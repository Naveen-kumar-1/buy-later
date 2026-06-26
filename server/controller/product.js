import prisma from '../lib/prisma.js';

// Get all products for a specific user
export const getProducts = async (req, res) => {
  const { clerkUserId } = req.query;

  if (!clerkUserId) {
    return res.status(400).json({ error: "Missing clerkUserId in query parameters" });
  }

  try {
    const userWithProducts = await prisma.user.findUnique({
      where: { id: clerkUserId },
      include: {
        products: {
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!userWithProducts) {
      return res.status(404).json({ error: "User not found in database" });
    }

    return res.status(200).json({ success: true, products: userWithProducts.products });
  } catch (err) {
    console.error("Error fetching products:", err.message);
    return res.status(500).json({ error: "Failed to fetch products" });
  }
};

// Save a product (Creates a new one or Updates an existing one if ID is provided)
export const saveProduct = async (req, res) => {
  const clerkUserId = req.body.clerkUserId || req.body.clerUserkId;
  const { id, name, price, link, url, platform, status, orderDate, expectedDate } = req.body;

  if (!clerkUserId) {
    return res.status(400).json({ error: "Missing clerkUserId in request body" });
  }

  try {
    const priceVal = price !== undefined && price !== null ? Number(price) : null;
    const linkVal = link || url || null;
    const dateVal = (orderDate || expectedDate) ? new Date(orderDate || expectedDate) : null;

    if (id) {
      // UPDATE MODE
      // Verify product exists and belongs to the user
      const existingProduct = await prisma.product.findUnique({
        where: { id }
      });

      if (!existingProduct) {
        return res.status(404).json({ error: "Product not found" });
      }

      if (existingProduct.clerkUserId !== clerkUserId) {
        return res.status(403).json({ error: "Unauthorized to update this product" });
      }

      const updatedProduct = await prisma.product.update({
        where: { id },
        data: {
          name: name !== undefined ? name : existingProduct.name,
          price: price !== undefined ? priceVal : existingProduct.price,
          link: link !== undefined || url !== undefined ? linkVal : existingProduct.link,
          platform: platform !== undefined ? platform : existingProduct.platform,
          status: status !== undefined ? status : existingProduct.status,
          orderDate: (orderDate !== undefined || expectedDate !== undefined) ? dateVal : existingProduct.orderDate
        }
      });

      return res.status(200).json({ 
        success: true, 
        message: "Product updated successfully", 
        product: updatedProduct 
      });
    } else {
      // CREATE MODE
      if (!name) {
        return res.status(400).json({ error: "Missing product name in request body for creation" });
      }

      const newProduct = await prisma.product.create({
        data: {
          clerkUserId,
          name,
          price: priceVal,
          link: linkVal,
          platform: platform || "Other",
          status: status || "Saved",
          orderDate: dateVal
        }
      });

      return res.status(201).json({ 
        success: true, 
        message: "Product created successfully", 
        product: newProduct 
      });
    }

  } catch (err) {
    if (err.code === 'P2003') { // Foreign key constraint failed (e.g. user does not exist)
      return res.status(404).json({ 
        error: "User not found in database. Make sure you are signed up using Clerk and synced to the backend." 
      });
    }
    console.error("Error in saveProduct controller:", err.message);
    return res.status(500).json({ error: "Internal server database error when saving product" });
  }
};

// Delete a product
export const deleteProduct = async (req, res) => {
  const { id } = req.params;
  const { clerkUserId } = req.query;

  if (!clerkUserId) {
    return res.status(400).json({ error: "Missing clerkUserId in query parameters" });
  }

  try {
    const existingProduct = await prisma.product.findUnique({
      where: { id }
    });

    if (!existingProduct) {
      return res.status(404).json({ error: "Product not found" });
    }

    if (existingProduct.clerkUserId !== clerkUserId) {
      return res.status(403).json({ error: "Unauthorized to delete this product" });
    }

    await prisma.product.delete({
      where: { id }
    });

    return res.status(200).json({ success: true, message: "Product deleted successfully" });
  } catch (err) {
    console.error("Error deleting product:", err.message);
    return res.status(500).json({ error: "Failed to delete product" });
  }
};
