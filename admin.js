const SUPABASE_URL = "https://cqgiafcacrbyrovrqehp.supabase.co";
const SUPABASE_KEY = "sb_publishable_f3UUErdVfU4o1WPj-FVM4Q_zvA2rr7w";

export function validateGame(game) {
  if (!game.name?.trim()) {
    return {
      valid: false,
      message: "Enter a game name."
    };
  }
if (!["live", "upcoming"].includes(game.status)) {
  return { valid: false, message: "Choose Live or Upcoming." };
}
  if (!["yono", "diwa"].includes(game.category)) {
    return {
      valid: false,
      message: "Choose Yono Games or Diwa Games."
    };
  }

 if (game.status === "live") {
  if (!game.game_url?.trim()) {
    return { valid: false, message: "Enter a normal game URL." };
  }

  try {
    new URL(game.game_url.trim());
  } catch {
    return { valid: false, message: "Enter a valid game URL." };
  }
}

if (game.status === "upcoming") {
  if (!game.release_at) {
    return {
      valid: false,
      message: "Choose a release date and time for the upcoming game."
    };
  }

  const releaseDate = new Date(game.release_at);

  if (Number.isNaN(releaseDate.getTime())) {
    return {
      valid: false,
      message: "Enter a valid release date and time."
    };
  }
}

  return {
    valid: true,
    message: ""
  };
}

