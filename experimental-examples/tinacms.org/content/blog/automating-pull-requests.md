---
title: Automating Pull Requests
date: '2022-04-14T07:00:00.000Z'
author: James Perkins
prev: content/blog/read-only-tokens-content-anytime.md
---

When working on a git-backed site, you don’t normally want to work directly on your main branch. Ideally, you want to be able to finish your post or site update, check if it looks good, and schedule the release. In this post, we are going to cover two different options to automate your PRs to make scheduling content easier.

## PR Scheduler

PR Scheduler is a GitHub integration that can be installed directly within your GitHub repositories. It was built by [Tom Kadwill](https://tomkadwill.com/) with the goal to make it easy to schedule pull requests. PR Scheduler lets developers schedule PRs to be merged at a specific time. Instead of having to write your own GitHub action, you can write a comment in your pull request and the application will take care of it for you.

### How to install

1.  Open [PR Scheduler's GitHub App page](https://github.com/apps/pr-scheduler).
2.  Click the 'Install' button
3.  Select whether to install PR Scheduler on all repositories or only specific repositories. Then click 'Install'.

### How to schedule a pull request

Now, the PR Scheduler can now be used to schedule any of your pull requests. To initiate,do the following:

1.  Open the pull request that you want to schedule.
2.  Add a new comment with DD/MM/YYYTHH:MM for example `@prscheduler 05/04/2022T14:00`
3.  PR Scheduler will respond back telling you it's ready.

![Example Image of PR Scheduled](https://res.cloudinary.com/forestry-demo/image/upload/v1649865121/blog-media/branch-automate-pr/Screen\_Shot\_2022-04-12\_at\_7.34.54\_AM.png "")

That's it! Now when that time comes, your PR will be merged. If you make a mistake with the time or date, just run the same command and it will reschedule.

## Github Actions

Github Actions are a powerful and flexible way to allow you to run all sorts of DevOps workflows without needing separate tooling. Github Actions uses YAML to define workflows. This makes a great option for scheduling your pull requests where you want to have maximum control.

### Creating your GitHub Action

Create a file in your project called `.github/workflows/scheduler.yml`. We will use this to create our action.

There are quite a few options for Github Actions. I have used **merge-schedule-action** in multiple personal projects, it has create customization and is easy to use. This action takes a few different arguments and uses the date to schedule your PR:

```
name: Merge Schedule
on:
  pull_request:
    types:
      - opened
      - edited
      - synchronize
  schedule:
    # Check every hour.
    - cron: 0 * * * *

jobs:
  merge_schedule:
    runs-on: ubuntu-latest
    steps:
      - uses: gr2m/merge-schedule-action@v1
        with:
          merge_method: merge
          #  Time zone to use. Default is UTC.
          time_zone: "America/New_York"
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

So let us break down what is happening. We have given this job a name of Merge Schedule. It will only trigger on pull requests that are opened, edited, or synchronized. Every hour we run a job called `merge_schedule`, thanks to the cronjob `0 * * * *`

The steps inside of the jobs section are the most important, it tells GitHub what to do when the schedule runs. First, the job needs to use `gr2m/merge-schedule-action@v1` and tell it the merge method to use. I have set it to merge but you could use squash if you prefer. The `time_zone` is t set to UTC by default, but can be any time zone you need.

The `GITHUB_TOKEN` doesn’t need to be set, since GitHub will retrieve a `GITHUB_TOKEN` to use for the account.

> If you want to read more about triggering GitHub actions check out there documentation https://docs.github.com/en/github-ae@latest/actions/using-workflows/events-that-trigger-workflows

### How to run the action

Now that we have created the action, when you create a pull request, you need to add `/schedule YYYY-MM-DD` to your pull request description. This Github Action will run on the schedule defined in the cron statement and check for PRs where the date matches and then deploy the code. If you need precise deployments you can use `/schedule 2019-12-31T00:00:00.000Z.`

## How to keep up to date with Tina?

The best way to keep up with Tina is to subscribe to our newsletter, we send out updates every two weeks. Updates include new features, what we have been working on, blog posts you may have missed, and so much more!

You can subscribe by following this link and entering your email: [https://tina.io/community/](https://tina.io/community/)

### Tina Community Discord

Tina has a community [Discord](https://discord.com/invite/zumN63Ybpf) that is full of Jamstack lovers and Tina enthusiasts. When you join you will find a place:

*   To get help with issues
*   Find the latest Tina news and sneak previews
*   Share your project with Tina community, and talk about your experience
*   Chat about the Jamstack

### Tina Twitter

Our Twitter account ([@tina\_cms](https://twitter.com/tina\_cms)) announces the latest features, improvements, and sneak peeks to Tina. We would also be psyched if you tagged us in projects you have built.
