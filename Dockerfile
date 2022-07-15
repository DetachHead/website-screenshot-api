FROM mcr.microsoft.com/playwright:v1.23.1-focal

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app
WORKDIR /home/node/app

# Add user so we don't need --no-sandbox.
# same layer as npm install to keep re-chowned files from using up several hundred MBs more space
RUN mkdir -p /home/node/Downloads \
    && chown -R node:node /home/node \

COPY package-*.json .
RUN npm ci
COPY . .

USER node
