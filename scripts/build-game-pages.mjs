/* ==========================================================================
   Build static game guide pages.

   Run from the repository root:
       node scripts/build-game-pages.mjs

   The script reads the unique guides from game-content.js, fetches the live
   game records from Supabase, and writes one root-level HTML page per game.
   Those pages contain the full guide in the initial HTML, so Google and other
   crawlers can read the content without executing JavaScript.
   ========================================================================== */

import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = file => fs.readFileSync(path.join(root, file), "utf8");

const appSource = read("app.js");
const urlMatch = appSource.match(/const SUPABASE_URL = "([^"]+)";/);
const keyMatch = appSource.match(/const SUPABASE_KEY = "([^"]+)";/);
if (!urlMatch || !keyMatch) {
    throw new Error("Could not read Supabase credentials from app.js");
}

const SUPABASE_URL = urlMatch[1];
const SUPABASE_KEY = keyMatch[1];
const SITE = {
    name: "YonoDiwaGames",
    url: "https://www.yonodiwagames.online",
    email: "support@yonodiwagames.online"
};

const sandbox = { window: {} };
vm.runInNewContext(read("game-content.js"), sandbox, { filename: "game-content.js" });
const GUIDES = sandbox.window.GAME_GUIDES || {};

const STAR_SVG =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.7 1.2 6.6L12 17.6 6.1 20.8l1.2-6.6L2.5 9.5l6.6-.9z"/></svg>';

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, character => {
        const entity = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };
        return entity[character];
    });
}

const escapeAttr = escapeHTML;

function initials(name = "Game") {
    return (
        name
            .split(/\s+/)
            .filter(Boolean)
            .map(word => word[0])
            .join("")
            .slice(0, 3)
            .toUpperCase() || "G"
    );
}

function scoreFor(game) {
    const seed = `${game.id || ""}${game.name || ""}`;
    let hash = 0;
    for (let i = 0; i < seed.length; i += 1) {
        hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
    }
    const value = 9 + (hash % 11) / 10;
    return value.toFixed(1);
}

function categoryLabel(category) {
    return category === "diwa" ? "Diwa Games" : "Yono Games";
}

function isUpcoming(game) {
    return game.status === "upcoming";
}

function releasePassed(game) {
    const release = game.release_at ? new Date(game.release_at).getTime() : NaN;
    return Number.isNaN(release) || release <= Date.now();
}

function canPlay(game) {
    const hasLink = Boolean(String(game.game_url || "").trim());
    if (!hasLink) return false;
    return !isUpcoming(game) || releasePassed(game);
}

function formatDate(value) {
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return "";
    const dateOnly = typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
    return date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: dateOnly ? "UTC" : undefined
    });
}

function gameKey(name) {
    return String(name || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
}

function slugFor(name) {
    return String(name || "")
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-+|-+$/g, "");
}

function headerMarkup() {
    return `
        <header class="site-header">
            <div class="header-inner">
                <a class="brand" href="index.html" aria-label="${SITE.name} home">
                    <img src="logo.png" alt="${SITE.name} logo">
                    <span class="brand-text"><span class="yono">Yono</span><span class="diwa">Diwa</span><span class="games">Games</span></span>
                </a>
                <nav class="primary-nav" aria-label="Main navigation">
                    <div class="nav-item"><a class="nav-link" href="index.html">Home</a></div>
                    <div class="nav-item">
                        <a class="nav-link is-active" href="casinos.html">Games<span class="caret">▼</span></a>
                        <div class="nav-drop">
                            <a href="casinos.html">All games</a>
                            <a href="casinos.html?cat=yono">Yono games</a>
                            <a href="casinos.html?cat=diwa">Diwa games</a>
                            <a href="casinos.html?status=upcoming">Upcoming releases</a>
                        </div>
                    </div>
                    <div class="nav-item"><a class="nav-link" href="promo-codes.html">Promo codes</a></div>
                    <div class="nav-item"><a class="nav-link" href="bonuses.html">Bonuses</a></div>
                    <div class="nav-item"><a class="nav-link" href="news.html">News</a></div>
                    <div class="nav-item"><a class="nav-link" href="complaints.html">Complaints</a></div>
                    <div class="nav-item"><a class="nav-link" href="about.html">About</a></div>
                </nav>
                <div class="nav-actions">
                    <a class="btn btn-primary btn-sm header-cta" href="casinos.html">Browse games</a>
                </div>
            </div>
        </header>`;
}

