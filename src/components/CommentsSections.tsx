import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import CreateComment from "./CreateComment";
import PostComment from "./PostComment";

interface CommentsSectionsProps {
  postId: string;
}

const CommentsSections = async ({ postId }: CommentsSectionsProps) => {
  const session = await getAuthSession();

  const comments = await db.comment.findMany({
    where: {
      postId,
      replyToId: null,
    },
    include: {
      author: true,
      Votes: true,
      replyTo: true,
      replies: {
        include: {
          author: true,
          Votes: true,
          replyTo: true,
        },
      },
    },
  });

  return (
    <div className="flex flex-col gap-y-4 mt-4">
      <hr className="my-6 w-full h-px" />
      <CreateComment postId={postId} />
      <div className="flex flex-col gap-y-6 mt-4">
        {comments
          .filter((comment) => !comment.replyToId)
          .map((topLevelComment) => {
            const topLevelCommentsVoteAmt = topLevelComment.Votes.reduce(
              (acc, vote) => {
                if (vote.type === "UPVOTE") {
                  return acc + 1;
                }
                if (vote.type === "DOWNVOTE") {
                  return acc - 1;
                }
                return acc;
              },
              0
            );

            const topLevelCommentVote = topLevelComment.Votes.find((vote) => {
              vote.userId === session?.user.id;
            });
            return (
              <div key={topLevelComment.id} className="flex flex-col">
                <div className="mb-2">
                  <PostComment
                    postId={postId}
                    currentVote={topLevelCommentVote}
                    votesAmt={topLevelCommentsVoteAmt}
                    comment={topLevelComment}
                  />
                </div>
                {topLevelComment.replies
                  .sort((a, b) => b.Votes.length - a.Votes.length)
                  .map((reply) => {
                    const replyVotesAmt = reply.Votes.reduce((acc, vote) => {
                      if (vote.type === "UPVOTE") {
                        return acc + 1;
                      }
                      if (vote.type === "DOWNVOTE") {
                        return acc - 1;
                      }
                      return acc;
                    }, 0);
                    const replyVote = reply.Votes.find((vote) => {
                      vote.userId === session?.user.id;
                    });
                    return (
                      <div
                        key={reply.id}
                        className="ml-2 py-2 pl-4 b-zinc-200 bl-4"
                      >
                        <PostComment
                          postId={postId}
                          currentVote={replyVote}
                          votesAmt={replyVotesAmt}
                          comment={reply}
                        />
                      </div>
                    );
                  })}
              </div>
            );
          })}
      </div>
    </div>
  );
};

export default CommentsSections;
