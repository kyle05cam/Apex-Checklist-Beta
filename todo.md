# Apex Kneeboard — Capacitor + ATC Whisper Engine

## Milestones

- [x] M1: Initialize Capacitor
        Install @capacitor/core, @capacitor/cli, @capacitor/ios.
        Run npx cap init and npx cap add ios.
        Verify Xcode project generates without errors.

- [x] M2: Configure build pipeline
        Update vite.config.js: base './', output to /dist.
        Update capacitor.config.ts with correct webDir.
        Run npm run build && npx cap sync.
        Verify app loads correctly in iOS Simulator.

- [x] M3: App Store configuration
        Set bundle identifier.
        Add NSMicrophoneUsageDescription and
        NSSpeechRecognitionUsageDescription to Info.plist.
        Add required entitlements.
        Configure app icons and launch screen.

- [x] M4: First-launch model download service
        The Whisper large-v3 ATC model (~1.5GB) is NOT bundled
        in the app binary. Instead, build a native Swift service
        (ModelDownloadService.swift) that:
          - Runs once on first app launch
          - Shows a full-screen setup UI with progress bar:
            "Downloading ATC Aviation Model (1.5GB)"
            "This is a one-time download. WiFi recommended."
          - Downloads model weights from Hugging Face:
            jacktol/whisper-large-v3-finetuned-for-ATC
          - Saves model to the app's local Documents directory
          - Marks download complete in UserDefaults so it
            never runs again
          - On subsequent launches loads the cached model
            instantly from local storage
        This keeps the App Store binary small while delivering
        the full-size high-accuracy model to the user.

- [x] M5: ATC Whisper native plugin
        Compile whisper.cpp for iOS (arm64).
        Write WhisperPlugin.swift — a Capacitor plugin that:
          - Loads the locally cached ATC fine-tuned model weights
          - Accepts start/stop commands from JavaScript
          - Captures microphone audio at 16kHz mono PCM
            (required format for Whisper inference)
          - Runs inference through the ATC fine-tuned model
            entirely on-device with no network calls
          - Emits interim and final transcript strings back
            to JavaScript
        The JavaScript callback shape must exactly match the
        existing onresult handler in cessna172s_checklist.jsx
        so no downstream code changes are needed.

- [x] M6: Wire plugin into app
        In cessna172s_checklist.jsx, find the
        webkitSpeechRecognition initialization block
        (around line 2800) and replace it with calls to
        WhisperPlugin via Capacitor.Plugins.WhisperPlugin.
        The existing normalizeAtcSpeech(), normalizePhonetic(),
        commDetectType(), and all parser functions remain
        completely unchanged — they process Whisper output
        exactly as they processed Web Speech API output.

- [ ] M7: End-to-end test in Xcode Simulator
        Verify first-launch download flow completes correctly.
        Verify mic capture, transcription, type detection,
        and auto-fill of ATIS / Taxi / Ground clearance cards
        all function correctly on simulated device.

---

## M7 Manual Xcode Steps (required before simulator test)

Before M7 can be verified in Xcode Simulator, complete these one-time Xcode setup steps:

### 1. Compile whisper.cpp
```bash
bash scripts/build_whisper_ios.sh
```
This clones whisper.cpp, builds libwhisper.a for arm64 device + simulator, and writes
`ios/App/App/whisper/libwhisper.a` + `ios/App/App/whisper/whisper.h`.

### 2. Open Xcode project
```bash
npx cap open ios
```

### 3. In Xcode Build Settings for the "App" target:
- **Objective-C Bridging Header** → `App/App-Bridging-Header.h`
- **Library Search Paths** → add `$(SRCROOT)/App/whisper`
- **Other Linker Flags** → add `-lwhisper`
- **Bundle Identifier** → `com.apexkneeboard.app`

### 4. Link libwhisper.a
Drag `ios/App/App/whisper/libwhisper.a` into Xcode → App target → Link Binary With Libraries.

### 5. Download GGUF model weights
The GGUF-format model file must be available from HuggingFace. If jacktol's repo does not
publish a GGUF file directly, convert using:
```bash
python3 .whisper_build/models/convert-pt-to-ggml.py \
  <hf_cache>/jacktol/whisper-large-v3-finetuned-for-ATC \
  .whisper_build \
  ios/App/App/whisper/
```
The ModelDownloadService downloads `ggml-large-v3-atc.bin` from HuggingFace at first launch.
Update `HF_MODEL_URL` in `ModelDownloadService.swift` to match the actual published filename.

### 6. Run in Simulator
Select an iPad Air or iPad Pro simulator (iOS 17+). First launch shows the download UI;
subsequent launches skip straight to the app.

---

## Build Log