function footerMarkup() {
    return `
        <footer class="site-footer">
            <div class="wrap">
                <div class="foot-top">
                    <div class="foot-brand">
                        <a class="brand" href="index.html" aria-label="${SITE.name} home">
                            <img src="logo.png" alt="${SITE.name} logo">
                            <span class="brand-text"><span class="yono">Yono</span><span class="diwa">Diwa</span><span class="games">Games</span></span>
                        </a>
                        <p>An independent directory for Yono and Diwa style gaming apps. Compare scores, check what is live, and follow the referral link that suits you.</p>
                    </div>
                    <div class="foot-col">
                        <h4>Explore</h4>
                        <a href="casinos.html">All games</a>
                        <a href="casinos.html?cat=yono">Yono games</a>
                        <a href="casinos.html?cat=diwa">Diwa games</a>
                        <a href="casinos.html?status=upcoming">Upcoming releases</a>
                    </div>
                    <div class="foot-col">
                        <h4>Discover</h4>
                        <a href="promo-codes.html">Daily promo codes</a>
                        <a href="bonuses.html">Bonuses and codes</a>
                        <a href="news.html">News and updates</a>
                        <a href="complaints.html">Complaint service</a>
                        <a href="about.html">About us</a>
                    </div>
                    <div class="foot-col">
                        <h4>Support</h4>
                        <a href="mailto:${SITE.email}">${SITE.email}</a>
                        <a href="complaints.html#complaint-form">Report a problem</a>
                        <a href="about.html#methodology">How we score games</a>
                        <a href="admin.html">Admin login</a>
                    </div>
                </div>
                <p class="foot-legal">
                    <strong>18+ only.</strong> This website is an informational directory. We do not operate, host or process payments for any of the
                    apps listed here. Game links are third-party referral links and the operators are solely responsible for their services, terms,
                    withdrawals and local legality. Play responsibly and only where online gaming is permitted.
                </p>
                <div class="foot-bottom">
                    <span>© ${new Date().getFullYear()} ${SITE.name}. All rights reserved.</span>
                    <span class="age-badge" aria-label="18 plus only">18+</span>
                    <span>Made by Sagar</span>
                </div>
            </div>
        </footer>`;
}

function renderSections(guide) {
    return guide.sections
        .map(
            section => `<h3>${escapeHTML(section.title)}</h3>${section.body
                .map(paragraph => `<p>${paragraph}</p>`)
                .join("")}`
        )
        .join("");
}

function renderFaq(game, guide) {
    if (!guide.faq?.length) return "";
    return `
        <div class="panel" style="margin-top:18px">
            <h2>${escapeHTML(game.name)} FAQ</h2>
            <div class="faq">
                ${guide.faq
                    .map(
                        item => `<details class="faq-item">
                            <summary>${escapeHTML(item.q)}</summary>
                            <p>${escapeHTML(item.a)}</p>
                        </details>`
                    )
                    .join("")}
            </div>
        </div>`;
}

function renderRelated(game, games) {
    const related = games
        .filter(item => item.id !== game.id && item.category === game.category)
        .slice(0, 4);

    return related.length
        ? related
              .map(
                  item => `
                    <a href="${slugFor(item.name)}.html" style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 0;border-bottom:1px solid rgba(54,197,255,.1)">
                        <span style="font-size:13.5px;font-weight:700">${escapeHTML(item.name)}</span>
                        <span style="font-size:11.5px;color:var(--gold);font-weight:800">${scoreFor(item)}</span>
                    </a>`
              )
              .join("")
        : '<p style="color:var(--muted);font-size:13px">No related games yet.</p>';
}

