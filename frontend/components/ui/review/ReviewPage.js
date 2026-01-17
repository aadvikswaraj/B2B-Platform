'use client';

import { useState } from 'react';
import PreviewPage from '@/components/ui/preview/PreviewPage';
import PreviewSection from '@/components/ui/preview/PreviewSection';
import PreviewField from '@/components/ui/preview/PreviewField';
import Modal from '@/components/ui/Modal';
import Button from '@/components/ui/Button';
import { CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export { PreviewSection as ReviewSection, PreviewField as ReviewField };

export default function ReviewPage({ 
  children, 
  title = "Review Request", 
  status = "pending",
  onDecision,
  isSubmitting = false,
  verifyOptions = null, // Component to render inside verify modal
  rejectOptions = null, // Component to render inside reject modal (usually just reason)
  labels = {
    verify: "Verify",
    reject: "Reject",
    verified: "Verified",
    rejected: "Rejected"
  }
}) {
  const [modalState, setModalState] = useState({ type: null, isOpen: false });
  const [reason, setReason] = useState("");
  const [verifyData, setVerifyData] = useState({});

  const handleOpenVerify = () => setModalState({ type: 'verify', isOpen: true });
  const handleOpenReject = () => setModalState({ type: 'reject', isOpen: true });
  const handleClose = () => {
    setModalState({ type: null, isOpen: false });
    setReason("");
    setVerifyData({});
  };

  const handleSubmit = async () => {
    if (modalState.type === 'verify') {
      await onDecision('verified', verifyData);
    } else if (modalState.type === 'reject') {
      await onDecision('rejected', { reason });
    }
    handleClose();
  };

  const isPending = status === 'pending';

  const actions = [
    {
      label: labels.verify,
      onClick: handleOpenVerify,
      variant: 'outline',
      icon: CheckCircleIcon,
      disabled: !isPending || isSubmitting,
      hidden: !isPending
    },
    {
      label: labels.reject,
      onClick: handleOpenReject,
      variant: 'danger',
      icon: XCircleIcon,
      disabled: !isPending || isSubmitting,
      hidden: !isPending
    }
  ].filter(a => !a.hidden);

  // If already decided, show status badge/text in actions area? 
  // PreviewPage puts actions in sidebar. We can add a status indicator there.
  // But PreviewPage doesn't support custom content in sidebar easily other than actions.
  // We might need to modify PreviewPage or just rely on the content to show status.
  // Actually, let's add a "Status" action that is disabled and shows the status.
  
  if (!isPending) {
    actions.push({
      label: status === 'verified' ? labels.verified : labels.rejected,
      variant: status === 'verified' ? 'success' : 'danger', // Assuming Button supports these or we map them
      disabled: true,
      icon: status === 'verified' ? CheckCircleIcon : XCircleIcon
    });
  }

  return (
    <>
      <PreviewPage title="Decision" actions={actions}>
        {children}
      </PreviewPage>

      {/* Verify Modal */}
      <Modal 
        open={modalState.type === 'verify' && modalState.isOpen} 
        onClose={handleClose}
        title={`Confirm ${labels.verify}`}
      >
        <div className="space-y-4">
          <p className="text-gray-600">Are you sure you want to {labels.verify.toLowerCase()} this request?</p>
          
          {/* Custom Verify Options (e.g. Category Selector) */}
          {verifyOptions && (
            <div className="mt-4">
              {typeof verifyOptions === 'function' 
                ? verifyOptions({ data: verifyData, onChange: setVerifyData }) 
                : verifyOptions}
            </div>
          )}

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
              Confirm {labels.verify}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Reject Modal */}
      <Modal 
        open={modalState.type === 'reject' && modalState.isOpen} 
        onClose={handleClose}
        title={`Confirm ${labels.reject}`}
      >
        <div className="space-y-4">
          <p className="text-gray-600">Please provide a reason for rejection.</p>
          
          <textarea
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            rows={4}
            placeholder="Reason for rejection..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
          />

          {rejectOptions}

          <div className="flex justify-end gap-3 mt-6">
            <Button variant="outline" onClick={handleClose}>Cancel</Button>
            <Button 
              variant="danger" 
              onClick={handleSubmit} 
              isLoading={isSubmitting}
              disabled={!reason.trim()}
            >
              Confirm {labels.reject}
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
}
