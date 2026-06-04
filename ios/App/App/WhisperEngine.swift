import Foundation
import AVFoundation

// ---------------------------------------------------------------------------
// WhisperEngine — on-device ATC Whisper inference via whisper.cpp
//
// SIMULATOR BUILD: whisper.cpp does not run in the iOS Simulator (x86_64 or
// arm64-sim). The #if targetEnvironment(simulator) block below provides a
// stub so the Xcode project compiles and runs in the Simulator without
// libwhisper.a linked. The mic capture pipeline is fully live in Simulator;
// transcription just returns empty strings until you test on a real device.
//
// DEVICE BUILD: whisper.cpp must be compiled and linked (see
// scripts/build_whisper_ios.sh). The real inference path runs below.
// ---------------------------------------------------------------------------

#if targetEnvironment(simulator)

/// Simulator stub — compiles without libwhisper.a.
class WhisperEngine {
    var onResult: ((String, Bool) -> Void)?

    init(modelURL: URL) throws {
        // No-op on simulator — model not needed
    }

    func feed(pcm: AVAudioPCMBuffer) {
        // Stub: no transcription in Simulator
    }

    func flush() {
        // Stub
    }
}

#else

// ---------------------------------------------------------------------------
// REAL DEVICE BUILD — requires libwhisper.a + whisper.h in ios/App/App/whisper/
// and Bridging Header set to App/App-Bridging-Header.h in Build Settings.
// ---------------------------------------------------------------------------

class WhisperEngine {

    // MARK: - Public

    /// Called on every inference result.
    /// `isFinal` = true when silence or buffer limit reached.
    var onResult: ((String, Bool) -> Void)?

    // MARK: - Private

    private var ctx: OpaquePointer?
    private var pcmBuffer: [Float] = []
    private let sampleRate: Double = 16_000
    private let maxBufferSeconds: Double = 30
    private let silenceThreshold: Float = 0.01
    private let silenceDurationTrigger: Double = 1.2
    private var silenceFrames: Int = 0
    private let queue = DispatchQueue(label: "com.apexkneeboard.whisper", qos: .userInitiated)

    // MARK: - Init

    init(modelURL: URL) throws {
        var params = whisper_context_default_params()
        params.use_gpu = true
        ctx = whisper_init_from_file_with_params(modelURL.path, params)
        guard ctx != nil else {
            throw WhisperError.modelLoadFailed(modelURL.path)
        }
    }

    deinit {
        if let ctx { whisper_free(ctx) }
    }

    // MARK: - Streaming API

    func feed(pcm: AVAudioPCMBuffer) {
        guard let channelData = pcm.floatChannelData?[0] else { return }
        let samples = Array(UnsafeBufferPointer(start: channelData, count: Int(pcm.frameLength)))
        queue.async { [weak self] in self?.append(samples: samples) }
    }

    func flush() {
        queue.async { [weak self] in
            guard let self, !self.pcmBuffer.isEmpty else { return }
            self.runInference(isFinal: true)
            self.pcmBuffer.removeAll()
        }
    }

    // MARK: - Private inference

    private func append(samples: [Float]) {
        pcmBuffer.append(contentsOf: samples)
        let rms = sqrt(samples.map { $0 * $0 }.reduce(0, +) / Float(samples.count))
        if rms < silenceThreshold { silenceFrames += samples.count } else { silenceFrames = 0 }

        let silenceDuration = Double(silenceFrames) / sampleRate
        let bufferDuration  = Double(pcmBuffer.count) / sampleRate

        if silenceDuration >= silenceDurationTrigger || bufferDuration >= maxBufferSeconds {
            runInference(isFinal: true)
            pcmBuffer.removeAll()
            silenceFrames = 0
        } else if bufferDuration >= 5.0 {
            runInference(isFinal: false)
        }
    }

    private func runInference(isFinal: Bool) {
        guard let ctx, !pcmBuffer.isEmpty else { return }
        var params = whisper_full_default_params(WHISPER_SAMPLING_GREEDY)
        params.language        = ("en" as NSString).utf8String
        params.translate       = false
        params.no_context      = true
        params.single_segment  = false
        params.print_progress  = false
        params.print_realtime  = false
        params.print_timestamps = false

        let result = pcmBuffer.withUnsafeBufferPointer { ptr -> String in
            let rc = whisper_full(ctx, params, ptr.baseAddress, Int32(ptr.count))
            guard rc == 0 else { return "" }
            var text = ""
            for i in 0..<whisper_full_n_segments(ctx) {
                if let seg = whisper_full_get_segment_text(ctx, i) {
                    text += String(cString: seg)
                }
            }
            return text.trimmingCharacters(in: .whitespaces)
        }
        guard !result.isEmpty else { return }
        onResult?(result, isFinal)
    }
}

enum WhisperError: LocalizedError {
    case modelLoadFailed(String)
    var errorDescription: String? {
        if case .modelLoadFailed(let p) = self { return "Failed to load Whisper model at \(p)" }
        return nil
    }
}

#endif // targetEnvironment(simulator)
