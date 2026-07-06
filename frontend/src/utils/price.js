export function parsePrice(price) {
  return parseFloat(String(price).replace(/[^\d.]/g, "")) || 0;
}