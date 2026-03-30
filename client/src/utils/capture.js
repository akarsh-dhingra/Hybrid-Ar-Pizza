export function captureComposite(videoEl, canvasEl) {
  if (!videoEl || !canvasEl) return '';
  const width = videoEl.videoWidth || canvasEl.width || 1280;
  const height = videoEl.videoHeight || canvasEl.height || 720;
  const output = document.createElement('canvas');
  output.width = width;
  output.height = height;
  const ctx = output.getContext('2d');
  if (!ctx) return '';
  try {
    ctx.drawImage(videoEl, 0, 0, width, height);
    ctx.drawImage(canvasEl, 0, 0, width, height);
    return output.toDataURL('image/png');
  } catch (error) {
    return '';
  }
}

export function captureCanvasOnly(canvasEl) {
  if (!canvasEl) return '';
  try {
    return canvasEl.toDataURL('image/png');
  } catch (error) {
    return '';
  }
}

export function triggerDownload(dataUrl, filename) {
  if (!dataUrl) return;
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = filename;
  link.click();
}

export function downloadJsonFile(content, filename) {
  const blob = new Blob([content], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
