# ---- Build stage ----
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
# Build-time config (overrides .env.production). Default: API on the same domain.
ARG VITE_API_URL=/api
ARG VITE_RAZORPAY_KEY_ID=
ARG VITE_GOOGLE_CLIENT_ID=
ARG VITE_GA_MEASUREMENT_ID=
ARG VITE_META_PIXEL_ID=
ENV VITE_API_URL=$VITE_API_URL \
    VITE_RAZORPAY_KEY_ID=$VITE_RAZORPAY_KEY_ID \
    VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID \
    VITE_GA_MEASUREMENT_ID=$VITE_GA_MEASUREMENT_ID \
    VITE_META_PIXEL_ID=$VITE_META_PIXEL_ID
RUN npm run build

# ---- Runtime (static nginx) stage ----
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80

HEALTHCHECK --interval=30s --timeout=5s \
  CMD wget -qO- http://localhost:80/ || exit 1
