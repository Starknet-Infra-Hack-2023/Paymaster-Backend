import express, { Express, Request, Response } from "express";
import dotenv from "dotenv";
import cors from "cors";
import BlockListener from "./src/service/listener";

dotenv.config();

export const _app: Express = express();
const port: number = process.env.PORT ? parseInt(process.env.PORT) : 3000;
_app.use(express.json()).use(cors());

_app.get("/test", (req: Request, res: Response) => {
  res.send("Express + TypeScript Server is running test");
});

if (process.env.NODE_ENV !== "test") {
  _app.listen(port, () => {
    console.log(`⚡️[server]: Server is running at http://localhost:${port}`);
  });
  const blockListener = new BlockListener();
  blockListener.startPolling();
}

export const app = _app;
