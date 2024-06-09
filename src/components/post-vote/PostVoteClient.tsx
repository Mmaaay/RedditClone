"use client";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { usePrevious } from "@mantine/hooks";
import { VoteType } from "@prisma/client";
import { FC, useEffect, useState } from "react";
import { Button } from "../ui/Button";
import { ArrowBigUp } from "lucide-react";
import { cn } from "@/lib/utils";
import { ArrowBigDown } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { postVoteRequest } from "@/lib/validators/vote";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";

interface PostVoteClientProps {
  postId: string;
  initialVotesAmount: number;
  InitialVote: VoteType | undefined;
}

const PostVoteClient: FC<PostVoteClientProps> = ({
  postId,
  initialVotesAmount,
  InitialVote,
}) => {
  const { logInToast } = useCustomToast();
  const [VotesAmt, setVotesAmt] = useState<number>(initialVotesAmount);
  const [CurrentVote, setCurrentVote] = useState(InitialVote);
  const prevVote = usePrevious(CurrentVote);

  useEffect(() => {
    setCurrentVote(InitialVote);
  }, [InitialVote]);

  const { mutate: vote } = useMutation({
    mutationFn: async (voteType: VoteType) => {
      const payload: postVoteRequest = {
        postId,
        voteType,
      };

      await axios.patch("/api/subreddit/post/vote", payload);
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
    onMutate: (type: VoteType) => {
      if (CurrentVote === type) {
        setCurrentVote(undefined);

        if (type === "UPVOTE") {
          setVotesAmt((prev) => prev - 1);
        } else if (type === "DOWNVOTE") {
          setVotesAmt((prev) => prev + 1);
        }
      } else {
        setCurrentVote(type);
        if (type === "UPVOTE") {
          setVotesAmt((prev) => prev + (CurrentVote ? 2 : 1));
        } else if (type === "DOWNVOTE") {
          setVotesAmt((prev) => prev - (CurrentVote ? 2 : 1));
        }
      }
    },
  });
  return (
    <div className="flex sm:flex-col gap-4 sm:gap-0 pr-6 sm:w-20 pb-4 sm:pb-0">
      <Button
        onClick={() => vote("UPVOTE")}
        size="sm"
        variant="ghost"
        aria-label="up-vote"
      >
        <ArrowBigUp
          className={cn("h-5 w-5 text-zinc-700", {
            "text-emerald-500 fill-emerald-500": CurrentVote === "UPVOTE",
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
            "text-red-500 fill-red-500": CurrentVote === "DOWNVOTE",
          })}
        />
      </Button>
    </div>
  );
};

export default PostVoteClient;
