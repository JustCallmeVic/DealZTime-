import fs from "node:fs";
fetch('https://www.amazon.de/deals', {
  headers: {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    "Accept-Language": "de-DE,de;q=0.9",
  }
})
  .then(r => r.text())
  .then(t => {
    // Find first ASIN and show context around it
    const firstAsin = t.indexOf('/dp/B0GKVGD51F');
    if (firstAsin !== -1) {
      const chunk = t.substring(Math.max(0, firstAsin - 2000), firstAsin + 500);
      console.log(chunk);
    }
  });
