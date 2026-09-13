FROM mcr.microsoft.com/playwright:v1.43.1-jammy

ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright

WORKDIR /app

COPY package.json package-lock.json ./
COPY apps ./apps
COPY packages ./packages
COPY agents ./agents
COPY adapters ./adapters
COPY tsconfig.json ./
COPY composio-agent-capability-map.json ./

# Install dev dependencies too because TypeScript is required to build.
RUN npm ci

RUN npm install -g openclaw@2026.6.11

RUN npm run build --workspaces --if-present && \
    npm run build

# Runtime begins only after compilation.
ENV NODE_ENV=production

RUN mkdir -p \
    /data/ai-os/state \
    /data/ai-os/api \
    /data/ai-os/reddit \
    /root/.openclaw

ENV AI_OS_STATE_DIR=/data/ai-os/state
ENV AI_OS_DATA_DIR=/data/ai-os/api
ENV AI_OS_REDDIT_DATA_DIR=/data/ai-os/reddit
ENV AI_OS_BROWSER_HEADLESS=true

ENV OPENCLAW_BIN=/usr/local/bin/openclaw
ENV OPENCLAW_GATEWAY_URL=http://openclaw:18789

ENV AI_OS_API_HOST=0.0.0.0
ENV AI_OS_API_PORT=3001

EXPOSE 3001

CMD ["node", "apps/api/dist/index.js"]