export function toGamePayload(game) {
  return {
    name: game.name.trim(),
    category: game.category,
    status: game.status,
    release_at:
      game.status === "upcoming" && game.release_at
        ? new Date(game.release_at).toISOString()
        : null,
    description: game.description?.trim() || "",
    image_url: game.image_url?.trim() || null,
    game_url: game.game_url?.trim() || "",
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
        statusFilter: document.querySelector("#statusFilter"),
gameStatus: document.querySelector("#status"),
upcomingFields: document.querySelector("#upcomingFields"),
releaseAt: document.querySelector("#release_at"),
        // NEW IMAGE ELEMENTS
        imageFile: document.querySelector("#image_file"),
        imagePreview: document.querySelector("#imagePreview"),
        previewImage: document.querySelector("#previewImage")
      };

let client;
let games = [];
let editingId = null;
let editingImageUrl = null;

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

  const email =
    document.querySelector("#loginEmail").value.trim();

  const password =
    document.querySelector("#loginPassword").value;

  const button =
    document.querySelector("#loginButton");

  const errorBox =
    document.querySelector("#loginError");

  button.disabled = true;
  button.textContent = "Logging in...";
  errorBox.style.display = "none";

  const { error } =
    await client.auth.signInWithPassword({
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

  document
    .querySelector("#loginScreen")
    ?.remove();

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

/* =========================
   IMAGE PREVIEW
========================= */

function clearImagePreview() {
  if (!app.imagePreview || !app.previewImage) return;

  app.previewImage.src = "";
  app.imagePreview.hidden = true;
}

function showImagePreview(url) {
  if (!app.imagePreview || !app.previewImage) return;

  if (!url) {
    clearImagePreview();
    return;
  }

  app.previewImage.src = url;
  app.imagePreview.hidden = false;
}

/* =========================
   IMAGE UPLOAD
========================= */

async function uploadGameImage(file) {
  if (!file) {
    return null;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type)) {
    throw new Error(
      "Please choose a JPG, PNG, or WebP image."
    );
  }

  const maxSize = 5 * 1024 * 1024;

  if (file.size > maxSize) {
    throw new Error(
      "Image must be smaller than 5 MB."
    );
  }

  const extension =
    file.name.split(".").pop().toLowerCase();

  const fileName =
    `${Date.now()}-${crypto.randomUUID()}.${extension}`;

  const filePath = fileName;

  const {
    error: uploadError
  } = await client.storage
    .from("game-images")
    .upload(filePath, file, {
      cacheControl: "3600",
      upsert: false,
      contentType: file.type
    });

  if (uploadError) {
    console.error(
      "Image upload error:",
      uploadError
    );

    throw new Error(
      `Image upload failed: ${uploadError.message}`
    );
  }

  const {
    data
  } = client.storage
    .from("game-images")
    .getPublicUrl(filePath);

  if (!data?.publicUrl) {
    throw new Error(
      "Could not create the image URL."
    );
  }

  return data.publicUrl;
}

/* =========================
   FORM DATA
========================= */
function updateUpcomingFields() {
  if (!app.gameStatus || !app.upcomingFields) {
    return;
  }

  const isUpcoming =
    app.gameStatus.value === "upcoming";

  app.upcomingFields.hidden = !isUpcoming;

  if (app.releaseAt) {
    app.releaseAt.required = isUpcoming;

    if (!isUpcoming) {
      app.releaseAt.value = "";
    }
  }
}
function currentFormData() {
  return {
    name: app.form.name.value,
    category: app.form.category.value,
    status: app.gameStatus.value,
    release_at: app.releaseAt.value,
    description: app.form.description.value,
    game_url: app.form.game_url.value,
    is_active: app.form.is_active.checked,
    sort_order: app.form.sort_order.value
  };
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

/* =========================
   RENDER GAMES
========================= */

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
              ? `
                <img
                  src="${escapeHtml(game.image_url)}"
                  alt=""
                  onerror="this.remove()"
                >
              `
              : escapeHtml(initials(game.name))
          }
        </div>

        <div class="game-info">

          <div class="game-meta">

            <span class="badge">
              ${game.category === "yono" ? "YONO" : "DIWA"}
            </span>

           
<span class="badge ${
  game.status === "upcoming" ? "upcoming" : ""
}">
  ${game.status === "upcoming" ? "🟡 UPCOMING" : "🟢 LIVE"}
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

/* =========================
   LOAD GAMES
========================= */

async function loadGames() {
  clearNotice();

  app.list.innerHTML =
    '<p class="loading">Loading games…</p>';

  const {
    data,
    error
  } = await client
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
  fillPromoGameOptions();
}

/* =========================
   RESET FORM
========================= */

function resetForm() {
  editingId = null;
  editingImageUrl = null;

  app.form.reset();

  app.form.is_active.checked = true;
app.gameStatus.value = "live";
app.releaseAt.value = "";
updateUpcomingFields();
  app.title.textContent = "Add a game";

  app.cancel.hidden = true;

  clearImagePreview();

  setBusy(false);
}

/* =========================
   EDIT GAME
========================= */

function editGame(id) {
  const game = games.find(
    item => item.id === id
  );

  if (!game) return;

  editingId = id;

  editingImageUrl =
    game.image_url || null;

  app.form.name.value = game.name || "";
app.form.category.value = game.category || "yono";
app.gameStatus.value = game.status || "live";
app.releaseAt.value = game.release_at
  ? new Date(game.release_at).toISOString().slice(0, 16)
  : "";
app.form.description.value = game.description || "";
app.form.game_url.value = game.game_url || "";
app.form.is_active.checked = Boolean(game.is_active);
app.form.sort_order.value = game.sort_order ?? 0;

updateUpcomingFields();
  // Clear file input
  if (app.imageFile) {
    app.imageFile.value = "";
  }

  // Show existing image
  if (editingImageUrl) {
    showImagePreview(editingImageUrl);
  } else {
    clearImagePreview();
  }

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

/* =========================
   DELETE GAME
========================= */

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

  const {
    error
  } = await client
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

/* =========================
   SAVE GAME
========================= */

async function saveGame(event) {
  event.preventDefault();

  clearNotice();

  const raw = currentFormData();

  const validation =
    validateGame(raw);

  if (!validation.valid) {
    showNotice(
      validation.message,
      "error"
    );

    return;
  }

  setBusy(true);

  try {
    let imageUrl = editingImageUrl;

    // If a new image was selected, upload it.
    if (
      app.imageFile &&
      app.imageFile.files &&
      app.imageFile.files.length > 0
    ) {
      showNotice(
        "Uploading image...",
        "success"
      );

      imageUrl =
        await uploadGameImage(
          app.imageFile.files[0]
        );
    }

    const payload =
      toGamePayload({
        ...raw,
        image_url: imageUrl
      });

    setBusy(true);

    let query;

    if (editingId) {
      query = client
        .from("games")
        .update(payload)
        .eq("id", editingId);
    } else {
      query = client
        .from("games")
        .insert(payload);
    }

    const {
      error
    } = await query;

    if (error) {
      throw new Error(
        `Could not save game: ${error.message}`
      );
    }

    showNotice(
      editingId
        ? "Game updated successfully."
        : "Game added successfully."
    );

    resetForm();

    await loadGames();

  } catch (error) {
    console.error(error);

    showNotice(
      error.message ||
        "Something went wrong while saving the game.",
      "error"
    );

  } finally {
    setBusy(false);
  }
}

/* =========================
   IMAGE FILE CHANGE
========================= */

function handleImageChange() {
  if (!app.imageFile) return;

  const file =
    app.imageFile.files[0];

  if (!file) {
    if (editingImageUrl) {
      showImagePreview(editingImageUrl);
    } else {
      clearImagePreview();
    }

    return;
  }

  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/webp"
  ];

  if (!allowedTypes.includes(file.type)) {
    showNotice(
      "Please choose a JPG, PNG, or WebP image.",
      "error"
    );

    app.imageFile.value = "";

    return;
  }

  if (file.size > 5 * 1024 * 1024) {
    showNotice(
      "Image must be smaller than 5 MB.",
      "error"
    );

    app.imageFile.value = "";

    return;
  }

  const previewUrl =
    URL.createObjectURL(file);

  showImagePreview(previewUrl);
}

/* =========================
   ADMIN INITIALIZATION
========================= */

function initializeAdmin() {
  const logoutButton =
    document.createElement("button");

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

  logoutButton.addEventListener(
    "click",
    logoutAdmin
  );

  document.body.appendChild(
    logoutButton
  );

  if (!app?.form) return;
app.gameStatus?.addEventListener(
  "change",
  updateUpcomingFields
);

updateUpcomingFields();
  app.form.addEventListener(
    "submit",
    saveGame
  );

  app.cancel.addEventListener(
    "click",
    resetForm
  );

  // Image upload preview
  app.imageFile?.addEventListener(
    "change",
    handleImageChange
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
  initPromoCodesAdmin();
}

/* =========================
   PROMO CODES
========================= */

const promoUI = {
  form: document.querySelector("#promoForm"),
  list: document.querySelector("#promoCodesList"),
  count: document.querySelector("#promoCount"),
  notice: document.querySelector("#promoNotice"),
  help: document.querySelector("#promoHelp"),
  code: document.querySelector("#promo_code"),
  game: document.querySelector("#promo_game"),
  note: document.querySelector("#promo_note"),
  link: document.querySelector("#promo_link"),
  expires: document.querySelector("#promo_expires"),
  sort: document.querySelector("#promo_sort"),
  active: document.querySelector("#promo_active"),
  save: document.querySelector("#promoSave"),
  cancel: document.querySelector("#promoCancel"),
  refresh: document.querySelector("#refreshPromos")
};

let promos = [];
let editingPromoId = null;

function promoNotice(message, type = "success") {
  if (!promoUI.notice) return;

  promoUI.notice.textContent = message;
  promoUI.notice.className = `notice ${type}`;
  promoUI.notice.hidden = false;
}

function promoIsExpired(promo) {
  if (!promo.expires_at) return false;

  const expiry = new Date(promo.expires_at).getTime();

  return !Number.isNaN(expiry) && expiry <= Date.now();
}

function fillPromoGameOptions() {
  if (!promoUI.game) return;

  const current = promoUI.game.value;

  promoUI.game.innerHTML =
    '<option value="">Not linked</option>' +
    games
      .map(
        game =>
          `<option value="${game.id}">${escapeHtml(game.name)}</option>`
      )
      .join("");

  promoUI.game.value = current;
}

function resetPromoForm() {
  if (!promoUI.form) return;

  editingPromoId = null;
  promoUI.form.reset();
  promoUI.active.checked = true;
  promoUI.sort.value = 0;
  promoUI.save.textContent = "Add promo code";
  promoUI.cancel.hidden = true;
}

function setPromoBusy(busy) {
  if (!promoUI.save) return;

  promoUI.save.disabled = busy;
  promoUI.save.textContent = busy
    ? "Saving..."
    : editingPromoId
      ? "Update promo code"
      : "Add promo code";
}

function renderPromoCodes() {
  if (!promoUI.list) return;

  if (promoUI.count) {
    promoUI.count.textContent = promos.length;
  }

  if (!promos.length) {
    promoUI.list.innerHTML =
      '<p class="empty">No promo codes yet. Add the first one above.</p>';

    return;
  }

  promoUI.list.innerHTML = promos
    .map(
      promo => `
      <article class="game-row">
        <div class="thumb">${escapeHtml(promo.code.slice(0, 6).toUpperCase())}</div>
        <div class="game-info">
          <div class="game-meta">
            <span class="badge">${promo.is_active ? "ACTIVE" : "HIDDEN"}</span>
            ${
              promoIsExpired(promo)
                ? '<span class="badge inactive">EXPIRED</span>'
                : ""
            }
            ${escapeHtml(promo.game_name || "No game linked")}
          </div>
          <h3>${escapeHtml(promo.code)}</h3>
          <p>${
            promo.note
              ? escapeHtml(promo.note)
              : promo.expires_at
                ? "Expires " + new Date(promo.expires_at).toLocaleString()
                : "No note"
          }</p>
        </div>
        <div class="row-actions">
          <button class="edit-button" type="button" data-promo-edit="${promo.id}">Edit</button>
          <button class="delete-button" type="button" data-promo-delete="${promo.id}">Delete</button>
        </div>
      </article>`
    )
    .join("");
}

async function loadPromoCodes() {
  if (!client || !promoUI.list) return;

  promoUI.list.innerHTML = '<p class="loading">Loading promo codes...</p>';

  const { data, error } = await client
    .from("promo_codes")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: false });

  if (error) {
    const missing =
      error.code === "PGRST205" ||
      /could not find the table/i.test(error.message || "");

    promos = [];
    renderPromoCodes();

    promoUI.list.innerHTML =
      '<p class="empty">Promo codes could not be loaded.</p>';

    if (promoUI.help) {
      promoUI.help.hidden = false;
      promoUI.help.innerHTML = missing
        ? "The <strong>promo_codes</strong> table does not exist yet. Open Supabase, go to SQL Editor, run the file <code>supabase/promo_codes.sql</code> from this project, then press refresh."
        : `Could not load promo codes: ${escapeHtml(error.message)}`;
    }

    return;
  }

  if (promoUI.help) promoUI.help.hidden = true;

  promos = data || [];
  renderPromoCodes();
}

