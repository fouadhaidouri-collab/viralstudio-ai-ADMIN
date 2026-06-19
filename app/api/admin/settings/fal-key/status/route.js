import fs from "fs";
import path from "path";
import { maskKey } from "../../../../../../lib/fal-key";

const SETTINGS_PATH = path.join(process.cwd(), "data", "app-settings.json");

export async function GET() {
  let hasKey = false;
  let source = "missing";
  let masked = null;

  if (process.env.FAL_KEY) {
    hasKey = true;
    source = "env";
    masked = maskKey(process.env.FAL_KEY);
  } else {
    try {
      if (fs.existsSync(SETTINGS_PATH)) {
        const data = JSON.parse(fs.readFileSync(SETTINGS_PATH, "utf-8"));
        if (data.fal_api_key) {
          hasKey = true;
          source = "database";
          masked = maskKey(data.fal_api_key);
        }
      }
    } catch {}
  }

  return Response.json({ success: true, hasKey, source, masked });
}
