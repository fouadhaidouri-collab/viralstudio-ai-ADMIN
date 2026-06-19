import fs from "fs";
import path from "path";

const SETTINGS_PATH = path.join(process.cwd(), "data", "app-settings.json");

export async function getFalKey() {
  if (process.env.FAL_KEY) {
    return { hasKey: true, source: "env", key: process.env.FAL_KEY };
  }

  try {
    if (fs.existsSync(SETTINGS_PATH)) {
      const data = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf-8"));
      if (data.fal_api_key) {
        return { hasKey: true, source: "database", key: data.fal_api_key };
      }
    }
  } catch {}

  return { hasKey: false, setupRequired: true, error: "FAL API key is missing. Add it from Admin Settings." };
}

export function saveFalKey(key) {
  const dir = path.dirname(SETTINGS_PATH);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const data = fs.existsSync(SETTINGS_PATH)
    ? JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf-8"))
    : {};
  data.fal_api_key = key;
  fs.writeFileSync(SETTINGS_PATH, JSON.stringify(data, null, 2), "utf-8");
}

export function maskKey(key) {
  if (!key || key.length < 8) return "****";
  return key.slice(0, 4) + "********" + key.slice(-4);
}
