import express from "express";
import { Category } from "../../models/model.js";
import { checkLoggedIn } from "../../utils/auth.js";
const router = express.Router();