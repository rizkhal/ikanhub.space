#!/bin/bash

set -e

git pull

npm --prefix apps/api install
npm --prefix apps/api run db:generate
npm --prefix apps/api run build

npm --prefix apps/web install
npm --prefix apps/web run build

pm2 restart ikanhub-api

echo "Deploy complete"
