FROM node:12 as base
RUN mkdir /app
WORKDIR /app
COPY . ./
RUN yarn 
RUN mv .env.example .env
#Bundle into dist directory
RUN yarn build
FROM nginx
COPY --from=base /app/dist /usr/share/nginx/html