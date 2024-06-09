import z from "zod";

export const voteSchema = z.object({
  postId: z.string(),
  voteType: z.enum(["UPVOTE", "DOWNVOTE"]),
});

export type postVoteRequest = z.infer<typeof voteSchema>;

export const commentSchema = z.object({
  commentId: z.string(),
  voteType: z.enum(["UPVOTE", "DOWNVOTE"]),
});

export type commentVoteRequest = z.infer<typeof commentSchema>;
