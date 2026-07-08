export function getCloudinaryOptimizedUrl(
  imageUrl,
  {
    width = 900,
    height = null,
    crop = "limit",
    quality = "auto:eco",
  } = {}
) {
  if (!imageUrl || typeof imageUrl !== "string") return imageUrl;

  if (!imageUrl.includes("res.cloudinary.com")) {
    return imageUrl;
  }

  const uploadPath = "/image/upload/";

  if (!imageUrl.includes(uploadPath)) {
    return imageUrl;
  }

  const transformations = [
    "f_auto",
    `q_${quality}`,
    crop ? `c_${crop}` : null,
    width ? `w_${width}` : null,
    height ? `h_${height}` : null,
  ]
    .filter(Boolean)
    .join(",");

  return imageUrl.replace(uploadPath, `${uploadPath}${transformations}/`);
}
