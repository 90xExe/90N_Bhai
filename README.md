# 90N Desktop

A macOS-inspired portfolio for **Md Nazim Uddin Noyon (90N Bhai)**. Includes a desktop, dock, movable and resizable windows, Finder, Preview, TextEdit, Control Center with display and font controls, Spotlight search, and optional on-device AI with custom Q&A.

## প্রথমে দেখো

`Start Portfolio.cmd` double-click করো (Python 3.10+ লাগবে)। এটি content refresh করে local preview browser-এ খুলবে। কোনো npm install বা API key লাগে না। Server window খোলা রাখো; বন্ধ করতে Ctrl+C চাপো।

`index.html` double-click করেও মূল portfolio ও Quick answers দেখা যায়। **Real AI-এর জন্য GitHub Pages অথবা local server দরকার**; সরাসরি file হিসেবে খোলা page-এ browser model/worker চালাতে পারে না। GitHub Pages-এর visitors-এর Python লাগে না।

## GitHub-এ live করো

1. GitHub-এ একটি repository তৈরি করো বা তোমার portfolio repository ব্যবহার করো।
2. এই folder-এর **ভেতরের সব source file/folder** repository root-এ দাও। `index.html`, `Desktop`, `assets`, `config`, `scripts`, এবং hidden `.github` folder থাকতে হবে। `_site` upload করার প্রয়োজন নেই।
3. Repository → **Settings → Pages → Build and deployment → Source → GitHub Actions** নির্বাচন করো।
4. `main` বা `master` branch-এ push করো। অথবা **Actions → Build desktop and deploy GitHub Pages → Run workflow** চাপো।
5. Workflow সফল হলে Pages settings এবং deployment job-এ website link পাবে।

অন্য default branch ব্যবহার করলে `.github/workflows/deploy.yml`-এর `branches` list-এ সেই নাম দাও। প্রথমবার Pages setting নির্বাচন করার আগে workflow fail হলে setting ঠিক করে workflow আবার চালাও।

GitHub Pages root domain এবং `/repository-name/` subpath—দুটিতেই relative asset paths কাজ করে। কোনো token visitor-এর browser-এ যায় না; GitHub-এর built-in deployment token শুধু workflow ব্যবহার করে।

