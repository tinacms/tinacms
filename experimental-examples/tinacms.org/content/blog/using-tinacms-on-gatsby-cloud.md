---
title: Using TinaCMS on Gatsby Cloud
date: '2020-01-03T12:00:00.000Z'
draft: false
author: James O'Halloran
consumes:
  - file: /packages/@tinacms/api-git/src/server.ts
    details: Explains configuring git-specific environment variables to manually set author and ssh-key
  - file: /packages/@tinacms/gatsby-tinacms-git/index.ts
    details: Explains configuring git-specific environment variables to manually set author and ssh-key
next: content/blog/three-ways-to-edit-md.md
prev: content/blog/editing-on-the-cloud.md
warningMessage: '**Update:** The examples in this post reference an outdated Gatsby implementation. We recommend using [Next.js](/docs/setup-overview/) for a solution with less friction.'
---

We've [recently written](/blog/editing-on-the-cloud/ 'TinaCMS on the cloud') about how TinaCMS will work on the cloud. Gatsby Cloud offers a great way for editors to edit TinaCMS sites, without having to run a local development environment.

Since Gatsby Cloud is built from the ground up specifically for Gatsby sites, it takes advantage of _build-artifact caching_ & _parallelizing tasks_ to make things fast ⚡

So, let's do this! 🕺

## Deploying a Preview on Gatsby Cloud 🚀

Deploying a preview with Gatsby Cloud can be done in just a few clicks. Once we've [created an account](https://www.gatsbyjs.com/cloud/ 'Gatsby Cloud'), we can connect the site's repository and enter some build information (the site's root directory and environment variables).

And tada! ✨ Our site's preview should be live! Any commits we make to the repo going forward will automatically trigger a rebuild of our Gatsby preview.

> Note: This preview will act as our "Cloud Editing Environment" and not our production site. Your production site should be built and deployed separately.

Now that our **preview is live**, there's some extra configuration that we'll want to do to have Tina work smoothly on the cloud.

## Make the Cloud Environment Private 🔒

We don't want just any stranger making commits from our cloud editing environment, so one of the first things we will want to do is make this environment private. This can be toggled within the **Access Control** section of the Gatsby Cloud **Site Settings**

## Configuring Git for Cloud Commits ✔️

> If you are using the gatsby-tinacms-git plugin, make sure to use version: 0.2.16-canary.0 or later!

To set up for canary, run `yarn add gatsby-tinacms-git@canary` until this version reaches a full release.

To get Tina working in Gatsby Cloud, we'll need to configure a few environment variables in our **Gatsby Cloud site settings**:

    GIT_AUTHOR_EMAIL
    GIT_AUTHOR_NAME
    TINA_CEE
    SSH_KEY

### `GIT_AUTHOR_NAME` & `GIT_AUTHOR_EMAIL` 🗣️

These values will define who will show up in the author field when commits are made.
![tinacms-add-new-file-gif](/img/commit_author_scott.png)

If you want the author to be based off of the logged-in user instead of a static value in your env, you might want to take a look at [Tina Teams](/teams 'Tina Teams')!

### `TINA_CEE`

This needs to be set to ensure that Tina knows that it is being run in a _Cloud Editing Environment_. Set it to `true`.

### `SSH_KEY` 🔑

The `SSH_KEY` is a private key that allows write access to your Git repo from our cloud editing environment.

Let's start by creating a new keypair using the following command. (Make a note of your key path/name, and when prompted for a password leave it blank)

```
$ ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

This should have created a **private key**, and a **public key**. We'll need to add the **public key** to your site's repo within your Git provider (Github, Gitlab, Bitbucket etc). In Github, This can be done in "Settings" > "Deploy Keys". Make sure to **enable write access.**

We can log out our public key by running the following command in your terminal:

```
$ cat ~/.ssh/your_key_name.pub
```

Now let's add the **private key** to Gatsby Cloud.

The **private key** will need to be be **Base64 encoded** and added to Gatsby Cloud as an environment variable.

We can encode and log our **private key** by running the following command in your terminal:

```
$ cat ~/.ssh/your_key_name | base64
```

Let's add this as an environment variable within Gatsby Cloud:

```
SSH_KEY: [value logged out above]
```

Lastly, we need to add this to the gatsby-tinacms-git configuration in `gatsby-config.js`:

```js
plugins: [
  {
    resolve: "gatsby-plugin-tinacms",
    options: {
      plugins: [
        ...
        {
          resolve: "gatsby-tinacms-git",
          options: {
            ...
            sshKey: process.env.SSH_KEY
          },
        },
      ],
    },
  }
  ...
]
```

Now after you trigger a rebuild, it should be able to commit to your repository!

> Note that Base64 encoding the key DOES NOT make it safe to make public!! **Do not commit this value to your repository.** We are Base64 encoding the key only to avoid formatting issues when using it as an environment variable.

## Site Configuration 🔨

When it's time to get our editors editing a Tina site on a cloud editing environment, we will need to be **extra careful around safeguarding against run-time errors.** Does the site blow up if an array is empty? or if an image isn't defined? We'll want to account for these edge cases which your editors may run into while editing.

## Happy Cloud Editing! ☁️

Hopefully this gets you started editing **your Gatsby site with Tina on the cloud.**

We'll continue to detail how to host cloud editing environments on a few different services. You can also sign up for our [Tina Teams Alpha](http://tinacms.org/teams) to try out some extended team features!

If you run into trouble or have any questions, head over to the [Tina Forum](https://community.tinacms.org/) for help. Stoked on TinaCMS? Please ⭐️ us on [Github](https://github.com/tinacms/tinacms) or [Tweet us](https://twitter.com/Tina_cms) 🐦 to show-off your Tina projects.
