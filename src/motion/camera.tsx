import type {ReactNode} from 'react';
import {HEIGHT, WIDTH} from './timing';

/**
 * 2D camera. Describe what the camera looks at, not how the world moves:
 * `x, y` is the world point at the centre of the frame, `zoom` its scale.
 *
 * The output is a `matrix(...)` string valid both as an SVG `transform`
 * attribute and a CSS `transform`. Apply it to SVG content where possible:
 * SVG re-rasterises at the final scale, so a zoom into a letter stays sharp.
 */
export type CameraState = {x: number; y: number; zoom: number; rotation?: number};

export const REST: CameraState = {x: WIDTH / 2, y: HEIGHT / 2, zoom: 1, rotation: 0};

export function cameraMatrix(
  {x, y, zoom, rotation = 0}: CameraState,
  viewport = {width: WIDTH, height: HEIGHT},
) {
  const r = (-rotation * Math.PI) / 180;
  const a = zoom * Math.cos(r);
  const b = zoom * Math.sin(r);
  // screen = T(viewport centre) · R · S · T(-target) · world
  const e = viewport.width / 2 - (a * x - b * y);
  const f = viewport.height / 2 - (b * x + a * y);
  return `matrix(${a}, ${b}, ${-b}, ${a}, ${e}, ${f})`;
}

/**
 * Blend two camera states. Interpolates zoom geometrically so a push from
 * x1 to x20 feels constant-speed instead of rushing at the end.
 */
export const lerpCamera = (from: CameraState, to: CameraState, t: number): CameraState => ({
  x: from.x + (to.x - from.x) * t,
  y: from.y + (to.y - from.y) * t,
  zoom: from.zoom * Math.pow(to.zoom / from.zoom, t),
  rotation: (from.rotation ?? 0) + ((to.rotation ?? 0) - (from.rotation ?? 0)) * t,
});

/** Wraps a full-frame SVG world in a camera. */
export const CameraSvg = ({
  camera,
  children,
  width = WIDTH,
  height = HEIGHT,
}: {
  camera: CameraState;
  children: ReactNode;
  width?: number;
  height?: number;
}) => (
  <svg
    width={width}
    height={height}
    viewBox={`0 0 ${width} ${height}`}
    style={{position: 'absolute', inset: 0, overflow: 'visible'}}
  >
    <g transform={cameraMatrix(camera, {width, height})}>{children}</g>
  </svg>
);
