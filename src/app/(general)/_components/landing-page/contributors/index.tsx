import { Octokit } from "octokit";

import { SiDiscord, SiGithub } from "@icons-pack/react-simple-icons";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { HStack } from "@/components/ui/stack";

import { Ripple } from "@/components/magicui/ripple";

import { Section } from "../lib/section";
import { SECTIONS } from "../sections";

import { UserAvatarCirclesByLogin } from "./user-avatar-circles";

import { env } from "@/env";

export const ContributorsSection = async () => {
  if (!env.GITHUB_TOKEN) {
    return null;
  }

  const octo = new Octokit({
    auth: env.GITHUB_TOKEN,
    request: {
      fetch: (url: string, options: RequestInit) => {
        return fetch(url, {
          ...options,
          cache: "force-cache",
          next: {
            revalidate: 60 * 60,
          },
        });
      },
    },
    warn: () => {
      void 0;
    },
  });

  const contributors = await octo.rest.repos
    .listContributors({
      owner: "jasonhedman",
      repo: "toolkit.dev",
    })
    .then((res) => res.data)
    .catch(() => null);

  if (!contributors) {
    return null;
  }

  return (
    <Section
      id={SECTIONS.Contributors}
      className="relative flex flex-col items-center gap-6 py-0 md:py-0"
    >
      <HStack className="mt-6 h-14">
        <h2 className="max-w-sm text-center text-xl font-bold">
          Join a global community of elite developers today
        </h2>
      </HStack>
      <UserAvatarCirclesByLogin
        logins={contributors
          .filter(
            (contributor) =>
              contributor.login && contributor.login !== "cursoragent",
          )
          .map((contributor) => contributor.login!)}
        numAvatarsToShow={10}
        totalUsers={contributors.length}
        size={48}
      />
      <HStack className="mb-6 h-14">
        <Link href="https://github.com/jasonhedman/toolkit.dev" target="_blank">
          <Button variant="outline">
            <SiGithub className="size-4" />
            Become a Contributor
          </Button>
        </Link>
        <Link href="https://discord.gg/cnNBsSfY" key="discord" target="_blank">
          <Button variant="outline">
            <SiDiscord />
            Join the Community
          </Button>
        </Link>
      </HStack>
      <Ripple className="absolute inset-0" />
    </Section>
  );
};
