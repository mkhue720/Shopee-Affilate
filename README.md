# n8n Shopee Affiliate Automation

An automation workflow that handles the process of **receiving a Shopee link → processing content with Gemini → posting to Facebook** using n8n, without relying on the official Shopee Affiliate API.

## 🚀 Workflow

```text
Shopee Affiliate Link
│
▼
n8n
│
├── Process / validate link
│
▼
Create Post
│
▼
Facebook Page
```

## 📌 Features

* Input Shopee links.
* Process and validate product links.
* Prepare post content.
* Support for post scheduling.
* Automatically post to a Facebook Page.
* Extensible to handle multiple products.
* Workflow built and executed on n8n.

## 🛠️ Technologies

* [n8n](https://n8n.io/)
* Facebook Graph API
* Node.js
* Gemini

## 📂 Directory Structure

```text
.
├── workflows/
│   └── shopee-affiliate-facebook.json
├── README.md
├── README_en.md
└── .gitignore
```

## ⚙️ Setup

### 1. Install n8n

You can run n8n using Docker:

```bash
docker compose up -d
```

Once running, access:

```text
http://localhost:5678
```

### 2. Import workflow

In n8n:

```text
Workflows
↓
Import from File
↓
Select the .json file
```

After importing, you need to configure the corresponding credentials. ### 3. Run Chrome with Remote Debugging
Close all Chrome instances by opening PowerShell:
```text
taskkill /F /IM chrome.exe
```
Create a folder to store the Chrome profile.
Launch Chrome with port 9222:
```text
& "C:\Program Files\Google\Chrome\Application\chrome.exe" --remote-debugging-port=9222 --user-data-dir="D:\chrome-profile"
```
Check the port:
```
http://127.0.0.1:9222/json/version
```
If successful, the output will look like this:
```
{
"Browser": "Chrome/154....",
"webSocketDebuggerUrl": "ws://127.0.0.1:9222/devtools/browser/..."
}
```
### 4. Configure Credentials

The workflow can use credentials such as:
* Gemini API
* Facebook
* Other APIs (if added)

**Credentials must not be stored directly in the repository.**

After importing the workflow, recreate the credentials in:

```text
n8n
→ Credentials
```

and assign the corresponding credentials to the nodes.

## 🔐 Security

Do not commit sensitive information to GitHub:

Before committing the workflow, check the JSON file to ensure no secrets are hard-coded within the nodes.

Example of what **not** to do:

```json
{
"Authorization": "Bearer YOUR_SECRET_TOKEN"
}
```

Use **n8n Credentials** or environment variables instead of hard-coding secrets.

## 🔄 Updating the workflow

After modifying the workflow:

```bash
git add .
git commit -m "Update Shopee affiliate workflow"
git push
```

Example:

```bash
git add workflows/shopee-affiliate-facebook.json
git commit -m "Update Facebook scheduling"
git push
```

## 📋 Re-importing the workflow

To restore the workflow:

```text
GitHub
↓
Download .json
↓
n8n
↓
Import from File
↓
Configure Credentials
↓
Activate
```

## ⚠️ Note

This workflow requires the user to manually configure:

* Telegram Bot
* Shopee Affiliate API
* Facebook Page / Facebook Graph API
* Relevant credentials

Credentials are **not provided in the repository**.