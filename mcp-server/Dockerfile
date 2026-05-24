FROM node:22-alpine AS builder
WORKDIR /app
COPY mcp-server/package*.json ./mcp-server/
RUN cd mcp-server && npm ci
COPY bcb-rc-16-28-11-2025/ ./bcb-rc-16-28-11-2025/
COPY bcb-rc-17-28-11-2025/ ./bcb-rc-17-28-11-2025/
COPY mcp-server/ ./mcp-server/
RUN cd mcp-server && npm run build

FROM node:22-alpine AS production
WORKDIR /app
RUN addgroup -S appgroup && adduser -S appuser -G appgroup
COPY --from=builder /app/mcp-server/package*.json ./
COPY --from=builder /app/mcp-server/dist ./dist
COPY --from=builder /app/mcp-server/node_modules ./node_modules
COPY --from=builder /app/bcb-rc-16-28-11-2025 ./bcb-rc-16-28-11-2025
COPY --from=builder /app/bcb-rc-17-28-11-2025 ./bcb-rc-17-28-11-2025
USER appuser
EXPOSE 3001
CMD ["node", "dist/index.js"]
