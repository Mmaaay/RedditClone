import { db } from "@/lib/db";
import { subredditSubscriptionValidator } from "@/lib/validators/subreddit";
import { getAuthSession } from "@/lib/auth";
import { z } from "zod";

export async function POST(req: Request) {
  try {
    const session = await getAuthSession();

    if (!session?.user) {
      return new Response("Unauthorized", { status: 401 });
    }

    const body = await req.json();

    const { subredditId } = subredditSubscriptionValidator.parse(body);

    const subscriptionExists = await db.subscriptions.findFirst({
      where: {
        userId: session.user.id,
        subredditId,
      },
    });

    if (subscriptionExists) {
      return new Response("Already subscribed", { status: 400 });
    }
    await db.subscriptions.create({
      data: {
        userId: session.user.id,
        subredditId,
      },
    });

    return new Response(subredditId, { status: 200 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response("Invalid request data passed", { status: 422 });
    }

    return new Response("Could not subscripe, please try again later", {
      status: 500,
    });
  }
}
