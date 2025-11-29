import { Router } from "express";
import authRoutes from "./auth.routes.js";
import commentRoutes from "./comment.routes.js";

const router = Router();

router.get("/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    timestamp: new Date().toISOString(),
  });
});

router.use("/auth", authRoutes);
router.use("/comments", commentRoutes);

export default router;
