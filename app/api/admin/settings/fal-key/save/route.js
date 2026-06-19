import { getFalKey, saveFalKey, maskKey } from "../../../../../../lib/fal-key";

export async function POST(request) {
  const { falKey } = await request.json();

  if (!falKey) {
    return Response.json({ success: false, message: "No key provided" }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.fal.ai/v1/models", {
      headers: { Authorization: `Key ${falKey}` },
    });

    if (!res.ok) {
      const text = await res.text();
      return Response.json({ success: false, message: `Key test failed (${res.status}): ${text}` }, { status: 400 });
    }

    saveFalKey(falKey);

    return Response.json({ success: true, masked: maskKey(falKey) });
  } catch (err) {
    return Response.json({ success: false, message: err.message }, { status: 500 });
  }
}
