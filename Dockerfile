FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

RUN npm install playwright-test-framework-advanced@^1.0.0
RUN npx playwright install --with-deps

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npx", "playwright", "test"]