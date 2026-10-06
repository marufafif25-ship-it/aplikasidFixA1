export function isOutsideChat(container, target) {
  return Boolean(container && target && !container.contains(target));
}
