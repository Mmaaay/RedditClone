import CommentsSections from "@/components/CommentsSections";
import EditorOutput from "@/components/EditorOutput";
import PostVoteServer from "@/components/post-vote/PostVoteServer";
import { buttonVariants } from "@/components/ui/Button";
import { db } from "@/lib/db";
import { redis } from "@/lib/redis";
import { formatTimeToNow } from "@/lib/utils";
import { CachedPost } from "@/types/redis";
import { Post, User, Vote } from "@prisma/client";
import { ArrowBigDown, ArrowBigUp, Loader2 } from "lucide-react";
import { notFound } from "next/navigation";
import { Suspense } from "react";

interface PageProps {
  params: {
    postId: string;
  };
}

export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

const page = async ({ params }: PageProps) => {
  const cachedPost = (await redis.hgetall(
    `post:${params.postId}`
  )) as CachedPost;
  let post: (Post & { votes: Vote[]; author: User }) | null = null;

  if (!cachedPost) {
    post = await db.post.findFirst({
      where: {
        id: params.postId,
      },
      include: {
        votes: true,
        author: true,
      },
    });
  }

  if (!post && !cachedPost) return notFound();

  return (
    <div>
      <div className="flex sm:flex-row flex-col justify-between items-center sm:items-start h-full">
        <Suspense fallback={<PostVoteShell />}>
          {/* @ts-expect-error server component */}
          <PostVoteServer
            postId={post?.id ?? cachedPost.id}
            getData={async () => {
              return db.post.findUnique({
                where: { id: params.postId },
                include: { votes: true },
              });
            }}
          />
        </Suspense>
        <div className="flex-1 bg-white p-4 rounded-sm w-full sm:w-0">
          <p className="mt-1 max-h-40 text-gray-500 text-xs truncate">
            Posted by u/{post?.author.username ?? cachedPost.autherUserName}{" "}
            {formatTimeToNow(new Date(post?.createdAt ?? cachedPost.createdAt))}
          </p>
          <h1 className="py-2 font-semibold text-gray-900 text-xl leading-6">
            {post?.title ?? cachedPost.title}
          </h1>

          <EditorOutput content={post?.content ?? cachedPost.content} />
          <Suspense
            fallback={
              <Loader2 className="w-5 h-5 text-zinc-500 animate-spin" />
            }
          >
            {/* @ts-expect-error server component */}
            <CommentsSections postId={post?.id ?? cachedPost.id} />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

function PostVoteShell() {
  return (
    <div className="flex flex-col items-center pr-6 w-20">
      <div className={buttonVariants({ variant: "ghost" })}>
        <ArrowBigUp className="w-5 h-5 text-zinc-700" />
      </div>

      <div className="py-2 font-medium text-center text-sm text-zinc-900">
        <Loader2 className="w-3 h-3 animate-spin"></Loader2>
      </div>

      <div className={buttonVariants({ variant: "ghost" })}>
        <ArrowBigDown className="w-5 h-5 text-zinc-700" />
      </div>
    </div>
  );
}

export default page;
