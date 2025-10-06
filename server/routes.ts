import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

const { PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET } = process.env;
const isPayPalEnabled = PAYPAL_CLIENT_ID && PAYPAL_CLIENT_SECRET;

export async function registerRoutes(app: Express): Promise<Server> {
  // PayPal integration routes (only if credentials are provided)
  if (isPayPalEnabled) {
    const { createPaypalOrder, capturePaypalOrder, loadPaypalDefault } = await import("./paypal");
    
    app.get("/setup", async (req, res) => {
      await loadPaypalDefault(req, res);
    });

    app.post("/order", async (req, res) => {
      await createPaypalOrder(req, res);
    });

    app.post("/order/:orderID/capture", async (req, res) => {
      await capturePaypalOrder(req, res);
    });
  } else {
    // Provide placeholder routes that inform the user PayPal is not configured
    app.get("/setup", async (req, res) => {
      res.status(503).json({ error: "PayPal is not configured. Please add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to enable payments." });
    });

    app.post("/order", async (req, res) => {
      res.status(503).json({ error: "PayPal is not configured. Please add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to enable payments." });
    });

    app.post("/order/:orderID/capture", async (req, res) => {
      res.status(503).json({ error: "PayPal is not configured. Please add PAYPAL_CLIENT_ID and PAYPAL_CLIENT_SECRET to enable payments." });
    });
  }

  const httpServer = createServer(app);

  return httpServer;
}
