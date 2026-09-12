# Deploying KN Softic from GitHub on Hostinger (hPanel)

The site is already live on Hostinger, put there by uploading files by hand. This guide switches
that to **deploying from GitHub**: you push your code, Hostinger pulls it, and one command finishes
the job.

Repository: `https://github.com/knsoftic/knmainweb.git`

---

## What the site is made of

| Part | Folder | Port | Address |
|---|---|---|---|
| Website (Next.js) | `frontend` | 3000 | https://knsoftic.com |
| API (Express) | `backend` | 5000 | https://api.knsoftic.com |
| Database (MySQL) | — | 3306 | on the server |

---

## Important: what GitHub deployment does and does not do

Hostinger's Git feature **only copies files**. After every deployment you still have to:

1. install dependencies (`npm ci`),
2. update the database (`npm run migrate`),
3. rebuild the website (`npm run build`),
4. restart both apps.

That is what `deploy.sh` in the project root does, in one command.

**These never come from GitHub and stay on the server** (they are excluded from the repository on
purpose, so a deployment can never overwrite or delete them):

- `backend/.env` — database password, tokens, allowed addresses
- `frontend/.env.production` — the API and site addresses
- `public/uploads/` — every image uploaded through the admin panel

Keep a private copy of both `.env` files somewhere safe.

---

## Part 1 — One-time setup

### Step 1. Decide which branch goes live

Today's work is on the branch `fix/site-audit`. Deploy from `main` so "what's on GitHub's main
branch" always equals "what's on the website".

On GitHub: open the repository → **Pull requests** → **New pull request** → base `main`, compare
`fix/site-audit` → create it → **Merge**.

Or from your computer:

```bash
cd "E:/Office Work/kn softic website"
git checkout main
git merge fix/site-audit
git push origin main
```

### Step 2. Back up what is on the server now

Before changing anything, in hPanel → **Files** → **File manager**, download:

- `backend/.env`
- `frontend/.env.production`
- the whole `public/uploads` folder

And in hPanel → **Databases** → **phpMyAdmin** → Export, save a copy of the database.

Do not skip this. It is your way back if anything goes wrong.

### Step 3. Connect the repository in hPanel

hPanel → **Websites** → knsoftic.com → **Dashboard** → **Advanced** → **GIT**.

Fill in:

| Field | Value |
|---|---|
| Repository address | `https://github.com/knsoftic/knmainweb.git` |
| Branch | `main` |
| Directory | the folder your site already runs from (see note below) |

**About the directory.** Hostinger refuses to install into a folder that already has files, so
either:

- **Option A (recommended)** — install into a new empty folder, for example `knsoftic-git`. Then
  copy `backend/.env`, `frontend/.env.production` and `public/uploads` into it from your old
  folder, and point the Node.js apps at the new folder (Part 3).
- **Option B** — rename the current folder as a backup (`knsoftic-old`), install into a fresh one,
  then copy the three items across.

If the repository is private, hPanel shows an **SSH key**. Copy it, then on GitHub go to the
repository → **Settings** → **Deploy keys** → **Add deploy key**, paste it, and leave write access
off.

### Step 4. Turn on automatic deployment (optional but handy)

In the same GIT page Hostinger shows a **webhook URL**. On GitHub: repository → **Settings** →
**Webhooks** → **Add webhook**:

- Payload URL: the webhook address from hPanel
- Content type: `application/json`
- Events: *Just the push event*

Now every push to `main` copies the new files to the server automatically. You still run
`deploy.sh` afterwards to build and restart (Part 2).

### Step 5. Check SSH access

hPanel → **Advanced** → **SSH access**. Note the host, port and username, and connect:

```bash
ssh -p <port> <username>@<host>
```

