"use client";
import { FC } from "react";
import { Button } from "./ui/Button";
import { useMutation } from "@tanstack/react-query";
import { SubscripeToSubredditPayload } from "../lib/validators/subreddit";
import axios, { AxiosError } from "axios";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { startTransition } from "react";
import { useRouter } from "next/navigation";

interface SubscripeLeaveToggleProps {
  subredditId: string;
  subredditName: string;
  isSubscribed: boolean;
}

const SubscripeLeaveToggle: FC<SubscripeLeaveToggleProps> = ({
  subredditId,
  isSubscribed,
  subredditName,
}) => {
  const { logInToast } = useCustomToast();
  const router = useRouter();

  const { mutate: subscribe, isLoading: isSubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscripeToSubredditPayload = {
        subredditId,
      };
      const { data } = await axios.post("/api/subreddit/subscribe", payload);

      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 400) {
          return logInToast();
        }
      }
      return toast({
        title: "An error occurred",
        description: "Failed to subscribe to subreddit",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });
      return toast({
        title: "Success",
        description: `Subscribed to subreddit r/${subredditName}`,
        variant: "default",
      });
    },
  });

  const { mutate: unSubscribe, isLoading: isUnsubLoading } = useMutation({
    mutationFn: async () => {
      const payload: SubscripeToSubredditPayload = {
        subredditId,
      };
      const { data } = await axios.post("/api/subreddit/unsubscribe", payload);

      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 400) {
          return logInToast();
        }
      }
      return toast({
        title: "An error occurred",
        description: "Failed to unsubscribe from subreddit",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      startTransition(() => {
        router.refresh();
      });
      return toast({
        title: "Success",
        description: `UnSubscribed from subreddit r/${subredditName}`,
        variant: "default",
      });
    },
  });

  return isSubscribed ? (
    <Button
      onClick={() => unSubscribe()}
      isLoading={isUnsubLoading}
      className="w-full mt-1 mb-4"
    >
      Leave Community
    </Button>
  ) : (
    <Button
      onClick={() => subscribe()}
      isLoading={isSubLoading}
      className="w-full mt-1 mb-4"
    >
      Join to Post
    </Button>
  );
};

export default SubscripeLeaveToggle;
