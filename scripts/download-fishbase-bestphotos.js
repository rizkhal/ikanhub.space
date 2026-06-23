/**
 * download-fishbase-bestphotos.js
 *
 * Crawler: Downloads FishBase Best Photos into storage/fishbase-images/
 * Also generates metadata.json with image metadata.
 *
 * Run: node scripts/download-fishbase-bestphotos.js
 *
 * This is a standalone script that does NOT import into the database.
 * Run import-fishbase-metadata.ts separately after downloading.
 */

const https = require("https");
const http = require("http");
const fs = require("fs");
const path = require("path");

const FISHBASE_BASE = "https://fishbase.se";
const STORAGE_DIR = path.resolve(__dirname, "..", "storage");
const IMAGES_DIR = path.join(STORAGE_DIR, "fishbase-images");
const METADATA_FILE = path.join(IMAGES_DIR, "metadata.json");

// FishBase genera with high photo counts
const GENERA = [
  "Amphiprion",
  "Pterois",
  "Chaetodon",
  "Thalassoma",
  "Pomacanthus",
  "Labroides",
  "Epinephelus",
  "Scarus",
  "Acanthurus",
  "Zebrasoma",
  "Pterapogon",
  "Synchiropus",
  "Oxymonacanthus",
  "Histrio",
  "Rhinecanthus",
  "Balistapus",
  "Sargocentron",
  "Myripristis",
  "Gymnothorax",
  "Paracirrhites",
];

function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const protocol = url.startsWith("https") ? https : http;
    const file = fs.createWriteStream(dest);

    protocol
      .get(url, { timeout: 30000, headers: { "User-Agent": "Ikanhub/1.0" } }, (response) => {
        // Handle redirects
        if (response.statusCode >= 300 && response.statusCode < 400 && response.headers.location) {
          file.close();
          fs.unlinkSync(dest);
          const redirectUrl = response.headers.location.startsWith("http")
            ? response.headers.location
            : `https://fishbase.se${response.headers.location}`;
          return resolve(downloadFile(redirectUrl, dest));
        }

        if (response.statusCode !== 200) {
          file.close();
          fs.unlinkSync(dest);
          return reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        }

        response.pipe(file);
        file.on("finish", () => {
          file.close();
          resolve(true);
        });
      })
      .on("error", (err) => {
        file.close();
        try {
          fs.unlinkSync(dest);
        } catch {}
        reject(err);
      })
      .on("timeout", function () {
        this.destroy();
        file.close();
        try {
          fs.unlinkSync(dest);
        } catch {}
        reject(new Error("Timeout"));
      });
  });
}

async function scrapeSpeciesList(genus) {
  const url = `${FISHBASE_BASE}/photos/Thumbnails.cfm?genus=${genus}`;

  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        { timeout: 15000, headers: { "User-Agent": "Ikanhub/1.0" } },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            // Extract species names from thumbnail page
            const species = [];
            const regex =
              /<a\s+href="\/photos\/Thumbnails\.cfm\?species=([^"]+)"[^>]*>/gi;
            let match;
            while ((match = regex.exec(data)) !== null) {
              const speciesName = decodeURIComponent(match[1]);
              if (!species.includes(speciesName)) {
                species.push(speciesName);
              }
            }
            resolve(species.slice(0, 5)); // Limit to 5 per genus
          });
        }
      )
      .on("error", reject)
      .on("timeout", function () {
        this.destroy();
        reject(new Error("Timeout"));
      });
  });
}

