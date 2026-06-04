import Foundation
import UIKit

// Hugging Face repo: jacktol/whisper-large-v3-finetuned-for-ATC
// Model files to download (CoreML / GGUF format expected by whisper.cpp)
private let HF_REPO = "jacktol/whisper-large-v3-finetuned-for-ATC"
private let MODEL_FILENAME = "ggml-large-v3-atc.bin"
private let HF_MODEL_URL = "https://huggingface.co/\(HF_REPO)/resolve/main/\(MODEL_FILENAME)"
private let DEFAULTS_KEY = "atcModelDownloadComplete"

class ModelDownloadService: NSObject {

    static let shared = ModelDownloadService()

    var onProgress: ((Double) -> Void)?
    var onComplete: (() -> Void)?
    var onError: ((Error) -> Void)?

    private var downloadTask: URLSessionDownloadTask?
    private lazy var session: URLSession = {
        let config = URLSessionConfiguration.default
        config.allowsCellularAccess = false // WiFi only — 1.5 GB
        config.timeoutIntervalForResource = 3600
        return URLSession(configuration: config, delegate: self, delegateQueue: nil)
    }()

    // MARK: - Public API

    var isDownloadComplete: Bool {
        UserDefaults.standard.bool(forKey: DEFAULTS_KEY) && modelFileExists
    }

    var modelURL: URL {
        let docs = FileManager.default.urls(for: .documentDirectory, in: .userDomainMask)[0]
        return docs.appendingPathComponent(MODEL_FILENAME)
    }

    func startDownload() {
        guard !isDownloadComplete else {
            onComplete?()
            return
        }
        guard let url = URL(string: HF_MODEL_URL) else { return }
        downloadTask = session.downloadTask(with: url)
        downloadTask?.resume()
    }

    func cancelDownload() {
        downloadTask?.cancel()
    }

    // MARK: - Private helpers

    private var modelFileExists: Bool {
        FileManager.default.fileExists(atPath: modelURL.path)
    }

    private func markComplete() {
        UserDefaults.standard.set(true, forKey: DEFAULTS_KEY)
        DispatchQueue.main.async { self.onComplete?() }
    }
}

// MARK: - URLSessionDownloadDelegate

extension ModelDownloadService: URLSessionDownloadDelegate {

    func urlSession(_ session: URLSession,
                    downloadTask: URLSessionDownloadTask,
                    didWriteData bytesWritten: Int64,
                    totalBytesWritten: Int64,
                    totalBytesExpectedToWrite: Int64) {
        guard totalBytesExpectedToWrite > 0 else { return }
        let progress = Double(totalBytesWritten) / Double(totalBytesExpectedToWrite)
        DispatchQueue.main.async { self.onProgress?(progress) }
    }

    func urlSession(_ session: URLSession,
                    downloadTask: URLSessionDownloadTask,
                    didFinishDownloadingTo location: URL) {
        do {
            let dest = modelURL
            if FileManager.default.fileExists(atPath: dest.path) {
                try FileManager.default.removeItem(at: dest)
            }
            try FileManager.default.moveItem(at: location, to: dest)
            markComplete()
        } catch {
            DispatchQueue.main.async { self.onError?(error) }
        }
    }

    func urlSession(_ session: URLSession,
                    task: URLSessionTask,
                    didCompleteWithError error: Error?) {
        if let error = error {
            DispatchQueue.main.async { self.onError?(error) }
        }
    }
}

// MARK: - SetupViewController

/// Full-screen first-launch download UI. Present modally from AppDelegate before
/// loading the Capacitor web view.
class ModelSetupViewController: UIViewController {

    private let titleLabel = UILabel()
    private let subtitleLabel = UILabel()
    private let progressBar = UIProgressView(progressViewStyle: .bar)
    private let progressLabel = UILabel()
    private let wifiLabel = UILabel()
    private var service: ModelDownloadService { .shared }

    override func viewDidLoad() {
        super.viewDidLoad()
        buildUI()
        wireCallbacks()
        service.startDownload()
    }

    private func buildUI() {
        view.backgroundColor = UIColor(red: 0.05, green: 0.07, blue: 0.12, alpha: 1)

        let stack = UIStackView()
        stack.axis = .vertical
        stack.alignment = .center
        stack.spacing = 20
        stack.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(stack)

        // Airplane icon
        let icon = UIImageView(image: UIImage(systemName: "antenna.radiowaves.left.and.right"))
        icon.tintColor = UIColor(red: 0.2, green: 0.6, blue: 1.0, alpha: 1)
        icon.contentMode = .scaleAspectFit
        icon.heightAnchor.constraint(equalToConstant: 64).isActive = true

        titleLabel.text = "Apex Kneeboard"
        titleLabel.font = .systemFont(ofSize: 28, weight: .bold)
        titleLabel.textColor = .white

        subtitleLabel.text = "Downloading ATC Aviation Model (1.5 GB)"
        subtitleLabel.font = .systemFont(ofSize: 16, weight: .medium)
        subtitleLabel.textColor = UIColor(white: 0.8, alpha: 1)
        subtitleLabel.textAlignment = .center
        subtitleLabel.numberOfLines = 2

        progressBar.trackTintColor = UIColor(white: 0.3, alpha: 1)
        progressBar.progressTintColor = UIColor(red: 0.2, green: 0.6, blue: 1.0, alpha: 1)
        progressBar.translatesAutoresizingMaskIntoConstraints = false
        progressBar.widthAnchor.constraint(equalToConstant: 280).isActive = true
        progressBar.heightAnchor.constraint(equalToConstant: 6).isActive = true

        progressLabel.text = "0%"
        progressLabel.font = .monospacedDigitSystemFont(ofSize: 14, weight: .regular)
        progressLabel.textColor = UIColor(white: 0.6, alpha: 1)

        wifiLabel.text = "This is a one-time download. WiFi recommended."
        wifiLabel.font = .systemFont(ofSize: 13)
        wifiLabel.textColor = UIColor(white: 0.5, alpha: 1)
        wifiLabel.textAlignment = .center
        wifiLabel.numberOfLines = 2

        [icon, titleLabel, subtitleLabel, progressBar, progressLabel, wifiLabel]
            .forEach { stack.addArrangedSubview($0) }

        NSLayoutConstraint.activate([
            stack.centerXAnchor.constraint(equalTo: view.centerXAnchor),
            stack.centerYAnchor.constraint(equalTo: view.centerYAnchor),
            stack.leadingAnchor.constraint(greaterThanOrEqualTo: view.leadingAnchor, constant: 40),
            stack.trailingAnchor.constraint(lessThanOrEqualTo: view.trailingAnchor, constant: -40),
        ])
    }

    private func wireCallbacks() {
        service.onProgress = { [weak self] pct in
            self?.progressBar.setProgress(Float(pct), animated: true)
            self?.progressLabel.text = String(format: "%.0f%%", pct * 100)
        }
        service.onComplete = { [weak self] in
            self?.dismiss(animated: true)
        }
        service.onError = { [weak self] error in
            self?.showRetry(error: error)
        }
    }

    private func showRetry(error: Error) {
        let alert = UIAlertController(
            title: "Download Failed",
            message: error.localizedDescription,
            preferredStyle: .alert)
        alert.addAction(UIAlertAction(title: "Retry", style: .default) { [weak self] _ in
            self?.service.startDownload()
        })
        present(alert, animated: true)
    }
}
