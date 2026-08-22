// Test: scrape individual mydealz deal page for Amazon links
const url = "https://www.mydealz.de/deals/amazon-smatwatch-xplora-x6-play-2-gen-bvb-edition-2828732";

fetch(url, {
  headers: { "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" }
})
  .then(r => r.text())
  .then(html => {
    // Search for any Amazon URL patterns in the HTML
    const patterns = [
      /https?:\/\/(?:www\.)?amazon\.de\/[^\s"'<>]+/g,
      /https?:\/\/(?:www\.)?amazon\.com\/[^\s"'<>]+/g,
      /amzn\.to\/[^\s"'<>]+/g,
      /goto\/[^\s"'<>]+/g,
    ];

    for (const p of patterns) {
      const matches = html.match(p);
      if (matches) {
        console.log(`Pattern ${p}:`);
        [...new Set(matches)].forEach(m => console.log("  " + m));
      }
    }

    // Also search in JSON-LD structured data
    const jsonLd = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g);
    if (jsonLd) {
      console.log("\nJSON-LD found:", jsonLd.length);
      jsonLd.forEach(j => {
        const content = j.replace(/<\/?script[^>]*>/g, "");
        try {
          const data = JSON.parse(content);
          if (data.url) console.log("  URL:", data.url);
          if (data.offers?.url) console.log("  Offer URL:", data.offers.url);
        } catch {}
      });
    }

    // Search for data attributes with URLs
    const dataAttrs = html.match(/data-(?:url|href|link|merchant|goto|target)="([^"]+)"/g);
    if (dataAttrs) {
      console.log("\nData attributes:");
      [...new Set(dataAttrs)].slice(0, 10).forEach(d => console.log("  " + d));
    }

    // Look for pepper exit links
    const exitLinks = html.match(/\/exit\/[^\s"'<>]+/g);
    if (exitLinks) {
      console.log("\nExit links:");
      [...new Set(exitLinks)].forEach(l => console.log("  " + l));
    }
  });
