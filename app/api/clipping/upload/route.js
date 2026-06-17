export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("video") || formData.get("file");
    const url = formData.get("url");

    if (!file && !url) {
      return Response.json({ error: "No file or URL provided" }, { status: 400 });
    }

    const validTypes = ["video/mp4", "video/quicktime", "video/x-msvideo"];
    if (file && !validTypes.includes(file.type)) {
      return Response.json({ error: "Invalid format. Accepted: MP4, MOV, AVI" }, { status: 400 });
    }

    const MAX_SIZE = 500 * 1024 * 1024;
    if (file && file.size > MAX_SIZE) {
      return Response.json({ error: "File too large. Max 500MB" }, { status: 400 });
    }

    return Response.json({
      jobId: crypto.randomUUID(),
      fileName: file?.name || new URL(url).pathname.split("/").pop(),
      fileSize: file?.size || 0,
      status: "uploaded",
      videoPath: `/videos/original/${crypto.randomUUID()}`,
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
