// ---------- Config ----------
const MAX_TILES = 4;
const QUICK_CHANNELS = [
  { name: "NFL Network", url: "https://bg.kardna.net/uv.html#aHR0cHM6Ly9uZmx3ZWJjYXN0LmNvbS9saXZlL25mbG5ldHdvcmsuaHRtbA==" },
  { name: "ESPN",        url: "https://bg.kardna.net/uv.html#aHR0cHM6Ly9uZmx3ZWJjYXN0LmNvbS9saXZlL2VzcG51c2EuaHRtbA==" },
  { name: "RedZone",     url: "./channels/redzone.html" },
  { name: "ABC",         url: "https://bg.kardna.net/uv.html#aHR0cHM6Ly9uZmx3ZWJjYXN0LmNvbS9saXZlL2JlbmdhbHMuaHRtbA==" }
];

// ---------- State ----------
// Keep DOM nodes so we don't rebuild existing iframes (prevents reload/refresh when adding a tile)
let tiles = []; // { id, url, label, elMain, elMV }
let counter = 0;

// ---------- DOM ----------
const grid = document.getElementById("grid");
const mvGrid = document.getElementById("mv-grid");
const tileCount = document.getElementById("tile-count");
const btnClear = document.getElementById("btn-clear");
const btnOpenMV = document.getElementById("btn-open-mv");
const mvModal = document.getElementById("mv-modal");
const mvClose = document.getElementById("mv-close");
const channelList = document.getElementById("channel-list");

// Build quick channel cards
function renderChannels(){
  if (!channelList) return;
  channelList.innerHTML = "";
  QUICK_CHANNELS.forEach(c => {
    const el = document.createElement("div");
    el.className = "card";
    el.innerHTML = `
      <h4>${c.name}</h4>
      <div class="actions">
        <button class="btn small primary">Open</button>
        <button class="btn small">Add Tile</button>
      </div>
    `;
    const [openBtn, addBtn] = el.querySelectorAll("button");
    openBtn.addEventListener("click", () => openWebsite(c.url));
    addBtn.addEventListener("click", () => addTile(c.url, c.name));
    channelList.appendChild(el);
  });
}
if (channelList) renderChannels();

// Public helper used by scoreboard/api.js
window.openWebsite = function (url) {
  addTile(url, "Stream");
};

function updateTileCount() {
  if (tileCount) tileCount.textContent = `${tiles.length}/${MAX_TILES} tiles`;
}

function createTileElement(id, url, label) {
  const wrapper = document.createElement("div");
  wrapper.className = "tile";
  wrapper.dataset.tileId = id;
  wrapper.innerHTML = `
    <div class="controls">
      <button class="icon" data-act="pop">Popout</button>
      <button class="icon" data-act="full">Full</button>
      <button class="icon" data-act="close">Close</button>
    </div>
    <div class="label">${label}</div>
    <iframe src="${url}" allow="autoplay; fullscreen; picture-in-picture"></iframe>
  `;
  const acts = wrapper.querySelectorAll("[data-act]");
  acts.forEach(btn => {
    btn.addEventListener("click", () => {
      const a = btn.dataset.act;
      if (a === "close") removeTile(id);
      if (a === "full") toggleFullscreen(wrapper);
      if (a === "pop") window.open(url, "_blank");
    });
  });
  return wrapper;
}

// Add a tile into the main grid and MV grid without touching existing ones
function addTile(url, label="Stream"){
  if (!grid || !mvGrid) return;
  if (tiles.length >= MAX_TILES){
    alert("Tile limit reached (4).");
    return;
  }
  const id = `tile-${++counter}`;

  const elMain = createTileElement(id, url, label);
  const elMV   = createTileElement(id, url, label);

  grid.appendChild(elMain);
  mvGrid.appendChild(elMV);

  tiles.push({ id, url, label, elMain, elMV });
  updateTileCount();
}

// Remove a single tile (both main and MV)
function removeTile(id){
  const idx = tiles.findIndex(t => t.id === id);
  if (idx === -1) return;
  const t = tiles[idx];
  try { t.elMain.remove(); } catch(_){}
  try { t.elMV.remove(); } catch(_){}
  tiles.splice(idx, 1);
  updateTileCount();
}

function toggleFullscreen(container){
  if (container.classList.contains("fullscreen-mode")){
    container.classList.remove("fullscreen-mode");
  } else {
    document.querySelectorAll(".fullscreen-mode").forEach(el => el.classList.remove("fullscreen-mode"));
    container.classList.add("fullscreen-mode");
  }
}

// Actions
if (btnClear){
  btnClear.addEventListener("click", () => {
    // Remove each tile via removeTile to clean up both grids
    [...tiles].forEach(t => removeTile(t.id));
  });
}

if (btnOpenMV && mvModal){
  btnOpenMV.addEventListener("click", () => mvModal.classList.add("open"));
}
if (mvClose && mvModal){
  mvClose.addEventListener("click", () => mvModal.classList.remove("open"));
}

// Keyboard helpers: 1..4 to focus a tile (scroll into view)
document.addEventListener("keydown", (e) => {
  if (!grid) return;
  if (e.key >= "1" && e.key <= "4"){
    const idx = parseInt(e.key, 10) - 1;
    const el = grid.children[idx];
    if (el) el.scrollIntoView({ behavior: "smooth", block: "center" });
  }
});