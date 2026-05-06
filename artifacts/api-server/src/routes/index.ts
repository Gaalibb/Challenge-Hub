import { Router, type IRouter } from "express";
import healthRouter from "./health";
import challengesRouter from "./challenges";
import usersRoute from "./users";
import talentRoute from "./talent";

const router: IRouter = Router();

router.use(healthRouter);
router.use(challengesRouter);
router.use("/users", usersRoute);
router.use(talentRoute);

export default router;
