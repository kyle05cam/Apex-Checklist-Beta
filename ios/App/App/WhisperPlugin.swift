import Foundation
import Capacitor
import AVFoundation

/// Capacitor plugin — ATC Whisper transcription (on-device, no network).
///
/// JS API:
///   import { Plugins } from '@capacitor/core';
///   const { WhisperPlugin } = Plugins;
///   await WhisperPlugin.startListening();
///   WhisperPlugin.addListener('transcript', ({ transcript, isFinal }) => { ... });
///   await WhisperPlugin.stopListening();
///
/// Event payload matches the existing onresult shape in cessna172s_checklist.jsx.
@objc(WhisperPlugin)
public class WhisperPlugin: CAPPlugin, CAPBridgedPlugin {

    public let identifier  = "WhisperPlugin"
    public let jsName      = "WhisperPlugin"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "startListening", returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "stopListening",  returnType: CAPPluginReturnPromise),
        CAPPluginMethod(name: "isModelReady",   returnType: CAPPluginReturnPromise),
    ]

    // MARK: - State

    private var whisperEngine: WhisperEngine?
    private var audioEngine = AVAudioEngine()
    private var isListening = false

    // MARK: - Plugin methods

    @objc func isModelReady(_ call: CAPPluginCall) {
        #if targetEnvironment(simulator)
        // In Simulator, report "ready" so JS doesn't block — no real model needed.
        call.resolve(["ready": true])
        #else
        call.resolve(["ready": ModelDownloadService.shared.isDownloadComplete])
        #endif
    }

    @objc func startListening(_ call: CAPPluginCall) {
        guard !isListening else { call.resolve(); return }

        #if !targetEnvironment(simulator)
        guard ModelDownloadService.shared.isDownloadComplete else {
            call.reject("Model not downloaded yet")
            return
        }
        #endif

        do {
            try setupAudioSession()

            #if targetEnvironment(simulator)
            // Stub model URL — WhisperEngine ignores it in Simulator
            let modelURL = FileManager.default.temporaryDirectory.appendingPathComponent("stub")
            #else
            let modelURL = ModelDownloadService.shared.modelURL
            #endif

            whisperEngine = try WhisperEngine(modelURL: modelURL)
            try startCapture()
            isListening = true
            call.resolve()
        } catch {
            call.reject("Failed to start: \(error.localizedDescription)")
        }
    }

    @objc func stopListening(_ call: CAPPluginCall) {
        stopCapture()
        call.resolve()
    }

    // MARK: - Audio

    private func setupAudioSession() throws {
        let session = AVAudioSession.sharedInstance()
        try session.setCategory(.record, mode: .measurement, options: .duckOthers)
        try session.setPreferredSampleRate(16_000)
        try session.setActive(true, options: .notifyOthersOnDeactivation)
    }

    private func startCapture() throws {
        let inputNode = audioEngine.inputNode
        let hwFormat = inputNode.outputFormat(forBus: 0)
        let whisperFormat = AVAudioFormat(commonFormat: .pcmFormatFloat32,
                                          sampleRate: 16_000,
                                          channels: 1,
                                          interleaved: false)!

        inputNode.installTap(onBus: 0, bufferSize: 4096, format: hwFormat) { [weak self] buf, _ in
            guard let self,
                  let converted = self.convert(buffer: buf, from: hwFormat, to: whisperFormat)
            else { return }
            self.whisperEngine?.feed(pcm: converted)
        }

        try audioEngine.start()

        whisperEngine?.onResult = { [weak self] text, isFinal in
            self?.notifyListeners("transcript", data: ["transcript": text, "isFinal": isFinal])
        }
    }

    private func stopCapture() {
        audioEngine.stop()
        audioEngine.inputNode.removeTap(onBus: 0)
        whisperEngine?.flush()
        whisperEngine = nil
        isListening = false
        try? AVAudioSession.sharedInstance().setActive(false)
    }

    // MARK: - Format conversion

    private func convert(buffer: AVAudioPCMBuffer,
                         from srcFmt: AVAudioFormat,
                         to dstFmt: AVAudioFormat) -> AVAudioPCMBuffer? {
        guard let converter = AVAudioConverter(from: srcFmt, to: dstFmt) else { return nil }
        let ratio = dstFmt.sampleRate / srcFmt.sampleRate
        let cap = AVAudioFrameCount(Double(buffer.frameLength) * ratio)
        guard let out = AVAudioPCMBuffer(pcmFormat: dstFmt, frameCapacity: cap) else { return nil }
        var error: NSError?
        var consumed = false
        converter.convert(to: out, error: &error) { _, status in
            if consumed { status.pointee = .noDataNow; return nil }
            status.pointee = .haveData; consumed = true; return buffer
        }
        return error == nil ? out : nil
    }
}
