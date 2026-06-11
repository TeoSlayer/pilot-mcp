# Multi-stage build for the Docker MCP Catalog.
# Docker-built path gives Sigstore signing + SBOM + provenance for free.

FROM node:20-alpine AS base
WORKDIR /app
COPY package.json ./
RUN npm install --omit=optional --no-audit --no-fund && \
    npm install --no-audit --no-fund

COPY . .

# Default to stdio MCP server.
ENTRYPOINT ["node", "cli.js"]
CMD []
