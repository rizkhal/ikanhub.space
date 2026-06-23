/**
 * import-fishbase-metadata.ts
 *
 * Import script: Reads storage/fishbase-images/metadata.json
 * and inserts/updates FishImage records in the database.
 *
 * Run: npx tsx scripts/import-fishbase-metadata.ts
 */

import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const prisma = new PrismaClient();

const STORAGE_DIR = path.resolve(__dirname, "..", "storage");
const METADATA_FILE = path.join(STORAGE_DIR, "metadata.json");

interface MetadataEntry {
  speciesId: string;
  scientificName: string;
  commonName: string;
  filename: string;
  author: string;
  locality: string;
  license: string;
  photoPageUrl: string;
  imageUrl: string;
  localPath: string;
  contentType: string;
  fileSize: number;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function main() {
  console.log("🐟 Ikanhub Metadata Importer");
  console.log("============================");

  // Check if metadata file exists
  if (!fs.existsSync(METADATA_FILE)) {
    console.error(`❌ Metadata file not found: ${METADATA_FILE}`);
    console.error("   Run download-fishbase-bestphotos.js first.");
    process.exit(1);
  }

  // Read metadata
  const raw = fs.readFileSync(METADATA_FILE, "utf-8");
  const metadata: MetadataEntry[] = JSON.parse(raw);
  console.log(`📄 Found ${metadata.length} records in metadata.json`);

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const entry of metadata) {
    try {
      // Check if already imported by filename
      const existingByFilename = await prisma.fishImage.findUnique({
        where: { filename: entry.filename },
      });

      if (existingByFilename) {
        skipped++;
        continue;
      }

      // Check if already imported by photoPageUrl
      const existingByUrl = await prisma.fishImage.findUnique({
        where: { sourcePageUrl: entry.photoPageUrl },
      });

      if (existingByUrl) {
        skipped++;
        continue;
      }

      // Check that the file actually exists on disk
      const fullPath = path.resolve(STORAGE_DIR, entry.localPath);
      if (!fs.existsSync(fullPath)) {
        console.warn(`   ⚠ File missing on disk: ${entry.localPath}, skipping`);
        skipped++;
        continue;
      }

      // Get image dimensions using sharp if available
      let width: number | null = null;
      let height: number | null = null;

      // Generate slug
      const slug = slugify(entry.scientificName);
      const commonName = entry.commonName || null;

      // Create record
      await prisma.fishImage.create({
        data: {
          speciesId: entry.speciesId,
          scientificName: entry.scientificName,
          commonName,
          slug,
          filename: entry.filename,
          localPath: entry.localPath,
          originalUrl: entry.imageUrl,
          sourcePageUrl: entry.photoPageUrl,
          author: entry.author || null,
          locality: entry.locality || null,
          license: entry.license || null,
          width,
          height,
        },
      });

      imported++;
      if (imported % 10 === 0) {
        console.log(`   ✅ Imported ${imported} records...`);
      }
    } catch (err) {
      errors++;
      console.error(`   ❌ Error importing ${entry.species}: ${err}`);
    }
  }

  console.log(`\n========================================`);
  console.log(`📊 Import Summary:`);
  console.log(`   Total records: ${metadata.length}`);
  console.log(`   Imported: ${imported}`);
  console.log(`   Skipped: ${skipped}`);
  console.log(`   Errors: ${errors}`);
  console.log(`========================================`);

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  prisma.$disconnect();
  process.exit(1);
});
