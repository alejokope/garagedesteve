/**
 * Redimensiona y comprime imágenes en el navegador antes de subirlas.
 * Equilibrio: buena nitidez en ficha / zoom sin archivos enormes.
 * Solo importar desde componentes cliente.
 */

/** Lado mayor en px (suficiente para pantallas Retina en PDP sin pesar como un RAW). */
export const PRODUCT_IMAGE_MAX_EDGE_PX = 2560;
/** Si el JPEG supera esto, bajamos calidad poco a poco (no apretamos a 800 KB). */
const TARGET_MAX_BYTES = 2_400_000;
const JPEG_QUALITY_START = 0.9;
const JPEG_QUALITY_MIN = 0.68;
const JPEG_QUALITY_STEP = 0.04;

function baseNameFromFile(name: string): string {
  const n = name.replace(/[/\\]/g, "").replace(/\.[^.]+$/, "").trim();
  return n.slice(0, 80) || "foto";
}

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob | null> {
  return new Promise((resolve) => {
    canvas.toBlob((b) => resolve(b), type, quality);
  });
}

/**
 * GIF se deja igual (animación). Resto: escala al borde máximo y exporta JPEG con calidad ajustada.
 * Si falla el decode o no mejora el peso, devuelve el archivo original.
 */
export async function compressProductImageFile(file: File): Promise<File> {
  if (!file.type.startsWith("image/") || file.size === 0) return file;
  if (file.type === "image/gif") return file;

  let bitmap: ImageBitmap | null = null;
  try {
    bitmap = await createImageBitmap(file);
  } catch {
    return file;
  }

  try {
    const nw = bitmap.width;
    const nh = bitmap.height;
    if (nw < 1 || nh < 1) return file;

    const scale = Math.min(1, PRODUCT_IMAGE_MAX_EDGE_PX / Math.max(nw, nh));
    const w = Math.max(1, Math.round(nw * scale));
    const h = Math.max(1, Math.round(nh * scale));

    const canvas = document.createElement("canvas");
    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;

    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(bitmap, 0, 0, w, h);

    let quality = JPEG_QUALITY_START;
    let blob: Blob | null = await canvasToBlob(canvas, "image/jpeg", quality);
    while (blob && blob.size > TARGET_MAX_BYTES && quality > JPEG_QUALITY_MIN + 0.001) {
      quality -= JPEG_QUALITY_STEP;
      blob = await canvasToBlob(canvas, "image/jpeg", quality);
    }

    if (!blob) return file;
    if (blob.size >= file.size) return file;

    const base = baseNameFromFile(file.name);
    return new File([blob], `${base}.jpg`, {
      type: "image/jpeg",
      lastModified: Date.now(),
    });
  } finally {
    bitmap.close();
  }
}

export async function compressProductImageFiles(files: File[]): Promise<File[]> {
  return Promise.all(files.map((f) => compressProductImageFile(f)));
}
