FROM node:18-alpine

RUN mkdir /home/node/bot && chown -R node:node /home/node/bot

WORKDIR /home/node/bot

COPY --chown=node:node package*.json ./

USER node
RUN npm ci

COPY --chown=node:node tsconfig.json ./
COPY --chown=node:node src/ src/
RUN npx tsc

CMD ["node", "src/app.js"]