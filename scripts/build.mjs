#!/usr/bin/env node
// Builds the site into _site/ for GitHub Pages:
//   1. refreshes the GitHub data snapshot baked into script.js
//   2. fingerprints style.css / script.js so browsers pick up new deploys immediately
// No dependencies; needs Node 18+. Set GITHUB_TOKEN for the higher API rate limit.
//
//   node scripts/build.mjs            # refresh data from the GitHub API
//   node scripts/build.mjs --offline  # keep the committed snapshot

import { createHash } from "node:crypto";
import { appendFile, copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "_site");
const USER = process.env.SITE_USER || "imkamaran";
const STATIC_FILES = ["favicon.svg"];
const START = "/* @snapshot:start */";
const END = "/* @snapshot:end */";

const inActions = Boolean(process.env.GITHUB_ACTIONS);
const warn = (msg) => console.log(inActions ? `::warning::${msg}` : `warning: ${msg}`);

async function gh(pathname) {
  const headers = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": `${USER}-site-build`,
  };
  if (process.env.GITHUB_TOKEN) headers.Authorization = `Bearer ${process.env.GITHUB_TOKEN}`;
  const res = await fetch(`https://api.github.com${pathname}`, { headers });
  if (!res.ok) throw new Error(`GitHub API ${res.status} ${res.statusText} for ${pathname}`);
  return res.json();
}

async function fetchSnapshot() {
  const user = await gh(`/users/${USER}`);

  const repos = [];
  for (let page = 1; page <= 10; page++) {
    const batch = await gh(`/users/${USER}/repos?per_page=100&type=owner&sort=pushed&page=${page}`);
    repos.push(...batch);
    if (batch.length < 100) break;
  }

  const publicRepos = repos.filter((r) => !r.private);
  const entries = await Promise.all(publicRepos.map(async (r) => {
    const entry = {
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
    };
    // The list endpoint omits a fork's upstream; look it up so the page doesn't have to.
    if (r.fork) {
      try {
        const parent = (await gh(`/repos/${r.full_name}`)).parent?.full_name;
        if (parent) entry.parent = parent;
      } catch (err) {
        warn(`Could not look up upstream for ${r.full_name}: ${err.message}`);
      }
    }
    return entry;
  }));

  return {
    fetchedAt: new Date().toISOString(),
    user: {
      login: user.login,
      avatar_url: user.avatar_url,
      followers: user.followers,
      created_at: user.created_at,
    },
    repos: entries,
  };
}

function injectSnapshot(js, data) {
  const start = js.indexOf(START);
  const end = js.indexOf(END);
  if (start < 0 || end < start) throw new Error("Snapshot markers not found in script.js");
  const json = JSON.stringify(data, null, 2).replace(/\n/g, "\n  ");
  return `${js.slice(0, start + START.length)} ${json} ${js.slice(end)}`;
}

const fingerprint = (text) => createHash("sha256").update(text).digest("hex").slice(0, 10);

function versionAsset(html, file, version) {
  const ref = new RegExp(`(href|src)="${file.replace(".", "\\.")}"`);
  if (!ref.test(html)) throw new Error(`index.html does not reference ${file}`);
  return html.replace(ref, `$1="${file}?v=${version}"`);
}

async function main() {
  const offline = process.argv.includes("--offline");
  let js = await readFile(path.join(ROOT, "script.js"), "utf8");
  const css = await readFile(path.join(ROOT, "style.css"), "utf8");
  let html = await readFile(path.join(ROOT, "index.html"), "utf8");

  let snapshot = null;
  if (offline) {
    console.log("Offline build: keeping the committed snapshot.");
  } else {
    try {
      snapshot = await fetchSnapshot();
      js = injectSnapshot(js, snapshot);
    } catch (err) {
      // A flaky API shouldn't block a deploy; the committed snapshot is still valid.
      warn(`Keeping the committed snapshot. ${err.message}`);
    }
  }

  html = versionAsset(html, "style.css", fingerprint(css));
  html = versionAsset(html, "script.js", fingerprint(js));

  await rm(OUT, { recursive: true, force: true });
  await mkdir(OUT, { recursive: true });
  await writeFile(path.join(OUT, "index.html"), html);
  await writeFile(path.join(OUT, "style.css"), css);
  await writeFile(path.join(OUT, "script.js"), js);
  for (const file of STATIC_FILES) await copyFile(path.join(ROOT, file), path.join(OUT, file));

  const summary = snapshot ? summarize(snapshot) : "Built with the committed snapshot (GitHub API not used).";
  console.log(`Built ${path.relative(ROOT, OUT)}/ · ${summary}`);
  if (process.env.GITHUB_STEP_SUMMARY) {
    await appendFile(process.env.GITHUB_STEP_SUMMARY, `### Site build\n\n${summary}\n`);
  }
}

function summarize({ repos, fetchedAt }) {
  const listed = repos.filter((r) => r.name.toLowerCase() !== `${USER}.github.io`);
  const own = listed.filter((r) => !r.fork).length;
  const stars = listed.reduce((sum, r) => sum + r.stargazers_count, 0);
  return `${listed.length} repos (${own} original, ${listed.length - own} forks) · ${stars} stars · data from ${fetchedAt}`;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
