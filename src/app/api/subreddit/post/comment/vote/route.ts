import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { z } from "zod";
import { commentSchema, voteSchema } from "@/lib/validators/vote";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { commentId, voteType } = commentSchema.parse(body);

    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const exisitingVote = await db.commentVote.findFirst({
      where: { userId: session.user.id, commentId },
    });

    if (exisitingVote) {
      if (exisitingVote.type === voteType) {
        await db.commentVote.delete({
          where: {
            userId_commentId: {
              commentId,
              userId: session.user.id,
            },
          },
        });

        return new Response("Ok");
      } else {
        await db.commentVote.update({
          where: {
            userId_commentId: {
              commentId,
              userId: session.user.id,
            },
          },
          data: {
            type: voteType,
          },
        });
      }

      return new Response("Ok");
    }

    await db.commentVote.create({
      data: { type: voteType, userId: session?.user.id, commentId },
    });

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
