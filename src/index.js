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

    const textToCheck = (title + " " + link).toLowerCase();
    if (!textToCheck.includes("amazon")) continue;

    const productName = title
      .replace(/\[.*?\]/g, "")
      .replace(/\(.*?\)/g, "")
      .replace(/f.r\s+\d+[.,]?\d*\s*\u20ac?/i, "")
      .replace(/statt\s+\d+[.,]?\d*\s*\u20ac?/i, "")
      .replace(/ab\s+\d+[.,]?\d*\s*\u20ac?/i, "")
      .replace(/~\s*\d+[.,]?\d*\s*\u20ac?/i, "")
      .replace(/von\s+Amazon/gi, "")
      .replace(/bei\s+Amazon/gi, "")
      .replace(/Amazon\s*/gi, "")
      .replace(/Prime/gi, "")
      .replace(/\d+[.,]\d+\s*\u20ac/g, "")
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

function escapeHtml(s) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}

function formatWhatsAppMessage(deal) {
  let msg = `\uD83D\uDD25 *Deal Alert!*\n\n${deal.title}`;
  if (deal.price) msg += `\n\n\uD83D\uDCB0 Preis: ${deal.price}`;
  msg += `\n\n\uD83D\uDD17 ${deal.affiliateLink}`;
  msg += `\n\n\uD83D\uDCC9 Sichere dir das Angebot!`;
  msg += `\n\n_Mit DealZTime verpasst du kein Schnaeppchen._`;
  return msg;
}

import express from "express";

const app = express();
const PORT = process.env.PORT || 3000;

app.get("/", async (req, res) => {
  try {
    const deals = await fetchDeals();

    const dealCards = deals.map((d, i) => {
      const msg = formatWhatsAppMessage(d);
      const escapedMsg = escapeHtml(msg);
      const b64 = Buffer.from(msg, "utf-8").toString("base64");

      return `
      <div class="deal">
        ${d.image ? `<img src="${d.image}" alt="" onerror="this.style.display='none'">` : ""}
        <h3 style="color:#25D366;margin-top:0">Deal ${i + 1}</h3>
        ${d.price ? `<div class="price">${escapeHtml(d.price)}</div>` : ""}
        <p style="color:#ddd">${escapeHtml(d.title)}</p>
        <div class="btns">
          <a href="${escapeHtml(d.affiliateLink)}" target="_blank" class="btn btn-amz">Amazon ansehen</a>
          <button class="btn btn-copy" onclick="copyMsg('${b64}', this)">Kopieren & Einfuegen</button>
        </div>
      </div>`;
    }).join("");

    const html = `<!DOCTYPE html>
<html lang="de"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>DealZTime</title>
<style>
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:system-ui,-apple-system,sans-serif;max-width:700px;margin:0 auto;padding:20px;background:#0a0a0a;color:#eee;min-height:100vh}
h1{font-size:26px;margin-bottom:2px}
.sub{color:#888;margin-bottom:20px;font-size:14px}
.deal{background:#1a1a1a;border-radius:12px;padding:20px;margin:15px 0;border:1px solid #2a2a2a;overflow:hidden}
.deal img{float:right;max-width:100px;border-radius:8px;margin-left:15px;margin-bottom:10px}
a{color:#25D366;text-decoration:none}
a:hover{text-decoration:underline}
.price{color:#ff6b35;font-weight:bold;font-size:18px;margin:8px 0}
.btns{display:flex;gap:10px;margin-top:12px;flex-wrap:wrap}
.btn{display:inline-block;padding:10px 18px;border-radius:8px;font-size:14px;font-weight:600;cursor:pointer;border:none;text-decoration:none}
.btn-amz{background:#25D366;color:#000}
.btn-amz:hover{opacity:.85;text-decoration:none}
.btn-copy{background:#333;color:#fff;border:1px solid #555}
.btn-copy:hover{background:#444}
.btn-copy.copied{background:#25D366;color:#000;border-color:#25D366}
.info{background:#111;border-radius:12px;padding:20px;margin-bottom:20px;border:1px solid #2a2a2a}
.info h2{color:#25D366;font-size:16px;margin-bottom:8px}
.info p{color:#888;font-size:13px;line-height:1.6}
.footer{color:#444;margin-top:30px;font-size:12px;text-align:center}
</style></head><body>
<h1>\uD83D\uDD25 DealZTime</h1>
<p class="sub">${new Date().toLocaleDateString("de-DE", {weekday:"long",day:"numeric",month:"long",year:"numeric"})} &middot; ${deals.length} Deals</p>

<div class="info">
<h2>\uD83D\uDCCB So funktioniert's:</h2>
<p>1. Klick <strong>"Kopieren & Einfuegen"</strong><br>
2. Oeffne deinen WhatsApp Channel<br>
3. Nachricht einfuegen + senden<br>
4. Fertig! Dein Affiliate-Link ist drin.</p>
</div>

${dealCards}

<p class="footer">DealZTime &middot; Deals von mydealz.de mit Amazon Affiliate-Links</p>

<script>
function copyMsg(b64, btn) {
  const msg = decodeURIComponent(escape(atob(b64)));
  navigator.clipboard.writeText(msg).then(() => {
    btn.textContent = "Kopiert!";
    btn.classList.add("copied");
    setTimeout(() => {
      btn.textContent = "Kopieren & Einfuegen";
      btn.classList.remove("copied");
    }, 2000);
  });
}
</script>
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
