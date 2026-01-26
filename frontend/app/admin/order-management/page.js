"use client";

import { useState, useMemo } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Select, Textarea } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import ConfirmationDialog from "@/components/ui/ConfirmationDialog";
import ReturnStatusBadge from "@/components/orders/ReturnStatusBadge";
import OrderTimeline from "@/components/orders/OrderTimeline";
import {
  orders as allOrders,
  returns as allReturns,
  ORDER_STATES,
  RETURN_STATES,
  PAYMENT_STATES,
  formatCurrency,
  formatDate,
  formatRelativeTime,
  getAuditLogsForOrder,
} from "@/data/ordersData";
import {
  adminForceDeliver,
  adminRollbackDelivery,
  adminApproveReturn,
  adminRejectReturn,
  adminMarkReturned,
  adminForceRefund,
  adminResolveDispute,
} from "@/utils/ordersApi";
import {
  EyeIcon,
  TruckIcon,
  ArrowUturnLeftIcon,
  CurrencyDollarIcon,
  ShieldCheckIcon,
  ExclamationTriangleIcon,
  CheckIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";

export default function AdminOrderManagement() {
  const [activeTab, setActiveTab] = useState(0);
  const [ordersData, setOrdersData] = useState(allOrders);
  const [returnsData, setReturnsData] = useState(allReturns);
  const [loading, setLoading] = useState(null);

  // Filter states
  const [statusFilter, setStatusFilter] = useState("all");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Modal states
  const [timelineModal, setTimelineModal] = useState({
    open: false,
    orderId: null,
  });
  const [rollbackModal, setRollbackModal] = useState({
    open: false,
    orderId: null,
  });
  const [rollbackReason, setRollbackReason] = useState("");
  const [forceDeliverModal, setForceDeliverModal] = useState({
    open: false,
    orderId: null,
  });
  const [rejectReturnModal, setRejectReturnModal] = useState({
    open: false,
    returnId: null,
  });
  const [rejectReturnReason, setRejectReturnReason] = useState("");
  const [disputeModal, setDisputeModal] = useState({
    open: false,
    orderId: null,
  });

  // Get filtered orders
  const filteredOrders = useMemo(() => {
    let result = ordersData;
    if (statusFilter !== "all") {
      result = result.filter((o) => o.orderState === statusFilter);
    }
    if (paymentFilter !== "all") {
      result = result.filter((o) => o.paymentState === paymentFilter);
    }
    return result;
  }, [ordersData, statusFilter, paymentFilter]);

  // Actions
  const handleForceDeliver = async () => {
    const orderId = forceDeliverModal.orderId;
    setLoading(`force-deliver-${orderId}`);
    const result = await adminForceDeliver(orderId, "Admin override");
    if (result.success) {
      setOrdersData((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                orderState: ORDER_STATES.DELIVERED,
                paymentState: PAYMENT_STATES.RELEASED,
                deliveredAt: result.data.deliveredAt,
              }
            : o,
        ),
      );
    }
    setForceDeliverModal({ open: false, orderId: null });
    setLoading(null);
  };

  const handleRollbackDelivery = async () => {
    if (!rollbackReason) return;
    const orderId = rollbackModal.orderId;
    setLoading(`rollback-${orderId}`);
    const result = await adminRollbackDelivery(orderId, rollbackReason);
    if (result.success) {
      setOrdersData((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                orderState: ORDER_STATES.SHIPPED,
                paymentState: PAYMENT_STATES.HELD,
                deliveredAt: null, // reset delivery
              }
            : o,
        ),
      );
    }
    setRollbackModal({ open: false, orderId: null });
    setRollbackReason("");
    setLoading(null);
  };

  const handleAdminApproveReturn = async (returnId) => {
    setLoading(`approve-return-${returnId}`);
    const result = await adminApproveReturn(returnId, "Admin approved");
    if (result.success) {
      setReturnsData((prev) =>
        prev.map((r) =>
          r.id === returnId
            ? {
                ...r,
                state: RETURN_STATES.APPROVED,
                approvedAt: result.data.approvedAt,
              }
            : r,
        ),
      );
    }
    setLoading(null);
  };

  const handleAdminRejectReturn = async () => {
    if (!rejectReturnReason) return;
    const returnId = rejectReturnModal.returnId;
    setLoading(`reject-return-${returnId}`);
    const result = await adminRejectReturn(returnId, rejectReturnReason);
    if (result.success) {
      setReturnsData((prev) =>
        prev.map((r) =>
          r.id === returnId
            ? {
                ...r,
                state: RETURN_STATES.REJECTED,
                rejectedAt: result.data.rejectedAt,
              }
            : r,
        ),
      );
    }
    setRejectReturnModal({ open: false, returnId: null });
    setRejectReturnReason("");
    setLoading(null);
  };

  const handleMarkReturned = async (returnId) => {
    setLoading(`mark-returned-${returnId}`);
    const result = await adminMarkReturned(
      returnId,
      "Admin confirmed item receipt",
    );
    if (result.success) {
      setReturnsData((prev) =>
        prev.map((r) =>
          r.id === returnId
            ? {
                ...r,
                state: RETURN_STATES.RETURNED,
                returnedAt: result.data.returnedAt,
              }
            : r,
        ),
      );
    }
    setLoading(null);
  };

  const handleForceRefund = async (returnId) => {
    setLoading(`force-refund-${returnId}`);
    const result = await adminForceRefund(returnId, "Admin forced refund");
    if (result.success) {
      setReturnsData((prev) =>
        prev.map((r) =>
          r.id === returnId
            ? {
                ...r,
                state: RETURN_STATES.REFUNDED,
                refundedAt: result.data.refundedAt,
              }
            : r,
        ),
      );
    }
    setLoading(null);
  };

  // Tabs Content
  const OrdersTab = () => (
    <div className="space-y-4">
      <div className="flex gap-4 mb-4">
        <Select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-48"
        >
          <option value="all">All Statuses</option>
          {Object.values(ORDER_STATES).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
        <Select
          value={paymentFilter}
          onChange={(e) => setPaymentFilter(e.target.value)}
          className="w-48"
        >
          <option value="all">All Payments</option>
          {Object.values(PAYMENT_STATES).map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </Select>
      </div>

      <Table>
        <THead>
          <Tr>
            <Th>Order ID</Th>
            <Th>Buyer / Seller</Th>
            <Th>Amount</Th>
            <Th>Status</Th>
            <Th>Payment</Th>
            <Th>Actions</Th>
          </Tr>
        </THead>
        <TBody>
          {filteredOrders.map((order) => (
            <Tr key={order.id}>
              <Td className="font-medium text-xs">{order.id}</Td>
              <Td>
                <div className="text-xs">
                  <p className="font-medium">B: {order.buyerName}</p>
                  <p className="text-gray-500">S: {order.sellerName}</p>
                </div>
              </Td>
              <Td className="font-medium">
                {formatCurrency(order.totalAmount)}
              </Td>
              <Td>
                <Badge>{order.orderState}</Badge>
              </Td>
              <Td>
                <Badge
                  variant={
                    order.paymentState === "released"
                      ? "emerald"
                      : order.paymentState === "held"
                        ? "amber"
                        : "gray"
                  }
                >
                  {order.paymentState}
                </Badge>
              </Td>
              <Td>
                <div className="flex gap-2">
                  <Button
                    size="xs"
                    variant="ghost"
                    icon={EyeIcon}
                    onClick={() =>
                      setTimelineModal({ open: true, orderId: order.id })
                    }
                    title="View Timeline"
                  />
                  {order.orderState === ORDER_STATES.SHIPPED && (
                    <Button
                      size="xs"
                      variant="solid"
                      icon={TruckIcon}
                      onClick={() =>
                        setForceDeliverModal({ open: true, orderId: order.id })
                      }
                      loading={loading === `force-deliver-${order.id}`}
                      title="Force Confirm Delivery"
                    />
                  )}
                  {order.orderState === ORDER_STATES.DELIVERED && (
                    <Button
                      size="xs"
                      variant="danger"
                      icon={ArrowUturnLeftIcon}
                      onClick={() =>
                        setRollbackModal({ open: true, orderId: order.id })
                      }
                      title="Rollback Delivery"
                    />
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </div>
  );

  const ReturnsTab = () => (
    <div className="space-y-4">
      <Table>
        <THead>
          <Tr>
            <Th>Return ID</Th>
            <Th>Order Info</Th>
            <Th>Reason</Th>
            <Th>Status</Th>
            <Th>Actions</Th>
          </Tr>
        </THead>
        <TBody>
          {returnsData.map((ret) => (
            <Tr key={ret.id}>
              <Td className="font-medium text-xs">{ret.id}</Td>
              <Td>
                <div className="text-xs">
                  <p>Ord: {ret.orderId}</p>
                  <p className="text-gray-500">
                    Amt: {formatCurrency(ret.returnAmount)}
                  </p>
                </div>
              </Td>
              <Td className="text-xs">{ret.reasonLabel}</Td>
              <Td>
                <ReturnStatusBadge state={ret.state} />
              </Td>
              <Td>
                <div className="flex gap-2 flex-wrap">
                  {ret.state === RETURN_STATES.REQUESTED && (
                    <>
                      <Button
                        size="xs"
                        variant="success"
                        icon={CheckIcon}
                        onClick={() => handleAdminApproveReturn(ret.id)}
                        loading={loading === `approve-return-${ret.id}`}
                        title="Force Approve"
                      >
                        Approve
                      </Button>
                      <Button
                        size="xs"
                        variant="danger"
                        icon={XMarkIcon}
                        onClick={() =>
                          setRejectReturnModal({ open: true, returnId: ret.id })
                        }
                        title="Force Reject"
                      >
                        Reject
                      </Button>
                    </>
                  )}
                  {ret.state === RETURN_STATES.APPROVED && (
                    <Button
                      size="xs"
                      variant="solid"
                      icon={ShieldCheckIcon}
                      onClick={() => handleMarkReturned(ret.id)}
                      loading={loading === `mark-returned-${ret.id}`}
                    >
                      Mark Returned
                    </Button>
                  )}
                  {ret.state === RETURN_STATES.RETURNED && (
                    <Button
                      size="xs"
                      variant="success"
                      icon={CurrencyDollarIcon}
                      onClick={() => handleForceRefund(ret.id)}
                      loading={loading === `force-refund-${ret.id}`}
                    >
                      Process Refund
                    </Button>
                  )}
                </div>
              </Td>
            </Tr>
          ))}
        </TBody>
      </Table>
    </div>
  );

  const DisputesTab = () => (
    <div className="flex flex-col items-center justify-center py-12 text-gray-500">
      <ExclamationTriangleIcon className="h-12 w-12 text-gray-300 mb-4" />
      <h3 className="text-lg font-medium text-gray-900">Dispute Management</h3>
      <p className="max-w-md text-center mt-2">
        This module allows admins to intervene in complex disputes between
        buyers and sellers. currently there are no active disputes.
      </p>
    </div>
  );

  const tabs = [
    { key: "orders", label: "All Orders", content: <OrdersTab /> },
    { key: "returns", label: "All Returns", content: <ReturnsTab /> },
    { key: "disputes", label: "Disputes", content: <DisputesTab /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">
            Order Management
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Global view of all marketplace orders and returns
          </p>
        </div>
      </div>

      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(key) => setActiveTab(tabs.findIndex((t) => t.key === key))}
      />

      {/* Modals */}
      <Modal
        open={timelineModal.open}
        onClose={() => setTimelineModal({ open: false, orderId: null })}
        title={`Audit Log - ${timelineModal.orderId}`}
        actions={
          <Button
            variant="outline"
            onClick={() => setTimelineModal({ open: false, orderId: null })}
          >
            Close
          </Button>
        }
      >
        <OrderTimeline
          events={
            timelineModal.orderId
              ? getAuditLogsForOrder(timelineModal.orderId)
              : []
          }
        />
      </Modal>

      <ConfirmationDialog
        open={forceDeliverModal.open}
        onClose={() => setForceDeliverModal({ open: false, orderId: null })}
        onConfirm={handleForceDeliver}
        title="Force Mark Delivered"
        description="Are you sure? This will release the payment to the seller immediately. This action should only be taken if you have external confirmation of delivery."
        confirmText="Force Deliver"
        type="danger"
        loading={loading?.startsWith("force-deliver")}
      />

      <Modal
        open={rollbackModal.open}
        onClose={() => {
          setRollbackModal({ open: false, orderId: null });
          setRollbackReason("");
        }}
        title="Rollback Delivery Status"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => setRollbackModal({ open: false, orderId: null })}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRollbackDelivery}
              disabled={!rollbackReason}
            >
              Confirm Rollback
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Reverting status from Delivered to Shipped. Payment will be held
            again.
          </p>
          <FormField label="Reason" required>
            <Textarea
              value={rollbackReason}
              onChange={(e) => setRollbackReason(e.target.value)}
              placeholder="Why are you rolling back this delivery?"
            />
          </FormField>
        </div>
      </Modal>

      <Modal
        open={rejectReturnModal.open}
        onClose={() => {
          setRejectReturnModal({ open: false, returnId: null });
          setRejectReturnReason("");
        }}
        title="Admin Reject Return"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                setRejectReturnModal({ open: false, returnId: null })
              }
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleAdminRejectReturn}
              disabled={!rejectReturnReason}
            >
              Confirm Rejection
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            You are overriding the normal return process. Please provide a
            reason.
          </p>
          <FormField label="Rejection Reason" required>
            <Textarea
              value={rejectReturnReason}
              onChange={(e) => setRejectReturnReason(e.target.value)}
              placeholder="Reason for administrative rejection..."
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}
