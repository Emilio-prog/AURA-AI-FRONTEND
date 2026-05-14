FROM node:20-alpine AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ARG VITE_API_BASE_URL
ARG VITE_TURNSTILE_SITE_KEY
ARG VITE_DEFAULT_LOCALE=es
ARG VITE_DEV_MODE=false
ENV VITE_API_BASE_URL=$VITE_API_BASE_URL \
    VITE_TURNSTILE_SITE_KEY=$VITE_TURNSTILE_SITE_KEY \
    VITE_DEFAULT_LOCALE=$VITE_DEFAULT_LOCALE \
    VITE_DEV_MODE=$VITE_DEV_MODE
RUN npm run build

FROM nginx:1.27-alpine AS runtime

RUN apk add --no-cache curl
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html

EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 CMD curl -fsS http://localhost/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
