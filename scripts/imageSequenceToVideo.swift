import AppKit
import AVFoundation

let args = CommandLine.arguments
guard args.count >= 6 else {
  fputs("usage: swift imageSequenceToVideo.swift output.mov fps secondsPerSlide frame1.png [frame2.png ...]\n", stderr)
  exit(64)
}

let outputURL = URL(fileURLWithPath: args[1])
let fps = Int32(args[2]) ?? 30
let secondsPerSlide = Double(args[3]) ?? 8.5
let frameURLs = args.dropFirst(4).map { URL(fileURLWithPath: String($0)) }
let width = 1280
let height = 720

try? FileManager.default.removeItem(at: outputURL)

guard let writer = try? AVAssetWriter(outputURL: outputURL, fileType: .mov) else {
  fputs("Unable to create AVAssetWriter\n", stderr)
  exit(1)
}

let outputSettings: [String: Any] = [
  AVVideoCodecKey: AVVideoCodecType.h264,
  AVVideoWidthKey: width,
  AVVideoHeightKey: height,
  AVVideoCompressionPropertiesKey: [
    AVVideoAverageBitRateKey: 5_000_000,
    AVVideoProfileLevelKey: AVVideoProfileLevelH264HighAutoLevel
  ]
]

let input = AVAssetWriterInput(mediaType: .video, outputSettings: outputSettings)
input.expectsMediaDataInRealTime = false

let adaptor = AVAssetWriterInputPixelBufferAdaptor(assetWriterInput: input, sourcePixelBufferAttributes: [
  kCVPixelBufferPixelFormatTypeKey as String: Int(kCVPixelFormatType_32ARGB),
  kCVPixelBufferWidthKey as String: width,
  kCVPixelBufferHeightKey as String: height
])

guard writer.canAdd(input) else {
  fputs("Unable to add video writer input\n", stderr)
  exit(1)
}
writer.add(input)

func pixelBuffer(from url: URL) -> CVPixelBuffer? {
  guard let image = NSImage(contentsOf: url) else { return nil }
  var rect = CGRect(x: 0, y: 0, width: width, height: height)
  guard let cgImage = image.cgImage(forProposedRect: &rect, context: nil, hints: nil) else { return nil }

  var pixelBuffer: CVPixelBuffer?
  let status = CVPixelBufferCreate(
    kCFAllocatorDefault,
    width,
    height,
    kCVPixelFormatType_32ARGB,
    [
      kCVPixelBufferCGImageCompatibilityKey: true,
      kCVPixelBufferCGBitmapContextCompatibilityKey: true
    ] as CFDictionary,
    &pixelBuffer
  )
  guard status == kCVReturnSuccess, let buffer = pixelBuffer else { return nil }

  CVPixelBufferLockBaseAddress(buffer, [])
  defer { CVPixelBufferUnlockBaseAddress(buffer, []) }

  guard
    let context = CGContext(
      data: CVPixelBufferGetBaseAddress(buffer),
      width: width,
      height: height,
      bitsPerComponent: 8,
      bytesPerRow: CVPixelBufferGetBytesPerRow(buffer),
      space: CGColorSpaceCreateDeviceRGB(),
      bitmapInfo: CGImageAlphaInfo.noneSkipFirst.rawValue
    )
  else {
    return nil
  }

  context.setFillColor(NSColor.white.cgColor)
  context.fill(CGRect(x: 0, y: 0, width: width, height: height))
  context.draw(cgImage, in: CGRect(x: 0, y: 0, width: width, height: height))
  return buffer
}

let buffers = frameURLs.compactMap { url -> CVPixelBuffer? in
  guard let buffer = pixelBuffer(from: url) else {
    fputs("Unable to load frame \(url.path)\n", stderr)
    exit(1)
  }
  return buffer
}

guard writer.startWriting() else {
  fputs("Unable to start writing: \(writer.error?.localizedDescription ?? "unknown error")\n", stderr)
  exit(1)
}
writer.startSession(atSourceTime: .zero)

let framesPerSlide = max(1, Int(round(secondsPerSlide * Double(fps))))
let frameDuration = CMTime(value: 1, timescale: fps)
var frameIndex: Int64 = 0

for buffer in buffers {
  for _ in 0..<framesPerSlide {
    while !input.isReadyForMoreMediaData {
      Thread.sleep(forTimeInterval: 0.005)
    }
    let time = CMTimeMultiply(frameDuration, multiplier: Int32(frameIndex))
    guard adaptor.append(buffer, withPresentationTime: time) else {
      fputs("Failed to append frame \(frameIndex)\n", stderr)
      exit(1)
    }
    frameIndex += 1
  }
}

input.markAsFinished()
let group = DispatchGroup()
group.enter()
writer.finishWriting {
  group.leave()
}
group.wait()

if writer.status != .completed {
  fputs("Video write failed: \(writer.error?.localizedDescription ?? "unknown error")\n", stderr)
  exit(1)
}

print(outputURL.path)
