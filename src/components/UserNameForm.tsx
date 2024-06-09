"use client";
import { UserNameType, UserNameValidator } from "@/lib/validators/username";
import { zodResolver } from "@hookform/resolvers/zod";
import { User } from "@prisma/client";
import { FC } from "react";
import { useForm } from "react-hook-form";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { useMutation } from "@tanstack/react-query";
import axios, { AxiosError } from "axios";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Button } from "./ui/Button";

interface UserNameFormProps {
  user: Pick<User, "id" | "username">;
}

const UserNameForm: FC<UserNameFormProps> = ({ user }) => {
  const router = useRouter();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<UserNameType>({
    resolver: zodResolver(UserNameValidator),
    defaultValues: {
      name: user?.username || "",
    },
  });

  const { mutate: updateUserName, isLoading } = useMutation({
    mutationFn: async ({ name }: UserNameType) => {
      const payload: UserNameType = { name };
      const { data } = await axios.patch(`/api/username`, payload);
      return data;
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 409) {
          return toast({
            title: "Username already taken",
            description: "Please choose a different name",
            variant: "destructive",
          });
        }
      }
      return toast({
        title: "There was an error",
        description: "Please try again later",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Username changed",
        description: "Your username has been updated",
        variant: "default",
      });
      router.refresh();
    },
  });
  return (
    <form
      onSubmit={handleSubmit((e) => {
        updateUserName(e);
      })}
    >
      <Card>
        <CardHeader>
          <CardTitle>Your Username</CardTitle>
          <CardDescription>Place enter a display name you like</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative grid gap-1">
            <div className="absolute top-0 left-0 w-8 h-10 grid place-items-center">
              <span className="text-sm text-zinc-400">u/ </span>
            </div>
            <Label className="sr-only" htmlFor="name">
              name
            </Label>
            <Input
              id="name"
              className="w-[400px] pl-6"
              size={32}
              {...register("name")}
            />

            {errors.name && (
              <p className="px-1 text-xs text-red-600">{errors.name.message}</p>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button isLoading={isLoading}>Change Name</Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default UserNameForm;
