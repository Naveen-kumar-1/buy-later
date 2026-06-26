import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import productRouter from "./routes/product.js";
import webhookRouter from "./routes/webhook.js";
import userRouter from "./routes/user.js";

dotenv.config();

const app = express();

// Enable CORS so the React frontend can talk to the backend
app.use(cors());

// Global JSON middleware (Note: Webhook router overrides if needed, but JSON.stringify(req.body) works for local Svix)
app.use(express.json());

// Mount routes
app.use("/api/products", productRouter);
app.use("/api/webhooks", webhookRouter);
app.use("/api/users", userRouter);

app.get("/", (req, res) => {
  res.send("API Working");
});

const PORT = process.env.PORT || 3000;

if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server Running on PORT : ${PORT}`);
  });
}

export default app;
