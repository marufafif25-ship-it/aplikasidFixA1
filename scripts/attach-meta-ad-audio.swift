import AVFoundation
import Foundation

let videoURL = URL(fileURLWithPath: CommandLine.arguments[1])
let audioURL = URL(fileURLWithPath: CommandLine.arguments[2])
let outputURL = URL(fileURLWithPath: CommandLine.arguments[3])
try? FileManager.default.removeItem(at: outputURL)

let videoAsset = AVURLAsset(url: videoURL)
let audioAsset = AVURLAsset(url: audioURL)
let composition = AVMutableComposition()
guard let sourceVideo = videoAsset.tracks(withMediaType: .video).first,
      let sourceAudio = audioAsset.tracks(withMediaType: .audio).first,
      let videoTrack = composition.addMutableTrack(withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid),
      let audioTrack = composition.addMutableTrack(withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid) else {
    fatalError("Could not read the source video or mixed audio")
}
let duration = videoAsset.duration
try videoTrack.insertTimeRange(CMTimeRange(start: .zero, duration: duration), of: sourceVideo, at: .zero)
try audioTrack.insertTimeRange(CMTimeRange(start: .zero, duration: duration), of: sourceAudio, at: .zero)
videoTrack.preferredTransform = sourceVideo.preferredTransform

guard let exporter = AVAssetExportSession(asset: composition, presetName: AVAssetExportPresetHighestQuality) else {
    fatalError("Could not create MP4 export session")
}
exporter.outputURL = outputURL
exporter.outputFileType = .mp4
exporter.shouldOptimizeForNetworkUse = true
let semaphore = DispatchSemaphore(value: 0)
exporter.exportAsynchronously { semaphore.signal() }
semaphore.wait()
guard exporter.status == .completed else {
    fatalError(exporter.error?.localizedDescription ?? "MP4 export failed")
}
print("Saved video with narration and music to \(outputURL.path)")
