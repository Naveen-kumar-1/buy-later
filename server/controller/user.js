import prisma from '../lib/prisma.js';

export const syncUser = async (req, res) => {
  const { clerkUserId, email, firstName, lastName } = req.body;

  if (!clerkUserId || !email) {
    return res.status(400).json({ error: "Missing clerkUserId or email in request body" });
  }

  try {
    const user = await prisma.user.upsert({
      where: { id: clerkUserId },
      update: {
        email,
        firstName: firstName || null,
        lastName: lastName || null,
      },
      create: {
        id: clerkUserId,
        email,
        firstName: firstName || null,
        lastName: lastName || null,
      },
    });

    return res.status(200).json({ success: true, user });
  } catch (err) {
    console.error("Error syncing user:", err);
    return res.status(500).json({ error: "Failed to sync user with database" });
  }
};
