import ProfileSection from "@/components/admin/users/profile/ProfileSection";
import Field from "@/components/admin/users/profile/Field";

const fmtDate = (d) => (d ? new Date(d).toLocaleString() : "—");

export default function SellerInfoSection({ seller, gstProfile, onEdit }) {
  const sections = [];

  if (seller) {
    sections.push(
      <ProfileSection
        key="seller"
        title="Seller Profile"
        description="Registered seller company information."
        onEdit={onEdit}
        columns={2}
      >
        <Field label="Company Name" value={seller.companyName} span={2} />
        <Field label="GSTIN" value={seller.gstin} />
        <Field label="GST Profile ID" value={seller.gstProfile} />
        <Field label="Created" value={fmtDate(seller.createdAt)} />
      </ProfileSection>
    );
  }

  if (gstProfile) {
    sections.push(
      <ProfileSection
        key="gst"
        title="GST Verification"
        description="Details from GST registration."
        onEdit={onEdit}
        columns={2}
      >
        <Field label="Company" value={gstProfile.companyName} span={2} />
        <Field
          label="Registration Date"
          value={
            gstProfile.gstRegistrationDate
              ? new Date(gstProfile.gstRegistrationDate).toLocaleDateString()
              : ""
          }
        />
        <Field label="Ownership Type" value={gstProfile.ownershipType} />
        <Field
          label="Primary Business"
          value={gstProfile.primaryBusinessType}
        />
        <Field
          label="Secondary Business"
          value={gstProfile.secondaryBusiness}
        />
        <Field label="Annual Turnover" value={gstProfile.annualTurnover} />
      </ProfileSection>
    );
  }

  return <>{sections}</>;
}
