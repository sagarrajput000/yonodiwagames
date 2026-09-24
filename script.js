console.log("YonoDiwaGames Supabase script loaded");

// ================= SUPABASE CONFIG =================

const SUPABASE_URL =
    "https://cqgiafcacrbyrovrqehp.supabase.co";

const SUPABASE_KEY =
    "sb_publishable_f3UUErdVfU4o1WPj-FVM4Q_zvA2rr7w";


// ================= SUPABASE CLIENT =================

const supabaseClient = window.supabase.createClient(
    SUPABASE_URL,
    SUPABASE_KEY
);


// ================= GAME DATA =================

let yonoGames = [];
let diwaGames = [];


// ================= CREATE GAME CARD =================
function createGameCard(game) {
    const short =
        game.name
            .split(" ")
            .map(word => word[0])
            .join("")
            .substring(0, 3)
            .toUpperCase();

    const isUpcoming =
        game.status === "upcoming" &&
        game.release_at &&
        new Date(game.release_at).getTime() > Date.now();

    let actionButton = "";

    if (isUpcoming) {
        actionButton = `
            <div
    class="countdown-timer"
    data-release="${game.release_at}"
>
    <span class="timer-part timer-days">00</span>
    <span class="timer-part timer-hours">00</span>
    <span class="timer-part timer-minutes">00</span>
    <span class="timer-part timer-seconds">00</span>
</div>
        `;
    } else if (game.game_url) {
        actionButton = `
            <a
                href="${game.game_url}"
                class="referral-button"
                target="_blank"
                rel="noopener noreferrer"
            >
                🎮 Play Game
            </a>
        `;
    } else {
        actionButton = `
            <div class="referral-button disabled-button">
                Coming Soon
            </div>
        `;
    }

    return `
        <article class="game-card">
            <div class="game-image">
                ${
                    game.image_url
                        ? `<img src="${game.image_url}" alt="${escapeHTML(game.name)}">`
                        : `<span>${short}</span>`
                }
            </div>

            <h3>${escapeHTML(game.name)}</h3>

            <p>${escapeHTML(
                game.description || "Explore this game"
            )}</p>

            ${actionButton}
        </article>
    `;
}

// ================= SECURITY HELPER =================
function startCountdowns() {
    const timers = document.querySelectorAll(".countdown-timer");

    timers.forEach(timer => {
        const releaseValue = timer.getAttribute("data-release");

        if (!releaseValue) {
            timer.textContent = "Release date not set";
            return;
        }

        const releaseTime = new Date(releaseValue).getTime();

        if (Number.isNaN(releaseTime)) {
            timer.textContent = "Invalid release date";
            return;
        }

        function updateTimer() {
            const difference = releaseTime - Date.now();

            if (difference <= 0) {
                timer.textContent = "🎮 Available Now";
                return;
            }

            const totalSeconds = Math.floor(difference / 1000);

            const days = Math.floor(totalSeconds / 86400);
            const hours = Math.floor((totalSeconds % 86400) / 3600);
            const minutes = Math.floor((totalSeconds % 3600) / 60);
            const seconds = totalSeconds % 60;

            timer.textContent =
                `⏳ ${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m ${String(seconds).padStart(2, "0")}s`;
        }

        updateTimer();

        setInterval(updateTimer, 1000);
    });
}
function escapeHTML(text) {

    const div = document.createElement("div");

    div.textContent = text;

    return div.innerHTML;
}


// ================= RENDER GAMES =================

function renderGames(games, container) {
    if (!container) return;

    if (games.length === 0) {
        container.innerHTML = `
            <p class="no-games">
                No games available.
            </p>
        `;
        return;
    }

    container.innerHTML = games
        .map(createGameCard)
        .join("");

    setTimeout(startCountdowns, 0);
}


// ================= LOAD GAMES FROM SUPABASE =================

async function loadGames() {

    const yonoGrid =
        document.getElementById("yonoGrid");

    const diwaGrid =
        document.getElementById("diwaGrid");

    if (!yonoGrid || !diwaGrid) {
        console.error("Game grid elements not found.");
        return;
    }

    yonoGrid.innerHTML = "<p>Loading games...</p>";
    diwaGrid.innerHTML = "<p>Loading games...</p>";


    const { data, error } = await supabaseClient
        .from("games")
        .select("*")
        .eq("is_active", true)
        .order("sort_order", {
            ascending: true
        });


    if (error) {

        console.error("Supabase error:", error);

        yonoGrid.innerHTML =
            "<p>Unable to load games.</p>";

        diwaGrid.innerHTML =
            "<p>Unable to load games.</p>";

        return;
    }


    yonoGames =
        data.filter(game =>
            game.category === "yono"
        );

    diwaGames =
        data.filter(game =>
            game.category === "diwa"
        );


    renderGames(
        yonoGames,
        yonoGrid
    );

    renderGames(
        diwaGames,
        diwaGrid
    );
}
startCountdowns();

// ================= SEARCH =================

function setupSearch() {

    const yonoSearch =
        document.getElementById("yonoSearch");

    const diwaSearch =
        document.getElementById("diwaSearch");


    if (yonoSearch) {

        yonoSearch.addEventListener(
            "input",
            function () {

                const search =
                    this.value
                        .toLowerCase()
                        .trim();


                const filtered =
                    yonoGames.filter(game =>
                        game.name
                            .toLowerCase()
                            .includes(search)
                    );


                renderGames(
                    filtered,
                    document.getElementById("yonoGrid")
                );

            }
        );

    }


    if (diwaSearch) {

        diwaSearch.addEventListener(
            "input",
            function () {

                const search =
                    this.value
                        .toLowerCase()
                        .trim();


                const filtered =
                    diwaGames.filter(game =>
                        game.name
                            .toLowerCase()
                            .includes(search)
                    );


                renderGames(
                    filtered,
                    document.getElementById("diwaGrid")
                );

            }
        );

    }

}


// ================= SECTION OPEN =================

function openSection(id) {

    const section =
        document.getElementById(id);

    if (!section) return;

    section.scrollIntoView({
        behavior: "smooth"
    });

}
// ================= ABOUT SECTION =================
// ================= ABOUT SECTION =================

function setupAboutSection() {

    const aboutButton =
        document.getElementById("aboutButton");

    const mobileAboutButton =
        document.getElementById("mobileAboutButton");

    const aboutSection =
        document.getElementById("about");

    if (!aboutSection) {
        return;
    }

    function showAbout(event) {

        event.preventDefault();

        aboutSection.hidden = false;

        setTimeout(function () {

            aboutSection.scrollIntoView({
                behavior: "smooth",
                block: "start"
            });

        }, 50);
    }

    if (aboutButton) {
        aboutButton.addEventListener(
            "click",
            showAbout
        );
    }

    if (mobileAboutButton) {
        mobileAboutButton.addEventListener(
            "click",
            showAbout
        );
    }
}

// ================= START WEBSITE =================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadGames();

        setupSearch();

        setupAboutSection();

    }
);
