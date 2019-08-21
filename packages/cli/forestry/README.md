# Forestry CLI

Supports Github (Gitlab to come)

## Development

To run the project, run

```
  ./bin/forestry <commands>
```

You can view the list of commands with `--help`

### env

To access some third party services, you will need to add a env.
Use the .env.example to fill in the example keys.

### Creating a Github app

To test the Github APP API locally, you can create a Github app here: https://github.com/settings/apps/new
Homepage URL: http://localhost:4568
User authorization callback URL: http://localhost:4568/github/callback
Setup URL: http://localhost:4568/github/installation-callback
Redirect on update: TRUE

Then click "Generate a Private key"
