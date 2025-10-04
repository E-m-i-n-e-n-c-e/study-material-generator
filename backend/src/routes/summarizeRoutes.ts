import { Router } from "express";
import { summarizeController } from "../controllers/summarizeController";

const router = Router();

router.post("/summarize", summarizeController);

export default router;
