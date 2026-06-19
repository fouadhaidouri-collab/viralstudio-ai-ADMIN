export async function POST(request) {
  const { falKey } = await request.json();

  if (!falKey) {
    return Response.json({ success: false, valid: false, message: "No key provided" }, { status: 400 });
  }

  try {
    const res = await fetch("https://api.fal.ai/v1/models", {
      headers: { Authorization: `Key ${falKey}` },
    });

    if (res.ok) {
      return Response.json({ success: true, valid: true, message: "fal.ai key works" });
    }

    const text = await res.text();
    return Response.json({
      success: true,
      valid: false,
      message: `fal.ai error (${res.status}): ${text}`,
    });
  } catch (err) {
    return Response.json({ success: false, valid: false, message: err.message }, { status: 500 });
  }
}
