function normalizeNumberCars(n) {
    if (n <= 0) { return 0; }
    if (n < 8) { return 1; }
    if (n < 16) { return 2; }
    return 3;
}
function normalizeDistance(n) {
    if (n <= 0) { return 0; }
    if (n < 0.25) { return 1; }
    if (n < 0.5) { return 2; }
    return 3;
  }
function normalizeTime(t) {
  if (t <= 0) { return 0; }
  if (t < 10) { return 1; }
  if (t < 16) { return 2; }
  return 3;
}