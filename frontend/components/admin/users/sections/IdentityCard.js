import UserAvatar from "@/components/admin/users/UserAvatar";
import Badge from "@/components/ui/Badge";
import UserStatusPill from "@/components/admin/users/UserStatusPill";

const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "—");

export default function IdentityCard({ user, roles }) {
  if (!user) return null;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 bg-white rounded-xl shadow border border-gray-100">
      <UserAvatar user={user} size={80} />
      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-start gap-3">
          <div className="flex-1 min-w-40">
            <h2 className="text-xl font-semibold text-gray-900 break-words">
              {user.name}
            </h2>
            <p className="text-sm text-gray-500 break-words">{user.email}</p>
            <div className="mt-3">
              {roles.map((role) => (
                <Badge key={role} children={role} />
              ))}
            </div>
          </div>
          <UserStatusPill status={user.status || "active"} />
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-medium text-gray-700">Created</p>
            <p className="mt-1 text-gray-600">{fmtDate(user.createdAt)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-medium text-gray-700">Updated</p>
            <p className="mt-1 text-gray-600">{fmtDate(user.updatedAt)}</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-medium text-gray-700">Last Login</p>
            <p className="mt-1 text-gray-600">—</p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="font-medium text-gray-700">Status</p>
            <p className="mt-1 text-gray-600 capitalize">
              {user.userSuspended ? "suspended" : "active"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
