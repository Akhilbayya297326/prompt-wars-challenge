import {
  tools,
  languages,
  observations,
  qualities,
  waterOptions,
  categories,
  nutrientBands,
} from "../shared/fields.js";

export class InvalidInput extends Error {}
function invalid(field) {
  throw new InvalidInput("Check the field: " + field);
}

function choice(raw, allowed, field, fallback) {
  const value = raw ?? fallback;
  if (!allowed.includes(value)) invalid(field);
  return value;
}

function shortText(raw, field, limit) {
  if (raw == null) return "";
  if (typeof raw !== "string" || raw.length > limit) invalid(field);
  return raw.trim();
}

function number(raw, field, min, max) {
  if (raw == null || raw === "") return null;
  if (typeof raw !== "number" && typeof raw !== "string") invalid(field);
  if (typeof raw === "string" && !raw.trim()) invalid(field);
  const value = Number(raw);
  if (!Number.isFinite(value) || value < min || value > max) invalid(field);
  return value;
}

function photo(raw) {
  if (!raw) return null;
  if (typeof raw !== "string" || raw.length > 1450000) invalid("photo");
  const match =
    /^data:image\/(jpeg|png|webp);base64,([A-Za-z0-9+/]+={0,2})$/.exec(raw);
  if (!match) invalid("photo");
  const bytes = Buffer.from(match[2], "base64");
  if (!bytes.length || bytes.length > 1048576) invalid("photo size");
  const kind = match[1];
  const valid =
    kind === "jpeg"
      ? bytes.subarray(0, 3).toString("hex") === "ffd8ff"
      : kind === "png"
        ? bytes.subarray(0, 8).toString("hex") === "89504e470d0a1a0a"
        : bytes.toString("ascii", 0, 4) === "RIFF" &&
          bytes.toString("ascii", 8, 12) === "WEBP";
  if (!valid) invalid("photo format");
  return { mimeType: "image/" + kind, data: match[2] };
}

export function validate(raw) {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) invalid("request");
  if (
    typeof raw.id !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      raw.id,
    )
  )
    invalid("request ID");
  const tool = choice(raw.tool, tools, "tool");
  const value = {
    id: raw.id,
    tool,
    lang: choice(raw.lang, languages, "language"),
    crop: shortText(raw.crop, "crop", 80),
    state: shortText(raw.state, "state", 80),
    topic: shortText(raw.topic, "notes", 600),
    land: number(raw.land, "land", 0, 10000),
    ph: number(raw.ph, "pH", 0, 14),
    category: choice(raw.category, categories, "category", "general"),
    water: choice(raw.water, waterOptions, "water", "unknown"),
    observation: choice(raw.observation, observations, "symptom", "unsure"),
    quality: choice(raw.quality, qualities, "condition", "unsure"),
    photo: photo(raw.photo),
  };
  for (const key of ["n", "p", "k"])
    value[key] = choice(raw[key], nutrientBands, key, "");
  if (raw.location != null) {
    const lat = number(raw.location.lat, "latitude", -90, 90);
    const lon = number(raw.location.lon, "longitude", -180, 180);
    if (lat == null || lon == null || tool !== "soil") invalid("location");
    value.location = { lat, lon };
  }
  if (["crop", "harvest", "soil"].includes(tool) && !value.crop)
    invalid("crop");
  if (tool === "schemes" && !value.state) invalid("state");
  if (tool === "learn" && !value.topic) invalid("topic");
  if (value.photo && !["crop", "soil", "harvest"].includes(tool))
    invalid("photo");
  return value;
}
