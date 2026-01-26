"use client";

import React, { useState, useEffect } from "react";
import PageHeader from "@/components/ui/PageHeader";
import { Card } from "@/components/ui/Card";
import Badge from "@/components/ui/Badge";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import { Tabs } from "@/components/ui/Tabs";
import Spinner from "@/components/ui/Spinner";
import {
  PayoutService,
  EARNING_STATUS,
  PAYOUT_STATUS,
} from "@/lib/mock/payouts";
import { Wallet, Clock, CheckCircle, AlertCircle, Info } from "lucide-react";

export default function SellerPayoutsPage() {
  const [loading, setLoading] = useState(true);
  const [balance, setBalance] = useState(null);
  const [earnings, setEarnings] = useState([]);
  const [payouts, setPayouts] = useState([]);
  const [activeTab, setActiveTab] = useState("earnings");

  // Hardcoded seller ID for this view since we don't have real auth in this resume project context yet
  const SELLER_ID = "seller_1";

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [balData, earnData, payData] = await Promise.all([
          PayoutService.getSellerSummary(SELLER_ID),
          PayoutService.getSellerEarnings(SELLER_ID),
          PayoutService.getSellerPayouts(SELLER_ID),
        ]);
        setBalance(balData);
        setEarnings(earnData);
        setPayouts(payData);
      } catch (error) {
        console.error("Failed to load payout data", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <PageHeader
        title="Payouts & Earnings"
        description="View your earnings, pending balances, and payout history."
      />

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-4 flex items-center justify-between bg-white shadow-sm border border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Available Balance
            </p>
            <div className="flex items-end gap-2">
              <h3 className="text-2xl font-bold text-gray-900">
                $
                {balance?.available.toLocaleString("en-US", {
                  minimumFractionDigits: 2,
                })}
              </h3>
            </div>
            {balance?.onHold && (
              <span className="inline-flex items-center gap-1 text-xs text-red-600 mt-1 font-medium bg-red-50 px-2 py-0.5 rounded-full">
                <AlertCircle size={12} /> Payouts On Hold
              </span>
            )}
          </div>
          <div className="p-3 bg-green-50 rounded-full text-green-600">
            <Wallet size={24} />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between bg-white shadow-sm border border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-500">
              Pending Clearance
            </p>
            <h3 className="text-2xl font-bold text-gray-900">
              $
              {balance?.pending.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </h3>
            <p className="text-xs text-gray-400 mt-1">
              Clears after return window
            </p>
          </div>
          <div className="p-3 bg-orange-50 rounded-full text-orange-600">
            <Clock size={24} />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between bg-white shadow-sm border border-gray-100">
          <div>
            <p className="text-sm font-medium text-gray-500">Total Paid Out</p>
            <h3 className="text-2xl font-bold text-gray-900">
              $
              {balance?.paid.toLocaleString("en-US", {
                minimumFractionDigits: 2,
              })}
            </h3>
          </div>
          <div className="p-3 bg-blue-50 rounded-full text-blue-600">
            <CheckCircle size={24} />
          </div>
        </Card>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-4 flex gap-3 text-blue-800 text-sm">
        <Info className="shrink-0 mt-0.5" size={18} />
        <p>
          Payouts are processed weekly by the administration. Earnings become
          eligible for payout 5 days after order completion to account for
          potential returns.
        </p>
      </div>

      {/* Main Content Tabs */}
      <Tabs
        activeTab={activeTab}
        onChange={setActiveTab}
        tabs={[
          { id: "earnings", label: "Order Earnings" },
          { id: "payouts", label: "Payout History" },
        ]}
      />

      {activeTab === "earnings" && (
        <Card className="overflow-hidden border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-900">
              Recent Order Earnings
            </h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <Tr>
                  <Th>Order ID</Th>
                  <Th>Date</Th>
                  <Th>Gross Amount</Th>
                  <Th>Fees</Th>
                  <Th>Net Earnings</Th>
                  <Th>Status</Th>
                  <Th>Eligible At</Th>
                </Tr>
              </THead>
              <TBody>
                {earnings.map((earn) => (
                  <Tr key={earn.id}>
                    <Td className="font-medium text-gray-900">
                      {earn.orderId}
                    </Td>
                    <Td className="text-gray-500">
                      {new Date(earn.createdAt).toLocaleDateString()}
                    </Td>
                    <Td>${earn.grossAmount.toFixed(2)}</Td>
                    <Td className="text-red-500">
                      -${earn.platformFee.toFixed(2)}
                    </Td>
                    <Td className="font-bold text-green-700">
                      +${earn.netAmount.toFixed(2)}
                    </Td>
                    <Td>
                      <StatusBadge status={earn.status} />
                    </Td>
                    <Td className="text-gray-500 text-xs">
                      {new Date(earn.eligibleAt).toLocaleDateString()}
                    </Td>
                  </Tr>
                ))}
                {earnings.length === 0 && (
                  <Tr>
                    <Td colSpan={7} className="text-center py-8 text-gray-500">
                      No earnings records found.
                    </Td>
                  </Tr>
                )}
              </TBody>
            </Table>
          </div>

          {/* Mobile View */}
          <div className="md:hidden space-y-4 p-4">
            {earnings.map((earn) => (
              <div key={earn.id} className="border rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-start">
                  <span className="font-medium">{earn.orderId}</span>
                  <StatusBadge status={earn.status} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="text-gray-500">Net Earned:</div>
                  <div className="text-right font-bold text-green-700">
                    ${earn.netAmount.toFixed(2)}
                  </div>
                  <div className="text-gray-500">Eligible:</div>
                  <div className="text-right">
                    {new Date(earn.eligibleAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {activeTab === "payouts" && (
        <Card className="overflow-hidden border border-gray-200 shadow-sm">
          <div className="p-4 border-b border-gray-100 bg-gray-50">
            <h3 className="font-semibold text-gray-900">Withdrawal History</h3>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <THead>
                <Tr>
                  <Th>Payout ID</Th>
                  <Th>Released Date</Th>
                  <Th>Reference</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                </Tr>
              </THead>
              <TBody>
                {payouts.map((payout) => (
                  <Tr key={payout.id}>
                    <Td className="font-medium text-gray-900">{payout.id}</Td>
                    <Td className="text-gray-500">
                      {new Date(payout.releasedAt).toLocaleDateString()}
                    </Td>
                    <Td className="text-xs font-mono text-gray-400">
                      {payout.transactionRef}
                    </Td>
                    <Td className="font-bold text-gray-900">
                      $
                      {payout.amount.toLocaleString("en-US", {
                        minimumFractionDigits: 2,
                      })}
                    </Td>
                    <Td>
                      <PayoutBadge status={payout.status} />
                    </Td>
                  </Tr>
                ))}
                {payouts.length === 0 && (
                  <Tr>
                    <Td colSpan={5} className="text-center py-8 text-gray-500">
                      No payout history available.
                    </Td>
                  </Tr>
                )}
              </TBody>
            </Table>
          </div>
        </Card>
      )}
    </div>
  );
}

function StatusBadge({ status }) {
  const styles = {
    [EARNING_STATUS.LOCKED]: "bg-gray-100 text-gray-600",
    [EARNING_STATUS.ELIGIBLE]: "bg-blue-100 text-blue-700",
    [EARNING_STATUS.HELD]: "bg-red-100 text-red-700",
    [EARNING_STATUS.PAID]: "bg-green-100 text-green-700",
  };

  const labels = {
    [EARNING_STATUS.LOCKED]: "Pending Clearance",
    [EARNING_STATUS.ELIGIBLE]: "Ready for Payout",
    [EARNING_STATUS.HELD]: "On Hold",
    [EARNING_STATUS.PAID]: "Paid Out",
  };

  return (
    <Badge className={`${styles[status] || "bg-gray-100"} border-0`}>
      {labels[status] || status}
    </Badge>
  );
}

function PayoutBadge({ status }) {
  const styles = {
    [PAYOUT_STATUS.PROCESSING]: "bg-yellow-100 text-yellow-700",
    [PAYOUT_STATUS.PAID]: "bg-green-100 text-green-700",
    [PAYOUT_STATUS.FAILED]: "bg-red-100 text-red-700",
  };
  return (
    <Badge className={`${styles[status] || "bg-gray-100"} border-0`}>
      {status}
    </Badge>
  );
}
