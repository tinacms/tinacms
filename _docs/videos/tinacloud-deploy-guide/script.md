# Script: Deploy a Tina starter to Vercel or Cloudflare

Guide video for [Make a YouTube guide for the TinaCloud Deploy to Vercel and Deploy to Cloudflare flows (#8100)](https://github.com/tinacms/tinacms/issues/8100).

- **Target length:** 7 min 09 s of narration (1071 words at 150 words per minute), plus any pauses the editor adds.
- **Order:** shared intro (S1–S3), Vercel path (V1–V6), Cloudflare path (C1–C11), shared outro (S4).
- **Stills:** each scene has one PNG with the same base name as its HTML file in this folder. A blue outline and a cursor mark the click target.
- **Labels:** every TinaCloud string on a still is listed in `labels.md` with its source (`tinacms/tinacloud@d35ddf0`). Re-check the live TinaCloud UI before you record.
- **Duration rule:** each estimate is the narration's word count at 150 words per minute, rounded to the nearest second. No pauses are included.

## Placeholders

Every scene and line uses only these values.

| What | Value |
| --- | --- |
| GitHub owner | `your-github` |
| Repository, Worker and project name | `my-tina-site` |
| Second Worker (picker only) | `my-tina-site-2` |
| Worker created times (picker only) | `11/26/2026, 9:41:00 AM`, `11/26/2026, 9:38:00 AM` |
| Cloudflare account | `Your Account` |
| Worker URL | `https://my-tina-site.your-account.workers.dev` |
| Vercel URL | `https://my-tina-site.vercel.app` |
| Repository URL | `https://github.com/your-github/my-tina-site` |
| Page title on the live site | `Welcome to my Tina site` |
| Build log lines | lines starting with `[placeholder]` |

## States not covered

These real states are not shown in the video. Reason for each: not part of the happy path or the build-log step the issue asks for.

- Cloudflare approval declined (red alert under the deploy buttons): "Access was denied on Cloudflare. If you did not decline it, your Cloudflare account administrator may have blocked third-party apps."
- No Cloudflare accounts on the login: "No Cloudflare accounts were found for this login."
- Indexing takes too long (row with Check again): "TinaCloud is still indexing your repo. This can take a few minutes; the build starts once it is done."
- Indexing failed: "TinaCloud could not index your repo, so the build was not started."
- Build watch stopped: "We stopped watching the build. Check its progress in Cloudflare."
- Cloudflare rate limit note: "Cloudflare is limiting requests right now. We are checking less often."
- Worker watch timed out: "We stopped watching for your Worker. Click "I've deployed it" once your deployment has finished."
- Vercel return: TinaCloud could not be reached (Try again): "We couldn't reach TinaCloud"
- Vercel: still waiting on Vercel: "Still waiting on Vercel"
- Starter code not pushed yet: "Waiting for Cloudflare to push the starter code to your repo"
- Popup blocked: "Your browser blocked the Cloudflare window. Allow popups for this site and try again."
- Popup closed early: "The Cloudflare window was closed before authorization finished."

## Scenes

### S1: Title card

- **Files:** `S1-title-card.html`, `S1-title-card.png`
- **Host:** shared
- **Browser tab:** none (title card)
- **Screen state:** Title card
- **Active wizard step:** none
- **On-screen action:** No click. Hold on the title.
- **Estimated duration:** 24 s (61 words)

**Narration**

> This video shows you how to put a Tina starter site live on the web. You pick a starter in TinaCloud. Then you deploy it to Vercel or to Cloudflare. A Worker is a small app that Cloudflare runs for you, and on Cloudflare your site runs as a Worker. At the end, you edit your content in the Tina editor.

### S2: Pick a starter

- **Files:** `S2-starter-page.html`, `S2-starter-page.png`
- **Host:** shared
- **Browser tab:** TinaCloud
- **Screen state:** Starter page: starter list
- **Active wizard step:** Create and Deploy
- **On-screen action:** Click target: the Next.js Starter in the list (already selected). Zoom on the yellow popup note while it is read.
- **Estimated duration:** 21 s (52 words)

**Narration**

> In TinaCloud, open the New Project page. Under Start from a template, you see five starters. Click the one you want. In this video we use the Next.js Starter. Now read the yellow note. Vercel and GitHub sign you in with a popup, so allow popups for this site in your browser.

### S3: Choose a host

- **Files:** `S3-starter-detail.html`, `S3-starter-detail.png`
- **Host:** shared
- **Browser tab:** TinaCloud
- **Screen state:** Starter page: starter detail panel
- **Active wizard step:** Create and Deploy
- **On-screen action:** Click target: the two deploy buttons under Deploy with. Zoom on the link under them.
- **Estimated duration:** 23 s (58 words)

**Narration**

> The panel on the right shows the starter you picked. Under Deploy with, there are two buttons. The black Deploy button sends your site to Vercel. The Deploy to Cloudflare button sends it to Cloudflare. If a starter cannot run on Cloudflare yet, the page marks Cloudflare as coming soon, and only Vercel works. We start with Vercel.

### V1: Click Deploy (Vercel)

- **Files:** `V1-vercel-click-deploy.html`, `V1-vercel-click-deploy.png`
- **Host:** vercel
- **Browser tab:** TinaCloud
- **Screen state:** Starter page: Vercel Deploy clicked, new Vercel tab opening
- **Active wizard step:** Create and Deploy
- **On-screen action:** Click target: the black Deploy button. Show the new Vercel tab appearing in the tab strip.
- **Estimated duration:** 12 s (30 words)

**Narration**

> Click the black Deploy button. Vercel opens in a new tab. This TinaCloud tab stays on the starter page. You do not need it again until Vercel sends you back.

### V2: Vercel setup and the TinaCloud integration

- **Files:** `V2-vercel-setup.html`, `V2-vercel-setup.png`
- **Host:** vercel
- **Browser tab:** Vercel tab
- **Screen state:** Vercel clone page (simplified): Git repository, integration, Deploy
- **Active wizard step:** none
- **On-screen action:** Click target: Add on the TinaCloud integration row, then Deploy.
- **Estimated duration:** 36 s (90 words)

**Narration**

> In the Vercel tab, connect GitHub if Vercel asks. Vercel makes a new Git repository for your site in your GitHub account. Next, add the TinaCloud integration, which is an add-on that links your Vercel project to TinaCloud. You must add it during this setup. It creates your TinaCloud project. It also saves your Tina keys, which are the client ID and token your site uses to talk to TinaCloud. They are saved as build variables, which are settings your host reads when it builds your site. Then click Deploy.

### V3: Back in TinaCloud

- **Files:** `V3-vercel-return.html`, `V3-vercel-return.png`
- **Host:** vercel
- **Browser tab:** TinaCloud (redirected from the Vercel tab)
- **Screen state:** Vercel return: looking up the new project
- **Active wizard step:** Project Ready
- **On-screen action:** No click. Show the redirect: the Vercel tab now shows app.tina.io. The step on Vercel's last page that brings you back is unconfirmed (see Open Questions).
- **Estimated duration:** 12 s (30 words)

**Narration**

> Vercel now builds your site. When the build is done, Vercel brings you back to TinaCloud. TinaCloud then looks for the project the integration made. This takes a few seconds.

### V4: Your project is ready

- **Files:** `V4-vercel-project-ready.html`, `V4-vercel-project-ready.png`
- **Host:** vercel
- **Browser tab:** TinaCloud
- **Screen state:** Vercel return: project ready
- **Active wizard step:** Project Ready
- **On-screen action:** Click target: the live site link.
- **Estimated duration:** 10 s (26 words)

**Narration**

> Your project is ready. TinaCloud shows the address of your live site and your new GitHub repository. Click the live site link to open your site.

### V5: Edit in /admin (Vercel)

- **Files:** `V5-vercel-live-admin.html`, `V5-vercel-live-admin.png`
- **Host:** vercel
- **Browser tab:** Live site
- **Screen state:** Live site: Tina editor at /admin
- **Active wizard step:** none
- **On-screen action:** Click target: Save. Show the address bar ending in /admin.
- **Estimated duration:** 22 s (55 words)

**Narration**

> Your site is now live on Vercel. Add slash admin to the address to open the Tina editor. Before your content shows here, TinaCloud does indexing, which means it reads your repository so it can serve your content. This can take a minute. Edit a field, then click Save. Tina saves your change to GitHub.

### V6: Alternatives: no integration, and Vercel build logs

- **Files:** `V6-vercel-alternatives.html`, `V6-vercel-alternatives.png`
- **Host:** vercel
- **Browser tab:** Vercel tab (with an inset of the TinaCloud tab)
- **Screen state:** Alternative A: Vercel return, project not found. Alternative B: Vercel project overview with Build Logs
- **Active wizard step:** none
- **On-screen action:** Two labelled alternatives side by side. Click target: Build Logs on the production deployment.
- **Estimated duration:** 22 s (55 words)

**Narration**

> Here are two cases you may meet on Vercel. First, if you did not add the integration, TinaCloud says Deployment finished instead. Click Import your repository to connect the repo to TinaCloud yourself. Second, if a build fails, open your project in Vercel. Click Build Logs on the production deployment to see what went wrong.

### C1: Click Deploy to Cloudflare and approve

- **Files:** `C1-cloudflare-approve.html`, `C1-cloudflare-approve.png`
- **Host:** cloudflare
- **Browser tab:** Cloudflare popup (over the TinaCloud tab)
- **Screen state:** Starter page: authorizing with Cloudflare, approval popup open
- **Active wizard step:** Create and Deploy
- **On-screen action:** Click target: Deploy to Cloudflare (behind the popup), then the approve button in the popup. The popup's own labels are unconfirmed.
- **Estimated duration:** 20 s (51 words)

**Narration**

> Now the Cloudflare path. Go back to the starter page and click Deploy to Cloudflare. A Cloudflare popup opens. This step uses OAuth, which means you approve TinaCloud to act on your Cloudflare account. Check that the account is yours, then approve. The popup closes by itself, and TinaCloud moves on.

### C2: Connect GitHub

- **Files:** `C2-cloudflare-connect.html`, `C2-cloudflare-connect.png`
- **Host:** cloudflare
- **Browser tab:** TinaCloud
- **Screen state:** Cloudflare connect step: Cloudflare connected, GitHub waiting for popup approval
- **Active wizard step:** Connect
- **On-screen action:** Click target: Connect GitHub (shown disabled while the GitHub popup is open).
- **Estimated duration:** 17 s (42 words)

**Narration**

> TinaCloud now asks for GitHub too. Cloudflare already shows Connected. If GitHub is not connected yet, click Connect GitHub and approve TinaCloud in the GitHub popup. If you are already signed in to GitHub, you may not see this step at all.

### C3: TinaCloud checks your Cloudflare account

- **Files:** `C3-cloudflare-checking.html`, `C3-cloudflare-checking.png`
- **Host:** cloudflare
- **Browser tab:** TinaCloud
- **Screen state:** Cloudflare deploy step: checking existing Workers
- **Active wizard step:** Deploy
- **On-screen action:** No click. The still shows the "Checking your existing Workers…" row; the account-loading row before it is narration only.
- **Estimated duration:** 15 s (37 words)

**Narration**

> Next, TinaCloud loads your Cloudflare accounts, then checks the Workers you already have. If your login has more than one Cloudflare account, you pick one here first. Most people have only one, so they skip that choice.

### C4: Open Cloudflare's deploy page

- **Files:** `C4-cloudflare-open-deploy.html`, `C4-cloudflare-open-deploy.png`
- **Host:** cloudflare
- **Browser tab:** TinaCloud
- **Screen state:** Cloudflare deploy step: deploy page opened, watching for a new Worker
- **Active wizard step:** Deploy
- **On-screen action:** Click target: Open Cloudflare deploy page. The watching row below it appears after the click.
- **Estimated duration:** 16 s (39 words)

**Narration**

> Now click Open Cloudflare deploy page. Cloudflare's deploy page opens in a new tab. Keep this TinaCloud tab open. It watches your Cloudflare account and finds your new Worker by itself. If it does not, click I've deployed it.

### C5: Deploy on Cloudflare's page

- **Files:** `C5-cloudflare-deploy-page.html`, `C5-cloudflare-deploy-page.png`
- **Host:** cloudflare
- **Browser tab:** Cloudflare deploy tab
- **Screen state:** Cloudflare deploy page (simplified): Git account, repository and Worker name, Deploy
- **Active wizard step:** none
- **On-screen action:** Click target: Deploy. Field labels are simplified; see labels.md for what is confirmed.
- **Estimated duration:** 21 s (52 words)

**Narration**

> On Cloudflare's page, check your Git account and the repository name. Cloudflare copies the starter into a new repo in your GitHub account. Any Worker name is fine. If Cloudflare asks for secrets, leave them empty, because TinaCloud adds the keys for you. Click Deploy, then go back to the TinaCloud tab.

### C6: Pick your Worker (only some viewers)

- **Files:** `C6-cloudflare-choose-worker.html`, `C6-cloudflare-choose-worker.png`
- **Host:** cloudflare
- **Browser tab:** TinaCloud
- **Screen state:** Cloudflare deploy step: more than one new Worker found
- **Active wizard step:** Deploy
- **On-screen action:** Click target: Use this Worker on my-tina-site.
- **Estimated duration:** 14 s (34 words)

**Narration**

> You may not see this step. If TinaCloud finds more than one new Worker, it asks which one is yours. Check the name and the time it was created, then click Use this Worker.

### C7: Confirm the Worker

- **Files:** `C7-cloudflare-confirm-worker.html`, `C7-cloudflare-confirm-worker.png`
- **Host:** cloudflare
- **Browser tab:** TinaCloud
- **Screen state:** Cloudflare finish step: confirm Worker
- **Active wizard step:** Finish
- **On-screen action:** Click target: Connect Worker. Zoom on the note at the bottom while it is read.
- **Estimated duration:** 32 s (81 words)

**Narration**

> TinaCloud found your Worker. Check that the name is the one you just made. If it is wrong, click Not this one. Then click Connect Worker. TinaCloud reads the repo from Cloudflare, creates your TinaCloud project and saves the Tina keys as build variables. Now read the note at the bottom. Cloudflare's first build ran before the keys existed, so it stops with Missing TinaCloud build variables. That is expected, and you did not break anything. TinaCloud's own build replaces it.

### C8: TinaCloud indexes your repo

- **Files:** `C8-cloudflare-indexing.html`, `C8-cloudflare-indexing.png`
- **Host:** cloudflare
- **Browser tab:** TinaCloud
- **Screen state:** Cloudflare finish step: indexing
- **Active wizard step:** Finish
- **On-screen action:** No click. Highlight the active indexing row.
- **Estimated duration:** 27 s (67 words)

**Narration**

> You can close the Cloudflare tab now. The first three steps are done. TinaCloud is indexing your repo. If TinaCloud asks you to install its GitHub app on your-github, click that button. It means the app cannot see your new repo yet. The setup carries on by itself after you install it. The note about the first Cloudflare build is still here, and it is still expected.

### C9: TinaCloud builds your site

- **Files:** `C9-cloudflare-building.html`, `C9-cloudflare-building.png`
- **Host:** cloudflare
- **Browser tab:** TinaCloud
- **Screen state:** Cloudflare finish step: building
- **Active wizard step:** Finish
- **On-screen action:** Click target: View build log.
- **Estimated duration:** 13 s (33 words)

**Narration**

> When indexing is done, TinaCloud starts a new build with the keys. Click View build log to watch the build in Cloudflare. This link is where you find the log during any build.

### C10: Your site is live

- **Files:** `C10-cloudflare-live.html`, `C10-cloudflare-live.png`
- **Host:** cloudflare
- **Browser tab:** TinaCloud
- **Screen state:** Cloudflare live step
- **Active wizard step:** Live
- **On-screen action:** Click target: Edit with Tina. The /admin/index.html view it opens is narration only.
- **Estimated duration:** 18 s (44 words)

**Narration**

> Your site is live. TinaCloud shows the address of your Worker. Click Edit with Tina to open the Tina editor at slash admin. Edit a field and save it, and your change goes to GitHub. Cloudflare then builds your site again with the change.

### C11: If the build fails

- **Files:** `C11-cloudflare-build-failed.html`, `C11-cloudflare-build-failed.png`
- **Host:** cloudflare
- **Browser tab:** TinaCloud
- **Screen state:** Cloudflare finish step: build failed, log shown
- **Active wizard step:** Finish
- **On-screen action:** Click target: View build log. The log lines are placeholders.
- **Estimated duration:** 34 s (85 words)

**Narration**

> If the build fails, TinaCloud says so and shows the log right here. Your project and build variables are already set, so you only need to fix the build. Click View build log to open the full log in Cloudflare. If TinaCloud cannot read the log, it says: We could not read the build log. Open it in Cloudflare to see why. Want to set things up by hand instead? On the starter page, the link under the deploy buttons lets you configure Cloudflare yourself.

### S4: Recap and help

- **Files:** `S4-recap.html`, `S4-recap.png`
- **Host:** shared
- **Browser tab:** none (title card)
- **Screen state:** Recap card
- **Active wizard step:** none
- **On-screen action:** No click. Hold on the recap.
- **Estimated duration:** 20 s (49 words)

**Narration**

> That is it. You deployed a Tina starter to Vercel or Cloudflare, and you edited it in the Tina editor. If something goes wrong, check the build log first. For more help, read the deploy guides for Vercel and for Cloudflare Workers in the TinaCMS docs. Thanks for watching.
