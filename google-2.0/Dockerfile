### 1) Build stage ###
FROM node:18-alpine AS builder
WORKDIR /app

# Installerer avhengigheter
COPY package.json package-lock.json ./
RUN npm ci

# Kopierer hele prosjektet (inkl. kildekode og config-filer)
COPY . .

# Bygger Next.js-applikasjonen (prod-versjon)
RUN npm run build

### 2) Production stage ###
FROM node:18-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Kopierer bare det som trengs for produksjon (optimal størrelse)
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

# Åpner port 3000 og starter appen
EXPOSE 3000
CMD ["npm", "start"]
