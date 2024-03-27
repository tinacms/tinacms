#!/bin/bash

PM=$PACKAGE_MANAGER

# Build the base image and the image for the specified package manager and run the tests
docker build --file docker/Dockerfile -t cli-testing-base . &&\
 docker build --file "docker/Dockerfile.$PM" -t "cli-testing-$PM" . &&\
  docker run --rm --entrypoint "npx" "cli-testing-$PM:latest" jest "-i $*"
