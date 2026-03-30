import * as THREE from 'three';

export function computeQrTarget(corners) {
  if (!corners || corners.length < 4) return null;
  const [tl, tr, br, bl] = corners;
  const centerX = (tl.x + tr.x + br.x + bl.x) / 4;
  const centerY = (tl.y + tr.y + br.y + bl.y) / 4;
  const topWidth = Math.hypot(tr.x - tl.x, tr.y - tl.y);
  const leftHeight = Math.hypot(bl.x - tl.x, bl.y - tl.y);
  const size = (topWidth + leftHeight) / 2;
  const rotation = Math.atan2(tr.y - tl.y, tr.x - tl.x);

  return {
    center: { x: centerX, y: centerY },
    size,
    rotation
  };
}

export function computeDepth(sizePx, viewport) {
  const minDepth = 0.35;
  const maxDepth = 2.4;
  const ratio = sizePx / Math.max(viewport.width, 1);
  const depth = 1.4 / Math.max(ratio, 0.05);
  return THREE.MathUtils.clamp(depth, minDepth, maxDepth);
}

// Convert screen coordinates into a 3D point along the camera ray at a given depth.
export function screenToWorld(center, depth, camera, viewport) {
  const ndcX = (center.x / viewport.width) * 2 - 1;
  const ndcY = -(center.y / viewport.height) * 2 + 1;
  const vector = new THREE.Vector3(ndcX, ndcY, 0.5);
  vector.unproject(camera);
  const direction = vector.sub(camera.position).normalize();
  return camera.position.clone().add(direction.multiplyScalar(depth));
}

export function worldScaleFromPixels(sizePx, depth, camera, viewport) {
  const fov = THREE.MathUtils.degToRad(camera.fov);
  const heightAtDepth = 2 * Math.tan(fov / 2) * depth;
  const widthAtDepth = heightAtDepth * camera.aspect;
  const worldPerPixel = widthAtDepth / viewport.width;
  return sizePx * worldPerPixel;
}
