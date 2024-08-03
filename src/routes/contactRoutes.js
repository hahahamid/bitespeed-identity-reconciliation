import express from "express";
import * as identityController from "../controllers/contactController.js";

const router = express.Router();

router.post("/identify", identityController.identify);
router.get("/identify", (req, res) => {
  res.send("Make a POST request, nothing here on GET");
});
export default router;
