export const META_PIXEL_ID = "28299406323089200";

export function shouldTrackMetaPageView(previousPathname, pathname) {
  return Boolean(previousPathname && pathname && previousPathname !== pathname);
}
