FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

FROM base AS build
WORKDIR /app
COPY pnpm-lock.yaml pnpm-workspace.yaml package.json ./
COPY common ./common
COPY suggestion ./suggestion
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile
RUN pnpm --filter @xbounty/common build
RUN pnpm --filter @xbounty/suggestion build

FROM base AS suggestion
WORKDIR /app
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/common/dist ./common/dist
COPY --from=build /app/common/package.json ./common/package.json
COPY --from=build /app/suggestion/dist ./suggestion/dist
COPY --from=build /app/suggestion/package.json ./suggestion/package.json
WORKDIR /app/suggestion
EXPOSE 3300
CMD ["node", "dist/cli.js"]
