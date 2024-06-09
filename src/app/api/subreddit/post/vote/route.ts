import { getAuthSession } from "@/lib/auth";
import { voteSchema } from "../../../../../lib/validators/vote";
import { db } from "@/lib/db";
import { CachedPost } from "@/types/redis";
import { redis } from "@/lib/redis";
import { z } from "zod";

const CACHE_AFTER_UPVOTES = 1;
export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { postId, voteType } = voteSchema.parse(body);

    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const exisitingVote = await db.vote.findFirst({
      where: { userId: session.user.id, postId },
    });

    const post = await db.post.findUnique({
      where: { id: postId },
      include: { author: true, votes: true },
    });

    if (!post) {
      return new Response("Post not found", { status: 404 });
    }

    if (exisitingVote) {
      if (exisitingVote.type === voteType) {
        await db.vote.delete({
          where: {
            userId_postId: {
              postId,
              userId: session.user.id,
            },
          },
        });

        return new Response("Ok");
      }

      await db.vote.update({
        where: {
          userId_postId: {
            postId,
            userId: session.user.id,
          },
        },
        data: {
          type: voteType,
        },
      });

      const votesAmt = post.votes.reduce((acc, vote) => {
        if (vote.type === "UPVOTE") {
          return acc + 1;
        }

        if (vote.type === "DOWNVOTE") {
          return acc - 1;
        }
        return acc;
      }, 0);

      if (votesAmt >= CACHE_AFTER_UPVOTES) {
        const cachePayload: CachedPost = {
          autherUserName: post.author.username ?? "",
          content: JSON.stringify(post.content),
          id: post.id,
          title: post.title,
          currenctVote: voteType,
          createdAt: post.createdAt,
        };

        await redis.hset(`post:${post.id}`, cachePayload);
      }
      return new Response("Ok");
    }

    await db.vote.create({
      data: { type: voteType, userId: session?.user.id, postId },
    });
    const votesAmt = post.votes.reduce((acc, vote) => {
      if (vote.type === "UPVOTE") {
        return acc + 1;
      }

      if (vote.type === "DOWNVOTE") {
        return acc - 1;
      }
      return acc;
    }, 0);

    if (votesAmt >= CACHE_AFTER_UPVOTES) {
      const cachePayload: CachedPost = {
        autherUserName: post.author.username ?? "",
        content: JSON.stringify(post.content),
        id: post.id,
        title: post.title,
        currenctVote: voteType,
        createdAt: post.createdAt,
      };

      await redis.hset(`post:${post.id}`, cachePayload);
    }

    return new Response("Ok");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    return new Response("Could not Vote, please try again later", {
      status: 500,
    });
  }
}
