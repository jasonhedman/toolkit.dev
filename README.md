![Banner Image](/banner.png)

# [Toolkit.dev](https://toolkit.dev)

The chatbot that **pays every merged PR**. Join us in building a **self-funding repository** for the usage-based economy.

## Contributing

All contributors are welcome to join the Toolkit community! See our list of [good first issues](https://github.com/jasonhedman/toolkit.dev/issues?q=is%3Aissue%20state%3Aopen%20label%3A%22good%20first%20issue%22) to find a starting point.

Every merged PR will get paid on [Merit Systems](https://terminal.merit.systems/jasonhedman/toolkit.dev). For more information on how payouts work, see [this section of the landing page](https://www.toolkit.dev/#Merit).

We also have a [Discord Community](https://discord.gg/cnNBsSfY) to discuss all things Toolkit!

## Getting Started

### Prerequisites

- **Node.js** 18+ - if you do not have node installed, install it [here](https://nodejs.org/en/download)
- **pnpm** - if you do not have pnpm installed, run `npm i -g pnpm`
- **Docker** or **Podman**
  - You can install Docker Desktop for free [here](https://www.docker.com/products/docker-desktop/)

### Quick Setup (Recommended)

The `dev` script will automatically configure everything for you

```bash
# Clone the repository
git clone https://github.com/jasonhedman/toolkit.dev.git
cd toolkit.dev

# Run the automated setup
pnpm dev
```

The setup script will:

- Create your `.env.local` file with all necessary environment variables
- Install dependencies
- Automatically set up the database, Redis, and Blob Storage using Docker/Podman (unless external database is configured)
- Run database migrations
- Run the app

### Manual Setup

If you prefer to set up manually:

#### 1) Clone the Repository

```bash
git clone https://github.com/jasonhedman/toolkit.dev.git
cd toolkit.dev
```

#### 2) Run the Development Script

This will set up your `.env.local`, install dependencies, start the required Docker containers, set up your database, and run the development server.

```bash
pnpm dev
```

#### 3) [OPTIONAL] Add an OpenRouter Key

Toolkit uses OpenRouter for inference. Get a key [here](https://openrouter.ai/settings/keys) and add it to your `.env.local`

```
OPENROUTER_API_KEY=<your API key>
```

#### 4) [OPTIONAL] Add extra auth providers

Toolkit uses [Auth.js](https://authjs.dev/) for user authentication.

In local development you have the option of logging in as a guest (this is not available in production).

You can also add these providers:

- [Discord Provider](https://authjs.dev/getting-started/providers/discord)
- [Google Provider](https://authjs.dev/getting-started/providers/google)
- [Github Provider](https://authjs.dev/getting-started/providers/github)
- [Twitter Provider](https://authjs.dev/getting-started/providers/twitter)
- [Notion Provider](https://authjs.dev/getting-started/providers/notion)

> We would love to see more auth providers integrated. Feel free to add any from the [Auth.js](https://authjs.dev/getting-started/providers/apple) supported providers list!

#### 5) [OPTIONAL] Set up Toolkits

Many of our Toolkits require extra keys. You can run Toolkit without these keys, but if you want to use a certain Toolkit locally, you will need to do some additional configuration

##### 5.1) Web Search Toolkit

Toolkit uses Exa for web search. Get an API key [here](https://dashboard.exa.ai/api-keys) and add it to your `.env`

```
EXA_API_KEY=<your API key>
```

##### 5.2) Code Interpreter Toolkit

Toolkit uses E2B for secure code execution. Get an API key [here](https://e2b.dev/dashboard) and add it to your `.env`

```
E2B_API_KEY=<your API key>
```

##### 5.3) Memory Toolkit

Toolkit uses Mem0 for memory storage and retrieval. Get an API key [here](https://app.mem0.ai/dashboard/api-keys)

```
MEM0_API_KEY=<your API key>
```

##### 5.4) Image Toolkit

To use the Image Toolkit, you will need a key to **generate images** and a key to **store images**

We currently support

- OpenAI
- xAI
- FAL AI
- Luma AI
- Fireworks AI

```
# At least one of these is required for image gen
OPENAI_API_KEY=
XAI_API_KEY=
FAL_API_KEY=
FIREWORKS_API_KEY=
LUMA_API_KEY=
```

## Development

### AI SDK v5 Upgrade

This project uses ai v5 and @ai-sdk/react v2. Messages are parts-based (text, file, reasoning, tool-invocation) and server streaming uses result.toUIMessageStream. Client submits files as file parts; experimental_attachments is no longer used.

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
