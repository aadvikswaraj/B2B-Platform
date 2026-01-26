"use client";

import { useMemo, useState } from "react";
import Modal from "@/components/ui/Modal";

export function useDocumentViewer() {
  const [doc, setDoc] = useState(null);

  const open = (url) => {
    if (!url) return;
    const isImage = /\.(jpg|jpeg|png|webp|gif|svg)$/i.test(url);
    const isVideo = /\.(mp4|webm|ogg|mov)$/i.test(url);
    setDoc({ url, type: isImage ? "image" : isVideo ? "video" : "pdf" });
  };

  const close = () => setDoc(null);

  return { doc, open, close };
}

export function DocumentViewerModal({ doc, onClose }) {
  const API_BASE =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:3001";

  const abs = useMemo(
    () => (url) => {
      if (!url) return url;
      if (url.startsWith("http")) return url;
      if (url.startsWith("/")) return `${API_BASE}${url}`;
      return url;
    },
    [API_BASE],
  );

  return (
    <Modal
      open={!!doc}
      onClose={onClose}
      title="Document Preview"
      mobileMode="fullscreen"
      size="xl"
    >
      <div className="flex items-center justify-center min-h-[50vh] bg-gray-100/50 rounded-lg">
        {doc?.type === "image" ? (
          <img
            src={abs(doc.url)}
            className="max-w-full max-h-[85vh] object-contain"
            alt="Document"
          />
        ) : doc?.type === "video" ? (
          <video
            src={abs(doc.url)}
            controls
            className="max-w-full max-h-[85vh] rounded"
          />
        ) : (
          <iframe
            src={abs(doc?.url)}
            className="w-full h-[80vh] border-0"
            title="Document PDF"
          />
        )}
      </div>
    </Modal>
  );
}
