# === Dev stage (hot reload con Vite) ===
FROM node:20-alpine AS dev
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
EXPOSE 5173
CMD ["pnpm", "vite", "--host", "0.0.0.0"]

# === Prod build ===
FROM node:20-alpine AS build
WORKDIR /app
RUN corepack enable pnpm
COPY package.json pnpm-lock.yaml ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm run build

# === Prod serve con nginx ===
FROM nginx:alpine AS prod
COPY --from=build /app/dist /usr/share/nginx/html/admin
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
