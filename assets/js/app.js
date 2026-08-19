const PROJECTS_URL = "./Projects/Projectsprojects.json";

const projectDescriptions = {
  "MR TRIPLE R - 6 MILLION SPECIAL TOURNAMENT": "Broadcast package and backend production visuals for a large-scale Free Fire tournament.",
  "RTB FEST 2025": "A complete esports show package covering opening, caster desk, match screens, standings and winner moments.",
  "OFFLINE CLASH - LQD": "Offline event broadcast visuals spanning tournament format, caster segments, gameplay and award moments.",
  "T4BxLQD EDITION - CAMPUS BATTLE": "Campus battle production package with live show graphics, teams, gameplay and event results.",
  "MIST - CAMPUS EDITION": "Campus esports production visuals including caster desk, gameplay, audience moments and champion reveal."
};

const state = { projects: [], activeProject: null };
const projectGrid = document.getElementById("projectGrid");
const modal = document.getElementById("projectModal");
const modalTitle = document.getElementById("modalTitle");
const modalGallery = document.getElementById("modalGallery");
const modalProjectLink = document.getElementById("modalProjectLink");
const navToggle = document.getElementById("navToggle");
const navLinks = document.getElementById("navLinks");

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function imageFile(image) {
  return typeof image === "string" ? image : image.file;
}

function imageTitle(image) {
  if (typeof image === "string") return image.replace(/\.[^/.]+$/, "");
  return image.title || image.file.replace(/\.[^/.]+$/, "");
}

function projectImage(project, index = 0) {
  const image = project.images?.[index] || project.images?.[0];
  return image ? `Projects/${encodeURIComponent(project.folder).replaceAll("%2F", "/")}/${encodeURIComponent(imageFile(image))}` : "";
}

async function loadProjects() {
  try {
    const response = await fetch(PROJECTS_URL);
    if (!response.ok) throw new Error("Project data could not be loaded.");
    state.projects = await response.json();
    renderProjects();
  } catch (error) {
    projectGrid.innerHTML = `
      <div class="loading-card">
        Project data could not be loaded. If you opened the HTML file directly, run it with a local server or deploy it to GitHub Pages.
      </div>`;
    console.error(error);
  }
}

function renderProjects() {
  if (!Array.isArray(state.projects) || !state.projects.length) {
    projectGrid.innerHTML = '<div class="loading-card">No projects found.</div>';
    return;
  }

  projectGrid.innerHTML = state.projects.map((project, index) => {
    const firstImage = project.images?.[0];
    const src = projectImage(project, 0);
    const imageCount = project.images?.length || 0;
    const description = projectDescriptions[project.folder] || "Esports live-production project and broadcast visual package.";

    return `
      <article class="project-card reveal visible" tabindex="0" role="button" aria-label="Open ${escapeHtml(project.folder)} gallery" data-project-index="${index}">
        <div class="project-media">
          <img src="${src}" alt="${escapeHtml(imageTitle(firstImage || "Project preview"))}" loading="lazy" />
          <span class="project-count">${imageCount} frames</span>
        </div>
        <div class="project-body">
          <div class="project-meta"><span>Broadcast production</span><span>Free Fire</span></div>
          <h3>${escapeHtml(project.folder)}</h3>
          <p>${escapeHtml(description)}</p>
          <span class="project-open">View gallery <i class="fa-solid fa-arrow-right" aria-hidden="true"></i></span>
        </div>
      </article>`;
  }).join("");

  projectGrid.querySelectorAll("[data-project-index]").forEach(card => {
    const open = () => openProject(Number(card.dataset.projectIndex));
    card.addEventListener("click", open);
    card.addEventListener("keydown", event => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        open();
      }
    });
  });
}

function openProject(index) {
  const project = state.projects[index];
  if (!project) return;
  state.activeProject = project;
  modalTitle.textContent = project.folder;
  modalGallery.innerHTML = (project.images || []).map(image => {
    const file = imageFile(image);
    const title = imageTitle(image);
    const src = `Projects/${encodeURIComponent(project.folder).replaceAll("%2F", "/")}/${encodeURIComponent(file)}`;
    return `<figure class="gallery-card"><img src="${src}" alt="${escapeHtml(title)}" loading="lazy" /><p>${escapeHtml(title)}</p></figure>`;
  }).join("");

  if (project.link && project.link !== "#") {
    modalProjectLink.href = project.link;
    modalProjectLink.style.display = "inline-flex";
  } else {
    modalProjectLink.style.display = "none";
  }

  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("modal-open");
  modal.querySelector(".modal-close").focus();
}

function closeModal() {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  document.body.classList.remove("modal-open");
}

document.querySelectorAll("[data-close-modal]").forEach(el => el.addEventListener("click", closeModal));
document.addEventListener("keydown", event => {
  if (event.key === "Escape" && modal.classList.contains("open")) closeModal();
});

navToggle.addEventListener("click", () => {
  const open = navLinks.classList.toggle("open");
  navToggle.setAttribute("aria-expanded", String(open));
});

document.querySelectorAll(".nav-links a").forEach(link => {
  link.addEventListener("click", () => {
    navLinks.classList.remove("open");
    navToggle.setAttribute("aria-expanded", "false");
  });
});

const header = document.querySelector(".site-header");
window.addEventListener("scroll", () => header.classList.toggle("scrolled", window.scrollY > 16), { passive: true });

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add("visible");
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: 0.12 });

document.querySelectorAll(".reveal").forEach(el => revealObserver.observe(el));

const roles = ["Broadcast Engineering", "Backend Production", "Workflow Automation", "Software Development"];
const typingText = document.getElementById("typingText");
let roleIndex = 0;
let charIndex = roles[0].length;
let deleting = true;

function typeRole() {
  if (!typingText) return;
  const current = roles[roleIndex];

  if (deleting) {
    charIndex -= 1;
    typingText.textContent = current.slice(0, Math.max(charIndex, 0));
    if (charIndex <= 0) {
      deleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      setTimeout(typeRole, 260);
      return;
    }
  } else {
    const next = roles[roleIndex];
    charIndex += 1;
    typingText.textContent = next.slice(0, charIndex);
    if (charIndex >= next.length) {
      deleting = true;
      setTimeout(typeRole, 1400);
      return;
    }
  }

  setTimeout(typeRole, deleting ? 36 : 62);
}
setTimeout(typeRole, 1100);

document.getElementById("year").textContent = new Date().getFullYear();
loadProjects();