function renderCta(game) {
    if (canPlay(game)) {
        return `<a class="btn btn-primary btn-block" style="margin-top:16px" href="${escapeAttr(game.game_url)}" target="_blank" rel="noopener noreferrer sponsored">Play ${escapeHTML(game.name)} →</a>`;
    }
    return '<span class="btn btn-ghost btn-block" style="margin-top:16px" aria-disabled="true">Coming soon</span>';
}

function schemaFor(game, guide, pageUrl) {
    const graph = [
        {
            "@type": "WebPage",
            "@id": `${pageUrl}#webpage`,
            url: pageUrl,
            name: guide.title,
            description: guide.meta,
            isPartOf: { "@id": `${SITE.url}/#website` }
        },
        {
            "@type": "BreadcrumbList",
            itemListElement: [
                { "@type": "ListItem", position: 1, name: "Home", item: `${SITE.url}/` },
                { "@type": "ListItem", position: 2, name: "Games", item: `${SITE.url}/casinos.html` },
                { "@type": "ListItem", position: 3, name: game.name, item: pageUrl }
            ]
        }
    ];

    if (guide.faq?.length) {
        graph.push({
            "@type": "FAQPage",
            "@id": `${pageUrl}#faq`,
            mainEntity: guide.faq.map(item => ({
                "@type": "Question",
                name: item.q,
                acceptedAnswer: { "@type": "Answer", text: item.a }
            }))
        });
    }

    return JSON.stringify({ "@context": "https://schema.org", "@graph": graph }).replace(/</g, "\\u003c");
}

