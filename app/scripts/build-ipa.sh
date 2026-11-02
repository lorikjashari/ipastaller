#!/usr/bin/env bash
#
# Build HelloIPA and package it as build/HelloIPA.ipa
#
# Requires macOS with Xcode (and a signing team for the signed build).
#
#   ./scripts/build-ipa.sh              signed .ipa (set your Team in Xcode first)
#   ./scripts/build-ipa.sh --unsigned   unsigned .ipa (for inspecting the format only)
#
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

MODE="${1:-signed}"
BUILD_DIR="$ROOT/build"
OUT="$BUILD_DIR/HelloIPA.ipa"

command -v xcodebuild >/dev/null || { echo "error: xcodebuild not found (macOS + Xcode required)"; exit 1; }

rm -rf "$BUILD_DIR"
mkdir -p "$BUILD_DIR/Payload"

if [[ "$MODE" == "--unsigned" ]]; then
  xcodebuild \
    -project HelloIPA.xcodeproj \
    -scheme HelloIPA \
    -configuration Release \
    -sdk iphoneos \
    -derivedDataPath "$BUILD_DIR/DerivedData" \
    CODE_SIGNING_ALLOWED=NO \
    CODE_SIGNING_REQUIRED=NO \
    build

  APP="$BUILD_DIR/DerivedData/Build/Products/Release-iphoneos/HelloIPA.app"
else
  ARCHIVE="$BUILD_DIR/HelloIPA.xcarchive"
  xcodebuild archive \
    -project HelloIPA.xcodeproj \
    -scheme HelloIPA \
    -configuration Release \
    -destination "generic/platform=iOS" \
    -archivePath "$ARCHIVE" \
    -allowProvisioningUpdates

  APP="$ARCHIVE/Products/Applications/HelloIPA.app"
fi

cp -R "$APP" "$BUILD_DIR/Payload/"

# ditto/zip preserve symlinks and the executable bit, which Python's zipfile
# does not do reliably. Fall back to the Python packer if unavailable.
if command -v ditto >/dev/null; then
  ( cd "$BUILD_DIR" && ditto -c -k --sequesterRsrc --keepParent Payload "$OUT" )
elif command -v zip >/dev/null; then
  ( cd "$BUILD_DIR" && zip -qry "$OUT" Payload )
else
  python3 "$ROOT/scripts/make-ipa.py" "$APP" "$OUT"
fi

echo "built $OUT"
