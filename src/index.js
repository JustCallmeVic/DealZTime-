const AFFILIATE_TAG = "dealztime0c-21";
const WHATSAPP_CHANNEL = "https://whatsapp.com/channel/0029Vb8nDX2F1YlZ5KEKZc3f";

import express from "express";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  const html = readFileSync(join(__dirname, "public.html"), "utf-8");
  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

app.listen(PORT, () => {
  console.log("DealZTime Generator running on port " + PORT);
});
