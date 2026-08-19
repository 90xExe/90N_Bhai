# Md Nazim Uddin Noyon — Professional Portfolio

A redesigned portfolio for **Md Nazim Uddin Noyon (90N Bhai)** focused on broadcast engineering, esports backend production, workflow automation and software development.

## What changed

- More professional visual system with cleaner typography and spacing
- Stronger recruiter/client-focused hero section
- Responsive layout for desktop, tablet and mobile
- Selected production projects loaded from the existing project JSON
- Accessible project gallery modal
- Experience and capability sections rewritten for clarity
- GitHub linked prominently in the navigation, hero, social links and a dedicated developer section
- Cleaner contact section and improved semantic HTML

## GitHub

Portfolio links to: https://github.com/90xExe/

## Run locally

Because project data is loaded from JSON, use a local server instead of opening `index.html` directly.

### Python

```bash
python -m http.server 8000
```

Then open:

```text
http://localhost:8000
```

## Deploy with GitHub Pages

1. Push this folder to a GitHub repository.
2. Open **Repository Settings → Pages**.
3. Choose **Deploy from a branch**.
4. Select the branch (usually `main`) and `/ (root)`.
5. Save and open the generated Pages URL.

## Main files

- `index.html` — page structure and content
- `assets/css/styles.css` — complete responsive design
- `assets/js/app.js` — navigation, project gallery, typing effect and animations
- `Projects/Projectsprojects.json` — project metadata
- `Projects/` — existing production images
