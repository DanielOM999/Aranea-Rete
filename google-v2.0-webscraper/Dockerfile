### 1) Build stage ###
FROM node:18-alpine AS builder
WORKDIR /app

# Installerer avhengigheter definert i manifestet (package.json + lock)
COPY package.json package-lock.json tsconfig.json ./
RUN npm ci

# Kopierer all kildekode (inkludert top-1m.txt og lemmatizedMap.json)
COPY . .

# Kompilerer TypeScript til JavaScript
RUN npm run build


### 2) Production stage ###
FROM node:18-alpine AS runner
WORKDIR /app

# Angir miljøvariabler for produksjon
ENV NODE_ENV=production
ENV PORT=5000
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium-browser

# Installerer Chromium-nettleser og nødvendige systembiblioteker
# Inkluderer også PostgreSQL-klient for å kunne bruke pg_isready
RUN apk add --no-cache \
    chromium \
    nss \
    freetype \
    harfbuzz \
    ca-certificates \
    ttf-freefont \
    postgresql-client

# Kopierer bygget applikasjon og nødvendige filer fra builder-steget
COPY --from=builder /app/dist       ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json  ./package.json

# Kopierer crawler-data og hjelpestrukturer
COPY --from=builder /app/top-1m.txt        ./top-1m.txt
COPY --from=builder /app/lemmatizedMap.json ./lemmatizedMap.json

# Kopierer script for å vente på at databasen er klar
COPY --from=builder /app/scripts/wait-for-it.sh ./wait-for-it.sh

RUN sed -i 's/\r$//' wait-for-it.sh \
 && chmod +x wait-for-it.sh

# Åpner port 5000 og starter applikasjonen når databasen er klar
EXPOSE 5000
ENTRYPOINT ["sh", "./wait-for-it.sh", "postgres"]
CMD ["node", "dist/starter.js"]
