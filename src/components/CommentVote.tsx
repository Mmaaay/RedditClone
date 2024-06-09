"use client";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { commentVoteRequest } from "@/lib/validators/vote";
import { usePrevious } from "@mantine/hooks";
import { CommentVote, VoteType } from "@prisma/client";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { ArrowBigDown, ArrowBigUp } from "lucide-react";
import { FC, useState } from "react";
import { Button } from "./ui/Button";

type PartialVote = Pick<CommentVote, "type">;

interface CommentVoteProps {
  commentId: string;
  initialVotesAmount: number;
  InitialVote: PartialVote | undefined;
}

const CommentVoteComponent: FC<CommentVoteProps> = ({
  commentId,
  initialVotesAmount,
  InitialVote,
}) => {
  const { logInToast } = useCustomToast();
  const [VotesAmt, setVotesAmt] = useState<number>(initialVotesAmount);
  const [CurrentVote, setCurrentVote] = useState(InitialVote);
  const prevVote = usePrevious(CurrentVote);

  const { mutate: vote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: commentVoteRequest = {
        commentId,
        voteType,
      };

      await axios.patch("/api/subreddit/post/comment/vote", payload);
    },
    onError: (error, voteType) => {
      if (voteType === "UPVOTE") setVotesAmt((prev) => prev - 1);
      else {
        setVotesAmt((prev) => prev + 1);

        if (prevVote) {
          setCurrentVote(prevVote);
        }

        if (error instanceof AxiosError) {
          if (error.response?.status === 401) {
            logInToast();
          }
        }
      }
      return toast({
        title: "Error",
        description: "An error occurred while voting",
        variant: "destructive",
      });
    },
    onMutate: (type) => {
      if (CurrentVote?.type === type) {
        setCurrentVote(undefined);

        if (type === "UPVOTE") {
          setVotesAmt((prev) => prev - 1);
        } else if (type === "DOWNVOTE") {
          setVotesAmt((prev) => prev + 1);
        }
      } else {
        setCurrentVote({ type });
        if (type === "UPVOTE") {
          setVotesAmt((prev) => prev + (CurrentVote ? 2 : 1));
        } else if (type === "DOWNVOTE") {
          setVotesAmt((prev) => prev - (CurrentVote ? 2 : 1));
        }
      }
    },
  });
  return (
    <div className="flex gap-1">
      <Button
        onClick={() => vote("UPVOTE")}
        size="sm"
        variant="ghost"
        aria-label="up-vote"
      >
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": CurrentVote?.type === "UPVOTE",
          })}
        />
      </Button>
      <p className="text-center py-2 font-medium text-sm text-zinc-900">
        {VotesAmt}
      </p>
      <Button
        onClick={() => vote("DOWNVOTE")}
        size="sm"
        variant="ghost"
        aria-label="down vote"
      >
        <ArrowBigDown
          className={cn("h-5 w-5 text-zinc-700", {
            "text-red-500 fill-red-500": CurrentVote?.type === "DOWNVOTE",
          })}
        />
      </Button>
    </div>
  );
};

export default CommentVoteComponent;
