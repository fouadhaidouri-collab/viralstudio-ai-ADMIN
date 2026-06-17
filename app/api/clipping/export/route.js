export async function POST(request) {
  try {
    const { clipIds, format } = await request.json();

    if (!clipIds) {
      return Response.json({ error: "Missing clipIds" }, { status: 400 });
    }

    return Response.json({
      jobId: crypto.randomUUID(),
      status: "completed",
      downloadUrl: `/api/clipping/export/download?jobId=${crypto.randomUUID()}&format=${format || "zip"}`,
      format: format || "zip",
      clipCount: clipIds.length,
      metadata: {
        exportedAt: new Date().toISOString(),
        totalSize: 0,
        format: format || "zip",
      },
    });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
