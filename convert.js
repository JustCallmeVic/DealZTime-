import sharp from "sharp";
import fs from "node:fs";

const logos = ["logo-v1", "logo-v2", "logo-v3"];

for (const name of logos) {
  const svg = fs.readFileSync(`${name}.svg`);
  await sharp(svg, { density: 300 }).png().toFile(`${name}.png`);
  console.log(`Created ${name}.png`);
}

// V2 also as square 512x512 for WhatsApp
const svgV2 = fs.readFileSync("logo-v2.svg");
await sharp(svgV2, { density: 300 }).resize(512, 512).png().toFile("logo-v2-square.png");
console.log("Created logo-v2-square.png (WhatsApp)");
