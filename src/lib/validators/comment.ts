import { z } from "zod";

export const commentValidator = z.object({
  postId: z.string(),
  text: z.string(),
  replytoId: z.string().optional(),
});

export type CommentRequest = z.infer<typeof commentValidator>;
