import { Button, buttonVariants } from "@/components/ui/Button";
import { INFINITE_SCROLLING_PAGINATION_RESULTS } from "@/config";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import SubscripeLeaveToggle from "@/components/SubscripeLeaveToggle";
import Link from "next/link";
const Layout = async ({
  children,
  params: { slug },
}: {
  children: React.ReactNode;
  params: { slug: string };
}) => {
  const session = await getAuthSession();
  if (!session) {
    return notFound();
  }
  const subreddit = await db.subreddit.findFirst({
    where: { name: slug },
    include: {
      posts: {
        include: {
          author: true,
          votes: true,
        },

        take: INFINITE_SCROLLING_PAGINATION_RESULTS,
      },
    },
  });

  const subscribe = !session?.user
    ? undefined
    : await db.subscriptions.findFirst({
        where: {
          subreddit: {
            name: slug,
          },
          user: {
            id: session?.user?.id,
          },
        },
      });

  const isSubscribed = !!subscribe;

  if (!subreddit) {
    return notFound();
  }

  const memberCount = db.subscriptions.count({
    where: {
      subreddit: {
        name: slug,
      },
    },
  });

  return (
    <div className="mx-auto pt-12 max-w-7xl h-full sm:container">
      <div>
        <div className="gap-y-4 md:gap-x-4 grid grid-cols-1 md:grid-cols-3 py-6">
          <div className="flex flex-col space-y-6 col-span-2">{children}</div>
          {/* info Sidebar */}
          <div className="md:block border-gray-200 order-first md:order-last hidden rounded-lg h-fit overflow-hidden">
            <div className="px-6 py-4">
              <p className="py-3 font-semibold">
                About our r/{subreddit?.name}
              </p>
            </div>

            <dl className="bg-white px-6 py-4 divide-y divide-gray-100 text-sm leading-6">
              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Created</dt>
                <dd className="text-gray-700">
                  <time dateTime={subreddit?.createdAt.toDateString()}>
                    {format(subreddit?.createdAt, "MMMM d, yyyy")}
                  </time>
                </dd>
              </div>

              <div className="flex justify-between gap-x-4 py-3">
                <dt className="text-gray-500">Members</dt>
                <dd className="text-gray-700">
                  <div className="text-gray-700">
                    <div className="text-gray-500">{memberCount}</div>
                  </div>
                </dd>
              </div>
              {subreddit.creatorId === session?.user?.id ? (
                <div className="flex justify-between gap-x-4 py-3">
                  <p className="text-gray-500">You Created This Community</p>
                </div>
              ) : null}
              {subreddit.creatorId !== session?.user?.id ? (
                <SubscripeLeaveToggle
                  isSubscribed={isSubscribed}
                  subredditId={subreddit.id}
                  subredditName={subreddit.name}
                />
              ) : null}
              {isSubscribed ? (
                <Link
                  className={buttonVariants({
                    variant: "outline",
                    className: "w-full mb-6",
                  })}
                  href={`/r/${slug}/submit`}
                >
                  Create Post
                </Link>
              ) : null}
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Layout;
