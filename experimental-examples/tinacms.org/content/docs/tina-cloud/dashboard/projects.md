---
title: Projects
id: '/docs/tina-cloud/dashboard/projects'
next: '/docs/tina-cloud/dashboard/users'
---

**Projects** connect Tina Cloud with a GitHub repository. A project is the **link between your site and your site's editors**, allowing users that you have authorized to access and modify the site's content.

> If it is your first time accessing the Tina Cloud dashboard, you will be given two options for setting up your first project. You can fork our <a href="https://github.com/tinacms/tina-cloud-starter" target="_blank">pre-built Next.js starter</a> which gets you up and running with Tina quickly and easily. Alternatively, you can connect to an existing GitHub repository.

## Setup

### 1. Authorizing GitHub

When setting up a project, the first step will be to authenticate with GitHub. A popup window will ask for permission to give Tina.io access to your GitHub repositories.

This authorization will allow Tina Cloud to push and pull content to and from the GitHub repository associated with your site.

### 2. Choosing the GitHub repository

Once GitHub has been authorized, a list of repositories will be displayed. The next step is to choose the repository containing your site's content.

If you don't see your repository within the list, you may have to re-configure your Tina.io permissions within GitHub.

### 3. Configuring the project

In the last step, the following properties must be configured:

#### Project Name

This name is shown to your users when they login to the project. Defaults to the repository name.

#### Site URL(s)

In these fields, enter both the local URL and the production site URL (if known). For security reasons, Tina will only work at these locations.

If you are developing locally, this value might be something like:

`http://localhost:3000`.

If Tina Cloud is configured on your production site, this value might be something like:

`https://<YOUR-SITE-NAME.com>`

> Only the URL origin is needed. There is no need to include the path to any specific pages.

### 4. Using the project

Once your project is created, you will see it listed on your [Projects](https://app.tina.io/projects) page.

## Administering the project

### Overview

A project's Overview page gives you an important value: your project's unique **Client ID**. This value is used by Tina Cloud to connect to your site's repository. You will need to use this value when setting up your site to use Tina.

### Configuration

After your project has been created, you can visit the Configuration page to update the Project Name, Site URL(s), or the GitHub repository

#### Changing the Repository

From the project configuration screen, click the "Change Repository" button. You will authorize Tina.io again and a list of repositories will be displayed. Selecting the new repository and click Save Project to update the repository.

#### Refreshing Webhooks

In rare circumstances, the GitHub Webhook connecting your repository to Tina Cloud may be disrupted. Click the "Refresh Webhooks" button to restore them.
