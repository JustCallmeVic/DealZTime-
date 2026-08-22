const AFFILIATE_TAG = "dealztime0c-21";

// Fetch Amazon deals from mydealz.de RSS
async function fetchDeals() {
  const res = await fetch("https://www.mydealz.de/rss", {
    headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" },
  });
  const text = await res.text();

  const items = [];
  const matches = [...text.matchAll(/<item>([\s\S]*?)<\/item>/g)];

  for (const m of matches) {
    const xml = m[1];
    const titleMatch = xml.match(/<title><!\[CDATA\[(.*?)\]\]>/) || xml.match(/<title>([\s\S]*?)<\/title>/);
    const title = (titleMatch?.[1] || titleMatch?.[2] || "").trim();
    const link = (xml.match(/<link>([\s\S]*?)<\/link>/)?.[1] || "").trim();
    const priceMatch = xml.match(/pepper:merchant[^>]*price="([^"]*)"/);
    const price = priceMatch?.[1] || "";
    const imageMatch = xml.match(/<media:content[^>]*url="([^"]*)"/);
    const image = imageMatch?.[1] || "";

    if (title.toLowerCase().includes("amazon") || link.includes("amazon")) {
      items.push({ title, link, price, image });
    }
  }

  return items.slice(0, 5);
}

function formatDeal(deal) {
  return `🔥 *Deal Alert!*

${deal.title}

💰 ${deal.price ? `Preis: ${deal.price}` : ""}

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
.deal{background:#1a1a1a;border-radius:12px;padding:20px;margin:15px 0;border:1px solid #333;overflow:hidden}
.deal h3{color:#25D366;margin-bottom:10px}
.deal pre{white-space:pre-wrap;color:#ccc;font-size:13px;line-height:1.5}
.deal img{float:right;max-width:120px;border-radius:8px;margin-left:15px}
a{color:#25D366}
.price{color:#ff6b35;font-weight:bold;font-size:18px;margin:8px 0}</style></head><body>
<h1>DealZTime Bot</h1>
<p>Heute ${new Date().toLocaleDateString("de-DE")}: <strong>${deals.length} Amazon-Deals gefunden</strong></p>
${deals.map((d, i) => `<div class="deal">${d.image ? `<img src="${d.image}" alt="">` : ""}<h3>Deal ${i + 1}</h3>${d.price ? `<div class="price">${d.price}</div>` : ""}<p style="color:#ccc">${d.title}</p><a href="${d.link}&tag=${AFFILIATE_TAG}" target="_blank">Bei Amazon ansehen →</a></div>`).join("")}
<p style="color:#666;margin-top:30px">Bot laeuft automatisch alle 6 Stunden.</p>
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
