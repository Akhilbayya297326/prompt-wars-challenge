export const tools = ["crop", "soil", "harvest", "schemes", "learn"];
export const languages = ["en", "hi", "te"];
export const observations = ["unsure", "spots", "wilting", "damage"];
export const qualities = ["unsure", "uniform", "mixed", "debris"];
export const waterOptions = ["unknown", "limited", "assured"];
export const categories = ["general", "SC", "ST", "OBC"];
export const nutrientBands = ["", "low", "medium", "high"];

export function local(lang, en, hi, te) {
  return { en, hi, te }[lang] || en;
}
