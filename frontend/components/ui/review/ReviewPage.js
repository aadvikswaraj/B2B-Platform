"use client";

import { useState } from "react";
import PreviewPage from "@/components/ui/preview/PreviewPage";
import PreviewSection from "@/components/ui/preview/PreviewSection";
import PreviewField from "@/components/ui/preview/PreviewField";
import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";
import { CheckCircleIcon, XCircleIcon } from "@heroicons/react/24/outline";

export { PreviewSection as ReviewSection, PreviewField as ReviewField };

export default function ReviewPage({
  children,
  status = "pending",
  onDecision,
  isSubmitting = false,
  rejectOptions = null, // Component to render inside reject modal (usually just reason)
  labels = {
    verify: "Verify",
    reject: "Reject",
    verified: "Verified",
    rejected: "Rejected",
  },
  verifyOptions: VerifyOptionsComponent,
}) {
  const [modalState, setModalState] = useState({ type: null, isOpen: false });
  const [reason, setReason] = useState("");
  const [verifyData, setVerifyData] = useState({});

  const handleOpenVerify = () =>
    setModalState({ type: "verify", isOpen: true });
  const handleOpenReject = () =>
    setModalState({ type: "reject", isOpen: true });
  const handleClose = () => {
    setModalState({ type: null, isOpen: false });
    setReason("");
    setVerifyData({});
  };

  const handleSubmit = async () => {
    if (modalState.type === "verify") {
      await onDecision("verified", verifyData);
    } else if (modalState.type === "reject") {
      await onDecision("rejected", { reason });
    }
    handleClose();
  };

  const isPending = status === "pending";

  const actions = [
    {
      label: labels.verify,
      onClick: handleOpenVerify,
      variant: "success",
      icon: CheckCircleIcon,
      disabled: !isPending || isSubmitting,
      hidden: !isPending,
    },
    {
      label: labels.reject,
      onClick: handleOpenReject,
      variant: "danger",
      icon: XCircleIcon,
      disabled: !isPending || isSubmitting,
      hidden: !isPending,
    },
  ].filter((a) => !a.hidden);

  // If already decided, show status badge/text in actions area?
  // PreviewPage puts actions in sidebar. We can add a status indicator there.
  // But PreviewPage doesn't support custom content in sidebar easily other than actions.
  // We might need to modify PreviewPage or just rely on the content to show status.
  // Actually, let's add a "Status" action that is disabled and shows the status.

  if (!isPending) {
    const isPositive = status === "verified" || status === "approved";
    actions.push({
      label: isPositive ? labels.verified : labels.rejected,
      variant: isPositive ? "success" : "danger", // Assuming Button supports these or we map them
      disabled: true,
      icon: isPositive ? CheckCircleIcon : XCircleIcon,
    });
  }

  return (
    <>
      <PreviewPage title="Decision" actions={actions}>
        {children}
      </PreviewPage>

      {/* Verify Modal */}
      <Modal
        open={modalState.type === "verify" && modalState.isOpen}
        onClose={handleClose}
        title={`Confirm ${labels.verify}`}
        mobileMode="fullscreen"
        actions={
          <>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="success"
              onClick={handleSubmit}
              isLoading={isSubmitting}
            >
              Confirm {labels.verify}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600 mb-4">
            Are you sure you want to {labels.verify.toLowerCase()} this request?
          </p>

          {VerifyOptionsComponent && (
            <div className="bg-gray-50 rounded-lg p-4 border border-gray-100">
              <VerifyOptionsComponent
                data={verifyData}
                onChange={setVerifyData}
              />
            </div>
          )}
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal
        open={modalState.type === "reject" && modalState.isOpen}
        onClose={handleClose}
        title={`Confirm ${labels.reject}`}
        mobileMode="fullscreen"
        actions={
          <>
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={handleSubmit}
              isLoading={isSubmitting}
              disabled={!reason.trim()}
            >
              Confirm {labels.reject}
            </Button>
          </>
        }
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Please provide a reason for rejection.
          </p>

          <textarea
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Reason for rejection..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          {rejectOptions}
        </div>
      </Modal>
    </>
  );
}
