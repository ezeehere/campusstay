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

    return compressedFile;
  } catch (error) {
    console.error("Image compression failed:", error);
    return file;
  }
}