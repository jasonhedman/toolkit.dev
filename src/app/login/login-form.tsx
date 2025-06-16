"use client";

import { signIn } from "next-auth/react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

import { AuthProviderIcon } from "@/app/_components/navbar/account-button/provider-icon";
import { VStack } from "@/components/ui/stack";
import { Logo } from "@/components/ui/logo";

interface LoginFormProps {
  providers: {
    name: string;
    id: string;
  }[];
}

export function LoginForm({
  providers,
  className,
  ...props
}: LoginFormProps & React.ComponentProps<"div">) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <VStack className="w-full max-w-md gap-4">
        <VStack className="gap-4">
          <Logo className="size-16" />
          <VStack className="gap-1">
            <h1 className="text-primary text-2xl font-bold">
              Welcome to Toolkit
            </h1>
          </VStack>
        </VStack>
        <Card className="w-full gap-4 p-4">
          <p className="text-muted-foreground text-center text-sm">
            Sign in with your preferred account to continue
          </p>
          <div className="flex flex-col gap-2">
            {providers.map((provider) => (
              <Button
                key={provider.id}
                variant="outline"
                className="w-full"
                onClick={() =>
                  signIn(provider.id, { callbackUrl: "/onboarding" })
                }
              >
                <AuthProviderIcon provider={provider.name} />
                Sign in with {provider.name}
              </Button>
            ))}
          </div>
        </Card>
      </VStack>
    </div>
  );
}
