/**
 * Profile Agent Configuration
 */

import type { ProfileConfig } from "../types/index.js";

export const CONFIG: ProfileConfig = {
  registryUrl: process.env.REGISTRY_URL || "http://localhost:3100",
  xaiApiKey: process.env.XAI_API_KEY || "",
  xBearerToken: process.env.X_BEARER_TOKEN || "",
  model: process.env.XAI_MODEL || "grok-3",
};

export function validateConfig(): void {
  if (!CONFIG.xaiApiKey) {
    throw new Error("XAI_API_KEY environment variable is required");
  }
  if (!CONFIG.xBearerToken) {
    throw new Error("X_BEARER_TOKEN environment variable is required");
  }
}
