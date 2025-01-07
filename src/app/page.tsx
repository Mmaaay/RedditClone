import CustomFeed from "@/components/CustomFeed";
import GeneralFeed from "@/components/GeneralFeed";
import { buttonVariants } from "@/components/ui/Button";
import { getAuthSession } from "@/lib/auth";
import { HomeIcon } from "lucide-react";
import Link from "next/link";

export default async function Home() {
  const session = await getAuthSession();
  return (
    <>
      <h1 className="font-bold text-3xl sm:text-4xl">Your Feed</h1>
      <div className="gap-y-4 md:gap-x-4 grid grid-cols-1 md:grid-cols-3 py-6">
        {/* @ts-expect-error server component*/}
        {session ? <CustomFeed /> : <GeneralFeed />}
        {/* subbreddit info */}
        <div className="border-gray-200 order-first md:order-last border rounded-lg h-fit overflow-hidden">
          <div className="bg-emerald-100 px-6 py-4">
            <p className="flex items-center gap-1.5 py-3 font-semibold">
              <HomeIcon className="w-4 h-4" />
              Home
            </p>
          </div>
          <div className="-my-3 px-6 py-4 divide-y divide-gray-100 text-sm leading-6">
            <div className="flex justify-between gap-x-4 py-3">
              <p className="text-zinc-500">
                Your Personal BreadIT homepage, Come here to check in with your
                favourite communities
              </p>
            </div>
            {session ? (
              <Link
                className={buttonVariants({ className: "w-full mt-4 mb-6" })}
                href="/r/create"
              >
                Create Community
              </Link>
            ) : (
              <div className="mt-4">
                <p className="mb-2 text-blue-600 text-center">
                  Log in to start your adventure.
                </p>
                <Link
                  className={buttonVariants({ className: "w-full" })}
                  href="/login"
                >
                  Log In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
