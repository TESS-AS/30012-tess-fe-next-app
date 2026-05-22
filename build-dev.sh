#!/usr/bin/env bash
# Build and push the dev FE Docker image.
# - Bakes the dev BE URL into the bundle at build time (NEXT_PUBLIC_API_BASE_URL).
# - Tags as :latest and pushes to ACR.
#
# Usage:  ./build-dev.sh

set -euo pipefail

IMAGE="tesscontainerregistry0.azurecr.io/tessfe:latest"
DEV_BE_URL="https://api.dev.tessix.no"

echo "→ Building dev image $IMAGE"
echo "  NEXT_PUBLIC_API_BASE_URL=$DEV_BE_URL"

docker buildx build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_BASE_URL="$DEV_BE_URL" \
  --load \
  -t "$IMAGE" \
  .

echo
echo "→ Pushing $IMAGE"
docker push "$IMAGE"

echo
echo "✅ Dev image built and pushed."
echo "Next: restart the dev App Service so it pulls the new image:"
echo "   az webapp restart --name tess-b2bFrontend-30011-dev --resource-group rg-automation-30011-dev"
