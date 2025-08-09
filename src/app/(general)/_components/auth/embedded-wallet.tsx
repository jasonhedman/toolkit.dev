"use client";

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useSignMessage } from "wagmi";
import {
  useSignInWithEmail,
  useVerifyEmailOTP,
  useCurrentUser,
} from "@coinbase/cdp-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, Mail, Shield } from "lucide-react";
import { signInWithEthereum } from "@/server/auth/providers/siwe/sign-in";
import { getCsrfToken } from "next-auth/react";

export const EmbeddedWallet = () => {
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [flowId, setFlowId] = useState<string | null>(null);

  const { signInWithEmail } = useSignInWithEmail();
  const { verifyEmailOTP } = useVerifyEmailOTP();
  const { currentUser } = useCurrentUser();
  const { signMessageAsync } = useSignMessage();

  // Mutation for sending OTP
  const {
    mutate: signIn,
    isPending: isSigningIn,
    error: signInError,
    data: signInData,
  } = useMutation({
    mutationFn: async (email: string) => {
      return signInWithEmail({ email });
    },
    onSuccess: (data) => {
      setFlowId(data.flowId);
    },
    onError: (error) => {
      console.error("Sign in failed:", error);
    },
  });

  // Mutation for verifying OTP
  const {
    mutate: verifyOTP,
    isPending: isVerifyingOTP,
    error: verifyOTPError,
    data: verifyOTPData,
  } = useMutation({
    mutationFn: async ({ flowId, otp }: { flowId: string; otp: string }) => {
      return await verifyEmailOTP({
        flowId,
        otp,
      });
    },
    onSuccess: (data) => {
      console.log("Signed in user:", data.user);
      console.log("User EVM address:", data.user.evmAccounts?.[0]);
      console.log("Is new user:", data.isNewUser);
    },
    onError: (error) => {
      console.error("OTP verification failed:", error);
    },
  });

  const handleSignIn = async () => {
    if (!email) {
      return;
    }
    signIn(email);
  };

  const handleVerifyOTP = async () => {
    if (!otp || !flowId) {
      return;
    }

    verifyOTP({ flowId, otp });
  };

  const handleSignInWithEthereum = async () => {
    if (!currentUser?.evmAccounts?.[0]) {
      return;
    }
    await signInWithEthereum({
      address: currentUser.evmAccounts[0],
      csrfToken: getCsrfToken,
      chainId: 8453,
      signMessage: async (message) => {
        const signature = await signMessageAsync({ message });
        return signature;
      },
      email: currentUser.authenticationMethods.email?.email ?? "",
    });
  };

  const handleReset = () => {
    setEmail("");
    setOtp("");
    setFlowId(null);
  };

  if (currentUser) {
    return (
      <Card className="mx-auto w-full max-w-md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-green-600" />
            Successfully Signed In
          </CardTitle>
          <CardDescription>Welcome to your embedded wallet</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Email</Label>
            <p className="text-muted-foreground text-sm">
              {currentUser.authenticationMethods.email?.email}
            </p>
          </div>
          <div className="space-y-2">
            <Label>EVM Address</Label>
            <p className="bg-muted rounded p-2 font-mono text-sm">
              {currentUser.evmAccounts?.[0] ?? "No EVM address found"}
            </p>
          </div>
          <Button onClick={handleSignInWithEthereum}>Sign In</Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mx-auto w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Mail className="h-5 w-5" />
          Embedded Wallet Sign In
        </CardTitle>
        <CardDescription>
          Sign in with your email to access your embedded wallet
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!flowId ? (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isSigningIn}
              />
            </div>
            <Button
              onClick={handleSignIn}
              disabled={isSigningIn}
              className="w-full"
            >
              {isSigningIn ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending OTP...
                </>
              ) : (
                "Send OTP"
              )}
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">OTP Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                disabled={isVerifyingOTP}
                maxLength={6}
              />
              <p className="text-muted-foreground text-xs">
                Check your email for the OTP code
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                onClick={handleVerifyOTP}
                disabled={isVerifyingOTP}
                className="flex-1"
              >
                {isVerifyingOTP ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  "Verify OTP"
                )}
              </Button>
              <Button
                onClick={handleReset}
                variant="outline"
                disabled={isVerifyingOTP}
              >
                Back
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
