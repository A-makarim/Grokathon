/**
 * Suggestion Agent Configuration
 */

import { config } from "dotenv";
import { resolve } from "path";
import type { SuggestionConfig } from "../types/index.js";

// Load from root .env first, then local .env
config({ path: resolve(process.cwd(), "../.env") });
config({ path: resolve(process.cwd(), ".env") });

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