function editPromo(id) {
  const promo = promos.find(item => item.id === id);

  if (!promo || !promoUI.form) return;

  editingPromoId = id;
  promoUI.code.value = promo.code || "";
  promoUI.game.value = promo.game_id || "";
  promoUI.note.value = promo.note || "";
  promoUI.link.value = promo.link || "";
  promoUI.expires.value = promo.expires_at
    ? new Date(promo.expires_at).toISOString().slice(0, 16)
    : "";
  promoUI.sort.value = promo.sort_order ?? 0;
  promoUI.active.checked = Boolean(promo.is_active);
  promoUI.save.textContent = "Update promo code";
  promoUI.cancel.hidden = false;
  promoUI.code.focus();

  window.scrollTo({ top: 0, behavior: "smooth" });
}

async function deletePromo(id) {
  const promo = promos.find(item => item.id === id);

  if (
    !promo ||
    !window.confirm(`Delete the code "${promo.code}"? This cannot be undone.`)
  ) {
    return;
  }

  const { error } = await client
    .from("promo_codes")
    .delete()
    .eq("id", id);

  if (error) {
    promoNotice(`Could not delete the code: ${error.message}`, "error");
    return;
  }

  promoNotice("Promo code deleted.");

  if (editingPromoId === id) resetPromoForm();

  await loadPromoCodes();
}

