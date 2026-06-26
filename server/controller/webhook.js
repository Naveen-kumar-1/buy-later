import { Webhook } from 'svix';
import prisma from '../lib/prisma.js';

export const handleClerkWebhook = async (req, res) => {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.warn("WARNING: CLERK_WEBHOOK_SECRET is not set in .env. Webhook signatures will not be verified.");
  }

  // Svix headers are required for verification
  const headers = req.headers;
  const svix_id = headers["svix-id"];
  const svix_timestamp = headers["svix-timestamp"];
  const svix_signature = headers["svix-signature"];

  // If signature headers are missing and no secret is set, we bypass validation for development ease.
  // Otherwise, we strictly verify the signature.
  let evt;

  if (WEBHOOK_SECRET) {
    if (!svix_id || !svix_timestamp || !svix_signature) {
      return res.status(400).json({ error: "Missing svix headers" });
    }

    // Get the raw body payload (Clerk sends JSON)
    const payload = JSON.stringify(req.body);
    const wh = new Webhook(WEBHOOK_SECRET);

    try {
      evt = wh.verify(payload, {
        "svix-id": svix_id,
        "svix-timestamp": svix_timestamp,
        "svix-signature": svix_signature,
      });
    } catch (err) {
      console.error("Webhook signature verification failed:", err.message);
      return res.status(400).json({ error: "Invalid signature" });
    }
  } else {
    // In local development without secret, parse directly from body
    evt = req.body;
  }

  const { type, data } = evt;
  console.log(`Received Clerk Webhook event type: ${type}`);

  if (type === "user.created" || type === "user.updated") {
    const { id, email_addresses, first_name, last_name } = data;
    const email = email_addresses?.[0]?.email_address;

    if (!email) {
      console.error("Webhook user event missing email address");
      return res.status(400).json({ error: "Email address not found" });
    }

    try {
      // Create or update the user record
      await prisma.user.upsert({
        where: { id },
        update: {
          email,
          firstName: first_name || null,
          lastName: last_name || null,
        },
        create: {
          id,
          email,
          firstName: first_name || null,
          lastName: last_name || null,
        },
      });
      console.log(`User ${id} successfully upserted in the database.`);
    } catch (err) {
      console.error("Prisma error upserting user:", err.message);
      return res.status(500).json({ error: "Database transaction failed" });
    }
  }

  if (type === "user.deleted") {
    const { id } = data;
    try {
      await prisma.user.delete({
        where: { id },
      });
      console.log(`User ${id} successfully deleted from the database.`);
    } catch (err) {
      console.error("Prisma error deleting user:", err.message);
      // Return 200 since user might already be deleted
    }
  }

  return res.status(200).json({ success: true });
};
