import ProfileSection from "@/components/admin/users/profile/ProfileSection";
import Field from "@/components/admin/users/profile/Field";

export default function SecuritySection({ user }) {
  return (
    <ProfileSection
      title="Security"
      description="Authentication & access posture."
      onEdit={() => {}}
      columns={2}
    >
      <Field label="Password Last Changed" value={""} />
      <Field label="MFA" value={"Not Enabled"} />
      <Field label="Failed Logins (24h)" value={"0"} />
      <Field label="Lockouts" value={"0"} />
    </ProfileSection>
  );
}
