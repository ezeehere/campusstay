import imageCompression from "browser-image-compression";

const compressionOptions = {
  maxSizeMB: 0.8,
  maxWidthOrHeight: 1600,
  useWebWorker: true,
  initialQuality: 0.8,
};

export async function compressImage(file) {
  try {
    return await imageCompression(file, compressionOptions);
  } catch (error) {
    console.error("Image compression failed:", error);

    return file;
  }
}