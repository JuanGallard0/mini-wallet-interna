import express from "express";
import {
  transferFunds,
  listTransfers,
  getAllWallets,
} from "../controllers/wallet.controller.js";

const router = express.Router();

router.post("/transfer", transferFunds);
router.get("/transfers", listTransfers);
router.get("/", getAllWallets);

export default router;
