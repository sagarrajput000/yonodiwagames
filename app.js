/* ==========================================================================
   YonoDiwaGames — shared site script
   Renders the header/footer, loads games from Supabase and builds each page.
   ========================================================================== */

const SUPABASE_URL = "https://cqgiafcacrbyrovrqehp.supabase.co";
const SUPABASE_KEY = "sb_publishable_f3UUErdVfU4o1WPj-FVM4Q_zvA2rr7w";

const SITE = {
    name: "YonoDiwaGames",
    email: "support@yonodiwagames.online",
    instagram: "https://www.instagram.com/sagar_rajput_2678"
};

/* ------------------------------------------------------------------ utils */

function escapeHTML(value = "") {
    const node = document.createElement("div");
    node.textContent = String(value);
    return node.innerHTML;
}

function escapeAttr(value = "") {
    return escapeHTML(value).replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

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

function isNew(game) {
    if (!canPlay(game)) return false;
    const created = game.created_at ? new Date(game.created_at).getTime() : NaN;
    if (Number.isNaN(created)) return false;
    return Date.now() - created < 1000 * 60 * 60 * 24 * 30;
}

function categoryLabel(category) {
    return category === "diwa" ? "Diwa Games" : "Yono Games";
}

function gameHref(game) {
    return `casino.html?id=${encodeURIComponent(game.id)}`;
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

function params() {
    return new URLSearchParams(window.location.search);
}

const STAR_SVG =
    '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2.5l2.9 6.1 6.6.9-4.8 4.7 1.2 6.6L12 17.6 6.1 20.8l1.2-6.6L2.5 9.5l6.6-.9z"/></svg>';

/* ----------------------------------------------------------------- chrome */

const NAV = [
    { key: "home", label: "Home", href: "index.html" },
    {
        key: "games",
        label: "Games",
        href: "casinos.html",
        children: [
            { label: "All games", href: "casinos.html" },
            { label: "Yono games", href: "casinos.html?cat=yono" },
            { label: "Diwa games", href: "casinos.html?cat=diwa" },
            { label: "Upcoming releases", href: "casinos.html?status=upcoming" }
        ]
    },
    { key: "promo-codes", label: "Promo codes", href: "promo-codes.html" },
    { key: "bonuses", label: "Bonuses", href: "bonuses.html" },
    { key: "news", label: "News", href: "news.html" },
    { key: "complaints", label: "Complaints", href: "complaints.html" },
    { key: "about", label: "About", href: "about.html" }
];

function navMarkup(active) {
    return NAV.map(item => {
        const isActive = item.key === active ? " is-active" : "";
        if (!item.children) {
            return `<div class="nav-item"><a class="nav-link${isActive}" href="${item.href}">${item.label}</a></div>`;
        }
        const children = item.children
            .map(child => `<a href="${child.href}">${child.label}</a>`)
            .join("");
        return `
            <div class="nav-item">
                <a class="nav-link${isActive}" href="${item.href}">${item.label}<span class="caret">▼</span></a>
                <div class="nav-drop">${children}</div>
            </div>`;
    }).join("");
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
                        <div class="foot-social">
                            <a href="${SITE.instagram}" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>
                            </a>
                            <a href="mailto:${SITE.email}" aria-label="Email us">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="M3 7l9 6 9-6"/></svg>
                            </a>
                        </div>
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

function renderChrome() {
    const active = document.body.dataset.page || "home";
    const headerSlot = document.querySelector("[data-site-header]");
    const footerSlot = document.querySelector("[data-site-footer]");

    if (headerSlot) {
        headerSlot.innerHTML = `
            <header class="site-header">
                <div class="header-inner">
                    <a class="brand" href="index.html" aria-label="${SITE.name} home">
                        <img src="logo.png" alt="${SITE.name} logo">
                        <span class="brand-text"><span class="yono">Yono</span><span class="diwa">Diwa</span><span class="games">Games</span></span>
                    </a>
                    <nav class="primary-nav" aria-label="Main navigation">${navMarkup(active)}</nav>
                    <div class="nav-actions">
                        <a class="icon-btn" href="casinos.html#search" aria-label="Search games">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="7"/><path d="M20 20l-3.5-3.5"/></svg>
                        </a>
                        <a class="btn btn-primary btn-sm header-cta" href="casinos.html">Browse games</a>
                        <button class="icon-btn menu-toggle" type="button" id="menuToggle" aria-label="Open menu" aria-expanded="false">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 7h16M4 12h16M4 17h16"/></svg>
                        </button>
                    </div>
                </div>
            </header>
            <div class="drawer-backdrop" id="drawerBackdrop"></div>
            <aside class="drawer" id="drawer" aria-label="Mobile menu" aria-hidden="true">
                <div class="drawer-head">
                    <a class="brand" href="index.html">
                        <img src="logo.png" alt="">
                        <span class="brand-text"><span class="yono">Yono</span><span class="diwa">Diwa</span><span class="games">Games</span></span>
                    </a>
                    <button class="drawer-close" type="button" id="drawerClose" aria-label="Close menu">✕</button>
                </div>
                <div class="drawer-links">
                    <a href="index.html" class="${active === "home" ? "is-active" : ""}">Home</a>
                    <span class="drawer-label">Games</span>
                    <a href="casinos.html" class="${active === "games" ? "is-active" : ""}">All games</a>
                    <a href="casinos.html?cat=yono">Yono games</a>
                    <a href="casinos.html?cat=diwa">Diwa games</a>
                    <a href="casinos.html?status=upcoming">Upcoming releases</a>
                    <span class="drawer-label">More</span>
                    <a href="promo-codes.html" class="${active === "promo-codes" ? "is-active" : ""}">Promo codes</a>
                    <a href="bonuses.html" class="${active === "bonuses" ? "is-active" : ""}">Bonuses</a>
                    <a href="news.html" class="${active === "news" ? "is-active" : ""}">News</a>
                    <a href="complaints.html" class="${active === "complaints" ? "is-active" : ""}">Complaints</a>
                    <a href="about.html" class="${active === "about" ? "is-active" : ""}">About</a>
                </div>
                <a class="btn btn-primary btn-block" href="casinos.html">Browse all games</a>
            </aside>`;
    }

    if (footerSlot) footerSlot.innerHTML = footerMarkup();

    const tabbar = document.querySelector("[data-tabbar]");
    if (tabbar) {
        const items = [
            { key: "home", label: "Home", href: "index.html", icon: '<path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6h-4v6H5a1 1 0 0 1-1-1z"/>' },
            { key: "games", label: "Games", href: "casinos.html", icon: '<rect x="3" y="5" width="18" height="14" rx="3"/><path d="M8 12h8M12 8v8"/>' },
            { key: "promo-codes", label: "Codes", href: "promo-codes.html", icon: '<path d="M4 7h16v4a2 2 0 0 0 0 2v4H4v-4a2 2 0 0 0 0-2z"/><path d="M12 7v10"/>' },
            { key: "bonuses", label: "Bonuses", href: "bonuses.html", icon: '<path d="M4 10v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9"/><path d="M3 6h18v4H3zM12 6v14"/>' },
            { key: "news", label: "News", href: "news.html", icon: '<path d="M5 4h14v16H5z"/><path d="M8 8h8M8 12h8M8 16h5"/>' }
        ];
        tabbar.innerHTML = items
            .map(
                item => `<a href="${item.href}" class="${item.key === active || (active === "game" && item.key === "games") ? "is-active" : ""}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">${item.icon}</svg>
                    <span>${item.label}</span>
                </a>`
            )
            .join("");
    }

    const toggle = document.getElementById("menuToggle");
    const drawer = document.getElementById("drawer");
    const backdrop = document.getElementById("drawerBackdrop");
    const close = document.getElementById("drawerClose");

    function setDrawer(open) {
        if (!drawer || !backdrop) return;
        drawer.classList.toggle("open", open);
        backdrop.classList.toggle("open", open);
        drawer.setAttribute("aria-hidden", String(!open));
        if (toggle) toggle.setAttribute("aria-expanded", String(open));
        document.body.style.overflow = open ? "hidden" : "";
    }

    toggle?.addEventListener("click", () => setDrawer(true));
    close?.addEventListener("click", () => setDrawer(false));
    backdrop?.addEventListener("click", () => setDrawer(false));
    document.addEventListener("keydown", event => {
        if (event.key === "Escape") setDrawer(false);
    });
}

/* ------------------------------------------------------------------- data */

let gamesPromise = null;
let allGames = [];

async function getGames() {
    if (!gamesPromise) {
        gamesPromise = (async () => {
            if (!window.supabase) throw new Error("Supabase library unavailable");
            const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            const { data, error } = await client
                .from("games")
                .select("*")
                .eq("is_active", true)
                .order("sort_order", { ascending: true })
                .order("name", { ascending: true });
            if (error) throw error;
            allGames = data || [];
            return allGames;
        })();
    }
    return gamesPromise;
}

let promosPromise = null;

async function getPromoCodes() {
    if (!promosPromise) {
        promosPromise = (async () => {
            if (!window.supabase) return [];
            const client = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            const { data, error } = await client
                .from("promo_codes")
                .select("*")
                .eq("is_active", true)
                .order("sort_order", { ascending: true })
                .order("created_at", { ascending: false });
            if (error) {
                // The table is created with supabase/promo_codes.sql; stay quiet until then.
                console.warn("Promo codes unavailable:", error.message);
                return [];
            }
            return data || [];
        })().catch(error => {
            console.warn("Promo codes unavailable:", error.message);
            return [];
        });
    }
    return promosPromise;
}

/* ------------------------------------------------------------------ cards */

function countdownMarkup(game) {
    return `<div class="countdown" data-release="${escapeHTML(game.release_at || "")}">
        <span class="part" data-unit="days">00</span>
        <span class="part" data-unit="hours">00</span>
        <span class="part" data-unit="minutes">00</span>
        <span class="part" data-unit="seconds">00</span>
    </div>`;
}

function scorePill(game) {
    return `<span class="score">${STAR_SVG}${scoreFor(game)}</span>`;
}

function gameCard(game, options = {}) {
    const playable = canPlay(game);
    const awaiting = isUpcoming(game) && !releasePassed(game);
    const comingSoon = !playable && !awaiting;
    const tag = awaiting
        ? '<span class="tag tag-soon">Upcoming</span>'
        : comingSoon
          ? '<span class="tag tag-soon">Coming soon</span>'
          : options.hot
            ? '<span class="tag tag-hot">Hot</span>'
            : isNew(game)
              ? '<span class="tag tag-new">New</span>'
              : "";

    const media = game.image_url
        ? `<img src="${escapeHTML(game.image_url)}" alt="${escapeHTML(game.name)}" loading="lazy" onerror="this.remove()">
           <span class="fallback">${initials(game.name)}</span>`
        : `<span class="fallback">${initials(game.name)}</span>`;

    const action = playable
        ? `<a class="btn btn-primary btn-sm" href="${escapeHTML(game.game_url)}" target="_blank" rel="noopener noreferrer sponsored">Play now</a>`
        : awaiting
          ? countdownMarkup(game)
          : '<span class="btn btn-ghost btn-sm" aria-disabled="true">Coming soon</span>';

    return `
        <article class="game-card">
            <div class="game-media">
                ${media}
                ${scorePill(game)}
                ${tag}
            </div>
            <div class="game-body">
                <span class="game-cat">${categoryLabel(game.category)}</span>
                <h3 class="game-name">${escapeHTML(game.name)}</h3>
                <p class="game-desc">${escapeHTML(game.description || `Explore ${game.name} and check the current referral link.`)}</p>
                <div class="game-foot">
                    ${action}
                    <a class="btn btn-ghost btn-sm" href="${gameHref(game)}">Details</a>
                </div>
            </div>
        </article>`;
}

function spotCard(game, rank) {
    return `
        <a class="spot-card" href="${gameHref(game)}">
            <div class="spot-head">
                <span class="spot-logo">
                    ${game.image_url ? `<img src="${escapeHTML(game.image_url)}" alt="" loading="lazy" onerror="this.remove()">` : initials(game.name)}
                </span>
                <span class="spot-rank">#${rank} Top pick</span>
            </div>
            <h3>${escapeHTML(game.name)}</h3>
            <p>${escapeHTML(game.description || `${categoryLabel(game.category)} · editor score ${scoreFor(game)} of 10`)}</p>
            <div class="spot-foot">
                <span class="score">${STAR_SVG}${scoreFor(game)}</span>
                <span class="pill pill--cat">${categoryLabel(game.category)}</span>
            </div>
        </a>`;
}

function newsCover(article, className) {
    const gradient = article.gradient || ["#0b3b2c", "#0a2c4a"];
    return `<div class="${className}" style="background:linear-gradient(135deg,${gradient[0]},${gradient[1]})">
        <span class="news-tag">${escapeHTML(article.tag || "News")}</span>
        <span>${article.emoji || "📰"}</span>
    </div>`;
}

function newsCard(article) {
    return `
        <article class="news-card">
            ${newsCover(article, "news-cover")}
            <div class="news-body">
                <span class="news-date">${formatDate(article.date)} · ${article.readTime || 4} min read</span>
                <h3>${escapeHTML(article.title)}</h3>
                <p>${escapeHTML(article.excerpt)}</p>
                <a class="more" href="news-detail.html?slug=${encodeURIComponent(article.slug)}">Read more →</a>
            </div>
        </article>`;
}

function bonusCard(bonus, games) {
    const match = games.find(
        game => game.name.toLowerCase() === String(bonus.game || "").toLowerCase()
    );
    const href = match ? gameHref(match) : "casinos.html";
    return `
        <article class="bonus-card">
            <span class="bonus-label">${escapeHTML(bonus.label || "Bonus")}</span>
            <div class="bonus-value">${escapeHTML(bonus.value)}</div>
            <h3>${escapeHTML(bonus.title)}</h3>
            <p>${escapeHTML(bonus.desc)}</p>
            ${bonus.code ? `<div class="bonus-code"><span>Code</span><span>${escapeHTML(bonus.code)}</span></div>` : ""}
            <a class="btn btn-primary btn-block btn-sm" href="${href}">${match ? "Open game" : "Browse games"}</a>
        </article>`;
}

/* ------------------------------------------------------------- promo codes */

function promoExpired(promo) {
    if (!promo.expires_at) return false;
    const expiry = new Date(promo.expires_at).getTime();
    return !Number.isNaN(expiry) && expiry <= Date.now();
}

function promoGame(promo) {
    if (promo.game_id) {
        const byId = allGames.find(game => game.id === promo.game_id);
        if (byId) return byId;
    }
    const name = String(promo.game_name || "").toLowerCase();
    return allGames.find(game => game.name.toLowerCase() === name) || null;
}

function promoExpiryLabel(promo) {
    if (!promo.expires_at) return "No expiry listed";
    const expiry = new Date(promo.expires_at).getTime();
    if (Number.isNaN(expiry)) return "No expiry listed";
    const diff = expiry - Date.now();
    if (diff <= 0) return "Expired";
    const minutes = Math.floor(diff / 60000);
    const days = Math.floor(minutes / 1440);
    const hours = Math.floor((minutes % 1440) / 60);
    if (days > 0) return `Ends in ${days}d ${hours}h`;
    if (hours > 0) return `Ends in ${hours}h ${minutes % 60}m`;
    return `Ends in ${Math.max(minutes, 1)}m`;
}

function promoCard(promo) {
    const expired = promoExpired(promo);
    const game = promoGame(promo);
    const title = promo.game_name || (game ? game.name : "Promo code");
    const href = game ? gameHref(game) : promo.link ? promo.link : "casinos.html";
    const external = !game && Boolean(promo.link);
    const cta = external
        ? `<a class="btn btn-primary btn-sm" href="${escapeAttr(promo.link)}" target="_blank" rel="noopener noreferrer sponsored">Claim</a>`
        : `<a class="btn btn-primary btn-sm" href="${href}">${game ? "View game" : "Browse games"}</a>`;

    return `
        <article class="promo-card${expired ? " is-expired" : ""}">
            <div class="promo-head">
                <span class="promo-game">${escapeHTML(title)}</span>
                <span class="promo-state">${expired ? "Expired" : promo.expires_at ? "Limited" : "Live"}</span>
            </div>
            <button class="promo-code" type="button" data-copy="${escapeAttr(promo.code)}" ${expired ? "disabled" : ""} aria-label="Copy code ${escapeAttr(promo.code)}">
                <span class="promo-code-text">${escapeHTML(promo.code)}</span>
                <span class="promo-copy">${expired ? "Ended" : "Copy"}</span>
            </button>
            ${promo.note ? `<p class="promo-note">${escapeHTML(promo.note)}</p>` : ""}
            <div class="promo-foot">
                <span class="promo-expiry" data-expiry="${escapeAttr(promo.expires_at || "")}">${promoExpiryLabel(promo)}</span>
                ${cta}
            </div>
        </article>`;
}

function startPromoTimers(scope = document) {
    scope.querySelectorAll("[data-expiry]").forEach(node => {
        if (node.dataset.started === "1") return;
        node.dataset.started = "1";
        const card = node.closest(".promo-card");
        const update = () => {
            const label = promoExpiryLabel({ expires_at: node.dataset.expiry });
            node.textContent = label;
            if (label === "Expired" && card) card.classList.add("is-expired");
        };
        update();
        setInterval(update, 30000);
    });
}

function flashCopied(button) {
    const label = button.querySelector(".promo-copy");
    const original = label ? label.textContent : "";
    button.classList.add("is-copied");
    if (label) label.textContent = "Copied";
    setTimeout(() => {
        button.classList.remove("is-copied");
        if (label) label.textContent = original;
    }, 1800);
}

async function copyText(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.select();
        const copied = document.execCommand("copy");
        area.remove();
        return copied;
    }
}

document.addEventListener("click", async event => {
    const button = event.target.closest("[data-copy]");
    if (!button) return;
    const ok = await copyText(button.dataset.copy || "");
    if (ok) flashCopied(button);
});

/* -------------------------------------------------------------- countdowns */

function startCountdowns(scope = document) {
    scope.querySelectorAll(".countdown[data-release]").forEach(timer => {
        if (timer.dataset.started === "1") return;
        timer.dataset.started = "1";

        const release = new Date(timer.dataset.release).getTime();
        const parts = {
            days: timer.querySelector('[data-unit="days"]'),
            hours: timer.querySelector('[data-unit="hours"]'),
            minutes: timer.querySelector('[data-unit="minutes"]'),
            seconds: timer.querySelector('[data-unit="seconds"]')
        };

        if (Number.isNaN(release) || Object.values(parts).some(part => !part)) {
            timer.innerHTML = '<span class="live-now">Play now</span>';
            return;
        }

        function tick() {
            const diff = release - Date.now();
            if (diff <= 0) {
                timer.innerHTML = '<span class="live-now">Play now</span>';
                return;
            }
            const total = Math.floor(diff / 1000);
            parts.days.textContent = String(Math.floor(total / 86400)).padStart(2, "0");
            parts.hours.textContent = String(Math.floor((total % 86400) / 3600)).padStart(2, "0");
            parts.minutes.textContent = String(Math.floor((total % 3600) / 60)).padStart(2, "0");
            parts.seconds.textContent = String(total % 60).padStart(2, "0");
            setTimeout(tick, 1000);
        }

        tick();
    });
}

/* -------------------------------------------------------------- home page */

async function initHome() {
    const spotlight = document.getElementById("spotlight");
    const grid = document.getElementById("homeGrid");
    const tabs = document.getElementById("homeTabs");
    const newsGrid = document.getElementById("homeNews");
    const bonusGrid = document.getElementById("homeBonuses");
    const stats = document.getElementById("heroStats");

    const games = await getGames().catch(error => {
        console.error(error);
        return [];
    });

    if (!games.length) {
        [spotlight, grid].forEach(slot => {
            if (slot) slot.innerHTML = '<p class="empty">No games available right now. Please check back soon.</p>';
        });
    } else {
        const liveGames = games.filter(canPlay);
        const yono = games.filter(game => game.category === "yono");
        const diwa = games.filter(game => game.category === "diwa");
        const upcoming = games.filter(game => !canPlay(game));

        if (spotlight) spotlight.innerHTML = liveGames.slice(0, 3).map((game, i) => spotCard(game, i + 1)).join("");

        if (stats) {
            stats.innerHTML = `
                <div><strong>${games.length}</strong><span>Games listed</span></div>
                <div><strong>${yono.length}</strong><span>Yono games</span></div>
                <div><strong>${diwa.length}</strong><span>Diwa games</span></div>
                <div><strong>${upcoming.length}</strong><span>Coming soon</span></div>`;
        }

        const renderHomeGrid = filter => {
            if (!grid) return;
            const source =
                filter === "yono" ? yono : filter === "diwa" ? diwa : filter === "upcoming" ? upcoming : games;
            const list = source.slice(0, 8);
            grid.innerHTML = list.length
                ? list.map((game, index) => gameCard(game, { hot: filter === "all" && index < 3 && canPlay(game) })).join("")
                : '<p class="empty">Nothing here yet. New games are added regularly.</p>';
            startCountdowns(grid);
        };

        renderHomeGrid("all");

        tabs?.addEventListener("click", event => {
            const tab = event.target.closest(".tab");
            if (!tab) return;
            tabs.querySelectorAll(".tab").forEach(item => item.classList.toggle("is-active", item === tab));
            renderHomeGrid(tab.dataset.filter);
        });
    }

    if (newsGrid) {
        newsGrid.innerHTML = (window.SITE_NEWS || []).slice(0, 3).map(newsCard).join("");
    }
    if (bonusGrid) {
        bonusGrid.innerHTML = (window.SITE_BONUSES || []).slice(0, 3).map(bonus => bonusCard(bonus, games)).join("");
    }

    const promoGrid = document.getElementById("homePromos");
    if (promoGrid) {
        const codes = await getPromoCodes();
        promoGrid.innerHTML = codes.length
            ? codes.slice(0, 3).map(promoCard).join("")
            : '<p class="empty">No promo codes are live right now. New codes are posted here daily — check back soon.</p>';
        startPromoTimers(promoGrid);
    }

    const searchForm = document.getElementById("heroSearch");
    searchForm?.addEventListener("submit", event => {
        event.preventDefault();
        const value = searchForm.querySelector("input").value.trim();
        window.location.href = `casinos.html${value ? `?q=${encodeURIComponent(value)}` : ""}#search`;
    });
}

/* -------------------------------------------------------------- all games */

async function initGamesPage() {
    const grid = document.getElementById("gamesGrid");
    const count = document.getElementById("resultCount");
    const searchInput = document.getElementById("search");
    const sortSelect = document.getElementById("sort");
    const chips = document.querySelectorAll("[data-filter]");
    if (!grid) return;

    grid.innerHTML = '<p class="loading">Loading games</p>';

    const games = await getGames().catch(error => {
        console.error(error);
        return [];
    });

    if (!games.length) {
        grid.innerHTML = '<p class="empty">Games could not be loaded. Please refresh the page.</p>';
        if (count) count.textContent = "";
        return;
    }

    const query = params();
    const state = {
        filter: ["all", "yono", "diwa", "upcoming"].includes(query.get("cat"))
            ? query.get("cat")
            : ["all", "yono", "diwa", "upcoming"].includes(query.get("status"))
              ? query.get("status")
              : "all",
        search: query.get("q") || "",
        sort: query.get("sort") || "default"
    };

    if (searchInput) searchInput.value = state.search;
    if (sortSelect) sortSelect.value = state.sort;

    chips.forEach(chip => {
        chip.classList.toggle("is-active", chip.dataset.filter === state.filter);
    });

    function paint() {
        let list = games.slice();

        if (state.filter === "yono" || state.filter === "diwa") {
            list = list.filter(game => game.category === state.filter);
        } else if (state.filter === "upcoming") {
            list = list.filter(game => !canPlay(game));
        } else if (state.filter === "live") {
            list = list.filter(canPlay);
        }

        if (state.search) {
            const needle = state.search.toLowerCase();
            list = list.filter(game =>
                `${game.name} ${game.description || ""} ${game.category}`.toLowerCase().includes(needle)
            );
        }

        if (state.sort === "rating") {
            list.sort((a, b) => Number(scoreFor(b)) - Number(scoreFor(a)));
        } else if (state.sort === "name") {
            list.sort((a, b) => a.name.localeCompare(b.name));
        } else if (state.sort === "newest") {
            list.sort((a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0));
        } else {
            list.sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
        }

        grid.innerHTML = list.length
            ? list
                  .map((game, index) =>
                      gameCard(game, {
                          hot: state.sort === "default" && index < 3 && canPlay(game)
                      })
                  )
                  .join("")
            : '<p class="empty">No games match this filter. Try another category or search term.</p>';

        if (count) {
            count.innerHTML = `Showing <b>${list.length}</b> of <b>${games.length}</b> games`;
        }

        startCountdowns(grid);
    }

    paint();

    chips.forEach(chip => {
        chip.addEventListener("click", () => {
            state.filter = chip.dataset.filter;
            chips.forEach(item => item.classList.toggle("is-active", item === chip));
            paint();
        });
    });

    searchInput?.addEventListener("input", () => {
        state.search = searchInput.value.trim();
        paint();
    });

    sortSelect?.addEventListener("change", () => {
        state.sort = sortSelect.value;
        paint();
    });
}

/* ------------------------------------------------------------ game detail */

async function initGameDetail() {
    const root = document.getElementById("gameDetail");
    if (!root) return;

    const id = params().get("id");
    const games = await getGames().catch(error => {
        console.error(error);
        return [];
    });

    const game = games.find(item => String(item.id) === String(id));

    if (!game) {
        root.innerHTML = `
            <div class="panel" style="text-align:center;padding:60px 24px">
                <h1 style="font-size:26px;margin-bottom:10px">Game not found</h1>
                <p style="color:var(--muted);margin-bottom:22px">This listing may have been removed or the link is incomplete.</p>
                <a class="btn btn-primary" href="casinos.html">Browse all games</a>
            </div>`;
        return;
    }

    const playable = canPlay(game);
    const awaiting = isUpcoming(game) && !releasePassed(game);
    const related = games
        .filter(item => item.id !== game.id && item.category === game.category)
        .slice(0, 4);

    document.title = `${game.name} — score, details and link | ${SITE.name}`;
    const crumb = document.getElementById("crumbName");
    if (crumb) crumb.textContent = game.name;
    const heading = document.getElementById("detailTitle");
    if (heading) heading.textContent = game.name;

    const meta = document.querySelector('meta[name="description"]');
    if (meta) {
        meta.setAttribute(
            "content",
            `${game.name} review on ${SITE.name}: editor score ${scoreFor(game)}/10, ${playable ? "live now" : "upcoming"}, ${categoryLabel(game.category)}. Check details before you play.`
        );
    }

    root.innerHTML = `
        <div class="detail-grid">
            <div>
                <div class="detail-cover">
                    ${
                        game.image_url
                            ? `<img src="${escapeHTML(game.image_url)}" alt="${escapeHTML(game.name)}" onerror="this.remove()">`
                            : ""
                    }
                    <span class="fallback">${initials(game.name)}</span>
                </div>

                <div class="panel" style="margin-top:18px">
                    <h2>About ${escapeHTML(game.name)}</h2>
                    <div class="prose">
                        <p>${escapeHTML(
                            game.description ||
                                `${game.name} is part of the ${categoryLabel(game.category)} collection tracked by ${SITE.name}. Use the listing below to check what the app offers before you follow the referral link.`
                        )}</p>
                        <p>${escapeHTML(game.name)} currently scores <strong>${scoreFor(game)} / 10</strong> in our directory. Scores are based on how complete the listing is, how stable the link is, and how the app is received by the community — they are not a guarantee of payouts or returns.</p>
                    </div>
                    <div class="note" style="margin-top:18px">
                        ${SITE.name} does not operate this game. Bonuses, withdrawals and account support are handled by the operator of ${escapeHTML(game.name)}. Always confirm the terms on their own website.
                    </div>
                </div>
            </div>

            <aside>
                <div class="panel">
                    <h2 style="margin-bottom:14px">Quick facts</h2>
                    <div class="detail-title" style="margin-bottom:10px">
                        <span class="score-big">${STAR_SVG}${scoreFor(game)}</span>
                        <span class="pill ${playable ? "pill--live" : "pill--soon"}">${playable ? "Live now" : awaiting ? "Upcoming" : "Coming soon"}</span>
                    </div>
                    <dl class="spec-list">
                        <div><dt>Game</dt><dd>${escapeHTML(game.name)}</dd></div>
                        <div><dt>Collection</dt><dd>${categoryLabel(game.category)}</dd></div>
                        <div><dt>Status</dt><dd>${playable ? "Available" : awaiting ? "Releasing soon" : "Awaiting link"}</dd></div>
                        ${
                            game.release_at
                                ? `<div><dt>Release</dt><dd>${formatDate(game.release_at)}</dd></div>`
                                : ""
                        }
                        <div><dt>Added</dt><dd>${formatDate(game.created_at)}</dd></div>
                    </dl>
                    ${
                        playable
                            ? `<a class="btn btn-primary btn-block" style="margin-top:16px" href="${escapeHTML(game.game_url)}" target="_blank" rel="noopener noreferrer sponsored">Play ${escapeHTML(game.name)} →</a>`
                            : awaiting
                              ? `<div style="margin-top:16px">${countdownMarkup(game)}</div>`
                              : '<span class="btn btn-ghost btn-block" style="margin-top:16px" aria-disabled="true">Coming soon</span>'
                    }
                    <p style="font-size:11px;color:var(--muted-2);text-align:center;margin-top:10px">18+ · Play responsibly</p>
                </div>

                <div class="panel">
                    <h3>More ${game.category === "yono" ? "Yono" : "Diwa"} games</h3>
                    <div style="display:flex;flex-direction:column;gap:10px">
                        ${
                            related.length
                                ? related
                                      .map(
                                          item => `
                                <a href="${gameHref(item)}" style="display:flex;align-items:center;justify-content:space-between;gap:10px;padding:9px 0;border-bottom:1px solid rgba(54,197,255,.1)">
                                    <span style="font-size:13.5px;font-weight:700">${escapeHTML(item.name)}</span>
                                    <span style="font-size:11.5px;color:var(--gold);font-weight:800">${scoreFor(item)}</span>
                                </a>`
                                      )
                                      .join("")
                                : '<p style="color:var(--muted);font-size:13px">No related games yet.</p>'
                        }
                    </div>
                    <a class="btn btn-ghost btn-block btn-sm" style="margin-top:14px" href="casinos.html?cat=${game.category}">View all</a>
                </div>
            </aside>
        </div>`;

    startCountdowns(root);
}

/* -------------------------------------------------------------------- news */

function initNewsList() {
    const grid = document.getElementById("newsGrid");
    if (!grid) return;
    const articles = window.SITE_NEWS || [];
    grid.innerHTML = articles.length
        ? articles.map(newsCard).join("")
        : '<p class="empty">No news yet.</p>';
}

function initNewsDetail() {
    const root = document.getElementById("articleBody");
    const hero = document.getElementById("articleHero");
    if (!root) return;

    const slug = params().get("slug");
    const articles = window.SITE_NEWS || [];
    const article = articles.find(item => item.slug === slug) || articles[0];

    if (!article) {
        root.innerHTML = '<p class="empty">This article could not be found.</p>';
        return;
    }

    document.title = `${article.title} | ${SITE.name}`;
    const meta = document.querySelector('meta[name="description"]');
    if (meta) meta.setAttribute("content", article.excerpt);

    if (hero) {
        hero.innerHTML = `
            <div class="wrap">
                <nav class="crumbs"><a href="index.html">Home</a><span>/</span><a href="news.html">News</a><span>/</span><span>${escapeHTML(article.tag || "Article")}</span></nav>
                <span class="eyebrow">${escapeHTML(article.tag || "News")}</span>
                <h1>${escapeHTML(article.title)}</h1>
                <p class="news-date" style="margin-top:12px">${formatDate(article.date)} · ${article.readTime || 4} min read</p>
            </div>`;
    }

    root.innerHTML = `
        ${newsCover(article, "news-cover")}
        <div class="prose" style="margin-top:24px">${article.body}</div>
        <div class="panel" style="margin-top:26px">
            <h3>Keep exploring</h3>
            <p style="color:var(--muted);font-size:13.5px;margin-bottom:14px">Compare scores and find a live link in the game directory.</p>
            <a class="btn btn-primary btn-sm" href="casinos.html">Browse games →</a>
        </div>
        <div class="section-head" style="margin-top:40px"><h2 style="font-size:24px">More news</h2></div>
        <div class="card-grid">${articles
            .filter(item => item.slug !== article.slug)
            .slice(0, 3)
            .map(newsCard)
            .join("")}</div>`;
    root.style.maxWidth = "820px";
    root.style.margin = "0 auto";
    root.style.padding = "0 24px 40px";
}

/* ----------------------------------------------------------------- bonuses */

async function initBonusesPage() {
    const grid = document.getElementById("bonusGrid");
    if (!grid) return;
    const games = await getGames().catch(() => []);
    const bonuses = window.SITE_BONUSES || [];
    grid.innerHTML = bonuses.length
        ? bonuses.map(bonus => bonusCard(bonus, games)).join("")
        : '<p class="empty">No bonuses listed right now.</p>';
}

/* -------------------------------------------------------------- promo codes */

async function initPromoCodesPage() {
    const grid = document.getElementById("promoGrid");
    const count = document.getElementById("promoCount");
    if (!grid) return;

    await getGames().catch(() => []);
    const codes = await getPromoCodes();
    const live = codes.filter(promo => !promoExpired(promo));

    if (count) count.textContent = String(live.length);

    grid.innerHTML = codes.length
        ? codes.map(promoCard).join("")
        : `<div class="empty-state">
                <h3>No promo codes are live right now</h3>
                <p>New codes are added from the admin panel every day. Check the bonuses page in the meantime, or come back shortly.</p>
                <a class="btn btn-primary btn-sm" href="bonuses.html">Browse bonuses</a>
           </div>`;

    startPromoTimers(grid);
}

/* -------------------------------------------------------------- complaints */

function initComplaintsPage() {
    const faq = document.getElementById("faqList");
    if (faq) {
        faq.innerHTML = (window.SITE_FAQ || [])
            .map(
                item => `<details class="faq-item">
                    <summary>${escapeHTML(item.q)}</summary>
                    <p>${escapeHTML(item.a)}</p>
                </details>`
            )
            .join("");
    }

    const form = document.getElementById("complaintForm");
    form?.addEventListener("submit", event => {
        event.preventDefault();
        const message = document.getElementById("formMessage");
        const data = new FormData(form);
        const game = String(data.get("game") || "").trim();
        const email = String(data.get("email") || "").trim();
        const issue = String(data.get("issue") || "").trim();
        const details = String(data.get("details") || "").trim();

        if (!game || !email || !issue || details.length < 20) {
            if (message) {
                message.className = "form-message is-error";
                message.textContent =
                    "Please add the game name, your email, the issue type and at least 20 characters of detail.";
            }
            return;
        }

        const subject = `Complaint: ${game} — ${issue}`;
        const body = `Game: ${game}\nIssue: ${issue}\nEmail: ${email}\n\nDetails:\n${details}\n`;
        window.location.href = `mailto:${SITE.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

        if (message) {
            message.className = "form-message is-ok";
            message.textContent =
                "Your email app should open with the complaint ready to send. If it does not, email us directly at " +
                SITE.email +
                ".";
        }
        form.reset();
    });
}

/* ------------------------------------------------------------------- about */

async function initAboutPage() {
    const stats = document.getElementById("aboutStats");
    if (!stats) return;
    const games = await getGames().catch(() => []);
    stats.innerHTML = `
        <div class="panel"><h3>${games.length}</h3><p>Games tracked</p></div>
        <div class="panel"><h3>${games.filter(game => game.category === "yono").length}</h3><p>Yono games</p></div>
        <div class="panel"><h3>${games.filter(game => game.category === "diwa").length}</h3><p>Diwa games</p></div>
        <div class="panel"><h3>${games.filter(canPlay).length}</h3><p>Playable now</p></div>`;
}

/* ------------------------------------------------------------------- boot */

document.addEventListener("DOMContentLoaded", async () => {
    renderChrome();
    startCountdowns();

    const page = document.body.dataset.page;
    try {
        if (page === "home") await initHome();
        else if (page === "games") await initGamesPage();
        else if (page === "game") await initGameDetail();
        else if (page === "bonuses") await initBonusesPage();
        else if (page === "news") initNewsList();
        else if (page === "news-detail") initNewsDetail();
        else if (page === "promo-codes") await initPromoCodesPage();
        else if (page === "complaints") initComplaintsPage();
        else if (page === "about") await initAboutPage();
    } catch (error) {
        console.error("Page initialisation failed:", error);
    }
});