Official setup reference: [GitHub Pages custom workflows](https://docs.github.com/en/pages/getting-started-with-github-pages/using-custom-workflows-with-github-pages).

## Desktop-এ folder বা file যোগ করো

**`Desktop/` হচ্ছে mother folder.** এর ভিতরের সরাসরি children portfolio desktop-এ দেখাবে। Folder-এর ভিতরের folders/files Finder-এ দেখাবে। যত স্তরের folder-ই হোক, নিজে থেকে index হবে।

```text
Desktop/
  Projects/
    My new event/
      cover.jpg
      backstage.png
      event-notes.txt
      video.mp4
  Certificates/
    certificate.pdf
  About my work.txt
  Read me.txt
```

**GitHub-এ:** `Desktop/`-এর নিচে upload/add/delete/rename করে commit দাও। প্রতিটি push-এ workflow আবার scan করে updated site publish করবে। আলাদা project array বা image list edit করতে হবে না। GitHub empty folder রাখে না—খালি folder রাখতে চাইলে `.gitkeep` file রাখো; সেটি UI-তে দেখা যাবে না।

**নিজের computer-এ:** `Desktop/` edit করার পর `Refresh Desktop.cmd` double-click করো (Python 3.10+ লাগবে), তারপর browser refresh করো। Command line-এ একই কাজ:

```text
python scripts/build.py --index-only
```

Browser নিরাপত্তার কারণে static website নিজে local directory scan করতে পারে না; এই ছোট script/GitHub Action index তৈরি করে। Generated `assets/content.js` হাতে edit করতে হয় না।

### File previews

| Files | Desktop behavior |
| --- | --- |
| PNG, JPG, WebP, GIF, SVG, AVIF, BMP, ICO | Preview window; zoom +/−, Fit, 100%, wheel/pinch zoom, drag to pan, previous/next, thumbnails, download |
| TXT, Markdown, JSON, CSV, code, HTML, CSS, etc. | TextEdit with selectable plain text; HTML/code is displayed, not executed |
| PDF | Bundled PDF.js viewer on GitHub Pages / local servers, with page controls and zoom; direct file opening uses your browser’s native PDF support |
| MP4, WebM, MOV, MP3, WAV, OGG, etc. | Built-in browser video/audio player; codec support depends on the browser |
| ZIP, Office files, unknown formats | File information and download |

Text preview is limited to the first 256 KB; full files can be downloaded. Hidden files, symlinks, and dependency directories are ignored. Images copied from your original portfolios were optimized to WebP; new images don’t require conversion. Keep uploads reasonably sized for a fast website. Only put files intended for visitors inside `Desktop/`.

## “Ask 90N” প্রশ্ন–উত্তর edit করো

`config/assistant.json` edit করো। `questions`-এ এই রকম entry যোগ করতে পারো:

```json
{
  "id": "booking-details",
  "question": "How do I book a broadcast?",
  "keywords": ["booking", "book", "বুকিং"],
  "answer": "Email me with your event date and production requirements.",
  "action": "contact",
  "actionLabel": "Get in touch"
}
```

`question` ও `answer` দরকার। `keywords` যোগ করলে wording আলাদা হলেও matching সহজ হয়। `action` ও `actionLabel` optional। Available actions: `about`, `profile`, `finder`, `experience`, `skills`, `contact`, `chat`.

`suggestions`, `welcome`, এবং unknown-question `fallback`-ও edit করা যায়। GitHub commit করলে update হবে; local হলে `Refresh Desktop.cmd` চালাও।

## API key ছাড়াই real AI

Ask 90N-এর **Enable AI** চাপলে [WebLLM](https://webllm.mlc.ai/docs/user/get_started.html) browser-এর GPU-তে Qwen3 model চালায়। GitHub Pages-এর জন্য কোনো backend বা API key দরকার নেই।

- **Better answers**: Qwen3 1.7B; প্রথমবার প্রায় 1 GB model download, সাধারণত প্রায় 2–3 GB GPU memory প্রয়োজন।
- **Smaller model**: Qwen3 0.6B; প্রায় 350 MB download, কম memory লাগে, উত্তরও তুলনামূলক কম নির্ভরযোগ্য হতে পারে।
- Current Chrome/Edge এবং WebGPU-compatible graphics দরকার। Graphics acceleration বন্ধ থাকলে enable করো। সব phone/browser-এ চলবে না।
- প্রথম download শেষে model browser cache-এ রাখা হয়। Browser cache সরিয়ে দিলে আবার download লাগতে পারে। Hosting-এর bandwidth-এর বদলে official Hugging Face / MLC model hosts থেকে model আসে।
- প্রশ্নের সঙ্গে profile, skills, experience, projects, প্রাসঙ্গিক custom Q&A ও text file-এর অংশ এবং সাম্প্রতিক conversation দেওয়া হয়। AI নিজে উত্তর তৈরি করে; follow-up বুঝতে history ব্যবহার করে। Image/PDF-এর ভেতরের বিষয় AI দেখে না।
- উত্তর আসার সঙ্গে সঙ্গে দেখা যাবে। **Stop reply** দিয়ে থামানো ও উপরের conversation button দিয়ে chat clear করা যায়। History page reload হলে মুছে যায়।
- Model চালু না থাকলে **Quick answers** label থাকবে। সেটি saved Q&A matching, real AI নয়। AI load/generation ব্যর্থ হলে সেটি স্পষ্ট দেখাবে।
- Chat ও portfolio context browser-এই process হয়; কোনো chat service-এ পাঠানো হয় না। Model files download করার জন্য internet লাগে। Model host স্বাভাবিক download-request metadata পায়।
- এটি ছোট local model—cloud AI-এর সমান মান বা সব উত্তরে নির্ভুলতা নিশ্চিত নয়। AI-কে English-এ উত্তর দিতে সেট করা হয়েছে; এই ছোট model-এর বাংলা উত্তর পরীক্ষায় নির্ভরযোগ্য ছিল না। English, বাংলা বা Banglish-এ প্রশ্ন করা যায়, তবে English-এ প্রশ্নের ফল বেশি স্থির। গুরুত্বপূর্ণ তথ্য profile/Contact-এ যাচাই করো।

`assets/ai-context.mjs`-এ persona, context selection ও reply instructions; `assets/ai-runtime.mjs`-এ model loading/streaming। Custom Q&A edit করলে Quick answers এবং AI-এর reference দুটোই update হয়।

## Control Center ও animation

উপরে ডান দিকের sliders icon চাপলে **Control Center** খুলবে। Brightness (35–100%), text size (90–120%), System/Clean/Rounded font, Dark Mode ও Reduce Motion আছে। এগুলো portfolio webpage-এর display বদলায়; computer monitor-এর hardware brightness বদলায় না। Preferences একই browser-এ save থাকে। **System Settings → Restore display defaults** দিয়ে reset করা যায়।

Window খোলা/বন্ধ, dock-এ minimize/restore, maximize এবং folder navigation-এ animation আছে। Reduce Motion চালু করলে transition সংক্ষিপ্ত/বন্ধ থাকবে।

## Personal details এবং featured project information

- `config/profile.json` — bio, contact, links, experience, skills, and stats.
- `config/projects.json` — optional display titles, captions, cover images, descriptions, and broadcast links for the existing five projects. A new folder works without adding anything here.
- `assets/styles.css`, `assets/files-and-chat.css`, and `assets/desktop-updates.css` — visual styling and responsive layouts.
- `assets/app.js` — desktop and app behavior.

Existing featured-project folder renamed হলে `config/projects.json`-এর path update করলে তার custom captions/link বজায় থাকবে। না করলে folder ও files স্বাভাবিকভাবেই দেখাবে, শুধু optional metadata থাকবে না।

## Local server and build

Direct file opening supports the main desktop, galleries, Quick answers, and text files; on-device AI needs a server. For server behavior (including browser PDF/media support), use:

```text
python scripts/build.py
python -m http.server 8000 --bind 127.0.0.1 --directory _site
```

Then open `http://localhost:8000`. `_site/` is disposable build output; edit the source folders, not `_site/`.

## Keyboard and window controls

- Click/tap an icon to open it; Enter/Space work on focused icons.
- Drag title bars to move windows; drag the lower-right corner to resize.
- Red closes, yellow minimizes, green maximizes. Double-click a title bar to maximize.
- Reopen apps through the dock. **Window** menu restores minimized file viewers and other windows.
- Preview zoom: **+ / −** buttons or mouse wheel/pinch. Drag a zoomed image to pan. **Fit** (keyboard `0`) shows the whole image; **100%** (keyboard `1`) uses the original pixel size. Double-click/double-tap toggles between a closer view and Fit. Opening another image resets to Fit.
- `Ctrl / ⌘ K`: Spotlight search. `Esc`: close search/front window. `← / →`: image navigation.
- Appearance preferences are saved only in the current browser. Phone layouts use screen-sized windows.

## References

The interface is an original implementation informed by your examples: [macintosh-os](https://github.com/fabiconcept/macintosh-os), [macOS-Portfolio](https://github.com/Pranesh-2005/macOS-Portfolio), and [Tharanika-Portfolio](https://github.com/Tharanika-R-Git/Tharanika-Portfolio). The photos and professional content come from your provided portfolio folders. This is a personal portfolio inspired by macOS, not an Apple product or operating system.

PDF rendering uses [Mozilla PDF.js](https://mozilla.github.io/pdf.js/), version 6.3.289, under Apache-2.0. Its license and source record are included in `assets/vendor/pdfjs/`. These assets are loaded locally; PDF viewing does not depend on a CDN. Optional AI downloads its model and GPU runtime on demand.

On-device AI uses [WebLLM 0.2.85](https://github.com/mlc-ai/web-llm) and [Qwen3](https://huggingface.co/Qwen/Qwen3-1.7B), under Apache-2.0. WebLLM’s license and pinned package source are in `assets/vendor/webllm/`; model weights are fetched from official MLC-hosted Qwen3 repositories, not included in this portfolio ZIP.
