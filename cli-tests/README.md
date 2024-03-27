# cli tests

This project is used to test the CLI against different package managers and starter projects. Tests can be run in a docker
container to provide a consistent environment for testing. Alternatively, tests can be run locally.

# Prerequisites

- Docker
- Node.js

# Setup

Configure the tinacms and nextjs versions in the docker files

# Run all tests

```bash
./scripts/run-all-tests.sh
```

# Run tests for one package manager

```bash
PACKAGE_MANAGER=pnpm ./scripts/run-tests.sh
```

# Run docker image without running tests

```bash
./scripts/exec-image.sh cli-testing-[package-manager]
```

## Running tests locally

### Install dependencies

```bash
npm install
```

### Create starter folder

```bash
mkdir starter
```

### Create starters

Using the commands in `Dockerfile` as an example create the starters in the `starter` folder. The names of the starter folders
should match the names in the `Dockerfile`.

### Setup environment file

```bash
cp .env.example .env
```

### Set starter directory for environment

Edit the .env and set `STARTER_FOLDER` to the path where the starters are

### Run tests

```bash
npm dlx jest ./tests
```
