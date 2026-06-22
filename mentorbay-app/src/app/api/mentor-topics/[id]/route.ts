import { getMentorProgramTopics } from "@/lib/programs";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const topics = await getMentorProgramTopics(params.id);
  return Response.json({ topics });
}
