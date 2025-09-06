FROM mcr.microsoft.com/playwright:v1.40.0-jammy

WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .

RUN mkdir -p logs

CMD ["sh", "-c", "npm test 2>&1 | tee logs/test.log"]