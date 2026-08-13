#to build a production image of project

FROM node:22-alpine as builder

WORKDIR /app

COPY package*.json ./

# only install dependencies version required, it looks into package-lock.json file
RUN npm ci

COPY . .

RUN npm run build



# till now we have build our builder image 


FROM node:18-alpine as production

ENV NODE_ENV=production

WORKDIR /app

COPY package*.json ./

#this line will ignore unneccesary scripts to be executed when we install packages
RUN npm ci --ignore-scripts

#this line will use dist folder after building the project that's what we want
COPY --from=builder /app/dist ./  

EXPOSE 5500

#now this will finaly run this file from the dist folder we got after building the project
CMD ["node", "src/server.js"]


