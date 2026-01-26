import Joi from "joi";

export const profileSchema = Joi.object({
  name: Joi.string().optional(),
  email: Joi.string().email().optional(),
  phone: Joi.string().optional(),
  avatarUrl: Joi.string().optional(),
  productCategories: Joi.array().items(Joi.string()).optional(),
  socials: Joi.object().optional(),
  companyName: Joi.string().optional(),
  businessType: Joi.string().optional(),
  gstin: Joi.string().optional(),
  pan: Joi.string().optional(),
  address: Joi.object().optional(),
  website: Joi.string().optional(),
  description: Joi.string().optional(),
  designation: Joi.string().optional(),
  ceo: Joi.string().optional(),
  employeeCount: Joi.string().optional(),
  annualTurnover: Joi.string().optional(),
  shortDescription: Joi.string().optional(),

  // Store Customization
  logo: Joi.string().optional(), // File ID
  banners: Joi.array()
    .items(
      Joi.object({
        file: Joi.string().required(),
        link: Joi.string().allow("", null).optional(),
        title: Joi.string().allow("", null).optional(),
        position: Joi.number().optional(),
        isActive: Joi.boolean().optional(),
      }),
    )
    .max(5)
    .optional(),
  highlights: Joi.array().items(Joi.string()).max(10).optional(),
  certifications: Joi.array().items(Joi.string()).max(20).optional(),
}).unknown(true);

export const validateProfile = (data) => profileSchema.validate(data);
