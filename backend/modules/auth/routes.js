import express from "express";
import * as controller from "./controller.js";
import * as validator from "./validator.js";
import { validateRequest } from "../../utils/customValidators.js";

const router = express.Router();

router.post(
    "/login",
    validateRequest(validator.loginSchema),
    controller.login
);

router.get(
    "/loggedin-status",
    controller.getLoggedInStatus
);

router.post(
    "/verify-email",
    validateRequest(validator.verifyEmailSchema),
    controller.verifyEmail
);

router.post(
    "/signup",
    validateRequest(validator.signupSchema),
    controller.signup
);

export default router;
