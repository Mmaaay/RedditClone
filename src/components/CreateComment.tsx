"use client";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { FC, useState } from "react";
import { CommentRequest } from "../lib/validators/comment";
import { Button } from "./ui/Button";
import { Textarea } from "./ui/textarea";
import axios, { AxiosError } from "axios";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface CreateCommentProps {
  postId: string;
  replytoId?: string;
}

const CreateComment: FC<CreateCommentProps> = ({ postId, replytoId }) => {
  const [Input, setInput] = useState<string>("");
  const { logInToast } = useCustomToast();
  const router = useRouter();
  const { mutate: comment, isLoading } = useMutation({
    mutationFn: async ({ postId, text, replytoId }: CommentRequest) => {
      const payload: CommentRequest = {
        postId,
        text,
        replytoId,
      };

      const { data } = await axios.patch(
        `/api/subreddit/post/comment`,
        payload
      );
      return data;
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          return logInToast();
        }
      }
      return toast({
        title: "Error",
        variant: "destructive",
        description:
          "Could not post to subreddit at this time. Please try later",
      });
    },
    onSuccess: () => {
      router.refresh();
      setInput("");
    },
  });

  return (
    <div className="gap-1.5 grid w-full">
      <Label htmlFor="comment" className="text-sm">
        Comment
      </Label>
      <div className="mt-2">
        <Textarea
          id="comment"
          value={Input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="What do you think"
        />

        <div className="flex justify-end mt-2">
          <Button
            onClick={() => comment({ postId, text: Input, replytoId })}
            disabled={Input.length === 0}
            isLoading={isLoading}
          >
            Post
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CreateComment;
