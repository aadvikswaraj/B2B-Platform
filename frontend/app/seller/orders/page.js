"use client";

import { useState, useMemo } from "react";
import { Tabs } from "@/components/ui/Tabs";
import { Table, THead, TBody, Tr, Th, Td } from "@/components/ui/Table";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import Modal from "@/components/ui/Modal";
import { Textarea } from "@/components/ui/Input";
import { FormField } from "@/components/ui/FormField";
import OrderMobileCard from "@/components/orders/OrderMobileCard";
import ReturnStatusBadge, {
  getReturnBadgeConfig,
} from "@/components/orders/ReturnStatusBadge";
import {
  orders as allOrders,
  returns as allReturns,
  ORDER_STATES,
  RETURN_STATES,
  AUTO_DELIVERY_DAYS,
  formatCurrency,
  formatDate,
  formatRelativeTime,
} from "@/data/ordersData";
import {
  sellerAcceptOrder,
  sellerRejectOrder,
  sellerShipOrder,
  sellerApproveReturn,
  sellerRejectReturn,
} from "@/utils/ordersApi";
import {
  CheckIcon,
  XMarkIcon,
  TruckIcon,
  ExclamationTriangleIcon,
  InformationCircleIcon,
} from "@heroicons/react/24/outline";

// Mock current seller ID - in real app, this would come from auth context
const CURRENT_SELLER_ID = "seller-001";

