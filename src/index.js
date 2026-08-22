const AFFILIATE_TAG = "dealztime0c-21";

async function fetchDeals() {
  const res = await fetch("https://www.amazon.de/deals", {
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      "Accept-Language": "de-DE,de;q=0.9",
    },
  });
  const text = await res.text();

  const deals = [];
  const seen = new Set();

  // Extract deal blocks from Amazon HTML
  const dealPattern = /data-csa-c-item-id="amzn1\.asin\.([A-Z0-9]{10})/g;
  let match;

  while ((match = dealPattern.exec(text)) !== null) {
    const asin = match[1];
    if (seen.has(asin)) continue;
    seen.add(asin);

    // Find the deal block around this ASIN
    const start = Math.max(0, match.index - 3000);
    const end = Math.min(text.length, match.index + 1500);
    const block = text.substring(start, end);

    // Extract product link with name from URL
    const linkMatch = block.match(/href="(\/[^"]*\/dp\/' + asin + '[^"]*)"/);
    let title = "";
    if (linkMatch) {
      // Extract product name from URL path: /Product-Name/dp/ASIN
      const pathMatch = linkMatch[1].match(/^\/([^\/]+)\//);
      title = pathMatch ? pathMatch[1].replace(/-/g, " ") : "";
    }

    // Extract image
    const imgMatch = block.match(/src="(https:\/\/m\.media-amazon\.com\/images\/I\/[^"]+)"/);
    const image = imgMatch?.[1] || "";

    // Extract price - look for dcl-price or a-price
    const priceMatch = block.match(/a-price-whole">(\d+)/);
    const centMatch = block.match(/a-price-fraction">(\d+)/);
    let price = "";
    if (priceMatch) {
      price = priceMatch[1] + (centMatch ? "," + centMatch[1] : "") + " €";
    }

    if (title) {
      const affiliateLink = `https://www.amazon.de/dp/${asin}?tag=${AFFILIATE_TAG}`;
      deals.push({ title, asin, price, image, affiliateLink });
    }
  }

  return deals.slice(0, 8);
}

import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  try {
    const deals = await fetchDeals();
    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>DealZTime Bot</title>
<style>body{font-family:sans-serif;max-width:700px;margin:40px auto;padding:20px;background:#111;color:#fff}
h1{background:linear-gradient(135deg,#25D366,#128C7E);-webkit-background-clip:text;-webkit-text-fill-color:transparent}
.deal{background:#1a1a1a;border-radius:12px;padding:20px;margin:15px 0;border:1px solid #333;overflow:hidden}
.deal img{float:right;max-width:120px;border-radius:8px;margin-left:15px}
a{color:#25D366}
.price{color:#ff6b35;font-weight:bold;font-size:18px;margin:8px 0}</style></head><body>
<h1>DealZTime Bot</h1>
<p>Heute ${new Date().toLocaleDateString("de-DE")}: <strong>${deals.length} Amazon-Deals</strong></p>
${deals.map((d, i) => `<div class="deal">${d.image ? `<img src="${d.image}" alt="">` : ""}<h3 style="color:#25D366">Deal ${i + 1}</h3>${d.price ? `<div class="price">${d.price}</div>` : ""}<p style="color:#ccc">${d.title}</p><a href="${d.affiliateLink}" target="_blank">Bei Amazon kaufen →</a></div>`).join("")}
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
    res.json(deals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log("DealZTime Bot running on port " + PORT);
});
