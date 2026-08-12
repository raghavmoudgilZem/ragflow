import express from "express";
import connectorRoutes from "./routes/connector.routes.js";
// import { globalErrorHandler } from "./middlewares/error.middleware.js";

const app = express();
app.use(express.json());

// Mount the router on the plural noun boundary
app.use("/api/v1/connectors", connectorRoutes);

// app.use(globalErrorHandler);

app.listen(3008, () => console.log("Server running on port 3008"));