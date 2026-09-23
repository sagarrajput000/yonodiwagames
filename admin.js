const SUPABASE_URL = "https://cqgiafcacrbyrovrqehp.supabase.co";
const SUPABASE_KEY = "sb_publishable_f3UUErdVfU4o1WPj-FVM4Q_zvA2rr7w";

export function validateGame(game) {
  if (!game.name?.trim()) {
    return { valid: false, message: "Enter a game name." };
  }

  if (!["yono", "diwa"].includes(game.category)) {
    return {
      valid: false,
      message: "Choose Yono Games or Diwa Games."
    };
  }

  if (!game.game_url?.trim()) {
    return {
      valid: false,
      message: "Enter a normal game URL."
    };
  }

  try {
    new URL(game.game_url.trim());
  } catch {
    return {
      valid: false,
      message: "Enter a valid game URL."
    };
  }

  if (game.image_url?.trim()) {
    try {
      new URL(game.image_url.trim());
    } catch {
      return {
        valid: false,
        message: "Enter a valid image URL or leave it blank."
      };
    }
  }

  return { valid: true, message: "" };
}

export function toGamePayload(game) {
  return {
    name: game.name.trim(),
    category: game.category,
    description: game.description?.trim() || "",
    image_url: game.image_url?.trim() || null,
    game_url: game.game_url.trim(),
    is_active: Boolean(game.is_active),
    sort_order: Math.max(
      0,
      Number.parseInt(game.sort_order, 10) || 0
    )
  };
}

const app =
  typeof document === "undefined"
    ? null
    : {
        form: document.querySelector("#gameForm"),
        list: document.querySelector("#gamesList"),
        notice: document.querySelector("#notice"),
        count: document.querySelector("#gameCount"),
        title: document.querySelector("#editor-title"),
        cancel: document.querySelector("#cancelEdit"),
        save: document.querySelector("#saveButton"),
        search: document.querySelector("#search"),
        categoryFilter: document.querySelector("#categoryFilter"),
        statusFilter: document.querySelector("#statusFilter")
      };

let client;
let games = [];
let editingId = null;

/* =========================
   LOGIN SYSTEM
========================= */

function createLoginScreen() {
  if (document.querySelector("#loginScreen")) return;

  const login = document.createElement("div");

  login.id = "loginScreen";

  login.innerHTML = `
    <div style="
      min-height:100vh;
      display:flex;
      align-items:center;
      justify-content:center;
      background:#0b1020;
      padding:20px;
      font-family:Arial,sans-serif;
    ">
      <div style="
        width:100%;
        max-width:400px;
        background:#151b2e;
        padding:30px;
        border-radius:18px;
        box-shadow:0 20px 60px rgba(0,0,0,.4);
      ">
        <h1 style="
          margin:0 0 8px;
          color:white;
          text-align:center;
        ">
          YonoDiwaGames
        </h1>

        <p style="
          color:#9ca3af;
          text-align:center;
          margin-bottom:25px;
        ">
          Admin Login
        </p>

        <form id="loginForm">

          <input
            id="loginEmail"
            type="email"
            placeholder="Admin email"
            required
            style="
              width:100%;
              box-sizing:border-box;
              padding:13px;
              margin-bottom:12px;
              border-radius:10px;
              border:1px solid #374151;
              background:#0f172a;
              color:white;
            "
          >

          <input
            id="loginPassword"
            type="password"
            placeholder="Password"
            required
            style="
              width:100%;
              box-sizing:border-box;
              padding:13px;
              margin-bottom:15px;
              border-radius:10px;
              border:1px solid #374151;
              background:#0f172a;
              color:white;
            "
          >

          <button
            id="loginButton"
            type="submit"
            style="
              width:100%;
              padding:13px;
              border:0;
              border-radius:10px;
              background:#6366f1;
              color:white;
              font-size:16px;
              font-weight:600;
              cursor:pointer;
            "
          >
            Login
          </button>

          <p
            id="loginError"
            style="
              color:#f87171;
              text-align:center;
              margin-top:15px;
              display:none;
            "
          ></p>

        </form>
      </div>
    </div>
  `;

  login.style.position = "fixed";
login.style.top = "0";
login.style.left = "0";
login.style.width = "100%";
login.style.height = "100%";
login.style.zIndex = "999999";

document.body.appendChild(login);

  document
    .querySelector("#loginForm")
    .addEventListener("submit", loginAdmin);
}

