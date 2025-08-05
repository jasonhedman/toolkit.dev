import Link from "next/link";

import { SiDiscord, SiGithub } from "@icons-pack/react-simple-icons";

import { Button } from "@/components/ui/button";
import { HStack } from "@/components/ui/stack";
import { Logo } from "@/components/ui/logo";

export const Footer = () => {
  return (
    <div className="flex w-full justify-center border-t py-4">
      <HStack className="w-full max-w-full justify-between px-2 lg:max-w-5xl">
        <HStack>
          <Logo className="size-6" />
          <h1 className="text-primary overflow-hidden text-lg font-bold whitespace-nowrap">
            Toolkit.dev
          </h1>
        </HStack>
        <HStack>
          <Link
            href="https://github.com/jasonhedman/toolkit.dev"
            target="_blank"
          >
            <Button variant="ghost">
              <SiGithub className="size-4" />
              <span className="hidden md:block">GitHub</span>
            </Button>
          </Link>
          <Link href="https://discord.gg/cnNBsSfY" target="_blank">
            <Button variant="ghost">
              <SiDiscord className="size-4" />
              <span className="hidden md:block">Discord</span>
            </Button>
          </Link>
        </HStack>
      </HStack>
    </div>
  );
};
