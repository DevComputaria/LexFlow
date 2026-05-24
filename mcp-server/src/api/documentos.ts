import { Router, type Request, type Response } from "express";
import { documentoSvc } from "../services/documento-service.js";

const router = Router();

router.get("/", (_req: Request, res: Response) => {
  const docs = documentoSvc.listar();
  res.json(docs);
});

router.get("/:id", (req: Request, res: Response) => {
  const doc = documentoSvc.obter(req.params.id as string);
  if (!doc) {
    res.status(404).json({ erro: "Documento não encontrado" });
    return;
  }
  res.json(doc);
});

export default router;
