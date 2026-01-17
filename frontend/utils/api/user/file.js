// File API utilities - Raw binary upload with headers
import { api, API_BASE } from "@/utils/api/base";

const base = "/user/file";

export const FileAPI = {
  /**
   * Upload file with progress + cancel support.
   * Sends raw binary with metadata in headers (fastest, single request).
   * Returns { promise, cancel }.
   */
  uploadWithProgress: (file, { folder = "uploads", onProgress } = {}) => {
    let xhr = null;
    let cancelled = false;

    const cancel = () => {
      cancelled = true;
      if (xhr) xhr.abort();
    };

    const promise = new Promise((resolve, reject) => {
      if (cancelled) {
        reject(new Error("Upload cancelled"));
        return;
      }

      xhr = new XMLHttpRequest();
      xhr.open("POST", API_BASE + base + "/upload", true);
      xhr.withCredentials = true;

      // Send metadata in headers
      xhr.setRequestHeader("Content-Type", file.type || "application/octet-stream");
      xhr.setRequestHeader("X-File-Name", encodeURIComponent(file.name));
      xhr.setRequestHeader("X-Folder", folder);

      xhr.upload.onprogress = (evt) => {
        if (!evt.lengthComputable) return;
        const pct = Math.round((evt.loaded / evt.total) * 100);
        onProgress?.(pct);
      };

      xhr.onload = () => {
        try {
          const res = JSON.parse(xhr.responseText);
          if (xhr.status >= 200 && xhr.status < 300 && res?.success) {
            resolve(res.data);
          } else {
            reject(new Error(res?.message || `Upload failed (${xhr.status})`));
          }
        } catch {
          reject(new Error("Upload failed: invalid response"));
        }
      };

      xhr.onerror = () => reject(new Error("Upload failed"));
      xhr.onabort = () => reject(new Error("Upload cancelled"));

      // Send raw file binary
      xhr.send(file);
    });

    return { promise, cancel };
  },

  /**
   * Simple upload without progress.
   */
  upload: async (file, folder = "uploads") => {
    const res = await fetch(API_BASE + base + "/upload", {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": file.type || "application/octet-stream",
        "X-File-Name": encodeURIComponent(file.name),
        "X-Folder": folder,
      },
      body: file,
    });
    return res.json();
  },

  delete: async (fileId) => {
    return api(base + `/${fileId}`, { method: "DELETE" });
  },

  getUrl: async (fileId) => {
    return api(base + `/${fileId}`, { method: "GET" });
  },

  getRedirectUrl: (fileId) => {
    return `${API_BASE}${base}/${fileId}/redirect-url`;
  },
};

export default FileAPI;
