export function scrollAdminEditorIntoView(element, { prefersReducedMotion = false } = {}) {
  if (!element || typeof element.scrollIntoView !== "function") return false;

  element.scrollIntoView({
    behavior: prefersReducedMotion ? "instant" : "smooth",
    block: "start"
  });
  return true;
}
