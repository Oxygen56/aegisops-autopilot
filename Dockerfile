FROM node:22-alpine AS deps
WORKDIR /app
ARG PNPM_VERSION=11.7.0
ARG NPM_CONFIG_REGISTRY=https://registry.npmjs.org/
RUN npm install -g "pnpm@${PNPM_VERSION}" --registry="${NPM_CONFIG_REGISTRY}"
COPY package.json pnpm-lock.yaml* pnpm-workspace.yaml* ./
RUN pnpm config set registry "${NPM_CONFIG_REGISTRY}"
RUN pnpm install --frozen-lockfile=false

FROM deps AS build
WORKDIR /app
COPY . .
RUN pnpm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8787
ARG PNPM_VERSION=11.7.0
ARG NPM_CONFIG_REGISTRY=https://registry.npmjs.org/
RUN npm install -g "pnpm@${PNPM_VERSION}" --registry="${NPM_CONFIG_REGISTRY}"
COPY --from=build /app/package.json /app/pnpm-lock.yaml* /app/pnpm-workspace.yaml* ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/src ./src
EXPOSE 8787
CMD ["pnpm", "run", "preview"]
