import React from "react";
import { BookOpen, HandCoins, Leaf, Sprout, Wheat } from "lucide-react";

const icons = {
  crop: Leaf,
  soil: Sprout,
  harvest: Wheat,
  schemes: HandCoins,
  learn: BookOpen,
};

export function ToolIcon({ tool }) {
  const Icon = icons[tool];
  return (
    <span aria-hidden="true" className={"symbol " + tool}>
      <Icon />
    </span>
  );
}
