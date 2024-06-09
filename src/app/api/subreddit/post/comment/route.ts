import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { commentValidator } from "@/lib/validators/comment";
import { z } from "zod";

export async function PATCH(req: Request) {
  try {
    const body = await req.json();

    const { postId, text, replytoId } = commentValidator.parse(body);

    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    await db.comment.create({
      data: {
        postId,
        text,
        authorId: session.user.id,
        replyToId: replytoId,
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(error.message, { status: 400 });
    }

    return new Response(
      "Could not post to subreddit at this time. Please try later",
      { status: 500 }
    );
  }
}