async function savePromoCode(event) {
  event.preventDefault();

  if (!client || !promoUI.form) return;

  const code = promoUI.code.value.trim();

  if (!code) {
    promoNotice("Enter the promo code text.", "error");
    return;
  }

  const link = promoUI.link.value.trim();

  if (link) {
    try {
      new URL(link);
    } catch {
      promoNotice("Enter a valid claim link or leave it empty.", "error");
      return;
    }
  }

  let expiresAt = null;

  if (promoUI.expires.value) {
    const parsed = new Date(promoUI.expires.value);

    if (Number.isNaN(parsed.getTime())) {
      promoNotice("Enter a valid expiry date.", "error");
      return;
    }

    expiresAt = parsed.toISOString();
  }

  const payload = {
    code,
    game_id: promoUI.game.value || null,
    game_name: promoUI.game.value
      ? promoUI.game.selectedOptions[0].textContent
      : null,
    note: promoUI.note.value.trim() || null,
    link: link || null,
    expires_at: expiresAt,
    is_active: promoUI.active.checked,
    sort_order: Math.max(0, Number.parseInt(promoUI.sort.value, 10) || 0)
  };

  setPromoBusy(true);

  try {
    const query = editingPromoId
      ? client.from("promo_codes").update(payload).eq("id", editingPromoId)
      : client.from("promo_codes").insert(payload);

    const { error } = await query;

    if (error) throw new Error(error.message);

    promoNotice(
      editingPromoId
        ? "Promo code updated."
        : "Promo code added and live on the site."
    );

    resetPromoForm();
    await loadPromoCodes();
  } catch (error) {
    promoNotice(
      `Could not save the promo code: ${error.message}`,
      "error"
    );
  } finally {
    setPromoBusy(false);
  }
}

function initPromoCodesAdmin() {
  if (!promoUI.form) return;

  promoUI.form.addEventListener("submit", savePromoCode);
  promoUI.cancel?.addEventListener("click", resetPromoForm);
  promoUI.refresh?.addEventListener("click", loadPromoCodes);

  promoUI.list?.addEventListener("click", event => {
    const editId = event.target.dataset.promoEdit;
    const deleteId = event.target.dataset.promoDelete;

    if (editId) editPromo(editId);
    if (deleteId) deletePromo(deleteId);
  });

  loadPromoCodes();
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
