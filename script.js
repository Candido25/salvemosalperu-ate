const navToggle = document.querySelector(".nav-toggle");
const siteNav = document.querySelector(".site-nav");
const navLinks = document.querySelectorAll(".site-nav a, .sub-nav a");
const currentPath = window.location.pathname.split("/").pop() || "index.html";

function normalizeHref(link) {
  const href = link.getAttribute("href");

  if (!href || href.startsWith("http") || href.startsWith("mailto:")) {
    return null;
  }

  return href;
}

function setActiveLink(matcher) {
  navLinks.forEach((link) => {
    link.classList.toggle("is-active", matcher(link));
  });
}

function activateCurrentPage() {
  setActiveLink((link) => {
    const href = normalizeHref(link);

    if (!href) {
      return false;
    }

    const [path] = href.split("#");
    const targetPath = path || "index.html";
    return targetPath === currentPath;
  });
}

function activateIndexSections() {
  const sectionLinks = [...navLinks].filter((link) => {
    const href = normalizeHref(link);
    return href && href.startsWith("#");
  });

  const sections = sectionLinks
    .map((link) => document.querySelector(link.getAttribute("href")))
    .filter(Boolean);

  if (!sectionLinks.length || !sections.length) {
    activateCurrentPage();
    return;
  }

  const updateByHash = (hash) => {
    setActiveLink((link) => {
      const href = normalizeHref(link);
      if (!href) {
        return false;
      }
      return href === hash;
    });
  };

  const observer = new IntersectionObserver(
    (entries) => {
      const visibleEntries = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

      if (!visibleEntries.length) {
        return;
      }

      updateByHash(`#${visibleEntries[0].target.id}`);
    },
    {
      threshold: [0.35, 0.6],
      rootMargin: "-25% 0px -45% 0px",
    }
  );

  sections.forEach((section) => observer.observe(section));

  const initialHash =
    window.location.hash && document.querySelector(window.location.hash)
      ? window.location.hash
      : "#inicio";

  updateByHash(initialHash);

  window.addEventListener("hashchange", () => {
    if (window.location.hash && document.querySelector(window.location.hash)) {
      updateByHash(window.location.hash);
    }
  });
}

if (navToggle && siteNav) {
  navToggle.addEventListener("click", () => {
    const expanded = navToggle.getAttribute("aria-expanded") === "true";
    navToggle.setAttribute("aria-expanded", String(!expanded));
    siteNav.classList.toggle("is-open");
  });

  siteNav.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", () => {
      navToggle.setAttribute("aria-expanded", "false");
      siteNav.classList.remove("is-open");
    });
  });
}

if (currentPath === "index.html" || currentPath === "") {
  activateIndexSections();
} else {
  activateCurrentPage();
}
