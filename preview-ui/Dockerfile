FROM node:22-alpine AS builder
WORKDIR /app
COPY preview-ui/package*.json ./preview-ui/
RUN cd preview-ui && npm ci
COPY bcb-rc-16-28-11-2025/ ./bcb-rc-16-28-11-2025/
COPY bcb-rc-17-28-11-2025/ ./bcb-rc-17-28-11-2025/
COPY preview-ui/ ./preview-ui/
RUN cd preview-ui && npm run build

FROM nginx:alpine
COPY --from=builder /app/preview-ui/out /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
