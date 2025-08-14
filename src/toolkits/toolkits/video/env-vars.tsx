import { Link } from "../components/link";

import type { EnvVar, EnvVars } from "@/toolkits/types";
import type { VideoModelProvider } from "@/ai/video/types";

const lumaEnvVar = {
  key: "LUMA_API_KEY",
  description: (
    <span>
      Get an Luma API Key <Link href="https://lumalabs.ai/api/keys">here</Link>
    </span>
  ),
};

export const videoEnvVars: EnvVars = [
  {
    type: "any",
    keys: [lumaEnvVar],
  },
  {
    type: "all",
    keys: ["BLOB_READ_WRITE_TOKEN"],
    description: (
      <span>
        Get a Vercel Blob Token{" "}
        <Link href="https://vercel.com/docs/vercel-blob">here</Link>
      </span>
    ),
  },
];

export const videoEnvVarMap: Record<VideoModelProvider, EnvVar> = {
  luma: lumaEnvVar,
};
