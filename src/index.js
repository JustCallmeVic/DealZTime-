const AFFILIATE_TAG = "dealztime0c-21";

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

    // Include any deal mentioning Amazon
    const textToCheck = (title + " " + link).toLowerCase();
    if (!textToCheck.includes("amazon")) continue;

    // Extract product keywords from title for Amazon search
    const productName = title
      .replace(/\[.*?\]/g, "")
      .replace(/\(.*?\)/g, "")
      .replace(/für\s+\d+[.,]?\d*\s*€?/i, "")
      .replace(/statt\s+\d+[.,]?\d*\s*€?/i, "")
      .replace(/ab\s+\d+[.,]?\d*\s*€?/i, "")
      .replace(/~\s*\d+[.,]?\d*\s*€?/i, "")
      .replace(/von\s+Amazon/gi, "")
      .replace(/bei\s+Amazon/gi, "")
      .replace(/Amazon\s*/gi, "")
      .replace(/Prime/gi, "")
      .replace(/\d+[.,]\d+\s*€/g, "")
      .replace(/\s+/g, " ")
      .trim()
      .split(" ")
      .slice(0, 6)
      .join(" ");

    const searchQuery = encodeURIComponent(productName);
    const affiliateLink = `https://www.amazon.de/s?k=${searchQuery}&tag=${AFFILIATE_TAG}`;

    items.push({ title, price, image, affiliateLink, mydealzLink: link });
  }

  return items.slice(0, 8);
}

function formatWhatsAppMessage(deal) {
  return `🔥 *Deal Alert!*

${deal.title}

${deal.price ? `💰 Preis: ${deal.price}\n` : ""}
🔗 ${deal.affiliateLink}

📉 Sichere dir das Angebot!

_Mit DealZTime verpasst du kein Schnaeppchen._`;
}

import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  try {
    const deals = await fetchDeals();

    const html = `<!DOCTYPE html>
<html><head><meta charset="utf-8"><title>DealZTime Bot</title>
<style>
body{font-family:system-ui,sans-serif;max-width:700px;margin:40px auto;padding:20px;background:#0a0a0a;color:#eee}
h1{font-size:28px;margin-bottom:5px}
.sub{color:#888;margin-top:0}
.deal{background:#1a1a1a;border-radius:12px;padding:20px;margin:15px 0;border:1px solid #2a2a2a;overflow:hidden}
.deal img{float:right;max-width:120px;border-radius:8px;margin-left:15px}
a{color:#25D366;text-decoration:none}
a:hover{text-decoration:underline}
.price{color:#ff6b35;font-weight:bold;font-size:18px;margin:8px 0}
.msg{background:#0d3320;border:1px solid #25D366;border-radius:8px;padding:15px;margin-top:10px;font-family:monospace;font-size:12px;white-space:pre-wrap;color:#ccc;display:none}
.show-msg{cursor:pointer;color:#888;font-size:13px;margin-top:8px}
</style></head><body>
<h1>DealZTime Bot</h1>
<p class="sub">Heute ${new Date().toLocaleDateString("de-DE")}: <strong>${deals.length} Amazon-Deals</strong></p>
${deals.map((d, i) => `<div class="deal">${d.image ? `<img src="${d.image}" alt="" onerror="this.style.display='none'">` : ""}<h3 style="color:#25D366;margin-top:0">Deal ${i + 1}</h3>${d.price ? `<div class="price">${d.price}</div>` : ""}<p>${d.title}</p><a href="${d.affiliateLink}" target="_blank">Bei Amazon ansehen →</a><div class="show-msg" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='block'?'none':'block'">📋 WhatsApp-Nachricht anzeigen</div><div class="msg">${formatWhatsAppMessage(d).replace(/</g, "&lt;")}</div></div>`).join("")}
<p style="color:#555;margin-top:30px;font-size:13px">Bot laeuft automatisch. Deals werden direkt von Amazon geholt.</p>
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
