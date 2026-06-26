import express from "express";
import { handleClerkWebhook } from "../controller/webhook.js";

const router = express.Router();

// Clerk webhook route (Clerk sends webhook payload as JSON)
router.post("/clerk", handleClerkWebhook);

export default router;
