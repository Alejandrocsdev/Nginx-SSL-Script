# Nginx SSL Script (Ubuntu)

A lightweight automation tool for deploying and removing Nginx site configurations on Ubuntu, supporting:

- Reverse proxy hosting  
- Static file hosting  
- Automatic SSL certificate generation 
	- Let’s Encrypt (production or staging)  
	- Self-signed certificates  
- Automatic Nginx configuration  
- Safe activation and validation  
- Clean rollback / removal  

---

## ✨ Features

- Deploy a site in seconds
- Supports proxy or static hosting
- Automatically configures Nginx
- Generates SSL certificates
- Clean removal with one command

---

## 📦 Requirements

- Ubuntu
- Nginx installed
- Node.js (via nvm recommended)
- Root privileges (script uses sudo)
- Internet access (for Let’s Encrypt)

For Let’s Encrypt:

```bash
sudo apt install certbot
```

---

## ⚙️ Usage

### ▶️ Deploy

```bash
./run.sh
```

This will:

1. Generate Nginx configuration
2. Enable the site
3. Generate SSL certificate
4. Test Nginx configuration
5. Reload Nginx
6. Make the site live

---

### ❌ Remove Deployment

```bash
./run.sh --remove
```

Removes everything associated with the site:

- Static deployment directory
- Nginx site config (available + enabled)
- SSL certificates (Let’s Encrypt or self-signed)

Removal is based on:

```
config.domain.primary
```

---

## 🧩 Configuration (`config.json`)

Edit **config.json** before running the script.

---

### 🌐 Domain Settings

```json
"domain": {
  "primary": "example.com",
  "aliases": ["www.example.com", "api.example.com"]
}
```

| Field | Description |
|--------|------------|
primary | Main domain (used for deployment & removal)
aliases | Optional additional domains

---

### 🏠 Hosting Settings

#### 🔁 Reverse Proxy

```json
"hosting": {
  "type": "proxy",
  "proxy": {
    "host": "192.168.1.100",
    "port": 3000
  }
}
```

Routes traffic to an internal service.

Example:

```
https://example.com → http://192.168.1.100:3000
```

---

#### 📁 Static Hosting

```json
"hosting": {
  "type": "static",
  "static": {
    "sourcePath": "/path/to/build/dist"
  }
}
```

Copies files to:

```
/var/www/<primary-domain>
```

---

### 🔐 SSL Settings

#### 🟢 Let’s Encrypt (Recommended)

```json
"ssl": {
  "provider": "letsencrypt",
  "letsencrypt": {
    "email": "you@example.com",
    "staging": false
  }
}
```

| Option | Description |
|--------|------------|
email | Required for Let's Encrypt
staging | true = test environment, false = production certificate

---

#### 🟡 Self-Signed Certificate

```json
"ssl": {
  "provider": "selfsigned",
  "selfsigned": {
    "days": 365,
    "keySize": 2048
  }
}
```

Useful for:

- Local development
- Internal services
- Private networks

---

## 🌍 Output Example

```
🔅 Generating nginx config...

Nginx site available: /etc/nginx/sites-available/example.com
Nginx site enabled (symlink): /etc/nginx/sites-enabled/example.com

🔅 Generating SSL certificate...

Certificate: /etc/letsencrypt/live/example.com/fullchain.pem
Key: /etc/letsencrypt/live/example.com/privkey.pem

🔅 Testing nginx configuration...

Nginx configuration tested successfully

🔅 Reloading nginx...

Nginx reloaded successfully

🌐 Site is now live: https://example.com
```

---

## 🧹 Removal Example

```
🔄 Rolling back deployment...

🔵 Removed static deployment directory: /var/www/example.com
🔵 Removed nginx enabled site (symlink)
🔵 Removed nginx available site
🔵 Removed SSL certificates

✅ Rollback completed.
```

---

## ⚠️ Notes

- The script must be run with sufficient privileges
- Port 80 must be reachable from the internet for Let’s Encrypt
- Aliases are included in certificate generation
- Let’s Encrypt enforces strict issuance limits to prevent abuse:
	- Maximum 5 certificates per exact set of domains within 7 days (168 hours)

---

## 📜 License

MIT License (or your preferred license)

---

## 👨‍💻 Author

Built to simplify real-world Nginx deployments without manual configuration.
