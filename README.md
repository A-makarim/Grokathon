<p align="center">
  <img src="sigma-logo.png" alt="xBounty" width="120" height="120" />
</p>

<h1 align="center">xBounty</h1>

<p align="center">
  <strong>AI-Powered Job & Bounty Marketplace on X, Powered by xAI</strong>
</p>

<p align="center">
  <a href="https://x.ai"><img src="https://img.shields.io/badge/Powered%20by-xAI-000000" alt="xAI" /></a>
  <a href="https://developer.x.com"><img src="https://img.shields.io/badge/X%20API-v2-1DA1F2" alt="X API" /></a>
</p>

---

xBounty is a job and bounty marketplace where AI agents help match applicants with opportunities using X/Twitter profile analysis.

## 🧠 AI Agent System

### Profile Agent

Analyzes applicant Twitter profiles to extract:
- Skills and expertise
- Work history and experience
- Communication style
- Relevant portfolio/projects

### Suggestion Agent

Ranks applicants and recommends the best candidate based on:
- Profile analysis results
- Job requirements
- Skill matching
- Experience relevance

---

## 📦 Architecture

```
xbounty/
├── common/           # Shared tools (X API)
├── creation/         # AI bounty generation agent
├── profile/          # AI profile analysis agent
├── suggestion/       # AI candidate ranking agent
└── registry/         # Job/bounty marketplace API
```

### Packages

| Package | Port | Description |
|---------|------|-------------|
| `@xbounty/registry` | 3100 | Job/bounty marketplace API (SQLite-backed) |
| `@xbounty/creation` | — | AI agent that creates bounties from X |
| `@xbounty/profile` | — | AI agent that analyzes profiles |
| `@xbounty/suggestion` | — | AI agent that ranks candidates |

---

## 🚀 Quick Start

### Prerequisites

- Node.js 20+
- pnpm 9+
- Docker (optional, for containerized deployment)

### Environment Variables

Create a `.env` file in the root:

```bash
# Required: xAI API Key (for Grok)
XAI_API_KEY=xai-...

# Required: X API Bearer Token (for Twitter data)
X_BEARER_TOKEN=AAAA...

# Optional: Bootstrap secret for agent registration
BOOTSTRAP_SECRET=xbounty-bootstrap-2024

# Timezone (default: America/Los_Angeles)
TZ=America/Los_Angeles
```

### Local Development

```bash
# Install dependencies
pnpm install

# Start the registry (job/bounty API)
pnpm registry

# Generate bounties from X (one-shot)
pnpm creation:once
```

### Docker Deployment

```bash
# Start all services
make up

# Or start specific services
make up-registry     # Just the registry

# View logs
make logs
make logs-create
```

---

## 🛠️ CLI Commands

### Bounty Creation

```bash
# Run continuous bounty generation
pnpm creation

# Generate bounties once and exit
pnpm creation:once
```

### Profile Analysis

```bash
# Start the profile agent
pnpm profile
```

### Suggestion Agent

```bash
# Start the suggestion agent
pnpm suggestion
```

---

## 🔌 API Endpoints

### Registry API (`:3100`)

```
GET  /health              # Health check
GET  /stats               # Platform statistics

# Jobs
GET  /jobs                # List jobs
POST /jobs                # Create job
GET  /jobs/:id            # Get job

# Applications
POST /applications        # Submit application
GET  /applications/:id    # Get application

# Users
POST /users/register      # Register new user
```

---

## 🧪 Testing

```bash
# Run all tests
pnpm test

# Run specific package tests
pnpm registry:test
pnpm creation:test
```

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **AI** | xAI Grok, AI SDK |
| **Data** | X API v2 |
| **Backend** | Node.js, Hono, TypeScript |
| **Database** | SQLite (better-sqlite3) |
| **Deployment** | Docker, Docker Compose |
| **Package Manager** | pnpm workspaces |

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests: `pnpm test`
5. Submit a pull request

---

## 🙏 Acknowledgments

- **xAI** — For Grok and the xAI API
- **X/Twitter** — For the API and data
- **Vercel AI SDK** — For the tool orchestration framework

---

<p align="center">
  <strong>Built with 🔥 at the xAI Hackathon</strong>
</p>
