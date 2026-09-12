# Deploying KN Softic on aaPanel

This guide takes the website from a fresh server to a working site at **knsoftic.com**, with the
API at **api.knsoftic.com**. Follow it top to bottom the first time; for later updates jump to
[Updating the site](#12-updating-the-site-after-the-first-deployment).

The site is two Node applications plus one database:

| Part | Folder | Runs on | Address |
|---|---|---|---|
| Website (Next.js) | `frontend` | port 3000 | https://knsoftic.com |
| API (Express) | `backend` | port 5000 | https://api.knsoftic.com |
| Database (MySQL / MariaDB) | — | port 3306 | local to the server |

Visitors only ever reach ports 80 and 443. Nginx (built into aaPanel) forwards them to the two
Node apps, so ports 3000 and 5000 stay closed to the outside world.

---

## 1. What you need before starting

- An aaPanel server with **Nginx**, **MySQL 5.7+ or MariaDB 10.4+**, **PM2 Manager** and
  **Node.js 20.9 or newer** installed (aaPanel → App Store).
  Node 18 and below will not build this site.
- Both domains pointing at the server's IP address:
  - `knsoftic.com` and `www.knsoftic.com`
  - `api.knsoftic.com`
- The project files (this repository) and about 2 GB of free disk space.

Check the Node version on the server before going further:

```bash
node -v     # must print v20.9.0 or higher
```

---

## 2. Upload the project

Put the project at `/www/wwwroot/knsoftic` so you end up with:

```
/www/wwwroot/knsoftic/
├── backend/
├── frontend/
├── database/
└── public/uploads/        ← uploaded images live here; never delete this folder
```

Either use aaPanel → Files → Upload (a zip, then Unzip), or on the server:

```bash
cd /www/wwwroot && git clone <your-repository-url> knsoftic
```

Do **not** upload `node_modules` or `.next` from your computer; they are rebuilt on the server.

---

## 3. Create the database

aaPanel → **Databases** → **Add database**:

- Database name: `kn_softic_db`
- Username: `knsoftic`
- Password: press the generate button and **save it somewhere safe** — you need it in step 4
- Access: Local (`localhost`)

Then import the schema. aaPanel → Databases → the database's **Import** button, choose
`database/final_database.sql`. Or from the command line:

```bash
cd /www/wwwroot/knsoftic
mysql -u knsoftic -p kn_softic_db < database/final_database.sql
```

That file creates every table the site needs. (If you are moving an existing site, import your own
backup instead — step 5 brings any older database up to date.)

---

## 4. Configure the API

Create `/www/wwwroot/knsoftic/backend/.env` with this content, replacing the two passwords:

```ini
PORT=5000
NODE_ENV=production

DB_HOST=127.0.0.1
DB_PORT=3306
DB_USER=knsoftic
DB_PASSWORD=the-database-password-from-step-3
DB_NAME=kn_softic_db

# Sign-in tokens. Use long random strings — see the command below.
JWT_SECRET=paste-a-64-character-random-string-here
JWT_REFRESH_SECRET=paste-a-different-64-character-random-string-here

# Which website addresses may call this API. Comma-separated; www is handled automatically.
CORS_ORIGIN=https://knsoftic.com

# The API sits behind Nginx, so it must trust one proxy hop to see real visitor IPs.
TRUST_PROXY=1

# Where uploaded images are written. Keep this outside the code folders so updates never touch it.
UPLOAD_DIR=/www/wwwroot/knsoftic/public/uploads
```

Generate the two secrets:

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
```

Run it twice and use a different value for each. Anyone with `JWT_SECRET` can sign in as an
administrator, so treat it like a password and never commit it.

Lock the file down:

```bash
chmod 600 /www/wwwroot/knsoftic/backend/.env
```

---

## 5. Install and start the API

```bash
cd /www/wwwroot/knsoftic/backend
npm ci --omit=dev
npm run migrate          # brings the database up to date; safe to re-run
```

`npm run migrate` is required on a first install and after every update. It adds new columns and
tables and never deletes data.

Start it with PM2 (aaPanel → PM2 Manager → Add project, or the command line):

```bash
cd /www/wwwroot/knsoftic/backend
pm2 start server.js --name knsoftic-api
pm2 save
pm2 startup            # run the line it prints, so PM2 restarts after a reboot
```

Check it:

```bash
curl http://127.0.0.1:5000/            # -> API is running successfully.
curl http://127.0.0.1:5000/api/settings  # -> your settings as JSON
```

If it fails, read the log: `pm2 logs knsoftic-api --lines 50`.

---

## 6. Configure and build the website

Create `/www/wwwroot/knsoftic/frontend/.env.production`:

```ini
NEXT_PUBLIC_API_URL=https://api.knsoftic.com/api
API_INTERNAL_URL=http://127.0.0.1:5000/api
NEXT_PUBLIC_SITE_URL=https://knsoftic.com
NEXT_PUBLIC_ADMIN_EMAIL=admin@knsoftic.com
```

Why two API addresses: `NEXT_PUBLIC_API_URL` is used by the visitor's browser, so it must be the
public HTTPS address. `API_INTERNAL_URL` is used by the server when it renders pages — going
straight to `127.0.0.1` skips Nginx and TLS, which makes pages render faster.

Build it:

```bash
cd /www/wwwroot/knsoftic/frontend
npm ci
npm run build
```

The build takes a few minutes and needs roughly 1 GB of free memory. If it is killed on a small
server, add swap space (aaPanel → Toolbox → Swap) and build again.

Start it:

```bash
pm2 start "npx next start -p 3000" --name knsoftic-web --cwd /www/wwwroot/knsoftic/frontend
pm2 save
```

Check it: `curl -I http://127.0.0.1:3000/` should return `HTTP/1.1 200 OK`.

---

## 7. Point the domains at the apps (Nginx)

### The website — knsoftic.com

aaPanel → **Website** → **Add site**:
- Domain: `knsoftic.com` and `www.knsoftic.com`
- PHP version: **Pure static** (this is a Node app; PHP is not used)

Then open the site → **Reverse proxy** → **Add reverse proxy**:
- Proxy name: `web`
- Target URL: `http://127.0.0.1:3000`
- Sending domain: `$host`

### The API — api.knsoftic.com

Add a second site for `api.knsoftic.com` the same way, with a reverse proxy to
`http://127.0.0.1:5000`.

Then open that site's **Config** file and make sure the proxy block allows large uploads and
passes the visitor's address through:

```nginx
client_max_body_size 12M;

location / {
    proxy_pass http://127.0.0.1:5000;
    proxy_http_version 1.1;
    proxy_set_header Host $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "upgrade";
}
```

The API accepts images up to 5 MB, so `client_max_body_size 12M` leaves room for the request
around them. Without it, Nginx rejects uploads over 1 MB with a 413 error before they reach the API.
The `X-Forwarded-*` headers matter because the API's sign-in protection counts attempts per
visitor address; without them every visitor looks like the server itself.

Save and reload Nginx (aaPanel → Website → Service → Reload).

---

## 8. Turn on HTTPS

For **each** of the two sites: aaPanel → Website → the site → **SSL** → **Let's Encrypt** → select
the domains → Apply, then switch **Force HTTPS** on.

Both must be on HTTPS. If the website is secure but the API is not, browsers block every request
and the site will look empty.

---

## 9. The uploads folder

Images added through the admin panel are written to the folder named by `UPLOAD_DIR` and served by
the API at `https://api.knsoftic.com/uploads/...`.

```bash
mkdir -p /www/wwwroot/knsoftic/public/uploads
chown -R www:www /www/wwwroot/knsoftic/public/uploads
chmod 755 /www/wwwroot/knsoftic/public/uploads
```

Keep this folder out of any deployment that wipes the directory, and include it in your backups —
the images are not stored in the database.

---

## 10. Create your administrator account

```bash
cd /www/wwwroot/knsoftic/backend
ADMIN_EMAIL=you@knsoftic.com ADMIN_NAME="Your Name" ADMIN_PASSWORD='a-long-password-you-choose' npm run create-admin
```

Use at least 8 characters; a few unrelated words is both stronger and easier to remember. Running
it again for the same email resets that password and signs out the other sessions.

Then clear the command from the server's history:

```bash
history -c
```

---

## 11. Check everything works

| Check | Expected |
|---|---|
| https://knsoftic.com | Homepage with your content and images |
| Services, Courses, Projects, Blog, Contact | All load, images visible |
| A project card | Opens its own page |
| https://knsoftic.com/sitemap.xml | Lists your pages, posts and projects |
| https://knsoftic.com/robots.txt | Contains `Disallow: /admin/` |
| https://api.knsoftic.com/api/settings | Returns JSON |
| https://knsoftic.com/admin/login | Sign in with the account from step 10 |
| In the admin: edit something and save | Toast appears; the change shows on the site within a minute |
| In the admin: upload an image | Appears immediately, and still loads after a refresh |
| Contact form on the website | Message appears in Admin → Contact Messages |

Browser console (F12) should show no red errors. A message about a blocked request usually means
`CORS_ORIGIN` does not match the address you are visiting.

---

## 12. Updating the site after the first deployment

```bash
cd /www/wwwroot/knsoftic
git pull                       # or upload the changed files

cd backend
npm ci --omit=dev
npm run migrate
pm2 restart knsoftic-api

cd ../frontend
npm ci
npm run build
pm2 restart knsoftic-web
```

Two rules worth keeping:
- Always run `npm run migrate` before restarting the API.
- Never delete `public/uploads` or the `.env` files during an update.

Roll back by checking out the previous version and repeating the same steps.

---

## 13. Backups

aaPanel → Cron → Add task, twice:

- **Backup database** — `kn_softic_db`, daily, keep 7 copies
- **Backup directory** — `/www/wwwroot/knsoftic/public/uploads`, weekly, keep 4 copies

Also keep a copy of `backend/.env` somewhere safe and private. Without `JWT_SECRET` every signed-in
session ends; without the database password the API cannot start.

---

## 14. If something goes wrong

**502 Bad Gateway**
The Node app is not running. `pm2 status`, then `pm2 logs knsoftic-web --lines 50` (or
`knsoftic-api`). A common cause is a missing `.env` value — the API stops on purpose and says which
one.

**The website loads but has no content**
The browser cannot reach the API. Open https://api.knsoftic.com/api/settings directly. If that
works, check `CORS_ORIGIN` in `backend/.env` matches your site address exactly, and that both sites
use HTTPS. Restart the API after any change to `.env`.

**Images are broken**
Check `UPLOAD_DIR` points at the folder that holds the files, that the folder is owned by `www`,
and that https://api.knsoftic.com/uploads/<filename> opens. New uploads failing with an error are
usually `client_max_body_size` being too small in Nginx.

**"Too many sign-in attempts"**
The protection against password guessing. It clears after 15 minutes, or immediately with
`pm2 restart knsoftic-api`. If it triggers for everybody at once, the `X-Forwarded-For` header from
step 7 is missing, so every visitor is counted as one.

**The build runs out of memory**
Add swap (aaPanel → Toolbox → Swap, 2 GB) and run `npm run build` again.

**Database errors after an update**
Run `npm run migrate` in `backend`. It is safe to run repeatedly and reports each change it makes.

---

## Quick reference

```bash
pm2 status                       # what is running
pm2 logs knsoftic-api --lines 50 # API log
pm2 logs knsoftic-web --lines 50 # website log
pm2 restart knsoftic-api
pm2 restart knsoftic-web

cd /www/wwwroot/knsoftic/backend && npm test     # 54 API + 7 migration checks, no database needed
cd /www/wwwroot/knsoftic/backend && npm run migrate
```

| File | What it holds |
|---|---|
| `backend/.env` | Database details, tokens, allowed site addresses, uploads folder |
| `frontend/.env.production` | API and site addresses used at build time |
| `database/final_database.sql` | Complete schema for a fresh installation |
| `public/uploads/` | Every uploaded image |
