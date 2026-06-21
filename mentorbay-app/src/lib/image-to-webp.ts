// Browser-only: convert an uploaded image File to WebP, optionally downscaling
// to a max dimension. Returns a new File (falls back to the original on any
// failure or for non-raster types like SVG/GIF). Keeps uploads small so pages
// load faster.
export async function toWebp(file: File, maxDim = 1600, quality = 0.82): Promise<File> {
  try {
    if (!file.type.startsWith("image/")) return file;
    // Skip formats we shouldn't rasterize (animated/vector).
    if (file.type === "image/gif" || file.type === "image/svg+xml") return file;
    if (file.type === "image/webp" && file.size < 400_000) return file; // already small webp

    const dataUrl = await new Promise<string>((resolve, reject) => {
      const r = new FileReader();
      r.onload = () => resolve(String(r.result));
      r.onerror = () => reject(new Error("read failed"));
      r.readAsDataURL(file);
    });

    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const i = new Image();
      i.onload = () => resolve(i);
      i.onerror = () => reject(new Error("decode failed"));
      i.src = dataUrl;
    });

    let { width, height } = img;
    if (width > maxDim || height > maxDim) {
      const scale = maxDim / Math.max(width, height);
      width = Math.round(width * scale);
      height = Math.round(height * scale);
    }

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext("2d");
    if (!ctx) return file;
    ctx.drawImage(img, 0, 0, width, height);

    const blob = await new Promise<Blob | null>((resolve) =>
      canvas.toBlob((b) => resolve(b), "image/webp", quality)
    );
    if (!blob) return file;

    const base = (file.name.replace(/\.[^.]+$/, "") || "image");
    return new File([blob], `${base}.webp`, { type: "image/webp" });
  } catch {
    return file; // any failure -> upload original untouched
  }
}
