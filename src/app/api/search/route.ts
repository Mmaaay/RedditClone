import { db } from "@/lib/db";

export const GET = async (req: Request) => {
  const url = new URL(req.url);
  const q = url.searchParams.get("q");

  if (!q) {
    return new Response("No query provided", { status: 400 });
  }

  const results = await db.subreddit.findMany({
    where: {
      name: {
        startsWith: q,
        mode: "insensitive",
      },
    },
    include: {
      _count: true,
    },
    take: 5,
  });

  return new Response(JSON.stringify(results));
};
