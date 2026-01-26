import * as profileService from "./service.js";
import { validateProfile } from "./validator.js";
import { sendResponse } from "../../../middleware/responseTemplate.js";

export const get = async (req, res) => {
  try {
    const user = await profileService.getUserProfile(req.session.user._id);
    res.locals.response.data.user = user || null;
    res.locals.response.data.business = user?.businessProfile || null;
    res.locals.response.message = "Profile fetched";
  } catch (e) {
    res.locals.response.success = false;
    res.locals.response.message = "Failed to fetch profile";
    res.locals.response.status = 400;
  }
  sendResponse(res);
};

export const update = async (req, res) => {
  try {
    const userId = req.session.user._id;
    const {
      name,
      email,
      phone,
      avatarUrl,
      productCategories,
      socials,
      companyName,
      businessType,
      gstin,
      pan,
      address,
      website,
      description,
      logo,
      banners,
      highlights,
      certifications,
      shortDescription,
      designation,
      ceo,
      employeeCount,
      annualTurnover,
    } = req.body;

    // Update user fields
    const userUpdates = {};
    if (name) userUpdates.name = name;
    if (email) userUpdates.email = email;
    if (phone) userUpdates.phone = phone;
    if (avatarUrl) userUpdates.avatarUrl = avatarUrl;
    if (productCategories) userUpdates.productCategories = productCategories;
    if (socials) userUpdates.socials = socials;

    await profileService.updateUser(userId, userUpdates);

    // Upsert business profile
    const businessUpdates = {};
    if (companyName !== undefined) businessUpdates.companyName = companyName;
    if (businessType !== undefined)
      businessUpdates.businessCategory = businessType; // Mapping businessType to businessCategory
    if (gstin !== undefined) businessUpdates.gstin = gstin;
    if (pan !== undefined) businessUpdates.pan = pan;
    if (address !== undefined) businessUpdates.address = address;
    if (website !== undefined) businessUpdates.website = website;
    if (description !== undefined) businessUpdates.description = description;
    if (shortDescription !== undefined)
      businessUpdates.shortDescription = shortDescription;
    if (designation !== undefined) businessUpdates.designation = designation;
    if (ceo !== undefined) businessUpdates.ceo = ceo;
    if (employeeCount !== undefined)
      businessUpdates.employeeCount = employeeCount;
    if (annualTurnover !== undefined)
      businessUpdates.annualTurnover = annualTurnover;

    // New fields
    if (logo !== undefined) businessUpdates.logo = logo;
    if (banners !== undefined) businessUpdates.banners = banners;
    if (highlights !== undefined) businessUpdates.highlights = highlights;
    if (certifications !== undefined)
      businessUpdates.certifications = certifications;

    const businessProfile = await profileService.upsertBusinessProfile(
      userId,
      businessUpdates,
    );

    // Ensure user.businessProfile is set
    await profileService.linkBusinessProfileToUser(userId, businessProfile._id);

    // Return updated profile
    const user = await profileService.getUserProfile(userId);
    res.locals.response.data.user = user;
    res.locals.response.data.business = user.businessProfile;
    res.locals.response.message = "Profile saved";
  } catch (e) {
    res.locals.response.success = false;
    res.locals.response.message = "Failed to save profile";
    res.locals.response.status = 400;
  }
  sendResponse(res);
};
