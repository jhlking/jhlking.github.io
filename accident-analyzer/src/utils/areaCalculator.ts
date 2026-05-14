import { Point } from '../types';

export function calculatePolygonArea(points: Point[]): number {
  if (points.length < 3) return 0;

  let area = 0;
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }

  return Math.abs(area / 2);
}

export function pixelsToRealArea(
  pixelArea: number,
  imageWidth: number,
  referenceWidth: number = 44
): number {
  const scale = referenceWidth / imageWidth;
  return pixelArea * scale * scale;
}

export function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}
