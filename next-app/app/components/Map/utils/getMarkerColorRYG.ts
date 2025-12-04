

export default function getMarkerColorRYG(value: number, min: number, max: number) {
  if (min === max) {
    return "rgb(255,255,0)";
  }

  const t = (value - min) / (max - min);
  if (t < 0.5) {
    const k = t / 0.5;
    return `rgb(255, ${Math.round(255 * k)}, 0)`;
  } else {
    const k = (t - 0.5) / 0.5;
    return `rgb(${Math.round(255 * (1 - k))}, 255, 0)`;
  }
}