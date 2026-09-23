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

    return `
        <article class="game-card">

            <div class="game-image">
                ${game.image_url
                    ? `<img src="${game.image_url}" alt="${game.name}">`
                    : `<span>${short}</span>`
                }
            </div>

            <h3>
                ${escapeHTML(game.name)}
            </h3>

            <p>
                ${escapeHTML(game.description || "Explore this game")}
            </p>

            <a
                href="${game.game_url}"
                class="referral-button"
                target="_blank"
                rel="noopener noreferrer"
            >
                🎮 Play Game
            </a>

        </article>
    `;
}


// ================= SECURITY HELPER =================

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


// ================= START WEBSITE =================

document.addEventListener(
    "DOMContentLoaded",
    function () {

        loadGames();

        setupSearch();

    }
);