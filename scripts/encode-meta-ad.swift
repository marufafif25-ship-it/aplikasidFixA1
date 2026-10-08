import AVFoundation
import CoreGraphics
import CoreVideo
import Foundation
import ImageIO

let frameDir = URL(fileURLWithPath: "/tmp/aplikasid-meta-ad-frames")
let outputURL = URL(fileURLWithPath: CommandLine.arguments.count > 1 ? CommandLine.arguments[1] : "output/aplikasid-meta-ad-15s.mp4")
let width = 1080
let height = 1920
let fps: Int32 = 30
let frameCount = 450

try? FileManager.default.removeItem(at: outputURL)
try FileManager.default.createDirectory(at: outputURL.deletingLastPathComponent(), withIntermediateDirectories: true)
let writer = try AVAssetWriter(outputURL: outputURL, fileType: .mp4)
let settings: [String: Any] = [
    AVVideoCodecKey: AVVideoCodecType.h264,
    AVVideoWidthKey: width,
    AVVideoHeightKey: height,
    AVVideoCompressionPropertiesKey: [
        AVVideoAverageBitRateKey: 8_000_000,
        AVVideoExpectedSourceFrameRateKey: fps,
        AVVideoMaxKeyFrameIntervalKey: fps
    ]
]
let input = AVAssetWriterInput(mediaType: .video, outputSettings: settings)
input.expectsMediaDataInRealTime = false
let adaptor = AVAssetWriterInputPixelBufferAdaptor(
    assetWriterInput: input,
    sourcePixelBufferAttributes: [
        kCVPixelBufferPixelFormatTypeKey as String: kCVPixelFormatType_32BGRA,
        kCVPixelBufferWidthKey as String: width,
        kCVPixelBufferHeightKey as String: height,
        kCVPixelBufferCGImageCompatibilityKey as String: true,
        kCVPixelBufferCGBitmapContextCompatibilityKey as String: true
    ]
)
guard writer.canAdd(input) else { fatalError("Could not add video input") }
writer.add(input)
guard writer.startWriting() else { fatalError(writer.error?.localizedDescription ?? "Could not start video writer") }
writer.startSession(atSourceTime: .zero)

for frame in 0..<frameCount {
    while !input.isReadyForMoreMediaData { Thread.sleep(forTimeInterval: 0.002) }
    let frameURL = frameDir.appendingPathComponent(String(format: "frame-%04d.png", frame))
    guard let source = CGImageSourceCreateWithURL(frameURL as CFURL, nil),
          let image = CGImageSourceCreateImageAtIndex(source, 0, nil) else {
        fatalError("Could not read frame \(frame)")
    }
    var pixelBuffer: CVPixelBuffer?
    let status = CVPixelBufferPoolCreatePixelBuffer(kCFAllocatorDefault, adaptor.pixelBufferPool!, &pixelBuffer)
    guard status == kCVReturnSuccess, let buffer = pixelBuffer else { fatalError("Could not allocate frame buffer") }
    CVPixelBufferLockBaseAddress(buffer, [])
    let context = CGContext(
        data: CVPixelBufferGetBaseAddress(buffer),
        width: width,
        height: height,
        bitsPerComponent: 8,
        bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
        space: CGColorSpaceCreateDeviceRGB(),
        bitmapInfo: CGImageAlphaInfo.premultipliedFirst.rawValue | CGBitmapInfo.byteOrder32Little.rawValue
    )!
    context.draw(image, in: CGRect(x: 0, y: 0, width: width, height: height))
    CVPixelBufferUnlockBaseAddress(buffer, [])
    let time = CMTime(value: Int64(frame), timescale: fps)
    guard adaptor.append(buffer, withPresentationTime: time) else {
        fatalError(writer.error?.localizedDescription ?? "Could not append frame \(frame)")
    }
    if frame % 90 == 0 { print("Encoded \(frame)/\(frameCount) frames") }
}
input.markAsFinished()
let semaphore = DispatchSemaphore(value: 0)
writer.finishWriting { semaphore.signal() }
semaphore.wait()
guard writer.status == .completed else { fatalError(writer.error?.localizedDescription ?? "Video encoding failed") }
print("Saved \(outputURL.path)")
