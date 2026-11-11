/* ==========================================================================
   YonoDiwaGames — site content
   Edit articles, bonuses and FAQ answers here. Game-linked bonuses match by
   exact game name in the Supabase "games" table.
   ========================================================================== */

/* Static game guide URLs. Keys use the game name lowercased with punctuation
   and extra spaces removed. app.js falls back to casino.html?id= if a game is
   not listed here yet. */
window.GAME_PAGES = {
    "diwa play": "diwa-play.html",
    "diwa x": "diwa-x.html",
    "diwa top": "diwa-top.html",
    "mqm bet": "mqm-bet.html",
    "diwa king": "diwa-king.html",
    "rummy zip": "rummy-zip.html",
    "777 game": "777-game.html",
    "bingo 101": "bingo-101.html",
    "567 slots": "567-slots.html",
    "boss rummy": "boss-rummy.html",
    "yono arcade": "yono-arcade.html",
    "yono slots": "yono-slots.html",
    "ind slots": "ind-slots.html",
    "diwa lucky": "diwa-lucky.html",
    "diwa win": "diwa-win.html",
    "diwa ace": "diwa-ace.html"
};

window.SITE_NEWS = [
    {
        slug: "how-we-score-games",
        title: "How we score games in the YonoDiwaGames directory",
        tag: "Guide",
        date: "2026-10-28",
        readTime: 4,
        emoji: "⭐",
        gradient: ["#0c3b2a", "#0a2b47"],
        excerpt:
            "Every listing carries an editor score out of 10. Here is exactly what that number measures — and what it does not.",
        body: `
            <p>Each game in the directory shows a score out of 10. It is a quick way to compare listings, not a promise about money. Our score answers one question: <strong>how useful is this listing for someone deciding where to play?</strong></p>
            <h2>What the score reflects</h2>
            <ul>
                <li><strong>Listing completeness</strong> — clear name, working artwork, an honest description and a valid referral link.</li>
                <li><strong>Link stability</strong> — how consistently the app link resolves across devices and browsers.</li>
                <li><strong>Community signals</strong> — patterns in the complaints we receive and how quickly they are resolved.</li>
                <li><strong>Freshness</strong> — apps that keep their offers and terms updated rank a little higher.</li>
            </ul>
            <h2>What the score does not measure</h2>
            <p>A high score is not a guarantee of withdrawals, payouts or bonuses. We do not run these apps, we cannot see your account, and we cannot influence their decisions. Treat the score as a shortlisting tool, then read the operator's own terms before you deposit anything.</p>
            <h2>Why two games can share a score</h2>
            <p>Scores are rounded to one decimal place, so ties are normal. When scores match, sort by latest addition or open each listing and compare the notes instead of relying on the number alone.</p>
            <blockquote class="note">Only play with money you can afford to lose, and only where online gaming is legal in your region. 18+.</blockquote>
        `
    },
    {
        slug: "what-is-coming-next",
        title: "On the radar: the next games joining the directory",
        tag: "Upcoming",
        date: "2026-10-21",
        readTime: 3,
        emoji: "🚀",
        gradient: ["#12324b", "#0b1f38"],
        excerpt:
            "Upcoming titles get a full countdown before launch, so you can see exactly when a link goes live.",
        body: `
            <p>The directory now separates <strong>live</strong> games from <strong>upcoming</strong> ones. Upcoming listings show a countdown on the card and on the detail page, and the Play button appears the moment the release time passes.</p>
            <h2>How upcoming listings work</h2>
            <ul>
                <li>The card shows a live countdown instead of a Play button.</li>
                <li>The detail page keeps the release date in the quick facts panel.</li>
                <li>When the timer reaches zero, the listing switches to a normal live link.</li>
            </ul>
            <p>Release times are set by the operator and can move. If a countdown passes and the link still is not usable, send us a note through the complaint service and we will check it.</p>
            <h2>Want a game added?</h2>
            <p>If you run an app in the Yono or Diwa style and want it listed, message us with the app name, the referral link and a square logo. Listings are reviewed before they appear.</p>
        `
    },
    {
        slug: "referral-link-safety-checklist",
        title: "A five-point checklist before you open any referral link",
        tag: "Safety",
        date: "2026-10-12",
        readTime: 4,
        emoji: "🛡️",
        gradient: ["#0a3040", "#0d1c3a"],
        excerpt:
            "Referral links are how directories like this one stay free. Use this checklist to make sure the link you open is the link you meant to open.",
        body: `
            <p>A referral link carries an ID that credits the person who shared it. It should never change what you see inside the app, but it is still worth a ten-second check before you sign up.</p>
            <h2>The checklist</h2>
            <ul>
                <li><strong>Check the domain.</strong> The link should point at the operator's own domain, not a lookalike spelling.</li>
                <li><strong>Look for HTTPS.</strong> Never enter account details on a page that warns about an insecure connection.</li>
                <li><strong>Read the terms first.</strong> Bonus conditions, wagering rules and withdrawal limits belong to the operator.</li>
                <li><strong>Keep records.</strong> Screenshot the offer you signed up for, including the date and any code used.</li>
                <li><strong>Never share OTPs.</strong> No legitimate support agent will ask for your one-time password.</li>
            </ul>
            <h2>If something looks wrong</h2>
            <p>Close the page, do not log in, and report it to us with the URL. We remove links that stop resolving or that lead somewhere unexpected, and we keep a record of every report in the complaint service.</p>
        `
    },
    {
        slug: "yono-vs-diwa-collections",
        title: "Yono vs Diwa: what actually changes between the two collections",
        tag: "Explainer",
        date: "2026-10-03",
        readTime: 3,
        emoji: "🎮",
        gradient: ["#123a2a", "#0d2c44"],
        excerpt:
            "Both collections sit in one directory, but they are organised differently. Here is how to pick a side.",
        body: `
            <p>The directory groups games into two collections: <strong>Yono</strong> and <strong>Diwa</strong>. The split is about how apps are branded and packaged, not about different rules — every listing still links out to an operator's own platform.</p>
            <h2>Yono games</h2>
            <p>Yono-style listings tend to be slot, bingo, arcade and rummy apps with a large number of rooms and frequent promotional screens. Expect more variety inside a single app.</p>
            <h2>Diwa games</h2>
            <p>Diwa-style listings often ship as lighter, faster apps with a narrower set of games and a stronger referral focus. They are easier to browse if you already know what you want to play.</p>
            <h2>Which should you open?</h2>
            <p>Start with the collection you are curious about, sort by our editor score, and read the notes on the detail page. Both collections are updated from the same database, so new listings appear on both the home page and the all-games page as soon as they go live.</p>
        `
    },
    {
        slug: "before-you-complain",
        title: "Before you file a complaint: four things that solve most issues",
        tag: "Support",
        date: "2026-09-24",
        readTime: 5,
        emoji: "🧾",
        gradient: ["#3a2410", "#16283c"],
        excerpt:
            "Most complaints we receive are resolved by the operator after one clear, well-documented message.",
        body: `
            <p>Our complaint service is a bridge, not a court. We can pass your case to the right contact and keep a record, but the operator controls the account, the balance and the decision. These four steps resolve most cases faster than a public complaint.</p>
            <h2>1. Use in-app support first</h2>
            <p>Open the app's own help centre and send the request from your registered account. This gives the operator the account context they need and creates a ticket number.</p>
            <h2>2. Collect evidence</h2>
            <ul>
                <li>Your user ID and the registered mobile number.</li>
                <li>Screenshots of the transaction, the balance and the offer you accepted.</li>
                <li>Dates and times for every step you have already taken.</li>
            </ul>
            <h2>3. Stick to facts</h2>
            <p>State what happened, when, and what you want resolved. Avoid insults or threats — they slow the process down and sometimes close the ticket.</p>
            <h2>4. Give a clear deadline</h2>
            <p>Ask for a response within a stated number of working days. If that passes, file the complaint with us and include the operator's ticket number. Our guide walks through the format we need.</p>
        `
    }
];

