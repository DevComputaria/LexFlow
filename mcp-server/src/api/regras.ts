import { Router, type Request, type Response } from "express";
import { regraSvc } from "../services/regra-service.js";

const router = Router();

router.get("/", (req: Request, res: Response) => {
  const toStr = (v: unknown): string | undefined =>
    typeof v === "string" ? v : undefined;
  const regras = regraSvc.listar({
    documento_id: toStr(req.query.documento_id),
    tipo: toStr(req.query.tipo),
    termo: toStr(req.query.termo),
  });
  res.json({ regras, total: regras.length });
});

router.get("/buscar", (req: Request, res: Response) => {
  const consulta = typeof req.query.q === "string" ? req.query.q : "";
  if (!consulta?.trim()) {
    res.status(400).json({ erro: "Parâmetro 'q' é obrigatório" });
    return;
  }
  const resultados = regraSvc.buscar(consulta);
  res.json({ resultados, total: resultados.length });
});

router.get("/:id", (req: Request, res: Response) => {
  const detalhes = regraSvc.obterDetalhada(req.params.id as string);
  if (!detalhes) {
    res.status(404).json({ erro: "Regra não encontrada" });
    return;
  }
  res.json(detalhes);
});

export default router;
