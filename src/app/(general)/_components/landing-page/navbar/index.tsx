import { Logo } from "@/components/ui/logo";
import { HStack } from "@/components/ui/stack";
import { ColorModeToggle } from "../../../../_components/navbar/color-mode-toggle";
import { Button } from "@/components/ui/button";
import { AuthModal } from "../lib/auth-modal";
import { SiDiscord, SiGithub } from "@icons-pack/react-simple-icons";
import Link from "next/link";

export const Navbar = () => {
  return (
    <HStack className="bg-background/50 sticky top-0 z-50 h-16 w-full border-b py-2 backdrop-blur-sm">
      <HStack className="mx-auto w-full max-w-5xl justify-between px-2 lg:px-0">
        <HStack>
          <Logo className="size-6" />
          <h1 className="shimmer-text overflow-hidden text-lg font-bold whitespace-nowrap">
            Toolkit.dev
          </h1>
        </HStack>
        <HStack>
          <AuthModal>
            <Button className="user-message">Playground</Button>
          </AuthModal>
          <Link
            href="https://github.com/jasonhedman/toolkit.dev"
            target="_blank"
          >
            <Button variant="outline" size="icon">
              <SiGithub className="size-4" />
            </Button>
          </Link>
          <Link href="https://discord.gg/cnNBsSfY" target="_blank">
            <Button variant="outline" size="icon">
              <SiDiscord className="size-4" />
            </Button>
          </Link>
          <ColorModeToggle />
        </HStack>
      </HStack>
    </HStack>
  );
};
