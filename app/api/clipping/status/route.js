export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");

  if (!jobId) {
    return Response.json({ error: "Missing jobId" }, { status: 400 });
  }

  const stages = ["upload", "transcribe", "analyze", "clip", "caption", "hook", "score"];
  const step = Math.floor(Math.random() * stages.length);

  return Response.json({
    jobId,
    status: step < stages.length - 1 ? "processing" : "completed",
    stage: stages[Math.min(step, stages.length - 1)],
    progress: Math.round(((step + 1) / stages.length) * 100),
    steps: stages.map((s, i) => ({
      name: s,
      status: i < step ? "completed" : i === step ? "processing" : "pending",
    })),
    estimatedRemaining: `${Math.round((stages.length - step - 1) * 0.8)}-${Math.round((stages.length - step - 1) * 2)} minutes`,
  });
}
