import express from "express";
import morgan from "morgan";
import routes from "./routes/index.js";
import { errorMiddleware } from "./middlewares/error.middleware.js";
import notFound from "./middlewares/notFound.middleware.js";

const app = express();

app.use(morgan("dev"));

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok", timestamp: new Date() });
});

app.use("/api", routes);

app.use(notFound);

app.use(errorMiddleware);

export default app;