window.SITE_BONUSES = [
    {
        label: "Referral programme",
        value: "Refer & earn",
        title: "Invite friends to DIWA X",
        desc:
            "DIWA X lists a referral programme inside the app. Share your own code from the account screen and check the current reward rules before inviting anyone.",
        game: "DIWA X"
    },
    {
        label: "Welcome offer",
        value: "New player",
        title: "777 GAME first-time offer",
        desc:
            "New accounts may see a welcome screen after sign-up. Read the wagering conditions and validity window before you accept, since terms are set by the operator.",
        game: "777 GAME"
    },
    {
        label: "Daily rewards",
        value: "Daily login",
        title: "YONO SLOTS login rewards",
        desc:
            "YONO SLOTS shows a daily check-in reward on some accounts. Rewards change without notice, so confirm the current schedule inside the app.",
        game: "YONO SLOTS"
    },
    {
        label: "Tables",
        value: "Rummy rooms",
        title: "BOSS RUMMY table offers",
        desc:
            "Promotions for rummy tables are listed in the app's own offers tab. Entry requirements and minimum balances apply — always check before joining a table.",
        game: "BOSS RUMMY"
    },
    {
        label: "Bingo",
        value: "Room credits",
        title: "BINGO 101 room promotions",
        desc:
            "Bingo rooms occasionally run credit-back promotions during peak hours. Availability depends on the operator's schedule and is not guaranteed.",
        game: "BINGO 101"
    },
    {
        label: "Slots",
        value: "Free spins",
        title: "567 SLOTS spin offers",
        desc:
            "Slot promotions appear as in-app banners. Spin values, eligible games and expiry dates are controlled by 567 SLOTS, not by this directory.",
        game: "567 SLOTS"
    }
];

window.SITE_FAQ = [
    {
        q: "Do you operate any of the games listed here?",
        a: "No. YonoDiwaGames is an independent directory. Every game link opens a third-party operator's own website or app, and that operator is responsible for accounts, deposits, withdrawals and support."
    },
    {
        q: "How long does a complaint take?",
        a: "We acknowledge every complaint within two working days and pass it to the operator contact we hold. Resolution time depends on the operator; we follow up for up to 14 days and keep you updated on the ticket."
    },
    {
        q: "What should I include in a complaint?",
        a: "Your game user ID, the registered mobile number or email, a description of the issue with dates, screenshots of the transaction and balance, and any ticket number the operator has already given you."
    },
    {
        q: "Can you recover my money?",
        a: "We cannot move funds or override an operator's decision. What we can do is document your case, contact the operator through our channel and record the outcome so other visitors can see how a game handles complaints."
    },
    {
        q: "Why does a game show an upcoming countdown?",
        a: "Upcoming listings are games that have been announced but are not live yet. The countdown uses the release time set by the operator. When it reaches zero the listing switches to a normal Play link."
    },
    {
        q: "How do I get my game listed?",
        a: "Send the game name, referral link, a square logo and a short description through the complaint form or by email. Every submission is reviewed manually before it appears in the directory."
    }
];
