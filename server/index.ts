/**
 * File principale del server di Maranza Simulator
 * Configura e avvia il server Express con tutte le route e middleware necessari
 */

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";

// Inizializzazione dell'applicazione Express
const app = express();

// Configurazione dei middleware per gestire JSON e dati codificati in URL
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

/**
 * Middleware per il logging delle richieste API
 * Traccia i tempi di risposta e registra i dettagli delle chiamate API
 */
app.use((req, res, next) => {
  // Registra il timestamp di inizio della richiesta
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  // Intercetta il metodo json() di response per poter loggare la risposta
  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  // Al termine della risposta, completa il logging
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      // Tronca messaggi di log troppo lunghi
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// IIFE (Immediately Invoked Function Expression) asincrona per avviare il server
(async () => {
  // Registra tutte le route dell'applicazione
  const server = await registerRoutes(app);

  /**
   * Middleware per la gestione degli errori
   * Cattura e formatta tutti gli errori non gestiti nelle route
   */
  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Configurazione dell'ambiente di sviluppo o produzione
  // In sviluppo, configura Vite per hot reloading e dev server
  // In produzione, serve i file statici compilati
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Configurazione e avvio del server sulla porta 5000
  // Questa porta serve sia l'API che il client ed è l'unica non protetta dal firewall
  const port = 5000;
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
})();