export default function SellerOrdersPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [ordersData, setOrdersData] = useState(allOrders);
  const [returnsData, setReturnsData] = useState(allReturns);
  const [loading, setLoading] = useState(null); // Track which action is loading

  // Modal states
  const [rejectModal, setRejectModal] = useState({
    open: false,
    orderId: null,
  });
  const [rejectReason, setRejectReason] = useState("");
  const [shipConfirmModal, setShipConfirmModal] = useState({
    open: false,
    orderId: null,
  });
  const [returnApproveModal, setReturnApproveModal] = useState({
    open: false,
    returnId: null,
  });
  const [returnApproveMessage, setReturnApproveMessage] = useState("");
  const [returnRejectModal, setReturnRejectModal] = useState({
    open: false,
    returnId: null,
  });
  const [returnRejectReason, setReturnRejectReason] = useState("");

  // Filter orders for current seller
  const sellerOrders = useMemo(
    () => ordersData.filter((o) => o.sellerId === CURRENT_SELLER_ID),
    [ordersData],
  );

  const sellerReturns = useMemo(
    () => returnsData.filter((r) => r.sellerId === CURRENT_SELLER_ID),
    [returnsData],
  );

  // Categorize orders by tab
  const receivedOrders = sellerOrders.filter(
    (o) => o.orderState === ORDER_STATES.PLACED,
  );
  const processingOrders = sellerOrders.filter(
    (o) => o.orderState === ORDER_STATES.PROCESSING,
  );
  const shippedOrders = sellerOrders.filter(
    (o) => o.orderState === ORDER_STATES.SHIPPED,
  );
  const pendingReturns = sellerReturns.filter(
    (r) =>
      r.state === RETURN_STATES.REQUESTED || r.state === RETURN_STATES.APPROVED,
  );

  // Action handlers
  const handleAcceptOrder = async (orderId) => {
    setLoading(`accept-${orderId}`);
    const result = await sellerAcceptOrder(orderId);
    if (result.success) {
      setOrdersData((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                orderState: ORDER_STATES.PROCESSING,
                acceptedAt: result.data.acceptedAt,
              }
            : o,
        ),
      );
    }
    setLoading(null);
  };

  const handleRejectOrder = async () => {
    if (!rejectReason.trim()) return;
    setLoading(`reject-${rejectModal.orderId}`);
    const result = await sellerRejectOrder(rejectModal.orderId, rejectReason);
    if (result.success) {
      setOrdersData((prev) =>
        prev.map((o) =>
          o.id === rejectModal.orderId
            ? {
                ...o,
                orderState: ORDER_STATES.REJECTED,
                rejectedAt: result.data.rejectedAt,
                rejectionReason: rejectReason,
                paymentState: "refunded",
              }
            : o,
        ),
      );
    }
    setRejectModal({ open: false, orderId: null });
    setRejectReason("");
    setLoading(null);
  };

  const handleShipOrder = async () => {
    const orderId = shipConfirmModal.orderId;
    setLoading(`ship-${orderId}`);
    const result = await sellerShipOrder(orderId);
    if (result.success) {
      setOrdersData((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? {
                ...o,
                orderState: ORDER_STATES.SHIPPED,
                shippedAt: result.data.shippedAt,
                autoDeliveryAt: result.data.autoDeliveryAt,
              }
            : o,
        ),
      );
    }
    setShipConfirmModal({ open: false, orderId: null });
    setLoading(null);
  };

  const handleApproveReturn = async () => {
    const returnId = returnApproveModal.returnId;
    setLoading(`approve-return-${returnId}`);
    const result = await sellerApproveReturn(returnId, returnApproveMessage);
    if (result.success) {
      setReturnsData((prev) =>
        prev.map((r) =>
          r.id === returnId
            ? {
                ...r,
                state: RETURN_STATES.APPROVED,
                approvedAt: result.data.approvedAt,
                sellerNote: returnApproveMessage,
              }
            : r,
        ),
      );
    }
    setReturnApproveModal({ open: false, returnId: null });
    setReturnApproveMessage("");
    setLoading(null);
  };

  const handleRejectReturn = async () => {
    if (!returnRejectReason.trim()) return;
    const returnId = returnRejectModal.returnId;
    setLoading(`reject-return-${returnId}`);
    const result = await sellerRejectReturn(returnId, returnRejectReason);
    if (result.success) {
      setReturnsData((prev) =>
        prev.map((r) =>
          r.id === returnId
            ? {
                ...r,
                state: RETURN_STATES.REJECTED,
                rejectedAt: result.data.rejectedAt,
                rejectionReason: returnRejectReason,
              }
            : r,
        ),
      );
    }
    setReturnRejectModal({ open: false, returnId: null });
    setReturnRejectReason("");
    setLoading(null);
  };

  // Badge helpers
  const getOrderBadge = (order) => {
    switch (order.orderState) {
      case ORDER_STATES.PLACED:
        return { variant: "amber", label: "Pending" };
      case ORDER_STATES.PROCESSING:
        return { variant: "blue", label: "Processing" };
      case ORDER_STATES.SHIPPED:
        return { variant: "indigo", label: "Shipped" };
      case ORDER_STATES.DELIVERED:
        return { variant: "emerald", label: "Delivered" };
      default:
        return { variant: "gray", label: order.orderState };
    }
  };

  // Tab content components
  const ReceivedTab = () => (
    <div className="space-y-4">
      {receivedOrders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-sm">No pending orders to review.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <THead>
                <Tr>
                  <Th>Order ID</Th>
                  <Th>Buyer</Th>
                  <Th>Product</Th>
                  <Th>Qty</Th>
                  <Th>Total</Th>
                  <Th>Placed</Th>
                  <Th>Actions</Th>
                </Tr>
              </THead>
              <TBody>
                {receivedOrders.map((order) => (
                  <Tr key={order.id}>
                    <Td className="font-medium">{order.id}</Td>
                    <Td>{order.buyerName}</Td>
                    <Td className="max-w-[200px] truncate">
                      {order.productName}
                    </Td>
                    <Td>{order.quantity}</Td>
                    <Td className="font-medium">
                      {formatCurrency(order.totalAmount)}
                    </Td>
                    <Td className="text-xs text-gray-500">
                      {formatRelativeTime(order.placedAt)}
                    </Td>
                    <Td>
                      <div className="flex gap-2">
                        <Button
                          size="xs"
                          variant="success"
                          icon={CheckIcon}
                          onClick={() => handleAcceptOrder(order.id)}
                          loading={loading === `accept-${order.id}`}
                        >
                          Accept
                        </Button>
                        <Button
                          size="xs"
                          variant="danger"
                          icon={XMarkIcon}
                          onClick={() =>
                            setRejectModal({ open: true, orderId: order.id })
                          }
                        >
                          Reject
                        </Button>
                      </div>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {receivedOrders.map((order) => (
              <OrderMobileCard
                key={order.id}
                order={order}
                getStatusBadge={getOrderBadge}
                actions={
                  <>
                    <Button
                      size="sm"
                      variant="success"
                      icon={CheckIcon}
                      onClick={() => handleAcceptOrder(order.id)}
                      loading={loading === `accept-${order.id}`}
                      className="flex-1"
                    >
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      icon={XMarkIcon}
                      onClick={() =>
                        setRejectModal({ open: true, orderId: order.id })
                      }
                      className="flex-1"
                    >
                      Reject
                    </Button>
                  </>
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  const ProcessingTab = () => (
    <div className="space-y-4">
      {/* Info notice */}
      <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
        <InformationCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <p>
          Delivery will be auto-confirmed {AUTO_DELIVERY_DAYS} days after
          shipment if buyer does not report issues.
        </p>
      </div>

      {processingOrders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-sm">No orders currently being processed.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <THead>
                <Tr>
                  <Th>Order ID</Th>
                  <Th>Buyer</Th>
                  <Th>Product</Th>
                  <Th>Qty</Th>
                  <Th>Total</Th>
                  <Th>Accepted</Th>
                  <Th>Actions</Th>
                </Tr>
              </THead>
              <TBody>
                {processingOrders.map((order) => (
                  <Tr key={order.id}>
                    <Td className="font-medium">{order.id}</Td>
                    <Td>{order.buyerName}</Td>
                    <Td className="max-w-[200px] truncate">
                      {order.productName}
                    </Td>
                    <Td>{order.quantity}</Td>
                    <Td className="font-medium">
                      {formatCurrency(order.totalAmount)}
                    </Td>
                    <Td className="text-xs text-gray-500">
                      {formatRelativeTime(order.acceptedAt)}
                    </Td>
                    <Td>
                      <Button
                        size="xs"
                        variant="solid"
                        icon={TruckIcon}
                        onClick={() =>
                          setShipConfirmModal({ open: true, orderId: order.id })
                        }
                      >
                        Mark as Shipped
                      </Button>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {processingOrders.map((order) => (
              <OrderMobileCard
                key={order.id}
                order={order}
                getStatusBadge={getOrderBadge}
                actions={
                  <Button
                    size="sm"
                    variant="solid"
                    icon={TruckIcon}
                    onClick={() =>
                      setShipConfirmModal({ open: true, orderId: order.id })
                    }
                    className="w-full"
                  >
                    Mark as Shipped
                  </Button>
                }
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  const ShippedTab = () => (
    <div className="space-y-4">
      {shippedOrders.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-sm">No shipped orders awaiting delivery.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <THead>
                <Tr>
                  <Th>Order ID</Th>
                  <Th>Buyer</Th>
                  <Th>Product</Th>
                  <Th>Total</Th>
                  <Th>Shipped</Th>
                  <Th>Auto-Delivery</Th>
                  <Th>Status</Th>
                </Tr>
              </THead>
              <TBody>
                {shippedOrders.map((order) => (
                  <Tr key={order.id}>
                    <Td className="font-medium">{order.id}</Td>
                    <Td>{order.buyerName}</Td>
                    <Td className="max-w-[200px] truncate">
                      {order.productName}
                    </Td>
                    <Td className="font-medium">
                      {formatCurrency(order.totalAmount)}
                    </Td>
                    <Td className="text-xs text-gray-500">
                      {formatDate(order.shippedAt)}
                    </Td>
                    <Td className="text-xs text-amber-600 font-medium">
                      {order.autoDeliveryAt
                        ? formatDate(order.autoDeliveryAt)
                        : "Pending"}
                    </Td>
                    <Td>
                      <Badge variant="indigo">In Transit</Badge>
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {shippedOrders.map((order) => (
              <OrderMobileCard
                key={order.id}
                order={order}
                getStatusBadge={() => ({
                  variant: "indigo",
                  label: "In Transit",
                })}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );

  const ReturnsTab = () => (
    <div className="space-y-4">
      {/* Warning notice */}
      <div className="flex items-start gap-2 p-3 bg-amber-50 border border-amber-100 rounded-lg text-sm text-amber-800">
        <ExclamationTriangleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
        <p>
          Refunds are processed only after item is returned and confirmed by
          admin.
        </p>
      </div>

      {pendingReturns.length === 0 ? (
        <div className="text-center py-12 text-gray-500">
          <p className="text-sm">No return requests to review.</p>
        </div>
      ) : (
        <>
          {/* Desktop Table */}
          <div className="hidden md:block">
            <Table>
              <THead>
                <Tr>
                  <Th>Return ID</Th>
                  <Th>Order</Th>
                  <Th>Buyer</Th>
                  <Th>Product</Th>
                  <Th>Reason</Th>
                  <Th>Amount</Th>
                  <Th>Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </THead>
              <TBody>
                {pendingReturns.map((ret) => (
                  <Tr key={ret.id}>
                    <Td className="font-medium">{ret.id}</Td>
                    <Td className="text-xs">{ret.orderId}</Td>
                    <Td>{ret.buyerName}</Td>
                    <Td className="max-w-[150px] truncate">
                      {ret.productName}
                    </Td>
                    <Td>
                      <span className="text-xs">{ret.reasonLabel}</span>
                      {ret.buyerNote && (
                        <p
                          className="text-xs text-gray-500 mt-0.5 max-w-[200px] truncate"
                          title={ret.buyerNote}
                        >
                          {ret.buyerNote}
                        </p>
                      )}
                    </Td>
                    <Td className="font-medium">
                      {formatCurrency(ret.returnAmount)}
                    </Td>
                    <Td>
                      <ReturnStatusBadge state={ret.state} />
                    </Td>
                    <Td>
                      {ret.state === RETURN_STATES.REQUESTED && (
                        <div className="flex gap-2">
                          <Button
                            size="xs"
                            variant="success"
                            onClick={() =>
                              setReturnApproveModal({
                                open: true,
                                returnId: ret.id,
                              })
                            }
                            loading={loading === `approve-return-${ret.id}`}
                          >
                            Approve
                          </Button>
                          <Button
                            size="xs"
                            variant="danger"
                            onClick={() =>
                              setReturnRejectModal({
                                open: true,
                                returnId: ret.id,
                              })
                            }
                          >
                            Reject
                          </Button>
                        </div>
                      )}
                      {ret.state === RETURN_STATES.APPROVED && (
                        <span className="text-xs text-gray-500 italic">
                          Awaiting return
                        </span>
                      )}
                    </Td>
                  </Tr>
                ))}
              </TBody>
            </Table>
          </div>

          {/* Mobile Cards */}
          <div className="md:hidden space-y-3">
            {pendingReturns.map((ret) => (
              <div
                key={ret.id}
                className="bg-white rounded-lg border border-gray-200 shadow-sm p-4 space-y-3"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-xs text-gray-500">{ret.id}</span>
                    <h3 className="text-sm font-medium text-gray-900 mt-0.5">
                      {ret.productName}
                    </h3>
                    <p className="text-xs text-gray-500">{ret.buyerName}</p>
                  </div>
                  <ReturnStatusBadge state={ret.state} />
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-gray-500">Reason:</span>
                    <span className="ml-1 font-medium">{ret.reasonLabel}</span>
                  </div>
                  <div>
                    <span className="text-gray-500">Amount:</span>
                    <span className="ml-1 font-medium">
                      {formatCurrency(ret.returnAmount)}
                    </span>
                  </div>
                </div>
                {ret.buyerNote && (
                  <p className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                    "{ret.buyerNote}"
                  </p>
                )}
                {ret.state === RETURN_STATES.REQUESTED && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      size="sm"
                      variant="success"
                      onClick={() =>
                        setReturnApproveModal({ open: true, returnId: ret.id })
                      }
                      loading={loading === `approve-return-${ret.id}`}
                      className="flex-1"
                    >
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() =>
                        setReturnRejectModal({ open: true, returnId: ret.id })
                      }
                      className="flex-1"
                    >
                      Reject
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );

  const tabs = [
    {
      key: "received",
      label: `Received${receivedOrders.length > 0 ? ` (${receivedOrders.length})` : ""}`,
      content: <ReceivedTab />,
    },
    {
      key: "processing",
      label: `Processing${processingOrders.length > 0 ? ` (${processingOrders.length})` : ""}`,
      content: <ProcessingTab />,
    },
    {
      key: "shipped",
      label: `Shipped${shippedOrders.length > 0 ? ` (${shippedOrders.length})` : ""}`,
      content: <ShippedTab />,
    },
    {
      key: "returns",
      label: `Returns${pendingReturns.length > 0 ? ` (${pendingReturns.length})` : ""}`,
      content: <ReturnsTab />,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">Orders</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage incoming orders and return requests
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        tabs={tabs}
        activeTab={activeTab}
        onChange={(key) => setActiveTab(tabs.findIndex((t) => t.key === key))}
      />

      {/* Reject Order Modal */}
      <Modal
        open={rejectModal.open}
        onClose={() => {
          setRejectModal({ open: false, orderId: null });
          setRejectReason("");
        }}
        title="Reject Order"
        mobileMode="drawer"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setRejectModal({ open: false, orderId: null });
                setRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRejectOrder}
              disabled={!rejectReason.trim()}
              loading={loading?.startsWith("reject-")}
            >
              Reject Order
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Please provide a reason for rejecting this order. The buyer will be
            notified and payment will be refunded.
          </p>
          <FormField label="Rejection Reason" required>
            <Textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              placeholder="Explain why this order cannot be fulfilled..."
              rows={4}
            />
          </FormField>
        </div>
      </Modal>

      {/* Ship Confirmation Modal */}
      <Modal
        open={shipConfirmModal.open}
        onClose={() => setShipConfirmModal({ open: false, orderId: null })}
        title="Confirm Shipment"
        mobileMode="drawer"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() =>
                setShipConfirmModal({ open: false, orderId: null })
              }
            >
              Cancel
            </Button>
            <Button
              variant="solid"
              onClick={handleShipOrder}
              loading={loading?.startsWith("ship-")}
            >
              Confirm Shipment
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to mark this order as shipped?
          </p>
          <div className="flex items-start gap-2 p-3 bg-blue-50 border border-blue-100 rounded-lg text-sm text-blue-800">
            <InformationCircleIcon className="h-5 w-5 flex-shrink-0 mt-0.5" />
            <p>
              Delivery will be auto-confirmed after {AUTO_DELIVERY_DAYS} days.
              Payment will be released to you once delivery is confirmed.
            </p>
          </div>
        </div>
      </Modal>

      {/* Approve Return Modal */}
      <Modal
        open={returnApproveModal.open}
        onClose={() => {
          setReturnApproveModal({ open: false, returnId: null });
          setReturnApproveMessage("");
        }}
        title="Approve Return Request"
        mobileMode="drawer"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setReturnApproveModal({ open: false, returnId: null });
                setReturnApproveMessage("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleApproveReturn}
              loading={loading?.startsWith("approve-return-")}
            >
              Approve Return
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Once approved, the buyer will be instructed to return the item.
            Refund will be processed after item is received.
          </p>
          <FormField label="Message to Buyer (Optional)">
            <Textarea
              value={returnApproveMessage}
              onChange={(e) => setReturnApproveMessage(e.target.value)}
              placeholder="Add any instructions for the buyer..."
              rows={3}
            />
          </FormField>
        </div>
      </Modal>

      {/* Reject Return Modal */}
      <Modal
        open={returnRejectModal.open}
        onClose={() => {
          setReturnRejectModal({ open: false, returnId: null });
          setReturnRejectReason("");
        }}
        title="Reject Return Request"
        mobileMode="drawer"
        actions={
          <>
            <Button
              variant="outline"
              onClick={() => {
                setReturnRejectModal({ open: false, returnId: null });
                setReturnRejectReason("");
              }}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleRejectReturn}
              disabled={!returnRejectReason.trim()}
              loading={loading?.startsWith("reject-return-")}
            >
              Reject Return
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Please provide a reason for rejecting this return request. The buyer
            will be notified of your decision.
          </p>
          <FormField label="Rejection Reason" required>
            <Textarea
              value={returnRejectReason}
              onChange={(e) => setReturnRejectReason(e.target.value)}
              placeholder="Explain why this return cannot be accepted..."
              rows={4}
            />
          </FormField>
        </div>
      </Modal>
    </div>
  );
}
