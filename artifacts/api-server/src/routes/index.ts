import { Router, type IRouter } from "express";
import healthRouter from "./health";
import contactRouter from "./contact";
import projectsRouter from "./projects";
import categoriesRouter from "./categories";
import uploadsRouter from "./uploads";
import adminRouter from "./admin";
import serviceRequestsRouter from "./service-requests";

const router: IRouter = Router();

router.use(healthRouter);
router.use(contactRouter);
router.use(projectsRouter);
router.use(categoriesRouter);
router.use(uploadsRouter);
router.use(serviceRequestsRouter);
router.use(adminRouter);

export default router;
