export function formatFanRating(value: number): string {
  return value.toFixed(1).replace(".", ",");
}
