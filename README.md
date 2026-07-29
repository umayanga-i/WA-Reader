# WA Reader

A fully client-side WhatsApp chat viewer. Static site, zero backend, zero data leakage. 

WA Reader allows you to view, search, filter, and analyze your WhatsApp chat exports entirely in your browser. Since it runs completely client-side, your chat data never leaves your device, ensuring complete privacy.

## Features

- **Privacy First:** Zero network requests after the initial page load. All parsing happens entirely in your browser.
- **WhatsApp-like UI:** Authentic message bubbles (green right / white left), sticky date dividers, and system messages.
- **Performance:** Handles 100,000+ messages smoothly using a virtualized list and a non-blocking Web Worker for file parsing.
- **Search & Filters:** Live search with highlights, keyboard shortcuts (Ctrl+F), and filters (mine only, other only, media, links, deleted, system).
- **Statistics:** Built-in charts, emoji usage, top words, and reply times analysis.
- **Themes:** Light, Dark, and AMOLED themes with persistent local storage.
- **Export:** Export parsed chats as JSON or as a self-contained HTML file.

## How to Use

1. **Export Chat from WhatsApp:**
   - Open a chat in WhatsApp on your mobile device.
   - Go to Chat Info > **Export Chat**.
   - Choose whether to include media or not (the reader currently supports text (`.txt`) exports and will display placeholder cards for media).
   - Save the `.txt` file to your device.

2. **Load into WA Reader:**
   - Drag and drop the `.txt` file into the upload zone on the home page, or click to browse.
   - Once loaded, select your participant name so the app can identify which messages are yours.

3. **Explore:**
   - Scroll through your chat history or use the sidebar timeline to jump to specific months.
   - Use the **Stats** page to view detailed analytics on your chat.

## How to Deploy

The application is built with React, Vite, and TailwindCSS, and is configured for seamless deployment to Cloudflare Pages.

### Deploying to Cloudflare Pages

1. **Push to GitHub:**
   Commit all files in this repository and push them to your GitHub account:
   ```bash
   git add .
   git commit -m "Initial commit"
   git push origin main
   ```

2. **Connect to Cloudflare Pages:**
   - Go to [Cloudflare Pages](https://pages.cloudflare.com).
   - Click **Create a project** → **Connect to Git**.
   - Select the repository containing your WA Reader code.

3. **Configure Build Settings:**
   - **Framework preset:** `None`
   - **Build command:** `npm run build`
   - **Build output directory:** `dist`
   - **Root directory:** `/`
   - **Environment Variables:** Set `NODE_VERSION` to `20` (or ensure your Node.js version is compatible).

4. **Deploy:**
   - Click **Save and Deploy**. 
   - Cloudflare will install the dependencies, build the project, and host it. 
   - SPA Routing is already configured via the included `public/_redirects` file, ensuring deep links work perfectly on refresh.
