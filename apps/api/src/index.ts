import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import fishRouter from "./routes/fish.js";
import apiRouter from "./routes/api.js";

const app = new Hono();

// Middleware
app.use("*", cors());
app.use("*", logger());

// Health check
app.get("/", (c) => c.json({ status: "ok", service: "ikanhub-api" }));

// Routes
app.route("/fish", fishRouter);
app.route("/api", apiRouter);

// 404 handler
app.notFound((c) => c.json({ error: "Not found" }, 404));

// Error handler
app.onError((err, c) => {
  console.error(err);
  return c.json({ error: "Internal server error" }, 500);
});

const port = parseInt(process.env.PORT || "3001");

serve({
  fetch: app.fetch,
  port,
});

console.log(`🐟 Ikanhub API running on http://localhost:${port}`);
