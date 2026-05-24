import { Router } from "express";
import documentosRouter from "./documentos.js";
import regrasRouter from "./regras.js";
import taxonomiaRouter from "./taxonomia.js";

const router = Router();

router.use("/documentos", documentosRouter);
router.use("/regras", regrasRouter);
router.use("/taxonomia", taxonomiaRouter);

router.get("/health", (_req, res) => {
  res.json({ status: "ok", service: "lexflow-mcp" });
});

export default router;
