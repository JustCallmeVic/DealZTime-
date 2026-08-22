const AFFILIATE_TAG = "dealztime0c-21";

// Fetch Amazon deals from mydealz.de RSS
async function fetchDeals() {
  const res = await fetch("https://www.mydealz.de/rss/gruppe/technik", {
    headers: { "User-Agent": "DealZTimeBot/1.0" },
  });
  const text = await res.text();

  const items = [];
  const matches = text.matchAll(/<item>([\s\S]*?)<\/item>/g);

  for (const m of matches) {
    const xml = m[1];
    const title =
      xml.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] ||
      xml.match(/<title>([\s\S]*?)<\/title>/)?.[1] ||
      "";
    const link = xml.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "";
    const description =
      xml.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>/)?.[1] ||
      xml.match(/<description>([\s\S]*?)<\/description>/)?.[1] || "";

    if (link.includes("amazon") || description.toLowerCase().includes("amazon")) {
      items.push({ title: title.trim(), link: link.trim(), description: description.trim() });
    }
  }

  return items.slice(0, 5);
}

function formatDeal(deal) {
  return `🔥 *Deal Alert!*

${deal.title}

🔗 ${deal.link}&tag=${AFFILIATE_TAG}

📉 Sichere dir das Angebot, solange es noch da ist!

_Mit DealZTime verpasst du kein Schnaeppchen mehr._`;
}

import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  try {
    const deals = await fetchDeals();
    const messages = deals.map(formatDeal);

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>DealZTime Bot</title>
<style>body{font-family:sans-serif;max-width:700px;margin:40px auto;padding:20px;background:#111;color:#fff}
h1{background:linear-gradient(135deg,#25D366,#128C7E);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.deal{background:#1a1a1a;border-radius:12px;padding:20px;margin:15px 0;border:1px solid #333}
.deal h3{color:#25D366;margin-bottom:10px}
.deal pre{white-space:pre-wrap;color:#ccc;font-size:13px;line-height:1.5}
a{color:#25D366}</style></head><body>
<h1>DealZTime Bot</h1>
<p>Heute ${new Date().toLocaleDateString("de-DE")} gefunden: <strong>${deals.length} Deals</strong></p>
${messages.map((m, i) => `<div class="deal"><h3>Deal ${i + 1}</h3><pre>${m.replace(/\*/g, "").replace(/_/g, "")}</pre></div>`).join("")}
<p style="color:#666;margin-top:30px">Bot laeuft automatisch alle 6 Stunden. Deals werden an den WhatsApp Channel gesendet.</p>
</body></html>`;

    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.send(html);
  } catch (err) {
    res.status(500).send("Fehler: " + err.message);
  }
});

app.get("/api/deals", async (req, res) => {
  try {
    const deals = await fetchDeals();
    res.json(deals.map(d => ({ ...d, affiliateLink: d.link + "&tag=" + AFFILIATE_TAG })));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`DealZTime Bot running on port ${PORT}`);
});
