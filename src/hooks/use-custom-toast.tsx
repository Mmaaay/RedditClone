import Link from "next/link";
import { toast } from "./use-toast";
import { buttonVariants } from "@/components/ui/Button";

export const useCustomToast = () => {
  const logInToast = () => {
    const { dismiss } = toast({
      title: "Unauthorized",
      description: "Please login to create a community",
      variant: "destructive",
      action: (
        <Link
          className={buttonVariants({ variant: "outline" })}
          href="/sign-in"
          onClick={() => dismiss()}
        >
          LogIn
        </Link>
      ),
    });
  };

  return { logInToast };
};
