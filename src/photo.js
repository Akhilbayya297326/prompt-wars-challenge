// Draw a bounded JPEG so field photos upload quickly and omit the camera's EXIF metadata.
export async function preparePhoto(file) {
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(file.type) ||
    !file.size ||
    file.size > 12 * 1024 * 1024
  )
    throw Error("Unsupported photo");
  const url = URL.createObjectURL(file);
  try {
    const img = new Image();
    img.src = url;
    await img.decode();
    const scale = Math.min(
      1,
      1280 / Math.max(img.naturalWidth, img.naturalHeight),
    );
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.naturalWidth * scale));
    canvas.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const context = canvas.getContext("2d");
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    for (const quality of [0.82, 0.65, 0.45]) {
      const data = canvas.toDataURL("image/jpeg", quality);
      if (data.startsWith("data:image/jpeg;base64,") && data.length < 1398000)
        return data;
    }
    throw Error("Photo is too large");
  } finally {
    URL.revokeObjectURL(url);
  }
}