async function loginAdmin(event) {
  event.preventDefault();

  const email = document.querySelector("#loginEmail").value.trim();
  const password = document.querySelector("#loginPassword").value;
  const button = document.querySelector("#loginButton");
  const errorBox = document.querySelector("#loginError");

  button.disabled = true;
  button.textContent = "Logging in...";
  errorBox.style.display = "none";

  const { error } = await client.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    errorBox.textContent = error.message;
    errorBox.style.display = "block";

    button.disabled = false;
    button.textContent = "Login";
    return;
  }

  document.querySelector("#loginScreen")?.remove();

  initializeAdmin();
}

async function logoutAdmin() {
  await client.auth.signOut();
  window.location.reload();
}

/* =========================
   ADMIN FUNCTIONS
========================= */

function escapeHtml(value = "") {
  const node = document.createElement("div");
  node.textContent = value;
  return node.innerHTML;
}

function initials(name) {
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

function showNotice(message, type = "success") {
  app.notice.textContent = message;
  app.notice.className = `notice ${type}`;
  app.notice.hidden = false;
}

function clearNotice() {
  app.notice.hidden = true;
}

function currentFormData() {
  return Object.fromEntries(
    new FormData(app.form).entries()
  );
}

function setBusy(busy) {
  app.save.disabled = busy;

  app.save.textContent = busy
    ? "Saving…"
    : editingId
      ? "Update game"
      : "Save game";
}

function visibleGames() {
  const query = app.search.value
    .trim()
    .toLowerCase();

  return games.filter(
    game =>
      (!query ||
        `${game.name} ${game.description || ""}`
          .toLowerCase()
          .includes(query)) &&
      (app.categoryFilter.value === "all" ||
        game.category === app.categoryFilter.value) &&
      (app.statusFilter.value === "all" ||
        (app.statusFilter.value === "active") ===
          game.is_active)
  );
}

function renderGames() {
  const shown = visibleGames();

  app.count.textContent = games.length;

  if (!shown.length) {
    app.list.innerHTML =
      '<p class="empty">No games match these filters.</p>';

    return;
  }

  app.list.innerHTML = shown
    .map(
      game => `
      <article class="game-row">

        <div class="thumb">
          ${
            game.image_url
              ? `<img
                  src="${escapeHtml(game.image_url)}"
                  alt=""
                  onerror="this.remove()"
                >`
              : escapeHtml(initials(game.name))
          }
        </div>

        <div class="game-info">

          <div class="game-meta">

            <span class="badge">
              ${game.category === "yono" ? "YONO" : "DIWA"}
            </span>

            <span class="badge ${
              game.is_active ? "" : "inactive"
            }">
              ${game.is_active ? "ACTIVE" : "INACTIVE"}
            </span>

            ORDER ${game.sort_order ?? 0}

          </div>

          <h3>${escapeHtml(game.name)}</h3>

          <p>
            ${escapeHtml(
              game.description || "No description"
            )}
          </p>

        </div>

        <div class="row-actions">

          <button
            class="edit-button"
            type="button"
            data-edit="${game.id}"
          >
            Edit
          </button>

          <button
            class="delete-button"
            type="button"
            data-delete="${game.id}"
          >
            Delete
          </button>

        </div>

      </article>
    `
    )
    .join("");
}

async function loadGames() {
  clearNotice();

  app.list.innerHTML =
    '<p class="loading">Loading games…</p>';

  const { data, error } = await client
    .from("games")
    .select("*")
    .order("sort_order", {
      ascending: true
    })
    .order("name", {
      ascending: true
    });

  if (error) {
    app.list.innerHTML =
      '<p class="empty">Games could not be loaded.</p>';

    showNotice(
      `Could not load games: ${error.message}`,
      "error"
    );

    return;
  }

  games = data || [];

  renderGames();
}

function resetForm() {
  editingId = null;

  app.form.reset();

  app.form.is_active.checked = true;

  app.title.textContent = "Add a game";

  app.cancel.hidden = true;

  setBusy(false);
}

function editGame(id) {
  const game = games.find(
    item => item.id === id
  );

  if (!game) return;

  editingId = id;

  app.form.name.value =
    game.name || "";

  app.form.category.value =
    game.category || "yono";

  app.form.description.value =
    game.description || "";

  app.form.image_url.value =
    game.image_url || "";

  app.form.game_url.value =
    game.game_url || "";

  app.form.is_active.checked =
    Boolean(game.is_active);

  app.form.sort_order.value =
    game.sort_order ?? 0;

  app.title.textContent =
    "Edit game";

  app.cancel.hidden = false;

  setBusy(false);

  app.form.name.focus();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

async function deleteGame(id) {
  const game = games.find(
    item => item.id === id
  );

  if (
    !game ||
    !window.confirm(
      `Delete "${game.name}"? This cannot be undone.`
    )
  ) {
    return;
  }

  const { error } = await client
    .from("games")
    .delete()
    .eq("id", id);

  if (error) {
    showNotice(
      `Could not delete game: ${error.message}`,
      "error"
    );

    return;
  }

  showNotice("Game deleted.");

  if (editingId === id) {
    resetForm();
  }

  await loadGames();
}

async function saveGame(event) {
  event.preventDefault();

  clearNotice();

  const raw = currentFormData();

  raw.is_active =
    app.form.is_active.checked;

  const validation =
    validateGame(raw);

  if (!validation.valid) {
    showNotice(
      validation.message,
      "error"
    );

    return;
  }

  const payload =
    toGamePayload(raw);

  setBusy(true);

  const query = editingId
    ? client
        .from("games")
        .update(payload)
        .eq("id", editingId)
    : client
        .from("games")
        .insert(payload);

  const { error } = await query;

  setBusy(false);

  if (error) {
    showNotice(
      `Could not save game: ${error.message}`,
      "error"
    );

    return;
  }

  showNotice(
    editingId
      ? "Game updated successfully."
      : "Game added successfully."
  );

  resetForm();

  await loadGames();
}

/* =========================
   ADMIN INITIALIZATION
========================= */

function initializeAdmin() {
  const logoutButton = document.createElement("button");

logoutButton.textContent = "Logout";
logoutButton.type = "button";

logoutButton.style.position = "fixed";
logoutButton.style.top = "20px";
logoutButton.style.right = "20px";
logoutButton.style.zIndex = "1000";
logoutButton.style.padding = "10px 16px";
logoutButton.style.border = "0";
logoutButton.style.borderRadius = "8px";
logoutButton.style.background = "#ef4444";
logoutButton.style.color = "#fff";
logoutButton.style.cursor = "pointer";
logoutButton.style.fontWeight = "600";

logoutButton.addEventListener("click", logoutAdmin);

document.body.appendChild(logoutButton);
  if (!app?.form) return;

  app.form.addEventListener(
    "submit",
    saveGame
  );

  app.cancel.addEventListener(
    "click",
    resetForm
  );

  document
    .querySelector("#refreshButton")
    ?.addEventListener(
      "click",
      loadGames
    );

  [
    app.search,
    app.categoryFilter,
    app.statusFilter
  ].forEach(control => {
    control?.addEventListener(
      "input",
      renderGames
    );
  });

  app.list.addEventListener(
    "click",
    event => {
      const {
        edit,
        delete: deleted
      } = event.target.dataset;

      if (edit) {
        editGame(edit);
      }

      if (deleted) {
        deleteGame(deleted);
      }
    }
  );

  loadGames();
}

/* =========================
   START
========================= */

async function start() {
  if (!window.supabase) {
    alert(
      "Supabase could not be loaded. Check your internet connection and refresh."
    );

    return;
  }

  client =
    window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );

  const {
    data: { session }
  } = await client.auth.getSession();

  if (session) {
    initializeAdmin();
  } else {
    createLoginScreen();
  }

  client.auth.onAuthStateChange(
    (event, session) => {
      if (event === "SIGNED_OUT") {
        window.location.reload();
      }
    }
  );
}

if (app) {
  start();
}