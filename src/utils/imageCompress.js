import imageCompression from "browser-image-compression";

const compressionOptions = {
  maxSizeMB: 0.25,
  maxWidthOrHeight: 1200,
  useWebWorker: true,
  initialQuality: 0.72,
};

export async function compressImage(file) {
  try {
    const compressedFile = await imageCompression(file, compressionOptions);

    console.log("Original size:", (file.size / 1024 / 1024).toFixed(2), "MB");
    console.log(
      "Compressed size:",
      (compressedFile.size / 1024 / 1024).toFixed(2),
      "MB"
    );

    return compressedFile;
  } catch (error) {
    console.error("Image compression failed:", error);
    return file;
  }
}