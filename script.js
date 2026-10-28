(() => {
  "use strict";

  const USER = "imkamaran";
  const API = "https://api.github.com";
  const CACHE_KEY = `${USER}:github`;
  const CACHE_TTL = 10 * 60 * 1000;

  // Build-time snapshot: the page renders instantly from this, then refreshes
  // from the GitHub API. It's also the fallback if the API is rate-limited.
  const SNAPSHOT = {
    fetchedAt: "2026-10-28T08:20:00Z",
    user: {
      login: "imkamaran",
      avatar_url: "https://avatars.githubusercontent.com/u/292006170?v=4",
      followers: 2,
      created_at: "2026-06-09T06:03:07Z",
    },
    repos: [
      { name: "AdbController", description: "Control and manage Android devices from your Android phone over Wi-Fi or USB OTG — remote control, apps, files, quick settings, diagnostics and root tools.", html_url: "https://github.com/imkamaran/AdbController", language: "Kotlin", stargazers_count: 3, forks_count: 0, fork: false, archived: false, topics: ["adb", "android", "fastboot", "magisk", "open-source", "root", "root-tools", "wireless-adb"], pushed_at: "2026-10-21T11:38:42Z" },
      { name: "AppGuard", description: "Per-app privacy controls for rooted Android (LSPosed/Xposed module): hide or fake location, Wi-Fi, SIM, device IDs, contacts, clipboard and sensors.", html_url: "https://github.com/imkamaran/AppGuard", language: "Kotlin", stargazers_count: 2, forks_count: 0, fork: false, archived: false, topics: ["android", "lsposed", "privacy", "root", "xposed", "xposed-module"], pushed_at: "2026-10-20T11:34:17Z" },
      { name: "HideMyDevice", description: "Hide My Device is an open-source Xposed module that spoofs your device identifiers, so third-party apps that track users can't see your real ids.", html_url: "https://github.com/imkamaran/HideMyDevice", language: "Java", stargazers_count: 13, forks_count: 2, fork: false, archived: false, topics: ["android", "android-faker", "android-spoofer", "device-faker", "device-id", "lsposed", "lsposed-module"], pushed_at: "2026-10-06T07:38:21Z" },
      { name: "Action-Build", description: "Build SukiSU-Ultra/KernelSU/KernelSU-Next/ReSukiSU Kernels For All OnePlus QCOM & MTK Devices (GKI2.0), Supporting SUSFS, KPM, ZRAM and more feats.", html_url: "https://github.com/imkamaran/Action-Build", language: null, stargazers_count: 0, forks_count: 0, fork: true, archived: false, topics: [], pushed_at: "2026-08-23T04:27:42Z", parent: "Numbersf/Action-Build" },
      { name: "avd-kernelsu-x86_64", description: "AVD GKI Kernel Compiler for KernelSU (x86_64)", html_url: "https://github.com/imkamaran/avd-kernelsu-x86_64", language: null, stargazers_count: 0, forks_count: 1, fork: true, archived: false, topics: [], pushed_at: "2026-09-07T13:32:24Z", parent: "leemikepop/avd-kernelsu-x86_64" },
      { name: "avd-kernelsu", description: "Build AVD kernels with KernelSU-Next + SUSFS patches (Android 14/15/16, x86_64 & aarch64)", html_url: "https://github.com/imkamaran/avd-kernelsu", language: null, stargazers_count: 0, forks_count: 0, fork: true, archived: false, topics: [], pushed_at: "2026-03-23T23:56:28Z", parent: "nzaar9/avd-kernelsu" },
    ],
  };

  // Colors from github-linguist.
  const LANG_COLORS = {
    Kotlin: "#A97BFF", Java: "#b07219", JavaScript: "#f1e05a", TypeScript: "#3178c6",
    Python: "#3572A5", C: "#555555", "C++": "#f34b7d", "C#": "#178600", Shell: "#89e051",
    Rust: "#dea584", Go: "#00ADD8", Dart: "#00B4AB", Swift: "#F05138", HTML: "#e34c26",
    CSS: "#663399", Makefile: "#427819", PHP: "#4F5D95", Ruby: "#701516", Lua: "#000080",
    PowerShell: "#012456", Dockerfile: "#384d54", Assembly: "#6E4C13", Batchfile: "#C1F12E",
  };

  const svg = (body, size = 16) =>
    `<svg viewBox="0 0 16 16" width="${size}" height="${size}" aria-hidden="true">${body}</svg>`;

  const icons = {
    repo: svg('<path fill="currentColor" d="M2 2.5A2.5 2.5 0 0 1 4.5 0h8.75a.75.75 0 0 1 .75.75v12.5a.75.75 0 0 1-.75.75h-2.5a.75.75 0 0 1 0-1.5h1.75v-2h-8a1 1 0 0 0-.714 1.7.75.75 0 1 1-1.072 1.05A2.495 2.495 0 0 1 2 11.5Zm10.5-1h-8a1 1 0 0 0-1 1v6.708A2.486 2.486 0 0 1 4.5 9h8ZM5 12.25a.25.25 0 0 1 .25-.25h3.5a.25.25 0 0 1 .25.25v3.25a.25.25 0 0 1-.4.2l-1.45-1.087a.249.249 0 0 0-.3 0L5.4 15.7a.25.25 0 0 1-.4-.2Z"/>'),
    fork: svg('<path fill="currentColor" d="M5 5.372v.878c0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75v-.878a2.25 2.25 0 1 1 1.5 0v.878a2.25 2.25 0 0 1-2.25 2.25h-1.5v2.128a2.251 2.251 0 1 1-1.5 0V8.5h-1.5A2.25 2.25 0 0 1 3.5 6.25v-.878a2.25 2.25 0 1 1 1.5 0ZM5 3.25a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Zm6.75.75a.75.75 0 1 0 0-1.5.75.75 0 0 0 0 1.5Zm-3 8.75a.75.75 0 1 0-1.5 0 .75.75 0 0 0 1.5 0Z"/>', 14),
    star: svg('<path fill="currentColor" d="M8 .25a.75.75 0 0 1 .673.418l1.882 3.815 4.21.612a.75.75 0 0 1 .416 1.279l-3.046 2.97.719 4.192a.751.751 0 0 1-1.088.791L8 12.347l-3.766 1.98a.75.75 0 0 1-1.088-.79l.72-4.194L.818 6.374a.75.75 0 0 1 .416-1.28l4.21-.611L7.327.668A.75.75 0 0 1 8 .25Zm0 2.445L6.615 5.5a.75.75 0 0 1-.564.41l-3.097.45 2.24 2.184a.75.75 0 0 1 .216.664l-.528 3.084 2.769-1.456a.75.75 0 0 1 .698 0l2.77 1.456-.53-3.084a.75.75 0 0 1 .216-.664l2.24-2.183-3.096-.45a.75.75 0 0 1-.564-.41L8 2.694Z"/>', 14),
    arrow: svg('<path d="M5 11 11 5M6 5h5v5" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>'),
    sun: svg('<circle cx="8" cy="8" r="3" fill="none" stroke="currentColor" stroke-width="1.5"/><path d="M8 1.25v1.5M8 13.25v1.5M1.25 8h1.5M13.25 8h1.5M3.2 3.2l1.06 1.06M11.74 11.74l1.06 1.06M3.2 12.8l1.06-1.06M11.74 4.26l1.06-1.06" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"/>', 17),
    moon: svg('<path d="M13.6 9.9A5.9 5.9 0 0 1 6.1 2.4a5.9 5.9 0 1 0 7.5 7.5Z" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"/>', 17),
  };

  const $ = (sel) => document.querySelector(sel);
  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

  const rtfLong = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const rtfShort = new Intl.RelativeTimeFormat("en", { numeric: "auto", style: "short" });
  // [unit, seconds per unit, minimum age before switching to that unit]
  const DAY = 86400;
  const UNITS = [["year", 365 * DAY, 365 * DAY], ["month", 30 * DAY, 60 * DAY], ["week", 7 * DAY, 14 * DAY], ["day", DAY, DAY], ["hour", 3600, 3600], ["minute", 60, 60]];

  function timeAgo(iso, rtf = rtfLong) {
    const diff = (Date.parse(iso) - Date.now()) / 1000;
    for (const [unit, secs, min] of UNITS) {
      if (Math.abs(diff) >= min) return rtf.format(Math.round(diff / secs), unit);
    }
    return "just now";
  }

  const storage = {
    get(key) { try { return JSON.parse(localStorage.getItem(key)); } catch { return null; } },
    set(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); } catch {} },
  };

  /* ---------- State ---------- */

  const state = {
    data: SNAPSHOT,
    live: false,
    query: "",
    sort: "stars",
  };

  const isListed = (r) => r.name.toLowerCase() !== `${USER}.github.io`;
  const repos = () => state.data.repos.filter(isListed);

  const sorters = {
    stars: (a, b) => b.stargazers_count - a.stargazers_count || b.forks_count - a.forks_count || Date.parse(b.pushed_at) - Date.parse(a.pushed_at),
    pushed: (a, b) => Date.parse(b.pushed_at) - Date.parse(a.pushed_at),
    name: (a, b) => a.name.localeCompare(b.name, "en", { sensitivity: "base" }),
  };

  function matches(r, q) {
    if (!q) return true;
    return [r.name, r.description, r.language, r.parent, ...(r.topics || [])]
      .some((v) => v && v.toLowerCase().includes(q));
  }

  /* ---------- Rendering ---------- */

  // Only touch the DOM when markup actually changes, so the live refresh
  // doesn't interrupt the entrance animation when nothing is different.
  const rendered = new WeakMap();
  function setHTML(el, html) {
    if (rendered.get(el) === html) return false;
    el.innerHTML = html;
    rendered.set(el, html);
    return true;
  }

  const stat = (value, label) =>
    `<div><div class="stat-value">${value}</div><div class="stat-label">${label}</div></div>`;

  function card(r, i, { featured = false, top = false } = {}) {
    const topics = r.topics || [];
    const shown = featured ? topics : topics.slice(0, 4);
    const extra = topics.length - shown.length;
    const topicsHTML = topics.length
      ? `<ul class="topics" aria-label="Topics">${shown.map((t) => `<li>${esc(t)}</li>`).join("")}${extra > 0 ? `<li class="more">+${extra}</li>` : ""}</ul>`
      : "";

    const head = `<div class="card-top">
        <span class="card-icon">${icons.repo}</span>
        <h3>${esc(r.name)}</h3>
        ${top ? `<span class="badge">Most starred</span>` : ""}
        ${r.archived ? `<span class="badge badge--muted">Archived</span>` : ""}
        <span class="card-arrow">${icons.arrow}</span>
      </div>`;
    const desc = `<p class="card-desc">${esc(r.description || "No description provided.")}</p>`;
    const lang = r.language
      ? `<span><i class="lang-dot" style="--c: ${LANG_COLORS[r.language] || "var(--text-3)"}"></i>${esc(r.language)}</span>`
      : "";
    const updated = `<span class="updated">Updated ${timeAgo(r.pushed_at)}</span>`;

    if (featured) {
      return `<a class="card card--featured" href="${esc(r.html_url)}" style="--i: ${i}">
          <div class="card-main">${head}${desc}${topicsHTML}</div>
          <div class="stats">${stat(r.stargazers_count, "Stars")}${stat(r.forks_count, "Forks")}</div>
          <div class="card-meta">${lang}${updated}</div>
        </a>`;
    }

    return `<a class="card" href="${esc(r.html_url)}" style="--i: ${i}">
        ${head}${desc}${topicsHTML}
        <div class="card-meta">
          ${lang}
          <span>${icons.star}${r.stargazers_count}<span class="sr-only"> stars</span></span>
          <span>${icons.fork}${r.forks_count}<span class="sr-only"> forks</span></span>
          ${updated}
        </div>
      </a>`;
  }

  function forkRow(r, i) {
    return `<li style="--i: ${i}">
        <a class="fork" href="${esc(r.html_url)}">
          <span class="card-icon">${icons.fork}</span>
          <span class="fork-main">
            <span class="fork-head">
              <span class="fork-name">${esc(r.name)}</span>
              ${r.parent ? `<span class="fork-src">from ${esc(r.parent)}</span>` : ""}
            </span>
            ${r.description ? `<span class="fork-desc" title="${esc(r.description)}">${esc(r.description)}</span>` : ""}
          </span>
          <span class="fork-updated">${timeAgo(r.pushed_at, rtfShort)}</span>
          <span class="card-arrow">${icons.arrow}</span>
        </a>
      </li>`;
  }

  function renderLists() {
    const all = repos();
    const own = all.filter((r) => !r.fork);
    const q = state.query;
    const sort = sorters[state.sort];

    const projects = own.filter((r) => matches(r, q)).sort(sort);
    const forks = all.filter((r) => r.fork && matches(r, q)).sort(sort);

    const topRepo = own.length > 1
      ? own.reduce((a, b) => (b.stargazers_count > a.stargazers_count ? b : a))
      : null;
    const featureFirst = projects.length % 2 === 1;

    const grid = $("#project-grid");
    const changed = setHTML(grid, projects.map((r, i) =>
      card(r, i, { featured: featureFirst && i === 0, top: r === topRepo && r.stargazers_count > 0 })
    ).join(""));
    if (changed && !state.firstPaint) grid.classList.remove("animate");

    const forkList = $("#fork-list");
    if (setHTML(forkList, forks.map(forkRow).join("")) && !state.firstPaint) forkList.classList.remove("animate");
    $("#forks").hidden = forks.length === 0;

    $("#project-count").textContent = projects.length;
    $("#fork-count").textContent = forks.length;

    const empty = $("#empty");
    empty.hidden = projects.length > 0;
    if (!projects.length) {
      empty.innerHTML = q
        ? `No projects match <strong>“${esc(q)}”</strong>${forks.length ? ` · ${forks.length} fork${forks.length > 1 ? "s" : ""} below` : ""}.`
        : "No public projects yet.";
    }
  }

  function renderTerminal() {
    const { user } = state.data;
    const all = repos();
    const own = all.filter((r) => !r.fork).sort(sorters.stars);
    const stars = all.reduce((sum, r) => sum + r.stargazers_count, 0);

    const langCount = {};
    for (const r of all) if (r.language) langCount[r.language] = (langCount[r.language] || 0) + 1;
    const langs = Object.keys(langCount).sort((a, b) => langCount[b] - langCount[a]);

    const since = new Date(user.created_at).toLocaleDateString("en", { month: "short", year: "numeric" });

    const cmd = (c) => `<span class="term-prompt">$</span> <span class="term-cmd">${c}</span>`;
    const kv = (k, v) => `<span class="term-key">${k}</span>${v}`;
    const lines = [
      cmd("whoami"),
      esc(user.login),
      cmd("ls ~/projects"),
      esc(own.map((r) => r.name).join("  ")) || "(empty)",
      cmd("cat ~/stats"),
      kv("repos", `${all.length} public · ${own.length} original`),
      kv("stars", `<span class="term-star">★</span> ${stars}`),
      kv("languages", esc(langs.join(", ") || "n/a")),
      kv("followers", esc(user.followers)),
      kv("since", esc(since)),
      `<span class="term-prompt">$</span> <span class="term-cursor"></span>`,
    ];

    const term = $("#terminal");
    const html = lines.map((l, n) => `<span class="term-line" style="--n: ${n}">${l}</span>`).join("");
    if (rendered.get(term) === html) return;
    // Offset the per-line typing delays by elapsed time so a re-render mid-animation continues seamlessly.
    term.parentElement.style.setProperty("--elapsed", `${Math.round(performance.now() - state.t0)}ms`);
    setHTML(term, html);
  }

  function renderSync() {
    const el = $("#sync");
    el.classList.toggle("is-live", state.live);
    $("#sync-text").textContent = state.live
      ? `Live from GitHub · synced ${timeAgo(state.data.fetchedAt)}`
      : `Snapshot from ${new Date(state.data.fetchedAt).toLocaleDateString("en", { month: "short", day: "numeric", year: "numeric" })}`;
  }

  function renderAll() {
    const avatar = $("#avatar");
    const src = `${state.data.user.avatar_url}&s=160`;
    if (avatar.getAttribute("src") !== src) avatar.src = src;
    renderTerminal();
    renderLists();
    renderSync();
  }

  /* ---------- Data ---------- */

  async function getJSON(path) {
    const res = await fetch(API + path, { headers: { Accept: "application/vnd.github+json" } });
    if (!res.ok) throw new Error(`GitHub API ${res.status} for ${path}`);
    return res.json();
  }

  async function fetchLive() {
    const [user, list] = await Promise.all([
      getJSON(`/users/${USER}`),
      (async () => {
        const out = [];
        for (let page = 1; page <= 5; page++) {
          const batch = await getJSON(`/users/${USER}/repos?per_page=100&type=owner&page=${page}`);
          out.push(...batch);
          if (batch.length < 100) break;
        }
        return out;
      })(),
    ]);

    // A fork's upstream never changes, so reuse known parents and only look up new forks.
    const knownParents = Object.fromEntries(SNAPSHOT.repos.filter((r) => r.parent).map((r) => [r.name, r.parent]));
    const repos = list.map((r) => ({
      name: r.name,
      description: r.description,
      html_url: r.html_url,
      language: r.language,
      stargazers_count: r.stargazers_count,
      forks_count: r.forks_count,
      fork: r.fork,
      archived: r.archived,
      topics: r.topics || [],
      pushed_at: r.pushed_at,
      parent: knownParents[r.name],
    }));
    await Promise.all(repos.filter((r) => r.fork && !r.parent).slice(0, 10).map(async (r) => {
      try { r.parent = (await getJSON(`/repos/${USER}/${r.name}`)).parent?.full_name; } catch {}
    }));

    return {
      fetchedAt: new Date().toISOString(),
      user: { login: user.login, avatar_url: user.avatar_url, followers: user.followers, created_at: user.created_at },
      repos,
    };
  }

  async function load() {
    const cached = storage.get(CACHE_KEY);
    if (cached && Date.now() - Date.parse(cached.fetchedAt) < CACHE_TTL) {
      Object.assign(state, { data: cached, live: true });
      return renderAll();
    }
    try {
      const data = await fetchLive();
      storage.set(CACHE_KEY, data);
      Object.assign(state, { data, live: true });
    } catch (err) {
      console.warn("[imkamaran.github.io] Falling back to snapshot:", err);
      if (cached) state.data = cached;
    }
    renderAll();
  }

  /* ---------- UI wiring ---------- */

  function initTheme() {
    const root = document.documentElement;
    const btn = $("#theme-toggle");
    const media = matchMedia("(prefers-color-scheme: dark)");
    const current = () => root.dataset.theme || (media.matches ? "dark" : "light");
    const paint = () => {
      const dark = current() === "dark";
      btn.innerHTML = dark ? icons.sun : icons.moon;
      btn.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    };
    btn.addEventListener("click", () => {
      const next = current() === "dark" ? "light" : "dark";
      root.dataset.theme = next;
      try { localStorage.setItem("theme", next); } catch {}
      paint();
    });
    media.addEventListener("change", paint);
    paint();
  }

  function initControls() {
    const input = $("#query");
    const sort = $("#sort");

    input.addEventListener("input", () => {
      state.query = input.value.trim().toLowerCase();
      renderLists();
    });
    sort.addEventListener("change", () => {
      state.sort = sort.value;
      renderLists();
    });

    addEventListener("keydown", (e) => {
      const typing = /^(INPUT|TEXTAREA|SELECT)$/.test(document.activeElement?.tagName);
      if (e.key === "/" && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
        e.preventDefault();
        input.focus();
      } else if (e.key === "Escape" && document.activeElement === input) {
        input.value = "";
        state.query = "";
        renderLists();
        input.blur();
      }
    });
  }

  function initEffects() {
    const nav = $("#nav");
    const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 8);
    addEventListener("scroll", onScroll, { passive: true });
    onScroll();

    document.addEventListener("pointermove", (e) => {
      const el = e.target.closest?.(".card");
      if (!el) return;
      const r = el.getBoundingClientRect();
      el.style.setProperty("--mx", `${e.clientX - r.left}px`);
      el.style.setProperty("--my", `${e.clientY - r.top}px`);
    }, { passive: true });
  }

  function init() {
    state.t0 = performance.now();
    state.firstPaint = true;
    $("#year").textContent = new Date().getFullYear();
    $("#terminal").parentElement.classList.add("is-typing");
    $("#project-grid").classList.add("animate");
    $("#fork-list").classList.add("animate");

    initTheme();
    initControls();
    initEffects();
    renderAll();
    state.firstPaint = false;
    load();
  }

  init();
})();
