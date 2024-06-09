import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";

export async function GET(req: Request, res: Response) {
  const url = new URL(req.url);

  const session = await getAuthSession();

  let followedCommunititesIds: string[] = [];

  if (session) {
    const followedCommunitites = await db.subscriptions.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        subreddit: true,
      },
    });

    followedCommunititesIds = followedCommunitites.map(
      ({ subreddit }) => subreddit.id
    );
  }

  try {
    const { subredditName, limit, page } = z
      .object({
        limit: z.string(),
        page: z.string(),
        subredditName: z.string().nullish().optional(),
      })
      .parse({
        subredditName: url.searchParams.get("subredditName"),
        limit: url.searchParams.get("limit"),
        page: url.searchParams.get("page"),
      });

    let whereClause = {};

    if (subredditName) {
      whereClause = {
        subreddit: {
          name: subredditName,
        },
      };
    } else if (session) {
      whereClause = {
        subreddit: {
          id: {
            in: followedCommunititesIds,
          },
        },
      };
    }
    const posts = await db.post.findMany({
      take: parseInt(limit),
      skip: (parseInt(page) - 1) * parseInt(limit),
      orderBy: {
        createdAt: "desc",
      },
      include: {
        subreddit: true,
        votes: true,
        author: true,
        comments: true,
      },
      where: whereClause,
    });

    return new Response(JSON.stringify(posts));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    return new Response("Could not show more feed, please try again later", {
      status: 500,
    });
  }
}