function buildPage(game, games, guide) {
    const slug = slugFor(game.name);
    const pageUrl = `${SITE.url}/${slug}.html`;
    const playable = canPlay(game);
    const awaiting = isUpcoming(game) && !releasePassed(game);
    const status = playable ? "Live now" : awaiting ? "Upcoming" : "Coming soon";
    const statusDetail = playable ? "Available" : awaiting ? "Releasing soon" : "Awaiting link";
    const image = game.image_url || `${SITE.url}/logo.png`;
    const cover = game.image_url
        ? `<img src="${escapeAttr(game.image_url)}" alt="${escapeAttr(game.name)}">`
        : "";
    const releaseRow = game.release_at
        ? `<div><dt>Release</dt><dd>${escapeHTML(formatDate(game.release_at))}</dd></div>`
        : "";

    return `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${escapeHTML(guide.title)}</title>
    <meta name="description" content="${escapeAttr(guide.meta)}">
    <meta name="robots" content="index,follow,max-image-preview:large">
    <link rel="canonical" href="${pageUrl}">
    <meta property="og:type" content="website">
    <meta property="og:site_name" content="${SITE.name}">
    <meta property="og:title" content="${escapeAttr(guide.title)}">
    <meta property="og:description" content="${escapeAttr(guide.meta)}">
    <meta property="og:url" content="${pageUrl}">
    <meta property="og:image" content="${escapeAttr(image)}">
    <meta name="twitter:card" content="summary_large_image">
    <link rel="icon" type="image/png" href="logo.png">
    <link rel="stylesheet" href="style.css?v=20261110">
    <script type="application/ld+json">${schemaFor(game, guide, pageUrl)}</script>
    <script src="data.js?v=20261111" defer></script>
    <script src="app.js?v=20261111" defer></script>
</head>
<body data-page="games" data-static-game="true">
<div data-site-header>${headerMarkup()}</div>

<main>
    <section class="page-hero" style="padding-bottom:20px">
        <div class="wrap">
            <nav class="crumbs" aria-label="Breadcrumb">
                <a href="index.html">Home</a><span>/</span><a href="casinos.html">Games</a><span>/</span><span>${escapeHTML(game.name)}</span>
            </nav>
            <h1 id="detailTitle" style="font-size:clamp(26px,3.4vw,36px)">${escapeHTML(game.name)}</h1>
        </div>
    </section>

    <section class="detail">
        <div class="wrap" id="gameDetail">
            <div class="detail-grid">
                <div>
                    <div class="detail-cover">
                        ${cover}
                        <span class="fallback">${initials(game.name)}</span>
                    </div>

                    <div class="panel" style="margin-top:18px">
                        <h2>About ${escapeHTML(game.name)}</h2>
                        <div class="prose">
                            <p><strong>${escapeHTML(guide.lead)}</strong></p>
                            ${guide.about.map(paragraph => `<p>${escapeHTML(paragraph)}</p>`).join("")}
                            ${renderSections(guide)}
                        </div>
                        <div class="note" style="margin-top:18px">
                            ${SITE.name} does not operate ${escapeHTML(game.name)}. Bonuses, withdrawals and account support are handled by the operator. Always confirm the terms on their own website. 18+ · Play responsibly.
                        </div>
                    </div>

                    ${renderFaq(game, guide)}
                </div>

                <aside>
                    <div class="panel">
                        <h2 style="margin-bottom:14px">Quick facts</h2>
                        <div class="detail-title" style="margin-bottom:10px">
                            <span class="score-big">${STAR_SVG}${scoreFor(game)}</span>
                            <span class="pill ${playable ? "pill--live" : "pill--soon"}">${status}</span>
                        </div>
                        <dl class="spec-list">
                            <div><dt>Game</dt><dd>${escapeHTML(game.name)}</dd></div>
                            <div><dt>Collection</dt><dd>${categoryLabel(game.category)}</dd></div>
                            <div><dt>Status</dt><dd>${statusDetail}</dd></div>
                            ${releaseRow}
                            <div><dt>Added</dt><dd>${escapeHTML(formatDate(game.created_at))}</dd></div>
                        </dl>
                        ${renderCta(game)}
                        <p style="font-size:11px;color:var(--muted-2);text-align:center;margin-top:10px">18+ · Play responsibly</p>
                    </div>

                    <div class="panel">
                        <h3>More ${game.category === "yono" ? "Yono" : "Diwa"} games</h3>
                        <div style="display:flex;flex-direction:column;gap:10px">
                            ${renderRelated(game, games)}
                        </div>
                        <a class="btn btn-ghost btn-block btn-sm" style="margin-top:14px" href="casinos.html?cat=${game.category}">View all</a>
                    </div>
                </aside>
            </div>
        </div>
    </section>

    <section class="section">
        <div class="wrap">
            <div class="note">
                <strong>Directory notice.</strong> YonoDiwaGames lists third-party gaming apps. We do not run these games, hold your balance or process
                withdrawals. The Play button opens the operator's own site and the operator's terms apply. 18+ · Play responsibly.
            </div>
        </div>
    </section>
</main>

<div data-site-footer>${footerMarkup()}</div>
<nav class="tabbar" data-tabbar aria-label="Quick navigation"></nav>
</body>
</html>
`;
}

const response = await fetch(
    `${SUPABASE_URL}/rest/v1/games?select=*&is_active=eq.true&order=sort_order.asc,name.asc`,
    {
        headers: {
            apikey: SUPABASE_KEY,
            Authorization: `Bearer ${SUPABASE_KEY}`
        }
    }
);

if (!response.ok) {
    throw new Error(`Supabase returned ${response.status}: ${await response.text()}`);
}

const games = await response.json();
const missingGuides = games.filter(game => !GUIDES[gameKey(game.name)]);

if (missingGuides.length) {
    throw new Error(`Missing guides for: ${missingGuides.map(game => game.name).join(", ")}`);
}

for (const game of games) {
    const guide = GUIDES[gameKey(game.name)];
    const slug = slugFor(game.name);
    fs.writeFileSync(path.join(root, `${slug}.html`), buildPage(game, games, guide));
}

console.log(`Generated ${games.length} static game pages.`);
for (const game of games) {
    console.log(`  ${slugFor(game.name)}.html  ${game.name}`);
}
