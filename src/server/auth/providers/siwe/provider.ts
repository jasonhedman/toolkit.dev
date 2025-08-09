import { SiweMessage } from "siwe";
import Credentials, {
  type CredentialsConfig,
} from "next-auth/providers/credentials";
import { z } from "zod";
import { db } from "@/server/db";
import {
  SIWE_PROVIDER_ID,
  SIWE_PROVIDER_NAME,
  SIWE_STATEMENT,
} from "./constants";

const siweCredentialsSchema = z.object({
  message: z.string().transform((val: string) => {
    try {
      return JSON.parse(val) as SiweMessage;
    } catch {
      throw new Error("Invalid JSON in message");
    }
  }),
  signedMessage: z.string(),
  email: z.string().email(),
});

function SiweProvider(options?: Partial<CredentialsConfig>) {
  return Credentials({
    id: SIWE_PROVIDER_ID,
    name: SIWE_PROVIDER_NAME,
    credentials: {
      message: { label: "Message", type: "text" },
      signedMessage: { label: "Signed Message", type: "text" },
      email: { label: "Email", type: "text" },
    },
    async authorize(credentials) {
      const parseResult = siweCredentialsSchema.safeParse(credentials);
      if (!parseResult.success) {
        throw new Error("Invalid credentials");
      }
      const { message } = parseResult.data;
      const siwe = new SiweMessage(message);

      await verifySignature({
        siwe,
        credentials: parseResult.data,
        nonce: message.nonce,
      });

      const user = await db.user.findUnique({
        where: {
          email: parseResult.data.email,
        },
      });

      if (user) {
        return user;
      }

      return db.user.create({
        data: {
          email: parseResult.data.email,
          name: siwe.address,
        },
      });
    },
    ...options,
  });
}

async function verifySignature({
  siwe,
  credentials,
  nonce,
}: {
  siwe: SiweMessage;
  credentials: z.infer<typeof siweCredentialsSchema>;
  nonce: string;
}) {
  const result = await siwe.verify({
    signature: credentials.signedMessage,
    nonce,
  });
  if (!result.success) {
    throw new Error("Invalid signature");
  }
  if (SIWE_STATEMENT !== result.data.statement) {
    throw new Error("Statement mismatch");
  }
  if (new Date(result.data.expirationTime!) < new Date()) {
    throw new Error("Signature expired");
  }
}

export default SiweProvider;
