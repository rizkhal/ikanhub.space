# IkanHub 🐟

**Beautiful fish placeholder images for developers.**

IkanHub is a fish-only placeholder image service inspired by Picsum Photos. Generate random fish images by size, species, or ID. Simple URLs, fast responses, and metadata included.

> **Live:** [https://ikanhub.space](https://ikanhub.space)
> **API:** [https://api.ikanhub.space](https://api.ikanhub.space)

---

## Architecture

```
ikanhub.space/
├── apps/
│   ├── web/               # React Vite frontend (port 3000)
│   │   └── src/pages/     # Landing, Docs, Explore, About
│   └── api/               # Hono backend (port 3001)
│       └── src/
│           ├── routes/         # fish.ts, api.ts
│           ├── services/       # metadata.service.ts (JSON-backed)
│           ├── utils/          # cache.ts
│           └── lib/            # image.ts (Sharp processing)
├── storage/
│   ├── metadata.json           # FishBase image metadata
│   ├── fishbase-images/        # Source images
│   ├── fishbase-indonesia/     # Indonesia checklist data
│   └── cache/                  # Sharp resized output
├── scripts/
│   ├── import-fishbase-indonesia-excel.js  # Indonesia checklist importer
│   ├── import-fishbase-metadata.ts          # FishBase Best Photos importer (legacy)
│   └── download-fishbase-bestphotos.js      # FishBase crawler (legacy)
└── data/                      # Excel/CSV input files
```

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React 18 + Vite + TypeScript |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Hono (Node.js) |
| Image processing | Sharp |
| Storage | JSON metadata + local filesystem |
| Database | None (JSON-only MVP) |

---

## Quick Start

### Prerequisites

- Node.js >= 18
- npm >= 9

### Setup

```bash
# 1. Clone and install
npm install

# 2. Prepare storage
mkdir -p storage/cache
# Place metadata.json in storage/

# 3. Configure environment
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env
```

### Environment Variables

**`apps/api/.env`**

```env
PORT=3001
STORAGE_DIR=../../storage
METADATA_PATH=../../storage/metadata.json
```

**`apps/web/.env`**

```env
VITE_API_URL=http://localhost:3001
```

### Run Development

```bash
npm run dev
```

This starts both the API (port 3001) and frontend (port 3000) concurrently. The Vite dev server proxies `/fish` and `/api` requests to the backend.

---

## API Endpoints

### Image Endpoints

| Endpoint | Description | Cache |
|----------|-------------|-------|
| `GET /fish/400` | Random square image (400×400) | No cache |
| `GET /fish/800/600` | Random image resized to 800×600 | No cache |
| `GET /fish/id/12/800/600` | Specific image by ID | Long cache |
| `GET /fish/species/tuna/800/600` | Random image from species | Long cache |

### Metadata Endpoints

| Endpoint | Description | Cache |
|----------|-------------|-------|
| `GET /fish/random.json` | Random image metadata | No cache |
| `GET /fish/id/12.json` | Specific image metadata | Long cache |
| `GET /api/search?q=...` | Search images | Long cache |
| `GET /api/stats` | API statistics | Long cache |
| `GET /api/species` | List all species | Long cache |
| `GET /api/species/:slug` | Species detail | Long cache |
| `GET /api/localities` | List localities | Long cache |
| `GET /api/localities/:slug` | Locality detail | Long cache |
| `GET /health` | Health check | None |

### Usage Examples

```html
<!-- HTML -->
<img src="https://api.ikanhub.space/fish/800/600" />
<img src="https://api.ikanhub.space/fish/species/tuna/400" />

<!-- With cache busting (for guaranteed fresh random images) -->
<img src="https://api.ikanhub.space/fish/800/600?v=1712345678901" />
```

```css
/* CSS */
.hero {
  background-image: url('https://api.ikanhub.space/fish/1920/1080');
  background-size: cover;
}
```

```bash
# curl
curl -o fish.jpg https://api.ikanhub.space/fish/800/600
curl https://api.ikanhub.space/fish/random.json
```

---

## Scripts

### Import FishBase Indonesia Excel/CSV

Import the Indonesia species checklist from an Excel (.xlsx) or CSV file exported from FishBase.

```bash
node scripts/import-fishbase-indonesia-excel.js data/fishbase-indonesia.xlsx

# With options
node scripts/import-fishbase-indonesia-excel.js data/fishbase-indonesia.csv \
  --limit=50 \
  --delay=1000 \
  --skip-images \
  --resume
```

**CSV support:** The script parses `=HYPERLINK("url", "text")` formulas from Excel-exported CSV files. Both `.xlsx` and `.csv` are supported.

**Options:**

| Flag | Default | Description |
|------|---------|-------------|
| `--sheet=Sheet1` | First sheet | Worksheet name |
| `--skip-images` | false | Skip image downloads (metadata only) |
| `--delay=1500` | 1200 | Delay between downloads (ms) |
| `--limit=100` | unlimited | Max species to process |
| `--output=path` | `storage/fishbase-indonesia` | Output directory |
| `--resume` | false | Resume from existing metadata |

**Output:**

```
storage/fishbase-indonesia/
├── metadata.json       # 4,200+ species records
├── failed.json          # Failed image downloads
├── localities.json      # Location groupings for future map features
└── images/
    └── Acanthurus_auranticavus/
        └── Acaur_u2.jpg
```

Each metadata record includes:
- Scientific name, common names, family, author
- Occurrence, abundance, max length, maturity
- Remark-based location extraction (`locationsMentioned[]`, `distributionText`, `references[]`)
- Geo fields prepared for future map features
- Image URLs and quality tracking (full / thumbnail)

### Other Scripts

```bash
# Legacy: Import FishBase Best Photos metadata
npm run import -w @ikanhub/scripts

# Legacy: Download FishBase Best Photos
npm run download -w @ikanhub/scripts
```

---

## Deployment

### Production Build

```bash
# Build API
npm run build -w @ikanhub/api

# Build frontend
npm run build -w @ikanhub/web

# Or use the deploy script
./deploy.sh
```

### PM2 (Recommended)

```bash
pm2 start ecosystem.config.cjs
```

### Nginx Reverse Proxy

```
# /fish and /api routes → backend (port 3001)
location / {
    proxy_pass http://localhost:3000;  # Frontend
}
location /fish {
    proxy_pass http://localhost:3001;
}
location /api {
    proxy_pass http://localhost:3001;
}
```

### Requirements

- Node.js >= 18
- Nginx (reverse proxy)
- PM2 (process manager)
- Storage folder with metadata.json and images

No PostgreSQL or Prisma required.

---

## Data Sources

- **FishBase Best Photos** — Scientific fish images curated by biologists and ichthyologists worldwide. Each image is tied to a species record with verifiable metadata.
- **FishBase Indonesia Checklist** — Species occurrence checklist for Indonesian waters, including distribution data and locality records.

Images are used under their respective licenses (typically CC BY-NC 4.0). Check individual metadata for license details.

---

## Project Structure Details

```
apps/api/src/
├── index.ts                        # Hono server entry
├── routes/
│   ├── fish.ts                     # Image endpoints
│   └── api.ts                      # Metadata/search endpoints
├── services/
│   └── metadata.service.ts         # JSON metadata loader & queries
├── utils/
│   └── cache.ts                    # Cache header helpers
└── lib/
    └── image.ts                    # Sharp processing

apps/web/src/
├── main.tsx                        # Entry point
├── App.tsx                         # Router
├── pages/
│   ├── landing.tsx                 # Landing page
│   ├── docs.tsx                    # API documentation
│   ├── explore.tsx                 # Fish gallery
│   ├── fish-detail.tsx             # Image detail
│   └── about.tsx                   # Attribution page
├── components/                     # Shared UI components
├── hooks/                          # Custom hooks
└── lib/                            # Utilities
```

---

## License

The IkanHub software is MIT licensed. Fish images retain their original licenses as specified in the metadata.
