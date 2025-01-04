"use client";
import { AccountType, AccountValidator } from "@/lib/validators/account";
import { zodResolver } from "@hookform/resolvers/zod";
import { FC } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/Button";
import { useMutation } from "@tanstack/react-query";
import axios from "axios";
import { toast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";

interface SignUpFormProps {}

const SignUpForm: FC<SignUpFormProps> = ({}) => {
  const router = useRouter();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<AccountType>({
    resolver: zodResolver(AccountValidator),
    defaultValues: {
      email: "",
      userName: "",
      password: "",
      confirmPassword: "",
    },
  });

  const { mutate: registerAccount, isLoading } = useMutation({
    mutationFn: async ({
      email,
      userName,
      password,
      confirmPassword,
    }: AccountType) => {
      const payload: AccountType = {
        email,
        userName,
        password,
        confirmPassword,
      };
      const { data } = await axios.post(`/api/auth/register`, payload);
      return data;
    },
    onError: () => {
      return toast({
        title: "Error",
        description: "Failed to register account",
        variant: "destructive",
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Account created successfully",
        variant: "default",
      });
      router.push("/sign-in");
    },
  });

  return (
    <form
      onSubmit={handleSubmit((e) => {
        registerAccount(e);
      })}
    >
      <Card className="mx-auto max-w-sm">
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email")}
                required
              />
              {errors.email && (
                <p className="text-red-500 text-xs">{errors.email.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="Username"
                {...register("userName")}
                required
              />
              {errors.userName && (
                <p className="text-red-500 text-xs">
                  {errors.userName.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                {...register("password")}
                required
              />
              {errors.password && (
                <p className="text-red-500 text-xs">
                  {errors.password.message}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Your Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Password"
                {...register("confirmPassword")}
                required
              />
              {errors.confirmPassword && (
                <p className="text-red-500 text-xs">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>

            <Button isLoading={isLoading} type="submit" className="w-full">
              Sign up
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default SignUpForm;
