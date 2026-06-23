import sharp from "sharp";
import path from "path";
import fs from "fs/promises";

const STORAGE_DIR = process.env.STORAGE_DIR || "../../storage";

export async function getResizedImage(
  sourcePath: string,
  width: number,
  height: number
): Promise<Buffer> {
  const fullPath = path.resolve(STORAGE_DIR, sourcePath);
  const cacheDir = path.resolve(STORAGE_DIR, "cache");
  const cacheKey = `${path.basename(sourcePath)}_${width}x${height}.jpg`;
  const cachePath = path.join(cacheDir, cacheKey);

  // Check cache
  try {
    const cached = await fs.readFile(cachePath);
    return cached;
  } catch {
    // Not cached, proceed
  }

  // Ensure cache dir exists
  await fs.mkdir(cacheDir, { recursive: true });

  // Process with Sharp
  const buffer = await fs.readFile(fullPath);
  const resized = await sharp(buffer)
    .resize(width, height, {
      fit: "cover",
      position: "center",
    })
    .jpeg({ quality: 85 })
    .toBuffer();

  // Write to cache
  await fs.writeFile(cachePath, resized);

  return resized;
}

export async function getImageBuffer(sourcePath: string): Promise<Buffer> {
  const fullPath = path.resolve(STORAGE_DIR, sourcePath);
  return fs.readFile(fullPath);
}
