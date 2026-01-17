import * as brandVerificationService from "./service.js";
import { generateReadUrl } from "../../user/file/service.js";

import { sendResponse } from "../../../middleware/responseTemplate.js";
import { createListController } from "../../../utils/listQueryHandler.js";

export const list = createListController({
  service: brandVerificationService.listBrands,
  searchFields: ["name", "slug"],
  filterMap: {
    status: (v) => ({ "kyc.status": v }),
  },
});

export const getById = async (req, res) => {
  try {
    const { brandId } = req.params;

    const brand = await brandVerificationService.getBrandById(brandId);
    if (!brand) {
      res.locals.response = {
        success: false,
        message: "Brand not found",
        status: 404,
      };
    } else {
      console.log("brand", brand);
      res.locals.response = {
        success: true,
        message: "Brand fetched successfully",
        data: {
          brand: {
            ...brand,
            kyc: { ...brand.kyc, file: await generateReadUrl(brand.kyc?.file) },
          },
        },
        status: 200,
      };
    }
  } catch (err) {
    console.error(err);
    res.locals.response = {
      success: false,
      message: "Error fetching brand",
      status: 500,
    };
  }
  return sendResponse(res);
};

export const verifyDecision = async (req, res) => {
  const { brandId } = req.params;
  const { decision, reason } = req.body;
  try {
    const brand = await brandVerificationService.updateBrand(brandId, {
      kyc: { status: decision, rejectedReason: reason || undefined },
    });
    if (!brand) {
      res.locals.response = {
        success: false,
        message: "Brand not found",
        status: 404,
      };
    }
    else {
      res.locals.response = {
        success: true,
        message: "Brand verification decision updated successfully",
        data: { brand },
        status: 200,
      };
    };
  } catch (err) {
    res.locals.response = {
      success: false,
      message: "Error updating brand verification decision",
      status: 500,
    };
  }
  return sendResponse(res);
};