async function scrapeSpeciesImages(species) {
  const url = `${FISHBASE_BASE}/photos/Thumbnails.cfm?species=${encodeURIComponent(species)}`;

  return new Promise((resolve, reject) => {
    https
      .get(
        url,
        { timeout: 15000, headers: { "User-Agent": "Ikanhub/1.0" } },
        (res) => {
          let data = "";
          res.on("data", (chunk) => (data += chunk));
          res.on("end", () => {
            const images = [];

            // Extract image blocks
            const blockRegex =
              /<div[^>]*class="thumbnail"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
            let blockMatch;
            while ((blockMatch = blockRegex.exec(data)) !== null) {
              const block = blockMatch[1];

              // Extract image URL
              const imgRegex =
                /<img[^>]*src="([^"]*\/images\/[^"]*)"[^>]*>/i;
              const imgMatch = imgRegex.exec(block);
              if (!imgMatch) continue;

              let imgSrc = imgMatch[1];
              if (imgSrc.startsWith("//")) imgSrc = "https:" + imgSrc;
              else if (imgSrc.startsWith("/"))
                imgSrc = FISHBASE_BASE + imgSrc;

              // Extract author
              const authorRegex = /<strong>([^<]+)<\/strong>/i;
              const authorMatch = authorRegex.exec(block);
              const author = authorMatch ? authorMatch[1].trim() : null;

              // Extract locality
              const localityRegex = /Locality:\s*([^<]+)</i;
              const localityMatch = localityRegex.exec(block);
              const locality = localityMatch ? localityMatch[1].trim() : null;

              // Extract license
              const licenseRegex = /CC[^<]+/i;
              const licenseMatch = licenseRegex.exec(block);
              const license = licenseMatch ? licenseMatch[0].trim() : "CC BY-NC 3.0";

              images.push({
                species,
                imageUrl: imgSrc,
                sourcePageUrl: url,
                author,
                locality,
                license,
              });
            }

            resolve(images.slice(0, 3)); // Limit to 3 per species
          });
        }
      )
      .on("error", reject)
      .on("timeout", function () {
        this.destroy();
        reject(new Error("Timeout"));
      });
  });
}

function slugify(name) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  console.log("🐟 Ikanhub FishBase Crawler");
  console.log("===========================");

  // Ensure directories exist
  fs.mkdirSync(IMAGES_DIR, { recursive: true });

  const allMetadata = [];
  let totalDownloaded = 0;
  let totalFailed = 0;

  for (const genus of GENERA) {
    console.log(`\n📁 Processing genus: ${genus}`);

    try {
      const species = await scrapeSpeciesList(genus);
      console.log(`   Found species: ${species.join(", ")}`);

      for (const speciesName of species) {
        console.log(`   📷 Fetching images for ${speciesName}...`);

        try {
          const images = await scrapeSpeciesImages(speciesName);

          for (const img of images) {
            const sluG = slugify(speciesName);
            const filename = `${sluG}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}.jpg`;
            const localPath = path.join("fishbase-images", filename);
            const fullPath = path.join(IMAGES_DIR, filename);

            // Skip if already downloaded
            if (fs.existsSync(fullPath)) {
              console.log(`      ⏭ Already exists: ${filename}`);
              allMetadata.push({ ...img, filename, localPath });
              continue;
            }

            try {
              console.log(`      ⬇ Downloading: ${img.imageUrl.substring(0, 80)}...`);
              await downloadFile(img.imageUrl, fullPath);
              totalDownloaded++;

              allMetadata.push({
                ...img,
                filename,
                localPath,
              });

              console.log(`      ✅ Saved: ${filename}`);
            } catch (err) {
              totalFailed++;
              console.log(`      ❌ Failed: ${err.message}`);
            }

            // Be nice to FishBase servers
            await new Promise((r) => setTimeout(r, 1000));
          }
        } catch (err) {
          console.log(`      ❌ Error fetching species: ${err.message}`);
        }
      }
    } catch (err) {
      console.log(`   ❌ Error processing genus: ${err.message}`);
    }
  }

  // Write metadata.json
  fs.writeFileSync(METADATA_FILE, JSON.stringify(allMetadata, null, 2));
  console.log(`\n========================================`);
  console.log(`📊 Summary:`);
  console.log(`   Total downloaded: ${totalDownloaded}`);
  console.log(`   Total failed: ${totalFailed}`);
  console.log(`   Total metadata records: ${allMetadata.length}`);
  console.log(`   Metadata file: ${METADATA_FILE}`);
  console.log(`========================================`);
}

main().catch(console.error);
