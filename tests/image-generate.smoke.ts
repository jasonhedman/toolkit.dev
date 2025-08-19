import { generateImage } from "@/ai/image/generate";
import readline from "readline";

async function main() {
  const model = process.env.TEST_IMAGE_MODEL || "openai:gpt-image-1";
  const prompt = "simple black square icon";
  const provider = model.includes(":") ? model.split(":")[0]! : "openai";
  const envKeyName = `${provider.toUpperCase()}_API_KEY`;
  if (!process.env[envKeyName]) {
    if (process.stdout.isTTY) {
      console.log(`${envKeyName} not found. Enter it to run the image smoke test (input hidden; not stored):`);
      const rl = readline.createInterface({ input: process.stdin, output: process.stdout, terminal: true });
      // Suppress echo
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (rl as any)._writeToOutput = function _writeToOutput() { /* no echo */ };
      const secret: string = await new Promise((resolve) => {
        rl.question("API Key: ", (answer) => {
          rl.close();
          resolve(answer.trim());
        });
      });
      if (!secret) {
        console.error("No key entered; aborting.");
        process.exit(1);
      }
      process.env[envKeyName] = secret; // use only in-memory for this run
      console.log("Key captured. Generating image...\n");
    } else {
      console.error(`${envKeyName} is required. Set it in the environment to run this smoke test.`);
      process.exit(1);
    }
  }
  try {
    const result = await generateImage(model, prompt);
    if (!result.image && !result.images?.length) {
      console.error("No image returned");
      process.exit(1);
    }
    const first = result.image ?? result.images?.[0];
    if (!first) {
      console.error("Missing first image");
      process.exit(1);
    }
    // Basic sanity assertions
    if (!(first.base64 || first.uint8Array)) {
      console.error("Image has neither base64 nor uint8Array data");
      process.exit(1);
    }
  console.log("Image generation smoke test passed");
  } catch (err) {
    // Attempt to provide clearer guidance on common failure modes
    const anyErr = err as any;
    const status = anyErr?.statusCode || anyErr?.status || anyErr?.response?.status;
    const message: string | undefined = anyErr?.data?.error?.message || anyErr?.message;
    if (status === 403 && message && /must be verified/i.test(message)) {
      console.warn("Image smoke test: model access denied (organization verification). Treating as soft skip.\n" + message);
      const suggestions: string[] = [];
      if (process.env.FAL_API_KEY) suggestions.push("fal:fal-ai/flux/dev");
      if (process.env.FIREWORKS_API_KEY) suggestions.push("fireworks:sdxl");
      if (process.env.LUMA_API_KEY) suggestions.push("luma:ray-2");
      if (process.env.OPENAI_API_KEY) suggestions.push("openai:gpt-image-1");
      if (suggestions.length) {
        console.warn("Try re-running with one of: TEST_IMAGE_MODEL=" + suggestions.join(" | "));
      }
      process.exit(0); // do not fail CI for account gating
    }
    console.error("Image generation smoke test failed", message ?? err);
    process.exit(1);
  }
}

// Run only if explicitly invoked (avoid running in CI without key)
if (process.env.RUN_IMAGE_SMOKE === "1") {
  void main();
}
