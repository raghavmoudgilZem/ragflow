import express from "express";
import routes from "./routes/connector.routes.js";
const app=express();app.use(express.json());app.use("/api/connector",routes);export default app;