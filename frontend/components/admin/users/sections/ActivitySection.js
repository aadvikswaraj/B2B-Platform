import ProfileSection from "@/components/admin/users/profile/ProfileSection";
import Field from "@/components/admin/users/profile/Field";

export default function ActivitySection({ user }) {
  if (!user) return null;
  return (
    <ProfileSection
      title="Activity Snapshot"
      description="User engagement metrics."
      onEdit={() => {}}
      columns={2}
    >
      <Field label="Orders Placed" value={"0"} />
      <Field label="RFQs" value={"0"} />
      <Field label="Products" value={user.isSeller ? "0" : "—"} />
      <Field label="Status" value={user.status || "active"} />
    </ProfileSection>
  );
}
