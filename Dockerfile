FROM mcr.microsoft.com/playwright:v1.23.1-focal

RUN useradd node && mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app

# Add user was needed for chrome, dont think its needed now that we use firefox but cbf fucking around with docker and linux shit so it stays
RUN mkdir -p /home/node/Downloads

COPY package*.json ./
RUN npm ci
COPY . .

RUN chown -R node:node /home/node && npm run build

USER node
