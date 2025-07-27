![Banner Image](/banner.png)

# [Toolkit.dev](https://toolkit.dev)

The chatbot that **pays every merged PR**. Join us in building a **self-funding repository** for the usage-based economy.

## Contributing

All contributors are welcome to join the Toolkit community! See our list of [good first issues](https://github.com/jasonhedman/toolkit.dev/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22) to find a starting point.

Every merged PR will get paid on [Merit Systems](https://terminal.merit.systems/jasonhedman/toolkit.dev). For more information on how payouts work, see [this section of the landing page](https://www.toolkit.dev/#Merit).

We also have a [Discord Community](https://discord.gg/cnNBsSfY) to discuss all things Toolkit!

## Getting Started

### Prerequisites

- **Node.js** 18+
- **pnpm** (recommended), npm, bun, or yarn
- **Docker** or **Podman**

#### 1) Clone the Repository

```bash
git clone https://github.com/jasonhedman/toolkit.dev.git
```

#### 2) Install Dependencies

```bash
pnpm install

# or
npm install

# or
yarn install

# or
bun install
```

#### 3) Copy the `.env.example` file into `.env.local` and set up your Auth secret

Create your `.env.local` from the example

```bash
cp .env.example .env.local
```

Create a secure `AUTH_SECRET` with the

```bash
pnpm dlx auth secret

# or
npx auth secret

# or
yarn dlx auth secret

# or
bunx auth secret
```

#### 4) Set up the database

Toolkit uses Postgres as a database. You have two options for running the database

##### 4.1) Use the `./start-database.sh` script (recommended)

```bash
./start-database.sh
```

> This requires either Docker or Podman to be installed on your machine.
>
> Docker installation guide: https://docs.docker.com/engine/install/
>
> Podman installation guide: https://podman.io/getting-started/installation

You will also need to run the migrations

```bash
pnpm db:generate

# or
npm run db:generate

# or
yarn db:generate

# or
bun run db:generate
```

##### 4.2) Use your own Postgres instance

Update `DATABASE_URL` in your `.env` to point to your Postgres instance.

```
DATABASE_URL=<your Postgres instance URL>
```

Then run the migrations

```bash
pnpm db:generate

# or
npm run db:generate

# or
yarn db:generate

# or
bun run db:generate
```

#### 5) Add an OpenRouter Key

Toolkit uses OpenRouter for inference. Get a key [here](https://openrouter.ai/settings/keys) and add it to your `.env`

```
OPENROUTER_API_KEY=<your API key>
```

#### 6) Start the development server

```bash
pnpm dev

# or
npm run dev

# or
yarn dev

# or
bun run dev
```

#### 7) [OPTIONAL] Add extra auth providers

Toolkit uses [Auth.js](https://authjs.dev/) for user authentication.

In local development you have the option of logging in as a guest (this is not available in production).

You can also add these providers:

- [Discord Provider](https://authjs.dev/getting-started/providers/discord)
- [Google Provider](https://authjs.dev/getting-started/providers/google)
- [Github Provider](https://authjs.dev/getting-started/providers/github)
- [Twitter Provider](https://authjs.dev/getting-started/providers/twitter)
- [Notion Provider](https://authjs.dev/getting-started/providers/notion)
- **Strava Provider** - Custom OAuth implementation (see Strava Toolkit section below)

> We would love to see more auth providers integrated. Feel free to add any from the [Auth.js](https://authjs.dev/getting-started/providers/apple) supported providers list!

#### 8) [OPTIONAL] Set up Toolkits

Many of our Toolkits require extra keys. You can run Toolkit without these keys, but if you want to use a certain Toolkit locally, you will need to do some additional configuration

##### 8.1) Web Search Toolkit

Toolkit uses Exa for web search. Get an API key [here](https://dashboard.exa.ai/api-keys) and add it to your `.env`

```
EXA_API_KEY=<your API key>
```

##### 8.2) Code Interpreter Toolkit

Toolkit uses E2B for secure code execution. Get an API key [here](https://e2b.dev/dashboard) and add it to your `.env`

```
E2B_API_KEY=<your API key>
```

##### 8.3) Memory Toolkit

Toolkit uses Mem0 for memory storage and retrieval. Get an API key [here](https://app.mem0.ai/dashboard/api-keys)

```
MEM0_API_KEY=<your API key>
```

##### 8.4) Image Toolkit

To use the Image Toolkit, you will need a key to **generate images** and a key to **store images**

We currently support OpenAI (get a key [here](https://platform.openai.com/settings/organization/api-keys)) and xAI (get a key [here](https://console.x.ai/)) image models.

> We are [looking for someone to add support for more image models](https://github.com/jasonhedman/toolkit.dev/issues/147)

```
# At least one of these is required for image gen
OPENAI_API_KEY=
XAI_API_KEY=
```

We use [Vercel Blob](https://vercel.com/docs/vercel-blob) for data storage

```
BLOB_READ_WRITE_TOKEN=<your token>
```

> We are [working on building a local mock of this SDK] so you dont have to get a key, but for now you will need to get a key from Vercel.

##### 8.5) Strava Toolkit

We've implemented a comprehensive Strava integration with custom OAuth flow. This toolkit provides access to fitness data, activities, performance analytics, and training insights.

**Features:**
- **9 Powerful Tools** - From athlete profiles to segment leaderboards
- **Custom OAuth Handler** - Bypasses NextAuth's broken Strava integration
- **Complete API Coverage** - Activities, stats, segments, routes, and training zones
- **Rich UI Components** - Activity cards, stats dashboards, and performance visualizations

**Setup:**
1. Create a Strava application at [Strava Developers](https://developers.strava.com/)
2. Set authorization callback domain to `localhost:3000` (development)
3. Add credentials to `.env.local`:
```env
# Server-side credentials (keep secret)
AUTH_STRAVA_ID=<your-client-id>
AUTH_STRAVA_SECRET=<your-client-secret>

# Client-side ID (optional - will use hardcoded fallback if not provided)
# NEXT_PUBLIC_STRAVA_CLIENT_ID=<your-client-id>
```

**Example Use Cases:**
- "Analyze my last 5 runs and show me pace trends"
- "Find challenging cycling segments near San Francisco"
- "Compare my performance this year vs last year"

See the [Strava Toolkit README](./src/toolkits/toolkits/strava/README.md) for detailed documentation.

#### 9) [OPTIONAL] Set up secondary data storage

##### 9.1) Resumable streams with Redis

Toolkit uses Redis to power resumable streams. If you want to enable this functionality, create a Redis instance and update your `.env`

```
REDIS_URL=<your Redis URL>
```

##### 9.2) Blob storage with Vercel Blob

If you want to be able to upload files, you will to be able to write to and read from Vercel Blob. More details on getting a key are [here](https://vercel.com/docs/vercel-blob)

```
BLOB_READ_WRITE_TOKEN=<your token>
```

## Development

### Project Structure

```
src/
├── app/                 # Next.js App Router
├── components/          # React components
├── lib/                 # Utility functions
├── server/             # tRPC server and database
├── toolkits/           # Extensible toolkit system
└── env.js              # Environment validation
```

### Adding New Toolkits

Toolkit.dev's modular architecture makes it easy to add new toolkits. Check out the [Toolkit Development Guide](./src/toolkits/README.md) for detailed instructions.

### Database Commands

```bash
# Push schema changes
pnpm db:push

# Generate Prisma client
pnpm db:generate

# Open database studio
pnpm db:studio
```

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
