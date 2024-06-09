import { VoteType } from "@prisma/client";

export type CachedPost = {
  id: string;
  title: string;
  autherUserName: string;
  content: string;
  currenctVote: VoteType | null;
  createdAt: Date;
};
