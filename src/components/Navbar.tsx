import Link from "next/link";
import { Icons } from "./Icons";
import { buttonVariants } from "./ui/Button";
import { getAuthSession } from "@/lib/auth";
import UserAccountNav from "./UserAccountNav";
import SearchBar from "./SearchBar";

export const Navbar = async () => {
  const session = await getAuthSession();

  return (
    <div className="top-0 z-[10] fixed inset-x-0 border-zinc-300 bg-zinc-100 py-2 border-b h-fit">
      <div className="flex justify-between items-center gap-2 mx-auto max-w-7xl h-full container">
        <Link href="/" className="flex items-center gap-2">
          <Icons.logo className="w-8 sm:w-6 h-8 sm:h-6 text-zinc-700" />
          <p className="md:block hidden font-medium text-sm text-zinc-700">
            BreadIt
          </p>
        </Link>

        <SearchBar />
        {session?.user ? (
          <UserAccountNav user={session.user} />
        ) : (
          <div className="space-x-2">
            <Link href="/sign-in" className={buttonVariants()}>
              Sign In
            </Link>
            <Link
              href="/sign-up"
              className={buttonVariants({ variant: "subtle" })}
            >
              Sign Up
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};
