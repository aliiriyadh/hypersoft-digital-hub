import { Router, type IRouter } from "express";
import { getProjects } from "../lib/storage";

const router: IRouter = Router();

router.get("/projects", async (_req, res) => {
  const projects = await getProjects();
  res.json({ projects });
});

export default router;
