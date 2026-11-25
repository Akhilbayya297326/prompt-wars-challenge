// Validate an API reply before it replaces the farmer's queued observation.
// Older notebook entries use the same fields; optional telemetry may be absent.
const hasText = (value) => typeof value === "string" && value.trim().length > 0;
function httpsLink(value) {
  if (typeof value !== "string") return false;
  try {
    return new URL(value).protocol === "https:";
  } catch {
    return false;
  }
}

export function isFieldPlan(plan) {
  if (!plan || !hasText(plan.title) || !hasText(plan.summary)) return false;
  if (!["field-guide", "gemini"].includes(plan.source)) return false;
  if (
    !Array.isArray(plan.steps) ||
    !plan.steps.length ||
    !plan.steps.every(hasText)
  )
    return false;
  if (
    !Array.isArray(plan.refs) ||
    !plan.refs.every(
      (ref) =>
        ref && hasText(ref.title) && hasText(ref.reason) && httpsLink(ref.url),
    )
  )
    return false;
  const weather = plan.weather;
  return (
    weather == null ||
    (Number.isFinite(weather.rain) &&
      hasText(weather.date) &&
      httpsLink(weather.url))
  );
}
