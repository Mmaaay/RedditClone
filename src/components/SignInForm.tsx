"use client";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";
import { SignInType, SignInValidator } from "@/lib/validators/account";
import { zodResolver } from "@hookform/resolvers/zod";
import { signIn } from "next-auth/react";
import { useState } from "react";
import { useForm } from "react-hook-form";

const SignInForm = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SignInType>({
    resolver: zodResolver(SignInValidator),
  });
  const handleLogin = async (e: SignInType) => {
    setIsLoading(true);
    try {
      const result = await signIn("credentials", {
        Email: e.email,
        Password: e.password,
        redirect: false,
      });
      if (!result?.ok) {
        throw new Error("Invalid login credentials");
      }
      window.location.replace("/"); // Redirect to homepage on successful login
    } catch (error) {
      toast({
        title: "There was a problem",
        description: "There was an error logging in with credentials",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit((e) => {
        handleLogin(e);
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
                <p className="text-red-500 text-sm">{errors.email.message}</p>
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
                <p className="text-red-500 text-sm">
                  {errors.password.message}
                </p>
              )}
            </div>

            <Button isLoading={isLoading} type="submit" className="w-full">
              Sign in
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  );
};

export default SignInForm;
