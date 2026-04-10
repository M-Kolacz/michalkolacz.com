FROM mcr.microsoft.com/playwright:v1.58.0-noble
WORKDIR /app
COPY package.json package-lock.json .npmrc ./
RUN npm ci
COPY .storybook/modes.ts ./.storybook/
COPY tests/visual/visual.spec.ts ./tests/visual/
COPY tests/visual/playwright.config.ts ./tests/visual/
CMD ["npx", "playwright", "test", "--config=tests/visual/playwright.config.ts"]
