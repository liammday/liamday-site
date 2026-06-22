#!/usr/bin/env bash
#
# deploy.sh — build and publish liamday-site to GitHub Pages WITHOUT GitHub
# Actions. This is the local fallback so the site can always ship — even when
# the GitHub Actions minute budget is exhausted (see ~/GitHub/LOCAL-FALLBACK.md).
#
# How it works:
#   1. npm install + `astro build`            -> ./dist
#   2. guarantee dist/CNAME (custom domain) and dist/.nojekyll exist
#   3. force-publish ./dist to the `gh-pages` branch as a single fresh commit
#   4. push gh-pages — GitHub Pages (Settings -> Pages -> "Deploy from a branch":
#      gh-pages /) serves it via the FREE built-in Pages builder, which does NOT
#      consume the Actions minute quota. Zero Actions minutes per deploy.
#
# The committed deploy.yml does the exact same thing on `workflow_dispatch`, so a
# cloud build is still available on demand when you are under budget.
#
# Usage:
#   scripts/deploy.sh                build, then publish
#   scripts/deploy.sh --skip-build   publish an already-built ./dist
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

BRANCH="gh-pages"
DOMAIN="www.liamday.co.uk"
SKIP_BUILD=false
[ "${1:-}" = "--skip-build" ] && SKIP_BUILD=true

if ! $SKIP_BUILD; then
  echo "==> npm install"
  npm install --no-audit --no-fund
  echo "==> astro build"
  npm run build
fi
[ -d dist ] || { echo "deploy: ./dist not found — run without --skip-build" >&2; exit 1; }

# GitHub Pages serving files (idempotent; public/ already provides both, this is
# belt-and-braces in case of a --skip-build on a stale dist).
echo "$DOMAIN" > dist/CNAME
: > dist/.nojekyll

REMOTE="$(git remote get-url origin)"
SRC_SHA="$(git rev-parse --short HEAD)"
STAMP="$(date -u '+%Y-%m-%d %H:%M:%SZ')"

echo "==> Publishing ./dist to '$BRANCH' (single force-pushed commit)"
(
  cd dist
  rm -rf .git
  git init -q
  git checkout -q -b "$BRANCH"
  git add -A
  git -c user.name='liamday-deploy' -c user.email='deploy@liamday.co.uk' \
      commit -q -m "Deploy $STAMP (source $SRC_SHA)"
  git push -q -f "$REMOTE" "$BRANCH"
  rm -rf .git
)

echo "==> Done. Pushed '$BRANCH'."
echo "    Live at https://$DOMAIN/ — served by the free Pages builder, 0 Actions minutes."