You need this once per deployment, for the build step. If SSH is not included in your plan, see
[Building without SSH](#building-without-ssh) at the end.

---

## Part 2 — Deploying a change (the normal routine)

From now on, releasing an update looks like this:

**1. Push your work**

```bash
git add -A
git commit -m "Describe the change"
git push origin main
```

**2. Pull it onto the server**

Either wait for the webhook (Step 4), or press **Deploy** in hPanel → Advanced → GIT.

**3. Build and restart** — over SSH:

```bash
cd ~/domains/knsoftic.com/knsoftic     # your project folder
sh deploy.sh
```

You will see it install dependencies, run the database migrations, build the website, and restart.
It takes a few minutes, mostly the build.

**4. Check it worked**

```bash
cd ~/domains/knsoftic.com/knsoftic/backend && npm run check
```

This inspects the settings file, connects to the database, counts your content, tests the uploads
folder and calls the live API — then prints `OK`, `WARN` or `FAIL` for each. It only reads, so it is
safe to run at any time. See [Checking a deployment](#checking-a-deployment) below.

Then open https://knsoftic.com and the admin panel at /admin/login.

---

## Part 3 — Node.js apps and domains

This only needs doing once (or after moving to a new folder).

hPanel → **Advanced** → **Node.js** (or **Setup Node.js App**). You need two applications:

| | Website | API |
|---|---|---|
| Application root | `.../knsoftic/frontend` | `.../knsoftic/backend` |
| Startup file | `node_modules/next/dist/bin/next` with argument `start` | `server.js` |
| Port | 3000 | 5000 |
| Node version | 20 or newer | 20 or newer |
| Domain | knsoftic.com | api.knsoftic.com |

Node **20.9 or newer** is required — the website will not build on Node 18.

If your plan runs Node through PM2 over SSH instead of the panel, use:

```bash
cd ~/domains/knsoftic.com/knsoftic/backend && pm2 start server.js --name knsoftic-api
cd ../frontend && pm2 start "npx next start -p 3000" --name knsoftic-web
pm2 save
```

`deploy.sh` detects PM2 and restarts both automatically.

---

## Part 4 — Settings files on the server

`backend/.env` (create it if the new folder does not have it):

```ini
PORT=5000
NODE_ENV=production

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=your_database_user
DB_PASSWORD=your_database_password
DB_NAME=your_database_name

JWT_SECRET=a-long-random-string
JWT_REFRESH_SECRET=a-different-long-random-string

CORS_ORIGIN=https://knsoftic.com
TRUST_PROXY=1
UPLOAD_DIR=/home/<user>/domains/knsoftic.com/knsoftic/public/uploads
```

Keep the **same `JWT_SECRET`** as your current live site — changing it signs everybody out.
To create new secrets (for a fresh install only):

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

`frontend/.env.production`:

```ini
NEXT_PUBLIC_API_URL=https://api.knsoftic.com/api
API_INTERNAL_URL=https://api.knsoftic.com/api
NEXT_PUBLIC_SITE_URL=https://knsoftic.com
```

Those three are all the site reads — `backend/.env.example` and `frontend/.env.production.example`
in the project list every value with an explanation.

`NEXT_PUBLIC_API_URL` is used by the visitor's browser and must be the public HTTPS address.
`API_INTERNAL_URL` is used by the server while rendering pages; the public address always works.
Pointing it at `http://127.0.0.1:<port>/api` is faster, but only if the API really listens on that
port on the same machine — check with `curl` over SSH before using it, because a wrong value makes
pages render without their content.

After changing either file: rebuild the website (`npm run build` in `frontend`) and restart the app.
The `.env.production` values are baked into the build, so a restart alone is not enough.

---

## Part 5 — First deployment checklist

After the first GitHub deployment, check each of these:

| Check | Expected |
|---|---|
| https://knsoftic.com | Homepage with your content and images |
| Services, Courses, Projects, Blog, Contact | All load |
| A project card | Opens its own page |
| Images across the site | Visible (they come from `public/uploads`) |
| https://api.knsoftic.com/api/settings | Returns JSON |
| https://knsoftic.com/admin/login | You can sign in |
| Admin: save any change | Green message, and the site updates within a minute |
| Admin: upload an image | Appears, and still loads after a refresh |
| Contact form | Message arrives in Admin → Contact Messages |
| https://knsoftic.com/sitemap.xml | Lists pages, posts and projects |

---

## Checking a deployment

One command tells you whether the API is running, whether it can reach the database, and whether
the website will be able to reach it:

```bash
cd ~/domains/knsoftic.com/knsoftic/backend && npm run check
```

It checks, in order:

| Check | What a `FAIL` means |
|---|---|
| `.env` values | A setting is missing, or an example value was never replaced |
| Database connection | `DB_USER`, `DB_PASSWORD` or `DB_NAME` is wrong |
| Tables and row counts | The dump was never imported, or `npm run migrate` was not run |
| Admin accounts | Nobody can sign in — run `npm run create-admin` |
| Uploads folder | `UPLOAD_DIR` points somewhere wrong, or the folder is not writable |
| API is running | The app is stopped, or the domain does not point at it |
| `/api/settings` | The API is running but cannot read the database |
| CORS | The website is blocked from calling the API — the site would look empty |
| Content routes | Services, courses, projects, team and blog posts all return data |

`WARN` lines are not errors: an empty table simply means there is nothing to show on that part of
the site yet.

Nothing is written or changed, so run it as often as you like. It exits with an error code when
something is broken, which makes it usable at the end of a deployment script.

If your API is on a different address, pass it:

```bash
npm run check -- https://api.example.com
```

### Checking by hand

Without the script, these four are the important ones:

```bash
curl -I https://api.knsoftic.com/                     # the API is running
curl https://api.knsoftic.com/api/settings            # it can read the database
curl -H "Origin: https://knsoftic.com" -I https://api.knsoftic.com/api/settings | grep -i access-control
curl -s https://knsoftic.com | grep -c "KN Softic"    # the website rendered with content
```

The third one must print an `access-control-allow-origin` line matching your site. If it is missing,
the browser blocks every request and the site loads with its layout but no content — the most common
symptom of a wrong `CORS_ORIGIN`.

To watch the API's own log output, use hPanel → Node.js → the application's log, or `pm2 logs
knsoftic-api` if you run it through PM2. Database connection errors appear there with a ❌.

---

## Database updates

`deploy.sh` runs `npm run migrate` for you. It only adds what is missing and never deletes data, so
it is safe to run repeatedly.

### Setting up a database from scratch

Two files are provided in `database/`:

| File | What it contains | Use it when |
|---|---|---|
| `knsoftic_complete.sql` | All 30 tables **with your website content** — settings, services, courses, projects, team, testimonials, hero slides, homepage cards, blog posts, SEO | Moving to a new database or server |
| `final_database.sql` | The same tables with only template/sample content | Starting a site from nothing |

Steps for either one:

1. Create an empty database in hPanel → **Databases**.
2. phpMyAdmin → your database → **Import** → choose the file → Go.
   (Or `mysql -u <user> -p <database> < database/knsoftic_complete.sql`.)
3. In `backend`, run `npm run migrate`.
4. Create your login: `ADMIN_EMAIL=... ADMIN_NAME=... ADMIN_PASSWORD=... npm run create-admin`.

`knsoftic_complete.sql` deliberately contains **no administrator accounts and no contact
messages** — you create your own login in step 4, so an old password from a backup can never be
used to get in.

Images are files, not database rows: copy `public/uploads` across as well, or pictures will be
missing.

To add an administrator:

```bash
cd ~/domains/knsoftic.com/knsoftic/backend
ADMIN_EMAIL=you@knsoftic.com ADMIN_NAME="Your Name" ADMIN_PASSWORD='your-password' npm run create-admin
history -c
```

---

## Going back to a previous version

Over SSH:

```bash
cd ~/domains/knsoftic.com/knsoftic
git log --oneline -10          # find the commit you want
git checkout <commit-id>
sh deploy.sh
```

To return to the latest: `git checkout main && git pull && sh deploy.sh`.

---

## If something goes wrong

**The website shows an old version**
Files arrived but nothing was rebuilt. Run `sh deploy.sh` over SSH. If the build succeeded but the
page is unchanged, restart the app in hPanel → Node.js.

**The site loads but has no content**
The browser cannot reach the API. Open https://api.knsoftic.com/api/settings directly. If that
works, check `CORS_ORIGIN` in `backend/.env` is exactly `https://knsoftic.com`, then restart the API.

**Images are missing after moving folders**
`public/uploads` was not copied across, or `UPLOAD_DIR` points at the old path. Copy the folder and
correct the path, then restart the API.

**The build fails with "GLIBC_2.29' not found", or "Turbopack is not supported on this platform"**
The full message looks like this:

```
⚠ Attempted to load @next/swc-linux-x64-gnu, but an error occurred:
  /lib64/libm.so.6: version `GLIBC_2.29' not found
Error: Turbopack is not supported on this platform (linux/x64) because native bindings
are not available.
```

This is already handled and should not happen again. The reason: Next.js ships a fast compiler
written in Rust, and Hostinger's servers are older than that compiler needs, so Next.js falls back
to a WebAssembly version of it — which its newest builder, Turbopack, cannot use. The older Webpack
builder can, so the project is set to use it: `frontend/package.json` has

```json
"build": "next build --webpack"
```

If you still see this error, the server has an older copy of the code. Pull the latest version
(hPanel → Advanced → GIT → **Deploy**, or `git pull`) and run `sh deploy.sh` again.

Because of the WebAssembly fallback the build is noticeably slower here than on your computer —
several minutes is normal. It is not stuck. The first build after `npm ci` also downloads that
WebAssembly compiler by itself, so the server needs internet access during the build (it already
has it, or `npm ci` would not work either).

**The build fails with "JavaScript heap out of memory"**
Shared hosting has limited memory. `deploy.sh` already retries once with a smaller memory limit;
to do it by hand:

```bash
cd frontend && NODE_OPTIONS=--max-old-space-size=1024 npm run build
```

If it still fails, build on your computer and upload only the `.next` folder — but then a plain
GitHub deployment is not enough by itself.

**`npm ci` prints "deprecated" warnings and "2 low severity vulnerabilities"**
Harmless, and expected. They come from packages that other packages depend on, none of them
reachable by a visitor. Do **not** run `npm audit fix --force`: it installs versions the project was
never tested against and is a far more likely way to break the site than the warnings themselves.

**The build stops with "Node.js version is too old"**
`deploy.sh` checks this before it starts. Set Node to 20.9 or newer in hPanel → Advanced → Node.js
and run it again.

**"Too many sign-in attempts"**
Protection against password guessing; it clears after 15 minutes, or immediately if you restart the
API.

**Git deployment fails: "directory not empty"**
Hostinger only installs into an empty folder. Use a new folder (Part 1, Step 3).

### Building without SSH

If your plan has no SSH, you have two options:

1. **Use hPanel's terminal** if your plan offers one (Advanced → Terminal) and run the same
   commands.
2. **Build on your computer** (`npm run build` in `frontend`) and upload the resulting `.next`
   folder plus `node_modules` through File manager. This works, but it is the manual method you are
   moving away from — SSH is worth enabling if your plan allows it.

---

## Quick reference

```bash
# On your computer
git add -A && git commit -m "..." && git push origin main

# On the server
cd ~/domains/knsoftic.com/knsoftic
git pull            # only needed if you are not using hPanel's Deploy button
sh deploy.sh
```

| Stays on the server, never in GitHub |
|---|
| `backend/.env` |
| `frontend/.env.production` |
| `public/uploads/` |
