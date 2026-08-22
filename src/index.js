const AFFILIATE_TAG = "dealztime0c-21";

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

import express from "express";
const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", (req, res) => {
  const html = `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DealZTime Generator</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,sans-serif;max-width:700px;margin:0 auto;padding:20px;background:#0a0a0a;color:#eee;min-height:100vh}
h1{font-size:24px;margin-bottom:4px}
.sub{color:#888;margin-bottom:20px;font-size:13px}
.field{margin-bottom:14px}
.field label{display:block;color:#aaa;font-size:12px;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px}
.field input,.field textarea,.field select{width:100%;padding:10px 14px;border-radius:8px;border:1px solid #333;background:#1a1a1a;color:#eee;font-size:14px;font-family:inherit}
.field input:focus,.field textarea:focus,.field select:focus{outline:none;border-color:#25D366}
.row{display:flex;gap:12px}
.row .field{flex:1}
.btn{display:block;width:100%;padding:14px;border-radius:10px;border:none;font-size:16px;font-weight:700;cursor:pointer;margin-top:8px}
.btn-gen{background:#25D366;color:#000}
.btn-gen:hover{opacity:.9}
.btn-copy{background:#333;color:#fff;border:1px solid #555;margin-top:10px;display:none}
.btn-copy:hover{background:#444}
.btn-copy.copied{background:#25D366;color:#000;border-color:#25D366}
.preview{background:#111;border-radius:12px;padding:20px;margin-top:16px;border:1px solid #2a2a2a;display:none;white-space:pre-wrap;font-size:14px;line-height:1.7;color:#ddd;font-family:inherit}
.preview-label{color:#25D366;font-size:12px;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px;display:none}
.footer{color:#444;margin-top:30px;font-size:11px;text-align:center}
</style></head><body>
<h1>DealZTime Generator</h1>
<p class="sub">Fuelle die Felder aus — die WhatsApp-Nachricht wird automatisch erstellt</p>

<div class="field">
  <label>Kategorie</label>
  <select id="cat" onchange="updateCat()">
    <option value="GETRÄNKE">Getränke</option>
    <option value="TECHNIK">Technik</option>
    <option value="HAUSHALT">Haushalt</option>
    <option value="LIVING">Wohnen</option>
    <option value="FREIZEIT">Freizeit</option>
    <option value="SPORT">Sport</option>
    <option value="KÜCHE">Küche</option>
    <option value="ELEKTRONIK">Elektronik</option>
    <option value="BAUHAUS">Bauhaus</option>
    <option value="KINDER">Kinder</option>
    <option value="OUTDOOR">Outdoor</option>
    <option value="BEAUTY">Beauty</option>
    <option value="MODE">Mode</option>
    <option value="DEAL DES TAGES">Deal des Tages</option>
  </select>
</div>

<div class="field">
  <label>Produktname</label>
  <input id="product" placeholder="z.B. Sparkling Wasser 24er Pack">
</div>

<div class="field">
  <label>Kurzbeschreibung (optional)</label>
  <input id="desc" placeholder="z.B. Erfrischendes kohlensäurehaltiges Getränk">
</div>

<div class="row">
  <div class="field">
    <label>Alter Preis (€)</label>
    <input id="oldPrice" type="number" step="0.01" placeholder="21.32">
  </div>
  <div class="field">
    <label>Neuer Preis (€)</label>
    <input id="newPrice" type="number" step="0.01" placeholder="14.99">
  </div>
</div>

<div class="field">
  <label>Amazon Link (nur der Produktteil)</label>
  <input id="link" placeholder="https://www.amazon.de/dp/B08YHT8V3F">
</div>

<button class="btn btn-gen" onclick="generate()">Nachricht erstellen</button>

<div class="preview-label" id="previewLabel">Vorschau & zum Kopieren:</div>
<div class="preview" id="preview"></div>
<button class="btn btn-copy" id="copyBtn" onclick="copyMsg()">Nachricht kopieren</button>

<p class="footer">DealZTime — Alle Deals mit deinem Affiliate-Tag dealztime0c-21</p>

<script>
const CATS = {
  "GETRÄNKE": "🥤",
  "TECHNIK": "💻",
  "HAUSHALT": "🏠",
  "LIVING": "🛋️",
  "FREIZEIT": "🎮",
  "SPORT": "💪",
  "KÜCHE": "🍳",
  "ELEKTRONIK": "⚡",
  "BAUHAUS": "🔧",
  "KINDER": "👶",
  "OUTDOOR": "⛺",
  "BEAUTY": "💄",
  "MODE": "👟",
  "DEAL DES TAGES": "🔥"
};

function generate() {
  const cat = document.getElementById("cat").value;
  const product = document.getElementById("product").value || "[Produkt]";
  const desc = document.getElementById("desc").value;
  const oldP = parseFloat(document.getElementById("oldPrice").value);
  const newP = parseFloat(document.getElementById("newPrice").value);
  const link = document.getElementById("link").value || "https://www.amazon.de/...";

  const emoji = CATS[cat] || "🔥";
  const savings = oldP && newP ? (oldP - newP).toFixed(2).replace(".", ",") : "";
  const percent = oldP && newP ? Math.round((1 - newP / oldP) * 100) : "";
  const tag = link.includes("?") ? link + "&tag=dealztime0c-21" : link + "?tag=dealztime0c-21";

  let msg = "";
  msg += emoji + " *" + cat + "-DEAL DES TAGES* 🔥\\n\\n";
  msg += "💦 *" + product + "*\\n";
  if (desc) msg += "✨ " + desc + "\\n\\n\\n";
  if (oldP && newP) {
    msg += "~" + oldP.toFixed(2).replace(".", ",") + " €~ → *" + newP.toFixed(2).replace(".", ",") + " €* 💥\\n";
    if (savings) msg += "💰 *" + savings + " € sparen!*\\n";
    if (percent) msg += "📉 *ca. " + percent + " % günstiger*\\n";
  }
  msg += "\\n\\n👉 *Jetzt bei Amazon sichern:*\\n" + tag;
  msg += "\\n\\n\\n⚡ *Deal kann jederzeit enden – schnell sein!*";

  const preview = document.getElementById("preview");
  preview.textContent = msg;
  preview.style.display = "block";
  document.getElementById("previewLabel").style.display = "block";
  document.getElementById("copyBtn").style.display = "block";
}

function copyMsg() {
  const msg = document.getElementById("preview").textContent;
  navigator.clipboard.writeText(msg).then(() => {
    const btn = document.getElementById("copyBtn");
    btn.textContent = "Kopiert!";
    btn.classList.add("copied");
    setTimeout(() => { btn.textContent = "Nachricht kopieren"; btn.classList.remove("copied"); }, 2000);
  });
}

function updateCat() {}
</script>
</body></html>`;

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.send(html);
});

app.get("/api/deals", async (req, res) => {
  res.json({ message: "Use the generator at /" });
});

app.listen(PORT, () => {
  console.log("DealZTime Generator running on port " + PORT);
});
