import { Post, Vote, VoteType } from "@prisma/client";
import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";

import PostVoteClient from "./PostVoteClient";

interface PostVoteServerProps {
  postId: string;
  initialVoteAmt?: number;
  initialVote?: VoteType | undefined;
  getData: () => Promise<(Post & { votes: Vote[] }) | null>;
}

const PostVoteServer = async ({
  postId,
  initialVoteAmt,
  initialVote,
  getData,
}: PostVoteServerProps) => {
  const session = await getServerSession();

  let _votesAmt = 0;
  let _currentVote: VoteType | null | undefined = undefined;

  if (getData) {
    const post = await getData();
    if (!post) return notFound();

    _votesAmt = post.votes.reduce((acc, vote) => {
      if (vote.type === "UPVOTE") return acc + 1;
      if (vote.type === "DOWNVOTE") return acc - 1;
      return acc;
    }, 0);

    _currentVote = post.votes.find(
      (vote) => vote.userId === session?.user?.id
    )?.type;
  } else {
    _votesAmt = initialVoteAmt!;
    _currentVote = initialVote;
  }
  return (
    <PostVoteClient
      postId={postId}
      initialVotesAmount={_votesAmt}
      InitialVote={_currentVote}
    />
  );
};

export default PostVoteServer;
