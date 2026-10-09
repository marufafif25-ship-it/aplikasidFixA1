import { createSocialImage, socialImageSize } from "../lib/seo-image.jsx";

export const alt = "Aplikasi.id — software untuk kuliah, riset, desain, dan kerja";
export const size = socialImageSize;
export const contentType = "image/png";

export default function TwitterImage() {
  return createSocialImage();
}
