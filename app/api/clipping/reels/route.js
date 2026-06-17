export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const jobId = searchParams.get("jobId");
  const type = searchParams.get("type") || "upload";

  if (!jobId) {
    return Response.json({ error: "Missing jobId" }, { status: 400 });
  }

  return Response.json({
    jobId,
    type,
    status: "processing",
    progress: Math.floor(Math.random() * 60) + 20,
    estimatedTime: "2-5 minutes",
    currentStep: type,
    logs: [`[${new Date().toISOString()}] Processing ${type}...`],
  });
}
