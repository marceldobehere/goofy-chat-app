FROM node:16-bullseye


WORKDIR /srv
COPY . .
RUN npm install

ENTRYPOINT [ "bash", "entry.sh" ]