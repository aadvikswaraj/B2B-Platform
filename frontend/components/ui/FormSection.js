import React from "react";

const FormSection = ({ title, description, children }) => {
  return (
    <div className="p-4 border rounded-md bg-white">
      <h2 className="text-lg font-semibold">{title}</h2>
      {description && <p className="text-sm text-gray-500 mb-4">{description}</p>}
      {children}
    </div>
  );
};

export default FormSection;
