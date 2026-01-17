/**
 * Suggestion Agent Configuration
 */

import type { SuggestionConfig } from "../types/index.js";

export const CONFIG: SuggestionConfig = {
  registryUrl: process.env.REGISTRY_URL || "http://localhost:3100",
  xaiApiKey: process.env.XAI_API_KEY || "",
  model: process.env.XAI_MODEL || "grok-3",
};

export function validateConfig(): void {
  if (!CONFIG.xaiApiKey) {
    throw new Error("XAI_API_KEY environment variable is required");
  }
}
