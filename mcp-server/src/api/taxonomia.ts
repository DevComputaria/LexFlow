import { Router, type Request, type Response } from "express";
import { regraSvc } from "../services/regra-service.js";

const router = Router();

router.get("/atores", (_req: Request, res: Response) => {
  const tax = regraSvc.extrairTaxonomia();
  res.json({ atores: tax.atores });
});

router.get("/acoes", (_req: Request, res: Response) => {
  const tax = regraSvc.extrairTaxonomia();
  res.json({ acoes: tax.acoes });
});

export default router;
