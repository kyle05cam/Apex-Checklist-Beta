#!/usr/bin/env bash
# Build whisper.cpp static library for iOS.
#
# This script works on BOTH Apple Silicon AND Intel Macs.
# It detects your machine and builds the appropriate slices:
#
#   Intel Mac  → builds arm64 device slice only (cross-compile)
#                (x86_64 simulator is NOT needed — the Simulator
#                 uses a stub in WhisperEngine.swift on device builds)
#   Apple Silicon → builds arm64 device + arm64 simulator slices
#
# Output (written to ios/App/App/whisper/):
#   libwhisper.a   — static library to link in Xcode
#   whisper.h      — C header (imported via App-Bridging-Header.h)
#
# Prerequisites:
#   brew install cmake     (if cmake is missing)
#   Xcode command-line tools installed
#
# Usage:
#   bash scripts/build_whisper_ios.sh

set -euo pipefail

HOST_ARCH="$(uname -m)"
WHISPER_TAG="v1.7.3"
REPO_ROOT="$(cd "$(dirname "$0")/.." && pwd)"
BUILD_DIR="$REPO_ROOT/.whisper_build"
OUT_DIR="$REPO_ROOT/ios/App/App/whisper"

DEVICE_SDK="$(xcrun --sdk iphoneos --show-sdk-path)"
SIM_SDK="$(xcrun --sdk iphonesimulator --show-sdk-path)"

echo "==> Host: $HOST_ARCH"
echo "==> whisper.cpp $WHISPER_TAG"
echo "==> Output: $OUT_DIR"
echo ""

# ── Clone if needed ─────────────────────────────────────────────────────────
if [ ! -f "$BUILD_DIR/CMakeLists.txt" ]; then
  echo "==> Cloning whisper.cpp $WHISPER_TAG …"
  rm -rf "$BUILD_DIR"
  git clone --depth 1 --branch "$WHISPER_TAG" \
    https://github.com/ggerganov/whisper.cpp.git "$BUILD_DIR"
else
  echo "==> whisper.cpp already cloned, skipping clone."
fi

# ── Build helper ─────────────────────────────────────────────────────────────
build_slice() {
  local NAME=$1   # e.g. "arm64_device"
  local ARCH=$2   # e.g. "arm64"
  local SDK=$3    # full sdk path
  local TARGET=$4 # clang target triple

  local OUT="$BUILD_DIR/build_${NAME}"
  echo ""
  echo "==> Building $NAME ($ARCH) …"
  rm -rf "$OUT" && mkdir -p "$OUT"

  cmake -S "$BUILD_DIR" -B "$OUT" \
    -DCMAKE_BUILD_TYPE=Release \
    -DCMAKE_SYSTEM_NAME=iOS \
    -DCMAKE_OSX_ARCHITECTURES="$ARCH" \
    -DCMAKE_OSX_SYSROOT="$SDK" \
    -DCMAKE_OSX_DEPLOYMENT_TARGET=16.0 \
    -DCMAKE_C_FLAGS="-target $TARGET" \
    -DCMAKE_CXX_FLAGS="-target $TARGET" \
    -DWHISPER_COREML=OFF \
    -DBUILD_SHARED_LIBS=OFF \
    -DWHISPER_BUILD_TESTS=OFF \
    -DWHISPER_BUILD_EXAMPLES=OFF \
    -DGGML_METAL=OFF \
    -DGGML_ACCELERATE=OFF \
    -DGGML_BLAS=OFF \
    2>&1

  cmake --build "$OUT" --config Release -j"$(sysctl -n hw.logicalcpu)" 2>&1
}

# ── Build slices ──────────────────────────────────────────────────────────────
# Always build arm64 device (required for real device / App Store)
build_slice "arm64_device" "arm64" "$DEVICE_SDK" "arm64-apple-ios16.0"

if [ "$HOST_ARCH" = "arm64" ]; then
  # Apple Silicon: also build arm64 simulator so you can test in Simulator
  build_slice "arm64_sim" "arm64" "$SIM_SDK" "arm64-apple-ios16.0-simulator"

  echo ""
  echo "==> Creating fat library (device + sim) …"
  mkdir -p "$OUT_DIR"
  lipo -create \
    "$BUILD_DIR/build_arm64_device/ggml/src/libggml.a" \
    "$BUILD_DIR/build_arm64_sim/ggml/src/libggml.a" \
    -output "$OUT_DIR/libggml.a" 2>/dev/null || true

  lipo -create \
    "$BUILD_DIR/build_arm64_device/src/libwhisper.a" \
    "$BUILD_DIR/build_arm64_sim/src/libwhisper.a" \
    -output "$OUT_DIR/libwhisper.a"
else
  # Intel Mac: device-only (Simulator uses Swift stub — no lib needed there)
  echo ""
  echo "==> Intel Mac detected — device slice only."
  echo "    (Simulator uses WhisperEngine stub; no x86_64 lib needed.)"
  mkdir -p "$OUT_DIR"
  cp "$BUILD_DIR/build_arm64_device/src/libwhisper.a" "$OUT_DIR/libwhisper.a"
  cp "$BUILD_DIR/build_arm64_device/ggml/src/libggml.a" "$OUT_DIR/libggml.a" 2>/dev/null || true
fi

# ── Copy header ───────────────────────────────────────────────────────────────
cp "$BUILD_DIR/include/whisper.h" "$OUT_DIR/whisper.h"

echo ""
echo "======================================================"
echo " Done! Files written to:"
echo "   $OUT_DIR/libwhisper.a"
echo "   $OUT_DIR/whisper.h"
echo "======================================================"
echo ""
echo "Next — in Xcode (open with: npx cap open ios):"
echo "  1. Select the 'App' target → Build Settings"
echo "  2. Objective-C Bridging Header  →  App/App-Bridging-Header.h"
echo "  3. Library Search Paths         →  \$(SRCROOT)/App/whisper"
echo "  4. Other Linker Flags           →  -lwhisper -lggml"
echo "  5. Drag libwhisper.a + libggml.a into Link Binary With Libraries"
echo "  6. Set Bundle Identifier        →  com.apexkneeboard.app"
echo "  7. Build & run on a real device."
