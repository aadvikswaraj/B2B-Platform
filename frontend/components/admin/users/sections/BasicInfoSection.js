import ProfileSection from "@/components/admin/users/profile/ProfileSection";
import Field from "@/components/admin/users/profile/Field";

export default function BasicInfoSection({ user, onEdit }) {
  if (!user) return null;
  return (
    <ProfileSection
      title="User Profile"
      description="Core account information."
      onEdit={onEdit}
      columns={2}
    >
      <Field label="Name" value={user.name} />
      <Field label="Email" value={user.email} />
      <Field label="Admin" value={user.isAdmin ? "Yes" : "No"} />
      <Field label="Seller" value={user.isSeller ? "Yes" : "No"} />
    </ProfileSection>
  );
}
