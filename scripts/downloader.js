import fs from "node:fs/promises";
import path from "node:path";
import * as cheerio from "cheerio";

const BASE = "https://fishbase.se";
const OUT_DIR = "./fishbase-images";
const DELAY_MS = 1200;
const MAX_PAGES = 26;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function safeName(input) {
  return String(input || "unknown")
    .replace(/[^\w\s.-]/g, "")
    .replace(/\s+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 120);
}

function absUrl(url) {
  return new URL(url, BASE).href;
}

async function fetchText(url) {
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 fishbase-downloader",
    },
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${url}`);
  }

  return await res.text();
}

async function downloadFile(url, filePath) {
  const res = await fetch(url, {
    redirect: "follow",
    headers: {
      "User-Agent": "Mozilla/5.0 fishbase-downloader",
      Referer: BASE,
    },
  });

  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText}: ${url}`);
  }

  const contentType = res.headers.get("content-type") || "";

  if (!contentType.startsWith("image/")) {
    const preview = await res.text();
    throw new Error(
      `Not an image. content-type=${contentType}. preview=${preview.slice(0, 100)}`,
    );
  }

  const buffer = Buffer.from(await res.arrayBuffer());

  if (buffer.length < 2048) {
    throw new Error(`Image too small or corrupted: ${buffer.length} bytes`);
  }

  await fs.writeFile(filePath, buffer);

  return {
    contentType,
    size: buffer.length,
  };
}

async function getPhotoLinksFromBestPage(pageIndex) {
  const start = pageIndex * 18;

  const url =
    pageIndex === 0
      ? `${BASE}/photos/BestPhotos.php`
      : `${BASE}/photos/BestPhotos.php?start=${start}`;

  const html = await fetchText(url);
  const $ = cheerio.load(html);

  const links = [];

  $("a").each((_, el) => {
    const href = $(el).attr("href");
    if (!href) return;

    if (href.includes("PicturesSummary.php")) {
      links.push(absUrl(href));
    }
  });

  return [...new Set(links)];
}

function cleanValue(value) {
  return String(value || "")
    .replace(/\s+/g, " ")
    .replace(/\s+View this.*$/i, "")
    .replace(/\s+Collaborator.*$/i, "")
    .trim();
}

function getDirectPhotoUrl(filename) {
  return `${BASE}/images/species/${filename}`;
}

async function parsePhotoSummary(photoUrl) {
  const html = await fetchText(photoUrl);
  const $ = cheerio.load(html);

  const bodyText = $("body").text().replace(/\s+/g, " ").trim();

  const url = new URL(photoUrl);

  const speciesId =
    url.searchParams.get("ID") || url.searchParams.get("id") || "";

  const filename =
    url.searchParams.get("pic") ||
    bodyText.match(/\(([A-Za-z0-9_.-]+\.(?:jpg|jpeg|png))\)/i)?.[1] ||
    "";

  if (!filename) {
    throw new Error("No filename found");
  }

  const scientificName =
    bodyText.match(/Image:\s*([A-Z][a-zA-Z-]+\s+[a-zA-Z-]+)/)?.[1] ||
    bodyText.match(
      new RegExp(
        `All\\s+([A-Z][a-zA-Z-]+\\s+[a-zA-Z-]+)\\s+\\(${filename.replace(".", "\\.")}\\)`,
      ),
    )?.[1] ||
    "Unknown Species";

  const author =
    bodyText.match(
      /\)\s*by\s+(.+?)(?:\s+Collaborator|\s+View this|\s+Size:|\s+Locality:|\s+Sex\/Stage:|\s+Date:|\s+Reference:|\s+Source:|\s+Remark:|$)/i,
    )?.[1] || "";

  const locality =
    bodyText.match(
      /Locality:\s*(.+?)(?:\s+Sex\/Stage:|\s+Date:|\s+Reference:|\s+Source:|\s+Remark:|$)/i,
    )?.[1] || "";

  const license =
    bodyText.match(/CC BY-NC 4\.0/i)?.[0] ||
    (bodyText.includes("non-commercial") ? "Non-commercial use noted" : "");

  const imageUrl = getDirectPhotoUrl(filename);

  return {
    speciesId,
    scientificName: cleanValue(scientificName),
    commonName: "",
    filename,
    author: cleanValue(author),
    locality: cleanValue(locality),
    license: cleanValue(license),
    photoPageUrl: photoUrl,
    imageUrl,
  };
}

async function main() {
  await fs.rm(OUT_DIR, { recursive: true, force: true });
  await fs.mkdir(OUT_DIR, { recursive: true });

  const metadata = [];
  const failed = [];
  const seenPhotos = new Set();

  for (let page = 0; page < MAX_PAGES; page++) {
    console.log(`\n[PAGE ${page + 1}/${MAX_PAGES}]`);

    let photoLinks = [];

    try {
      photoLinks = await getPhotoLinksFromBestPage(page);
    } catch (err) {
      console.error(`Failed page ${page + 1}:`, err.message);
      continue;
    }

    console.log(`Found ${photoLinks.length} photo links`);

    for (const photoUrl of photoLinks) {
      if (seenPhotos.has(photoUrl)) continue;
      seenPhotos.add(photoUrl);

      try {
        await sleep(DELAY_MS);

        const item = await parsePhotoSummary(photoUrl);

        const speciesDir = path.join(OUT_DIR, safeName(item.scientificName));
        await fs.mkdir(speciesDir, { recursive: true });

        const ext = path.extname(item.filename) || ".jpg";
        const baseName = path.basename(item.filename, ext);
        const localFilename = `${safeName(baseName)}${ext.toLowerCase()}`;
        const localPath = path.join(speciesDir, localFilename);

        console.log(`Downloading: ${item.scientificName} -> ${localPath}`);

        await sleep(DELAY_MS);

        const downloaded = await downloadFile(item.imageUrl, localPath);

        metadata.push({
          ...item,
          localPath,
          contentType: downloaded.contentType,
          fileSize: downloaded.size,
        });

        await fs.writeFile(
          path.join(OUT_DIR, "metadata.json"),
          JSON.stringify(metadata, null, 2),
        );
      } catch (err) {
        console.error(`FAILED: ${photoUrl}`, err.message);
        failed.push({ photoUrl, error: err.message });
      }
    }
  }

  await fs.writeFile(
    path.join(OUT_DIR, "metadata.json"),
    JSON.stringify(metadata, null, 2),
  );

  await fs.writeFile(
    path.join(OUT_DIR, "failed.json"),
    JSON.stringify(failed, null, 2),
  );

  console.log(
    `\nDone. Downloaded: ${metadata.length}, failed: ${failed.length}`,
  );
}

main();
