"use client";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { ExclamationTriangleIcon, ArrowPathIcon } from "@heroicons/react/24/outline";
import Button from "@/components/ui/Button";
import { RolesAPI } from "@/utils/api/adminRoles";

export default function DeleteRoleDialog({ open, onClose, role, onDeleted }) {
  const [mounted, setMounted] = useState(false);
  const [strategy, setStrategy] = useState("reassign");
  const [targetRoleId, setTargetRoleId] = useState("");
  const [loading, setLoading] = useState(false);
  const [userCount, setUserCount] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [error, setError] = useState("");

  const currentRoleId = role?._id || role?.id;

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!open || !currentRoleId) return;
    setError("");
    setStrategy("reassign");
    setTargetRoleId("");
    setUserCount(null);
    // Fetch user count for the role
    RolesAPI.usersCount(currentRoleId).then((res) => {
      if (res?.success) setUserCount(res.data.count);
    });
    // Prefetch role suggestions (exclude this role)
    RolesAPI.suggest({ limit: 50 }).then((res) => {
      if (res?.success) {
        setSuggestions((res.data.roles || []).filter((r) => r._id !== currentRoleId));
      }
    });
  }, [open, currentRoleId]);

  const canConfirm = useMemo(() => {
    if (!role) return false;
    if (strategy === "reassign" && (userCount || 0) > 0) return !!targetRoleId;
    return true;
  }, [role, strategy, targetRoleId, userCount]);

  async function handleConfirm() {
    if (!canConfirm || !currentRoleId) return;
    setLoading(true);
    setError("");
    try {
      const res = await RolesAPI.removeWithStrategy(currentRoleId, strategy, targetRoleId || undefined);
      if (res?.success) {
        onDeleted?.(currentRoleId);
        onClose?.();
      } else {
        setError(res?.message || "Delete failed");
      }
    } catch (e) {
      setError(e?.message || "Delete failed");
    } finally {
      setLoading(false);
    }
  }

  if (!mounted || !open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[100]">
      <div className="absolute inset-0 bg-black/30" onClick={loading ? undefined : onClose} />
      {/* Panel container: bottom sheet on mobile, centered on laptop/desktop */}
      <div className="absolute inset-0 flex items-end sm:items-center sm:justify-center p-3 sm:p-6">
        <div className="w-full sm:max-w-lg rounded-2xl sm:rounded-xl border border-gray-200 bg-white shadow-2xl overflow-hidden">
          <div className="p-4 sm:p-5">
          <div className="flex items-start gap-3">
            <ExclamationTriangleIcon className="h-6 w-6 text-rose-600 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="text-base font-semibold text-gray-900">Delete role: {role?.roleName}</h3>
              {(
                <>
                  {role?.isSuperAdmin ? (
                    <p className="mt-1 text-xs text-rose-600">Deleting a Super Admin role may remove platform-wide access for its assigned users.</p>
                  ) : null}
                <>
                  <p className="mt-1 text-xs text-gray-600">
                    {userCount === null ? "Checking assigned users…" :
                      userCount > 0 ? `${userCount} user${userCount!==1?'s':''} currently assigned to this role.` : "No users are assigned to this role."}
                  </p>
                  {(userCount || 0) > 0 && (
                    <div className="mt-3 space-y-3">
                      <label className="flex items-start gap-2">
                        <input
                          type="radio"
                          className="mt-0.5"
                          checked={strategy === "reassign"}
                          onChange={() => setStrategy("reassign")}
                        />
                        <div>
                          <div className="text-sm font-medium text-gray-800">Reassign users to another role</div>
                          <div className="mt-2">
                            <select
                              className="w-full border border-gray-300 rounded-md px-2 py-1.5 text-sm disabled:bg-gray-100"
                              disabled={strategy !== "reassign" || loading}
                              value={targetRoleId}
                              onChange={(e) => setTargetRoleId(e.target.value)}
                            >
                              <option value="">Select a target role…</option>
                              {suggestions.map((r) => (
                                <option key={r._id} value={r._id} disabled={r._id === currentRoleId}>
                                  {r.roleName}{r.isSuperAdmin ? " (Super Admin)" : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                        </div>
                      </label>
                      <label className="flex items-start gap-2">
                        <input
                          type="radio"
                          className="mt-0.5"
                          checked={strategy === "delete-users"}
                          onChange={() => setStrategy("delete-users")}
                        />
                        <div>
                          <div className="text-sm font-medium text-rose-700">Delete all users assigned to this role</div>
                          <p className="text-xs text-rose-600">This is permanent and cannot be undone.</p>
                        </div>
                      </label>
                    </div>
                  )}
                </>
                </>
              )}
              {error && <p className="mt-2 text-xs text-rose-600">{error}</p>}
            </div>
          </div>
          <div className="mt-5 flex items-center justify-end gap-2">
            <Button variant="outline" size="sm" onClick={onClose} disabled={loading}>Cancel</Button>
            <Button
              variant="danger"
              size="sm"
              onClick={handleConfirm}
              disabled={!canConfirm}
              icon={loading ? ArrowPathIcon : undefined}
            >
              {loading ? "Deleting..." : "Delete Role"}
            </Button>
          </div>
          </div>
        </div>
      </div>
    </div>, document.body
  );
}
