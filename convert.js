import sharp from "sharp";
import fs from "node:fs";

const svg = fs.readFileSync("fb-cover.svg");
await sharp(svg, { density: 300 }).png().toFile("fb-cover.png");
console.log("Created fb-cover.png (820x312)");
