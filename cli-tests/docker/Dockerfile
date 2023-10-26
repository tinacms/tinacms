FROM amazon/aws-lambda-nodejs:16

WORKDIR /starters

ENV TINAVERSION=0.0.0-20231024174613
ENV NEXTVERSION=13.5.6

RUN yum groupinstall -y 'Development Tools'
RUN yum install -y python3
RUN npm install -g npm@9.8.1

RUN npx create-next-app@$NEXTVERSION next-ts\
 --typescript\
 --no-app\
 --no-eslint\
 --no-tailwind\
 --no-src-dir\
 --import-alias "@/*"

RUN npx create-next-app@$NEXTVERSION next-ts-src\
 --typescript\
 --no-app\
 --no-eslint\
 --no-tailwind\
 --src-dir\
 --import-alias "@/*"

RUN npx create-next-app@$NEXTVERSION next-ts-app\
 --typescript\
 --app\
 --no-eslint\
 --no-tailwind\
 --no-src-dir\
 --import-alias "@/*"

RUN npx create-next-app@$NEXTVERSION next-js\
 --javascript\
 --no-app\
 --no-eslint\
 --no-tailwind\
 --no-src-dir\
 --import-alias "@/*"

RUN npx create-next-app@$NEXTVERSION next-js-src\
 --javascript\
 --no-app\
 --no-eslint\
 --no-tailwind\
 --src-dir\
 --import-alias "@/*"

RUN npx create-next-app@$NEXTVERSION next-js-app\
 --javascript\
 --app\
 --no-eslint\
 --no-tailwind\
 --no-src-dir\
 --import-alias "@/*"

RUN git clone https://github.com/cferdinandi/hugo-starter.git
RUN git clone https://github.com/electricbookworks/jekyll-starter.git

RUN npm install -g @tinacms/cli@$TINAVERSION

WORKDIR /app

COPY ../package.json .
COPY ../package-lock.json .
COPY ../jest.config.js .
COPY ../jest.setup.ts .

RUN npm install

# override the base entrypoint
ENTRYPOINT ["/bin/bash", "-l", "-c"]
