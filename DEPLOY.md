# Deploying EDUX

EDUX needs an Oracle database and a long-running Node process, so it can't run
on a serverless host like Vercel. This guide deploys it as a single Docker
Compose stack (Next.js app + Oracle XE) on a free Oracle Cloud VM — no cost,
and it uses the `Dockerfile`/`docker-compose.yml` already in this repo
unmodified in structure (only reads secrets from `.env` instead of hardcoded
values).

If you'd rather use a different VPS (DigitalOcean, AWS, Linode, etc.), skip to
[Step 4](#step-4-install-docker) — steps 1–3 are Oracle-Cloud-specific, but
everything from Step 4 onward works on any Ubuntu server.

## Step 1: Create an Oracle Cloud Free Tier account

1. Go to Oracle Cloud's sign-up page and register (email + phone verification,
   and a card for identity verification — you will not be charged as long as
   you stay within Always Free resources).
2. Once your account and tenancy are provisioned, log in to the OCI Console.

## Step 2: Create the VM

1. Console → **Compute → Instances → Create Instance**.
2. Name it (e.g. `edux-server`).
3. **Image and shape** → Edit:
   - Image: **Ubuntu 22.04**
   - Shape: pick an *Always Free eligible* shape — `VM.Standard.A1.Flex` (Arm,
     up to 4 OCPU / 24GB free) is the most generous, `VM.Standard.E2.1.Micro`
     (AMD) also works for a lighter demo.
4. **Add SSH keys**: let OCI generate a key pair and download the private key
   (or paste your own public key). You'll need the private key to connect.
5. Create the instance and note its **public IP address**.

## Step 3: Open network access

Oracle Cloud blocks inbound traffic by default at two layers — both need an
opening for port `3000` (the app) and `22` (SSH, usually open already):

1. **Security List / Network Security Group**: on the instance's subnet page,
   add an ingress rule: source `0.0.0.0/0`, destination port `3000`, protocol
   TCP.
2. **OS firewall** (Ubuntu images ship with `iptables` rules blocking new
   ports by default) — you'll run this after SSH'ing in, in Step 4.

## Step 4: Install Docker

SSH into the box, then install Docker Engine + Compose plugin:

```bash
ssh -i /path/to/your/key.pem ubuntu@<VM_PUBLIC_IP>

curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
newgrp docker

# Open port 3000 at the OS level (Oracle Cloud Ubuntu images only)
sudo iptables -I INPUT -p tcp --dport 3000 -j ACCEPT
sudo netfilter-persistent save 2>/dev/null || true
```

Log out and back in once so the `docker` group membership takes effect.

## Step 5: Get the code onto the server

```bash
git clone https://github.com/AfzalHossan-2005021/edux.git
cd edux
```

## Step 6: Configure secrets

```bash
cp .env.example .env
```

Edit `.env` and set real values — **do not deploy with the example
defaults**, they're weak and publicly visible in this repo's history:

```bash
# Generate a strong DB password (used for both DB_PASSWORD and APP_USER_PASSWORD)
openssl rand -base64 24 | tr -dc 'A-Za-z0-9' | head -c20; echo

# Generate a strong JWT secret
openssl rand -base64 48
```

At minimum, set in `.env`:
- `DB_PASSWORD` and `APP_USER_PASSWORD` — **must be identical**
- `ORACLE_PASSWORD` (the DB admin password — can be a separate strong value)
- `JWT_SECRET` — without this, auth silently falls back to a hardcoded
  secret that's visible in this repo's source (`middleware/auth.js`)
- `NEXT_PUBLIC_APP_URL=http://<VM_PUBLIC_IP>:3000` (or your domain, once you
  have one)

## Step 7: Build and start

```bash
docker compose up -d --build
```

First boot takes a few minutes — Oracle XE initializes its data files and
runs the schema scripts in `docker/oracle/init/` before the app is allowed to
start (the `app` service waits on the DB's healthcheck).

Watch progress with:

```bash
docker compose logs -f
```

## Step 8: Verify

Visit `http://<VM_PUBLIC_IP>:3000` in a browser. If it doesn't load:

```bash
docker compose ps                  # both services should be "Up"/"healthy"
docker compose logs oracle-db      # DB init errors show here
docker compose logs app            # app startup / DB connection errors
```

## Updating the deployment

```bash
git pull
docker compose up -d --build
```

The Oracle data volume (`oracle-data`) persists across rebuilds, so your data
survives redeploys. Back it up periodically if the data matters:
`docker run --rm -v edux_oracle-data:/data -v $(pwd):/backup alpine tar czf /backup/oracle-data-backup.tar.gz -C /data .`

## Optional: custom domain + HTTPS

For a demo, `http://<VM_IP>:3000` is fine. If you want a real domain with
HTTPS later, put [Caddy](https://caddyserver.com/) in front as a reverse
proxy (auto-provisions Let's Encrypt certs) — point your domain's A record at
the VM IP, open ports 80/443 the same way as Step 3, and run Caddy with a
`Caddyfile` that reverse-proxies to `localhost:3000`.

## Optional: real-time features (Socket.io)

`server/socket-server.js` powers live notifications/course updates but isn't
included in `docker-compose.yml` — it needs its own lightweight container
(it's a plain Node script, not part of the Next.js standalone build) and its
own exposed port (`SOCKET_PORT`, default 3001). It's not required for the
core app to work; ask if you want it wired into the compose stack.
