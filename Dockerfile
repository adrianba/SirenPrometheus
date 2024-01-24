FROM node:20-alpine
RUN mkdir -p /home/node/app/build && chown -R node:node /home/node/app
ENV NODE_ENV=production
WORKDIR /home/node/app
COPY package*.json ./
USER node
RUN npm ci 
COPY --chown=node:node build/. ./build/.
EXPOSE 8880
CMD [ "node", "build/app.js" ]