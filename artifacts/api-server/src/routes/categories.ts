import { Router, type IRouter } from "express";
import { getCategories } from "../lib/storage";

const router: IRouter = Router();

router.get("/categories", async (_req, res) => {
  const categories = await getCategories();
  res.json({ categories });
});

export default router;
