export interface RenderQuality {
  pixelRatio: number;
  shadowMapSize: 512 | 1024;
  pointShadowMapSize: 256 | 512;
  frameInterval: number;
}

/** Keep 3D scenes fluid without pushing laptop and phone GPUs unnecessarily. */
export function getRenderQuality(width: number): RenderQuality {
  const isMobile = width < 768;
  const device = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  const isConstrained =
    (device.hardwareConcurrency > 0 && device.hardwareConcurrency <= 4) ||
    (device.deviceMemory !== undefined && device.deviceMemory <= 4) ||
    device.connection?.saveData === true;

  const maxPixelRatio = isConstrained
    ? isMobile ? 1 : 1.25
    : isMobile ? 1.2 : 1.6;

  return {
    pixelRatio: Math.min(window.devicePixelRatio || 1, maxPixelRatio),
    shadowMapSize: isMobile || isConstrained ? 512 : 1024,
    pointShadowMapSize: isMobile || isConstrained ? 256 : 512,
    frameInterval: isMobile || isConstrained ? 1000 / 30 : 0,
  };
}
