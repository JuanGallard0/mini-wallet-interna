import express from "express";
import {
  getAllUsers,
  createUser,
  getWalletByUser,
} from "../controllers/users.controller.js";

const router = express.Router();

router.get("/", getAllUsers);
router.post("/", createUser);
router.get("/:userId/wallets", getWalletByUser);

export default router;
