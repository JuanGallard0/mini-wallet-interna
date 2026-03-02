import express from "express";
import walletRoutes from "./wallet.routes.js";
import userRoutes from "./users.routes.js";

const router = express.Router();

router.use("/users", userRoutes);
router.use("/wallets", walletRoutes);

export default router;
