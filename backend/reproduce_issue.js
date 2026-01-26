import Joi from "joi";
import { createRequirementSchema } from "./modules/buyer/buyRequirement/validator.js";

const testInputs = [
  // Case 1: Object (Expected)
  {
    productName: "Test Product",
    description: "Test Description 1234567890",
    quantity: 10,
    unit: "pcs",
    budget: { min: 100, max: 200 },
    city: "Mumbai",
  },
  // Case 2: Stringified JSON
  {
    productName: "Test Product",
    description: "Test Description 1234567890",
    quantity: 10,
    unit: "pcs",
    budget: '{"min": 100, "max": 200}',
    city: "Mumbai",
  },
  // Case 3: Plain String
  {
    productName: "Test Product",
    description: "Test Description 1234567890",
    quantity: 10,
    unit: "pcs",
    budget: "100-200",
    city: "Mumbai",
  },
];

testInputs.forEach((input, index) => {
  const { error, value } = createRequirementSchema.validate(input);
  console.log(`\nCase ${index + 1}:`);
  if (error) {
    console.log("Error:", error.message);
  } else {
    console.log("Success");
  }
});
