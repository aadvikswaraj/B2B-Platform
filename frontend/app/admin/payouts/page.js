"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Tabs } from "@/components/ui/Tabs";
import Spinner from "@/components/ui/Spinner";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import {
  PayoutService,
  EARNING_STATUS,
  PAYOUT_STATUS,
  LEDGER_TYPE,
} from "@/lib/mock/payouts";
import {
  Wallet,
  Search,
  ArrowRight,
  Lock,
  Unlock,
  DollarSign,
  FileText,
  TrendingUp,
  TrendingDown,
  AlertCircle,
} from "lucide-react";
import { Input } from "@/components/ui/Input";

export default function AdminPayoutsPage() {
  const [loading, setLoading] = useState(true);
  const [sellers, setSellers] = useState([]);
  const [selectedSellerId, setSelectedSellerId] = useState(null);

  // Data for selected seller
  const [sellerLedger, setSellerLedger] = useState([]);
  const [sellerEarnings, setSellerEarnings] = useState([]);
  const [detailLoading, setDetailLoading] = useState(false);

  // Actions
  const [showHoldDialog, setShowHoldDialog] = useState(false);
  const [sellerToHold, setSellerToHold] = useState(null);

  const [showPayoutModal, setShowPayoutModal] = useState(false);
  const [payoutSelection, setPayoutSelection] = useState([]);

  useEffect(() => {
    loadSellers();
  }, []);

  useEffect(() => {
    if (selectedSellerId) {
      loadSellerDetails(selectedSellerId);
    }
  }, [selectedSellerId]);

  const loadSellers = async () => {
    setLoading(true);
    try {
      const data = await PayoutService.getAllSellerBalances();
      setSellers(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSellerDetails = async (id) => {
    setDetailLoading(true);
    try {
      const [ledger, earnings] = await Promise.all([
        PayoutService.getSellerLedger(id),
        PayoutService.getSellerEarnings(id),
      ]);
      setSellerLedger(ledger);
      setSellerEarnings(earnings);
    } catch (err) {
      console.error(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleHoldToggle = (seller) => {
    setSellerToHold(seller);
    setShowHoldDialog(true);
  };

  const confirmHoldToggle = async () => {
    if (!sellerToHold) return;
    try {
      await PayoutService.toggleSellerHold(
        sellerToHold.id,
        !sellerToHold.balance.onHold,
      );
      await loadSellers(); // Refresh list
      setShowHoldDialog(false);
      setSellerToHold(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreatePayout = async () => {
    if (payoutSelection.length === 0 || !selectedSellerId) return;
    try {
      setDetailLoading(true); // Re-use loading state
      await PayoutService.createPayoutBatch(selectedSellerId, payoutSelection);
      await loadSellerDetails(selectedSellerId); // Refresh details
      await loadSellers(); // Refresh global balances
      setShowPayoutModal(false);
      setPayoutSelection([]);
    } catch (err) {
      console.error(err);
      alert("Failed to create payout: " + err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  if (loading && !selectedSellerId) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // RENDER: DETAIL VIEW
  if (selectedSellerId) {
    const seller = sellers.find((s) => s.id === selectedSellerId);
    if (!seller) return <div>Seller not found</div>;

    return (
      <div className="space-y-6 p-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setSelectedSellerId(null)}>
            ← Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{seller.name}</h1>
            <p className="text-gray-500 text-sm">Seller ID: {seller.id}</p>
          </div>
          <div className="ml-auto flex gap-2">
            <Button
              variant={seller.balance.onHold ? "secondary" : "destructive"}
              onClick={() => handleHoldToggle(seller)}
            >
              {seller.balance.onHold ? (
                <>
                  <Unlock size={16} className="mr-2" /> Release Hold
                </>
              ) : (
                <>
                  <Lock size={16} className="mr-2" /> Place Hold
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Balance Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="p-4 bg-white border border-gray-200">
            <p className="text-sm text-gray-500">Available for Payout</p>
            <div className="flex justify-between items-end">
              <h3 className="text-2xl font-bold">
                ${seller.balance.available.toFixed(2)}
              </h3>
              <Button
                size="sm"
                disabled={
                  seller.balance.available <= 0 || seller.balance.onHold
                }
                onClick={() => setShowPayoutModal(true)}
              >
                Create Payout
              </Button>
            </div>
          </Card>
          <Card className="p-4 bg-gray-50 border border-gray-200">
            <p className="text-sm text-gray-500">Pending</p>
            <h3 className="text-2xl font-bold text-gray-700">
              ${seller.balance.pending.toFixed(2)}
            </h3>
          </Card>
          <Card className="p-4 bg-gray-50 border border-gray-200">
            <p className="text-sm text-gray-500">Total Paid</p>
            <h3 className="text-2xl font-bold text-gray-700">
              ${seller.balance.paid.toFixed(2)}
            </h3>
          </Card>
        </div>

        {/* Detail Tabs */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold">Ledger & History</h2>
          {detailLoading ? (
            <Spinner />
          ) : (
            <div className="bg-white border rounded-lg overflow-hidden">
              <Table>
                <THead>
                  <Tr>
                    <Th>Date</Th>
                    <Th>Type</Th>
                    <Th>Description</Th>
                    <Th>Reference</Th>
                    <Th className="text-right">Amount</Th>
                  </Tr>
                </THead>
                <TBody>
                  {sellerLedger.map((entry) => (
                    <Tr key={entry.id}>
                      <Td className="text-gray-500 text-sm">
                        {new Date(entry.date).toLocaleDateString()}
                      </Td>
                      <Td>
                        <LedgerTypeBadge type={entry.type} />
                      </Td>
                      <Td>{entry.description}</Td>
                      <Td className="text-xs font-mono text-gray-400">
                        {entry.referenceId}
                      </Td>
                      <Td
                        className={`text-right font-medium ${entry.amount > 0 ? "text-green-600" : "text-gray-900"}`}
                      >
                        {entry.amount > 0 ? "+" : ""}
                        {entry.amount.toFixed(2)}
                      </Td>
                    </Tr>
                  ))}
                </TBody>
              </Table>
            </div>
          )}
        </div>

        {/* Payout Modal */}
        <Modal
          isOpen={showPayoutModal}
          onClose={() => setShowPayoutModal(false)}
          title="Create Payout Batch"
          className="max-w-3xl"
        >
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-md flex gap-2 text-blue-800 text-sm">
              <InfoIcon />
              <p>
                Select eligible earnings to include in this payout. Only
                "Eligible" earnings can be paid out.
              </p>
            </div>

            <div className="max-h-96 overflow-y-auto border rounded-md">
              <Table>
                <THead>
                  <Tr>
                    <Th className="w-10">{/* Select All could go here */}</Th>
                    <Th>Order</Th>
                    <Th>Eligible Since</Th>
                    <Th className="text-right">Net Amount</Th>
                  </Tr>
                </THead>
                <TBody>
                  {sellerEarnings
                    .filter((e) => e.status === EARNING_STATUS.ELIGIBLE)
                    .map((earning) => (
                      <Tr key={earning.id}>
                        <Td>
                          <input
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300"
                            checked={payoutSelection.includes(earning.id)}
                            onChange={(e) => {
                              if (e.target.checked)
                                setPayoutSelection([
                                  ...payoutSelection,
                                  earning.id,
                                ]);
                              else
                                setPayoutSelection(
                                  payoutSelection.filter(
                                    (id) => id !== earning.id,
                                  ),
                                );
                            }}
                          />
                        </Td>
                        <Td>{earning.orderId}</Td>
                        <Td className="text-sm text-gray-500">
                          {new Date(earning.eligibleAt).toLocaleDateString()}
                        </Td>
                        <Td className="text-right font-medium">
                          ${earning.netAmount.toFixed(2)}
                        </Td>
                      </Tr>
                    ))}
                  {sellerEarnings.filter(
                    (e) => e.status === EARNING_STATUS.ELIGIBLE,
                  ).length === 0 && (
                    <Tr>
                      <Td
                        colSpan={4}
                        className="text-center py-8 text-gray-500"
                      >
                        No eligible earnings found to pay out.
                      </Td>
                    </Tr>
                  )}
                </TBody>
              </Table>
            </div>

            <div className="flex justify-between items-center pt-4 border-t">
              <div className="text-sm text-gray-500">
                Selected:{" "}
                <span className="font-semibold text-gray-900">
                  {payoutSelection.length}
                </span>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-xl font-bold text-gray-900">
                  Total: $
                  {sellerEarnings
                    .filter((e) => payoutSelection.includes(e.id))
                    .reduce((sum, e) => sum + e.netAmount, 0)
                    .toFixed(2)}
                </div>
                <Button
                  onClick={handleCreatePayout}
                  disabled={payoutSelection.length === 0}
                >
                  Confirm Payout
                </Button>
              </div>
            </div>
          </div>
        </Modal>

        <ConfirmationDialog
          isOpen={showHoldDialog}
          onClose={() => setShowHoldDialog(false)}
          onConfirm={confirmHoldToggle}
          title={
            sellerToHold?.balance.onHold
              ? "Release Hold?"
              : "Place Hold on Payouts?"
          }
          message={
            sellerToHold?.balance.onHold
              ? "This will allow the seller to receive payouts again. Are you sure?"
              : "This will freeze all available funds for this seller. Often used for compliance checks or suspicious activity. Are you sure?"
          }
          confirmText={
            sellerToHold?.balance.onHold ? "Release Hold" : "Place Hold"
          }
          type={sellerToHold?.balance.onHold ? "info" : "danger"}
        />
      </div>
    );
  }

  // RENDER: LIST VIEW
  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Payout Administration"
        description="Manage seller balances, processed payouts, and holds."
      />

      <Card className="overflow-hidden border border-gray-200 shadow-sm">
        <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
          <h3 className="font-semibold text-gray-900">Seller Balances</h3>
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={16}
            />
            <Input placeholder="Search sellers..." className="pl-9 w-64" />
          </div>
        </div>
        <Table>
          <THead>
            <Tr>
              <Th>Seller</Th>
              <Th className="text-right">Available</Th>
              <Th className="text-right">Pending</Th>
              <Th className="text-right">Last Payout</Th>
              <Th className="text-center">Status</Th>
              <Th></Th>
            </Tr>
          </THead>
          <TBody>
            {sellers.map((seller) => (
              <Tr
                key={seller.id}
                className="group hover:bg-gray-50 cursor-pointer"
                onClick={() => setSelectedSellerId(seller.id)}
              >
                <Td className="font-medium text-blue-600 group-hover:underline">
                  {seller.name}
                </Td>
                <Td className="text-right font-bold text-gray-900">
                  ${seller.balance.available.toFixed(2)}
                </Td>
                <Td className="text-right text-gray-500">
                  ${seller.balance.pending.toFixed(2)}
                </Td>
                <Td className="text-right text-sm text-gray-500">
                  {seller.lastPayout
                    ? new Date(seller.lastPayout).toLocaleDateString()
                    : "-"}
                </Td>
                <Td className="text-center">
                  {seller.balance.onHold && (
                    <Badge className="bg-red-100 text-red-700 border-0">
                      On Hold
                    </Badge>
                  )}
                </Td>
                <Td className="text-right">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="opacity-0 group-hover:opacity-100"
                  >
                    Manage <ArrowRight size={16} className="ml-1" />
                  </Button>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      </Card>
    </div>
  );
}

function LedgerTypeBadge({ type }) {
  const styles = {
    [LEDGER_TYPE.ORDER]: {
      bg: "bg-green-100",
      text: "text-green-700",
      icon: TrendingUp,
    },
    [LEDGER_TYPE.PAYOUT]: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      icon: DollarSign,
    },
    [LEDGER_TYPE.REFUND]: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: TrendingDown,
    },
    [LEDGER_TYPE.ADJUSTMENT]: {
      bg: "bg-gray-100",
      text: "text-gray-700",
      icon: FileText,
    },
  };

  const config = styles[type] || styles[LEDGER_TYPE.ADJUSTMENT];
  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text}`}
    >
      <Icon size={12} />
      {type}
    </span>
  );
}

function InfoIcon() {
  return <AlertCircle size={18} className="shrink-0" />;
}
