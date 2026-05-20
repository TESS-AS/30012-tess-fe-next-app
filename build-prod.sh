#!/usr/bin/env bash
# Build and push the prod FE Docker image.
# - Uses the prod BE URL (matches the fallback in axiosConfig.ts, so no build-arg
#   strictly needed — passed explicitly for clarity / future-proofing).
# - Takes a version tag as the first argument.
#
# Usage:  ./build-prod.sh v1.16.57

set -euo pipefail

if [ -z "${1:-}" ]; then
  echo "Error: version tag required."
  echo "Usage: ./build-prod.sh v1.16.57"
  exit 1
fi

VERSION="$1"
IMAGE="tesscontainerregistry0.azurecr.io/tessfe:$VERSION"
PROD_BE_URL="https://api.tessix.no"

echo "→ Building prod image $IMAGE"
echo "  NEXT_PUBLIC_API_BASE_URL=$PROD_BE_URL"

docker buildx build \
  --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_BASE_URL="$PROD_BE_URL" \
  --load \
  -t "$IMAGE" \
  .

echo
echo "→ Pushing $IMAGE"
docker push "$IMAGE"

echo
echo "✅ Prod image $VERSION built and pushed."
echo
echo "Next steps (manual, deliberate):"
echo "  1. Update the prod App Service Container Image setting to point at $IMAGE"
echo "     az webapp config container set \\"
echo "       --name tess-b2bFrontend-30011 \\"
echo "       --resource-group rg-automation-30011-dev \\"
echo "       --container-image-name $IMAGE"
echo "  2. Restart the prod App Service:"
echo "     az webapp restart --name tess-b2bFrontend-30011 --resource-group rg-automation-30011-dev"
