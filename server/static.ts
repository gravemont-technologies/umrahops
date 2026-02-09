
import express, { type Express } from "express";
import fs from "fs";
import path from "path";

export function serveStatic(app: Express) {
  const distPath = path.resolve(process.cwd(), "dist", "public");
  if (!fs.existsSync(distPath)) {
    const errorMsg = `[CRITICAL] Build directory NOT FOUND: ${distPath}. ` +
      `Deployment will fail because static files cannot be served. ` +
      `Ensure "npm run build" was executed successfully and that dist/public contains index.html. ` +
      `Current working directory: ${process.cwd()}`;
    console.error(errorMsg);
    throw new Error(errorMsg);
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.get("*", (_req, res) => {
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
