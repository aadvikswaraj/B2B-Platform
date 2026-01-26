"use client";

import { TagIcon } from "@heroicons/react/24/outline";
import PageHeader from "@/components/ui/PageHeader";
import ReviewPage, {
  ReviewSection,
  ReviewField,
} from "@/components/ui/review/ReviewPage";
import VerificationSkeleton from "./VerificationSkeleton";
import { DocumentViewerModal, useDocumentViewer } from "./DocumentViewer";

/**
 * Dumb Document Card Component
 * Requires 'onClick' to handle viewing action.
 */

export const VerificationDocumentCard = ({
  url,
  label = "Document",
  icon: Icon,
  onClick,
}) => {
  if (!url)
    return (
      <div className="text-sm text-gray-500 italic p-3 bg-gray-50 rounded">
        No document uploaded
      </div>
    );

  const isImage = /\.(jpg|jpeg|png|webp)$/i.test(url);

  return (
    <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
      <div className="flex items-center gap-4">
        <div className="h-12 w-12 rounded bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
          {Icon ? (
            <Icon className="w-6 h-6" />
          ) : (
            <TagIcon className="w-6 h-6" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">{label}</p>
          <button
            type="button"
            onClick={onClick}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium bg-transparent border-0 p-0 underline cursor-pointer"
          >
            View Document &rarr;
          </button>
        </div>
      </div>

      {isImage && (
        <div
          className="mt-4 rounded-lg overflow-hidden border border-gray-200 cursor-pointer hover:opacity-90 transition-opacity"
          onClick={onClick}
        >
          <img
            src={abs(url)}
            alt={label}
            className="max-w-full h-auto max-h-[400px]"
          />
        </div>
      )}
    </div>
  );
};

export default function VerificationPage({
  loading,
  title,
  status,
  meta = [],
  sections = [],
  onDecision,
  isSubmitting,
  skeletonConfig = { sections: 3, fieldsPerSection: 4 },
  backHref,
  verifyOptions,
}) {
  const { doc, open, close } = useDocumentViewer();

  if (loading) {
    return (
      <VerificationSkeleton
        sections={skeletonConfig.sections}
        fieldsPerSection={skeletonConfig.fieldsPerSection}
      />
    );
  }

  return (
    <>
      <div className="space-y-6 max-w-5xl mx-auto pb-10">
        <div className="flex flex-col gap-6">
          {/* Standard Page Header */}
          <PageHeader
            title={title}
            subtitle={
              meta?.length ? meta.map((m) => m.value).join(" • ") : undefined
            }
            badge={status}
            backHref={backHref}
          />

          {/* Review Page */}
          <ReviewPage
            status={status}
            onDecision={onDecision}
            isSubmitting={isSubmitting}
            title={null}
            hideHeader={true}
            verifyOptions={verifyOptions}
          >
            {sections.map((section, sIdx) => (
              <ReviewSection
                key={sIdx}
                title={
                  section.icon ? (
                    <div className="flex items-center gap-2">
                      <section.icon className="w-5 h-5 text-gray-400" />
                      <span>{section.title}</span>
                    </div>
                  ) : (
                    section.title
                  )
                }
                columns={section.columns || 2}
                actions={section.actions}
              >
                {section.fields?.map((field, fIdx) => {
                  // Custom rendering based on field type
                  if (field.type === "document") {
                    return (
                      <div
                        key={fIdx}
                        className={field.span ? `col-span-${field.span}` : ""}
                      >
                        <p className="text-sm font-medium text-gray-700 mb-2">
                          {field.label}
                        </p>
                        <VerificationDocumentCard
                          url={field.url}
                          label={field.fileName || field.label}
                          icon={field.icon}
                          onClick={() => open(field.url)}
                        />
                        {field.subContent}
                      </div>
                    );
                  }

                  if (field.type === "link") {
                    return (
                      <div
                        key={fIdx}
                        className={
                          field.span ? `col-span-${field.span}` : "col-span-1"
                        }
                      >
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                          {field.label}
                        </label>
                        <a
                          href={field.url}
                          target="_blank"
                          rel="noreferrer"
                          className="text-sm font-medium text-indigo-600 hover:underline flex items-center gap-1"
                        >
                          {field.icon && <field.icon className="w-3.5 h-3.5" />}
                          {field.value}
                        </a>
                      </div>
                    );
                  }

                  // Default Text Field
                  return (
                    <ReviewField
                      key={fIdx}
                      label={field.label}
                      value={field.value}
                      span={field.span}
                    />
                  );
                })}
                {section.children}{" "}
                {/* Allow raw children mixed with fields if needed */}
              </ReviewSection>
            ))}
          </ReviewPage>
        </div>

        {/* Modal handles viewing for PageBuilder fields */}
        <DocumentViewerModal doc={doc} onClose={close} />
      </div>
    </>
  );
}
