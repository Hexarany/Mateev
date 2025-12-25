#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR=$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)
REPO_DIR="${REPO_DIR:-$(cd "$SCRIPT_DIR/.." && pwd)}"
GIT_BRANCH="${GIT_BRANCH:-main}"
IMAGE_NAME="${IMAGE_NAME:-mateev}"
CONTAINER_NAME="${CONTAINER_NAME:-mateev}"
ENV_FILE="${ENV_FILE:-$REPO_DIR/.env}"
PORT_BIND="${PORT_BIND:-127.0.0.1:3000:3000}"
UPLOADS_DIR="${UPLOADS_DIR:-$REPO_DIR/uploads}"

echo "[deploy] repo: $REPO_DIR"
echo "[deploy] branch: $GIT_BRANCH"
echo "[deploy] image: $IMAGE_NAME"
echo "[deploy] container: $CONTAINER_NAME"
echo "[deploy] env file: $ENV_FILE"
echo "[deploy] uploads: $UPLOADS_DIR"

if [ ! -f "$ENV_FILE" ]; then
  echo "[deploy] env file not found: $ENV_FILE"
  exit 1
fi

mkdir -p "$UPLOADS_DIR"

git -C "$REPO_DIR" fetch origin "$GIT_BRANCH"
git -C "$REPO_DIR" checkout "$GIT_BRANCH"
git -C "$REPO_DIR" pull --ff-only origin "$GIT_BRANCH"

docker build -t "$IMAGE_NAME:latest" "$REPO_DIR"

docker stop "$CONTAINER_NAME" >/dev/null 2>&1 || true
docker rm "$CONTAINER_NAME" >/dev/null 2>&1 || true

docker run -d --name "$CONTAINER_NAME" \
  --restart unless-stopped \
  --env-file "$ENV_FILE" \
  -p "$PORT_BIND" \
  -v "$UPLOADS_DIR":/app/server/uploads \
  "$IMAGE_NAME:latest"

docker ps --filter "name=$CONTAINER_NAME"
