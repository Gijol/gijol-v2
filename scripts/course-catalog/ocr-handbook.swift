// macOS: swiftc scripts/course-catalog/ocr-handbook.swift -o /tmp/ocr-handbook
// /tmp/ocr-handbook docs/bachelor_manual/2021_manual.pdf /tmp/handbooks/2021
import CryptoKit
import Foundation
import PDFKit
import Vision
import AppKit
let args = CommandLine.arguments
let pdf = PDFDocument(url: URL(fileURLWithPath:args[1]))!
let out = args[2]
try FileManager.default.createDirectory(atPath:out, withIntermediateDirectories:true)
let sourceSha256 = SHA256.hash(data: try Data(contentsOf: URL(fileURLWithPath: args[1]))).map { String(format: "%02x", $0) }.joined()
let manifestURL = URL(fileURLWithPath: out).appendingPathComponent("manifest.json")
if FileManager.default.fileExists(atPath: manifestURL.path) {
 let manifest = try JSONSerialization.jsonObject(with: Data(contentsOf: manifestURL)) as! [String: Any]
 precondition(manifest["sourceSha256"] as? String == sourceSha256, "Stale OCR cache; use an empty output directory")
} else {
 let existingFiles = try FileManager.default.contentsOfDirectory(atPath: out)
 precondition(existingFiles.isEmpty, "Unverified OCR cache; use an empty output directory")
}
let manifest: [String: Any] = ["sourceSha256": sourceSha256, "pageCount": pdf.pageCount, "engine": "Apple Vision ko-KR/en-US"]
try JSONSerialization.data(withJSONObject: manifest, options: [.prettyPrinted, .sortedKeys]).write(to: manifestURL)
let from = args.count > 3 ? Int(args[3])! : 1
let to = args.count > 4 ? min(Int(args[4])!,pdf.pageCount) : pdf.pageCount
for i in from...to {
 let file = String(format:"%@/page-%03d.txt",out,i)
 if FileManager.default.fileExists(atPath:file) { continue }
 autoreleasepool {
  let page = pdf.page(at:i-1)!
  let bounds = page.bounds(for:.mediaBox)
  let scale = 2.2
  let width = Int(bounds.width*scale), height=Int(bounds.height*scale)
  let ctx=CGContext(data:nil,width:width,height:height,bitsPerComponent:8,bytesPerRow:width*4,space:CGColorSpaceCreateDeviceRGB(),bitmapInfo:CGImageAlphaInfo.premultipliedLast.rawValue)!
  ctx.setFillColor(CGColor(gray:1,alpha:1));ctx.fill(CGRect(x:0,y:0,width:width,height:height));ctx.scaleBy(x:scale,y:scale)
  page.draw(with:.mediaBox,to:ctx)
  let request=VNRecognizeTextRequest();request.recognitionLevel = .accurate;request.recognitionLanguages=["ko-KR","en-US"];request.usesLanguageCorrection=false
  do {
   try VNImageRequestHandler(cgImage:ctx.makeImage()!,options:[:]).perform([request])
   let lines=(request.results ?? []).compactMap { obs -> String? in
     guard let t=obs.topCandidates(1).first else{return nil}
     return t.string
   }
   try lines.joined(separator:"\n").write(toFile:file,atomically:true,encoding:.utf8)
   print("page \(i)/\(pdf.pageCount)")
  } catch {print("ERROR \(i): \(error)")}
 }
}
