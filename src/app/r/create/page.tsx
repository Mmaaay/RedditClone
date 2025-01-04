"use client";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/input";
import { useCustomToast } from "@/hooks/use-custom-toast";
import { toast } from "@/hooks/use-toast";
import { CreateSubredditPayload } from "@/lib/validators/subreddit";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

const Page = () => {
  const router = useRouter();
  const { status } = useSession();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/sign-in");
    }
  }, [status, router]);

  const [input, setInput] = useState<string>("");
  const { logInToast } = useCustomToast();

  const { mutate: CreateCommunity, isLoading } = useMutation({
    mutationFn: async () => {
      const payload: CreateSubredditPayload = {
        name: input,
      };
      const { data } = await axios.post("/api/subreddit", payload);
      return data as string;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: "Subreddit already exists",
            description: "Please choose a different name",
            variant: "destructive",
          });
        }
        if (err.response?.status === 422) {
          return toast({
            title: "Invalid subreddit name",
            description: "Please choose a name between 3 and 21 characters",
            variant: "destructive",
          });
        }
        if (err.response?.status === 401) {
          return logInToast();
        }
      }
      return toast({
        title: "Could not create subreddit",
        description: "Please try again later",
        variant: "destructive",
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Subreddit created",
        description: "You can now start posting",
        variant: "default",
        action: (
          <Button
            className="bg-green-200 hover:bg-green-300 hover:shadow-md text-black text-bold hover:text-black"
            onClick={() => router.push(`/r/${data}`)}
          >
            r/{data}
          </Button>
        ),
      });
    },
  });

  return (
    <div className="flex items-center mx-auto max-w-3xl h-full container">
      <div className="relative space-y-6 bg-white p-4 rounded-lg w-full h-fit">
        <div className="flex justify-between items-center">
          <h1 className="font-semibold text-xl">Create a community</h1>
        </div>
        <hr className="bg-zinc-500 h-px" />
        <div>
          <p className="font-medium text-lg">Name</p>
          <p className="pb-2 text-xs">
            Community names including capitalization cannot be changed
          </p>
          <div className="relative">
            <p className="left-0 absolute inset-y-0 place-items-center grid w-8 text-sm text-zinc-400">
              r/
            </p>
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="pl-6"
            />
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="subtle" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button
            isLoading={isLoading}
            disabled={input.length === 0}
            onClick={() => CreateCommunity()}
          >
            Create Community
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Page;
