import express from "express";
import { getProducts, saveProduct, deleteProduct } from "../controller/product.js";

const router = express.Router();

router.get("/", getProducts);
router.post("/save", saveProduct);
router.delete("/:id", deleteProduct);

export default router;
