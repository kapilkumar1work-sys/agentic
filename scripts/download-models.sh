#!/bin/bash
set -e

MODELS_DIR="./models"
BASE_URL="https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights"

mkdir -p "$MODELS_DIR"

echo "Downloading face-api.js models..."

files=(
  "ssd_mobilenetv1_model-weights_manifest.json"
  "ssd_mobilenetv1_model-shard1"
  "ssd_mobilenetv1_model-shard2"
)

for file in "${files[@]}"; do
  if [ ! -f "$MODELS_DIR/$file" ]; then
    echo "Downloading $file..."
    curl -fsSL "$BASE_URL/$file" -o "$MODELS_DIR/$file"
  else
    echo "$file already exists, skipping."
  fi
done

echo "Face detection models downloaded successfully."
