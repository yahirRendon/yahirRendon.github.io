/* ============================================================================
   BOOK FOLDING WEB APP — APP LOGIC (Single File)

   TABLE OF CONTENTS
   0)  Overview & Principles
   1)  Globals & Configuration (constants used app-wide)
   2)  DOM Handles (elements used across sections)
   3)  Utilities (small helpers with no side effects)
   4)  Stage Layout & Image Loading (sizing, picking, drag&drop)
   5)  Smart HUD Placement (keeps HUD visible & readable)
   6)  HUD: Collapse + A11Y Tabs (ARIA wiring + keyboard nav)
   7)  App State (single source of truth for UI/analysis/output)
   8)  Schema Binding (DOM <-> params sync and events)
   9)  Stage Overlay Guides (drawn over the image)
   10) Image Helpers (transparency detection + flatten to white)
   11) Analyze (slices/segments detection — main processing)
   12) Auto-Fit Slices (heuristic match to pages count)
   13) Output Preview (page polygon, flaps, labels)
   14) PDF Export (paged fold guide + optional QR)
   15) Navigation & Init (bootstrapping, resize handlers)

   ========================================================================== */

/* ============================================================================
   1) GLOBALS & CONFIGURATION
   - App-wide constants and default assets.
   ========================================================================== */
const MAX_STAGE_WIDTH = 1400;        // cap the stage width in CSS grid
const TARGET_STAGE_HEIGHT = 900;     // preferred vertical cap for layout
const AUTO_SIZE = { MIN: 533, MAX: 800 }; // display size range
const IMG_PATH = "../img/projects/foldMe/";
const STAGE_IMAGES = [
  "amor.jpg", "amour.jpg", "apricity.jpg", "aurora.jpg", "bliss.jpg",
  "dream.jpg", "ephemeral.jpg", "ethereal.jpg", "felicity.jpg", "frisson.jpg",
  "grace.jpg", "halcyon.jpg", "ineffable.jpg", "joy.jpg", "laquacious.jpg",
  "limerence.jpg", "love-01.jpg", "love-02.jpg", "love-03.jpg", "mirth.jpg",
  "murmur.jpg", "muse.jpg", "nostalgia.jpg", "onomatopoeia.jpg", "peace.jpg",
  "philocalist.jpg", "reverie.jpg", "serene.jpg", "solace.jpg", "story.jpg",
  "zenith.jpg",
].map(name => IMG_PATH + name);;

/* ============================================================================
   2) DOM HANDLES
   - Cached references to elements used by multiple sections.
   ========================================================================== */
const wrapper = document.querySelector(".canvas-wrapper");
const prevBtn = document.querySelector(".image-previous");
const nextBtn = document.querySelector(".image-next");
const stage = document.getElementById("stage");
const stageImg = document.getElementById("stageImage");
const dropOverlay = document.getElementById("drop-overlay");

// HUD (toolbar + tabs)
const hud = document.getElementById("hud");
const hudToggle = document.getElementById("hudToggle");
const tabbar = document.getElementById("hud-tabbar");
const tabs = [...tabbar.querySelectorAll(".hud-btn[data-tab]")]; // buttons with data-tab

/* ============================================================================
   3) UTILITIES
   - Pure helpers with no side effects.
   ========================================================================== */
const clamp = (n, a, b) => Math.max(a, Math.min(b, n)); // clamp to [a,b]

/* ============================================================================
   4) STAGE LAYOUT & IMAGE LOADING
   - Computes stage size, loads images, and supports drag & drop.
   ========================================================================== */
/**
* Compute the maximum width/height the stage can use in the viewport,
* accounting for fixed side columns, padding, and vertical margins.
*
* Returns:
*   { maxWidth: number, maxHeight: number } - bounds for display size
*/
function getAvailableBounds() {
  const wrapperWidth = wrapper ? wrapper.clientWidth : window.innerWidth;
  const sideCols = 50 + 50, horizontalPadding = 24;
  const maxResponsiveWidth = Math.max(
    240,
    Math.min(wrapperWidth - sideCols - horizontalPadding, MAX_STAGE_WIDTH)
  );

  const verticalMargins = 160; // room above/below stage (header + HUD clearance)
  const maxResponsiveHeight = Math.max(
    200,
    Math.min(window.innerHeight - verticalMargins, TARGET_STAGE_HEIGHT)
  );

  return { maxWidth: maxResponsiveWidth, maxHeight: maxResponsiveHeight };
}

/**
 * Calculate the scaled display size for an image so it fits
 * within the available viewport bounds (as determined by getAvailableBounds())
 * while keeping the image's ascpect ratio.
 *
 * Params:
 *   imgW, imgH — the image’s natural width and height (in pixels)
 *
 * Returns:
 *   { w: number, h: number } — the computed display dimensions
 */
function computeDisplaySize(imgW, imgH) {
  const { maxWidth: vwMaxW, maxHeight: vwMaxH } = getAvailableBounds();
  const capW = Math.min(vwMaxW, AUTO_SIZE.MAX);
  const capH = Math.min(vwMaxH, AUTO_SIZE.MAX);
  const sMax = Math.min(capW / imgW, capH / imgH);
  return { w: Math.max(1, Math.round(imgW * sMax)), h: Math.max(1, Math.round(imgH * sMax)) };
}

/**
 * Apply responsive layout adjustments for the main stage image.
 *
 * - Computes a scaled display width
 * - Updates the CSS variable `--middle-col` and the stage element’s width
 *   to scale image and overlay
 * - Resizes the overlay to match the new display size.
 * - Repositions the HUD to maintain visual alignment relative to the stage.
 *
 * Returns: void
 */
function applyStageLayoutForImage() {
  if (!stageImg || !stageImg.naturalWidth || !stageImg.naturalHeight) return;
  const { w } = computeDisplaySize(stageImg.naturalWidth, stageImg.naturalHeight);
  document.documentElement.style.setProperty("--middle-col", `${w}px`);
  stage.style.width = `${w}px`;
  stage.style.height = "auto";
  sizeOverlayToDisplay();
  layoutHud();
}

/**
 * Cached data URL of the current image used for fold analysis.
 *
 * - May differ from the displayed stage image if flattening or preprocessing
 *   was required (adding a white background to transparent images).
 * - Ensures analysis routines always operate on a consistent, fully-loaded
 *   source without re-rendering to canvas each time.
 */
let _analysisSrc = null;

/**
 * Loads a new image into the stage and prepares it for analysis.
 *
 * Returns:
 *   A Promise that resolves when the image has fully loaded and analysis has been scheduled,
 *   or rejects if the image fails to load.
 *
 * @param {string} src - Image source URL or data URI to display and analyze.
 */
function setStageImage(src) {
  // Loads image into stage and prepares a consistent analysis source.
  return new Promise((resolve, reject) => {
    stageImg.onload = () => {
      applyStageLayoutForImage();
      _analysisSrc = imageHasTransparency(stageImg) ? flattenOnWhiteDataURL(stageImg) : src;
      scheduleAnalysis();
      resolve();
    };
    stageImg.onerror = reject;
    stageImg.src = src;
  });
}

// Start at a random image (fallback 0 when list empty)
let currentIndex = STAGE_IMAGES.length > 0 ? Math.floor(Math.random() * STAGE_IMAGES.length) : 0;

/**
 * Displays a specific image from the STAGE_IMAGES array by index.
 *
 * Returns:
 *   Promise<void> — resolves once the target image has finished loading.
 *
 * @param {number} i - Target image index
 */
async function showIndex(i) {
  // Displays the i-th stage image (wrap-around).
  if (!STAGE_IMAGES.length) return;
  currentIndex = (i + STAGE_IMAGES.length) % STAGE_IMAGES.length;
  await setStageImage(STAGE_IMAGES[currentIndex]);
}

/**
 * ------------------------------ Drag & Drop Image Loader ------------------------------
 * Enables users to drag an image file onto the window to load it into the stage.
 * Converts dropped image to a Data URL for immediate stage display and analysis.
 *
 * Behavior:
 * - showOverlay(on): Toggles the semi-transparent drop overlay for visual feedback.
 * - isFileImage(file): Checks that the dropped file is a valid image type.
 * - Global event listeners:
 *    • dragenter: show overlay
 *    • dragover:  allow drop (prevent default)
 *    • dragleave: hide overlay when leaving the document
 *    • drop:      load dropped image using FileReader to setStageImage()
 */
function showOverlay(on) { dropOverlay.classList.toggle("active", !!on); }
function isFileImage(file) { return /^image\//i.test(file.type || ""); }
window.addEventListener("dragenter", e => { e.preventDefault(); showOverlay(true); });
window.addEventListener("dragover", e => e.preventDefault());
window.addEventListener("dragleave", e => {
  if (e.target === document.documentElement || e.target === document.body) showOverlay(false);
});
window.addEventListener("drop", async e => {
  e.preventDefault();
  showOverlay(false);
  const file = e.dataTransfer?.files?.[0];
  if (!file || !isFileImage(file)) return;
  const reader = new FileReader();
  reader.onload = async () => { await setStageImage(reader.result); };
  reader.readAsDataURL(file);
});


/* ============================================================================
   5) SMART HUD PLACEMENT
   - Prefers 50px below the stage if it fits; else docks 50px above window bottom.
   - Caps HUD max-height so #hud-content can scroll.
   ========================================================================== */
function layoutHud() {
  if (!hud || !stage) return;

  const CLEAR_ABOVE_STAGE = 50;
  const CLEAR_WINDOW_BOTTOM = 50;

  const collapsed = hud.classList.contains("is-collapsed");
  const tabbarEl = document.getElementById("hud-tabbar");

  // Reset then measure
  hud.style.top = "auto";
  hud.style.bottom = "auto";
  hud.style.maxHeight = "";

  let hudH = 0;
  hudH = collapsed && tabbarEl ? Math.max(1, tabbarEl.offsetHeight || 0) : Math.max(1, hud.offsetHeight || 0);

  if (!hudH || hudH <= 0) {
    hud.style.top = "auto";
    hud.style.bottom = `${CLEAR_WINDOW_BOTTOM}px`;
    return;
  }

  const stageRect = stage.getBoundingClientRect();
  const desiredTop = Math.round(stageRect.bottom + CLEAR_ABOVE_STAGE);
  const vh = window.innerHeight;

  const fits = (desiredTop >= 0) && (desiredTop + hudH + CLEAR_WINDOW_BOTTOM <= vh);

  if (fits) {
    hud.style.top = `${desiredTop}px`;
    const available = Math.max(100, vh - desiredTop - CLEAR_WINDOW_BOTTOM);
    hud.style.maxHeight = `${available}px`;
  } else {
    hud.style.bottom = `${CLEAR_WINDOW_BOTTOM}px`;
    const available = Math.max(100, vh - CLEAR_WINDOW_BOTTOM * 2);
    hud.style.maxHeight = `${available}px`;
  }
}


/* ============================================================================
   6) HUD: COLLAPSE + A11Y TABS
   - ARIA roles, keyboard navigation, and panel activation.
   ========================================================================== */
tabbar.setAttribute("role", "tablist");
tabbar.setAttribute("aria-orientation", "horizontal");

const panels = tabs.map(t => document.getElementById(`hud-${t.dataset.tab}`) || null);

tabs.forEach((tab, i) => {
  const key = tab.dataset.tab;
  const tabId = tab.id || `tab-${key}`;
  const panel = panels[i];
  const panelId = panel ? (panel.id || `hud-${key}`) : `hud-${key}`;
  tab.id = tabId;
  tab.setAttribute("role", "tab");
  tab.setAttribute("aria-controls", panelId);
  if (panel) {
    panel.id = panelId;
    panel.setAttribute("role", "tabpanel");
    panel.setAttribute("aria-labelledby", tabId);
  }
});

function activateTab(idx, { focusTab = true } = {}) {
  // Shows one tab, hides others; updates ARIA; redraws preview if Output is active.
  tabs.forEach((tab, i) => {
    const selected = i === idx;
    tab.setAttribute("aria-selected", String(selected));
    tab.setAttribute("tabindex", selected ? "0" : "-1");
    tab.classList.toggle("active", selected);
    const panel = panels[i];
    if (panel) { panel.hidden = !selected; panel.classList.toggle("active", selected); }
  });
  if (focusTab) tabs[idx]?.focus();

  const panel = panels[idx];
  if (panel && panel.id === "hud-tThree") {
    requestAnimationFrame(() => drawFoldPreview());
  }
  // update HUD height when switching tabs
  layoutHud();
}

tabs.forEach((tab, i) => {
  tab.addEventListener("click", () => activateTab(i, { focusTab: true }));
  tab.addEventListener("keydown", (e) => {
    const current = tabs.indexOf(document.activeElement);
    if (current === -1) return;
    switch (e.key) {
      case "ArrowRight": e.preventDefault(); tabs[(current + 1) % tabs.length]?.focus(); break;
      case "ArrowLeft": e.preventDefault(); tabs[(current - 1 + tabs.length) % tabs.length]?.focus(); break;
      case "Home": e.preventDefault(); tabs[0]?.focus(); break;
      case "End": e.preventDefault(); tabs[tabs.length - 1]?.focus(); break;
      case "Enter":
      case " ": e.preventDefault(); activateTab(current, { focusTab: true }); break;
    }
  });
});

hudToggle.addEventListener("click", () => {
  // Collapses/expands HUD, then lays it out. Redraws Output if newly shown.
  const collapsed = hud.classList.toggle("is-collapsed");
  hudToggle.textContent = collapsed ? "+" : "−";
  hudToggle.setAttribute("aria-pressed", String(!collapsed));

  requestAnimationFrame(() => {
    if (!collapsed && panels.some(p => p && !p.hidden && p.id === "hud-tThree")) {
      drawFoldPreview();
    }
    layoutHud();
  });
});

activateTab(0, { focusTab: false }); // default active tab

/* ============================================================================
   7) APP STATE
   - params drives UI, analysis, preview, and export.
   ========================================================================== */
const params = {
  // Overlay on the stage image to make guides pop
  overlaySoftenAlpha: 0.3,

  // TAB ONE (book)
  bookTitle: "",
  bookPages: 150,
  bookPageWidthMM: 60,
  bookPageHeightMM: 80,
  bookEdgeFoldPos: 0.50,  // 0..1, from right/fore-edge toward left

  // TAB TWO (fold analysis)
  numDesiredSlices: 50,
  threshold: 0.25,        // 0..1 (luma)
  multiStrategy: "cycle", // first | cycle | pingpong | longest
  invertImage: false,

  // TAB THREE (fold outputs)
  totalFolds: 0,
  foldIndex: 1,           // 1-based among present folds
  pageTopFold: 0,         // current fold top Y (image px)
  pageBotFold: 0,         // current fold bottom Y (image px)

  // Output preview sizing
  previewMaxWidthPx: 380,

  // Export metadata
  projectLink: "https://yahirrendon.github.io/html/foldMe.html"
};


/* ============================================================================
   8) SCHEMA BINDING (DOM <-> params)
   - Initializes controls from params, wires events, and triggers work.
   ========================================================================== */
const schema = {
  // TAB ONE: book
  bookTitle: { el: "#bookTitle", type: "text" },
  bookPages: { el: "#bookPages", type: "number", clamp: [1, 100000] },
  bookPageWidthMM: { el: "#bookPageWidthMM", type: "number", clamp: [1, 100000] },
  bookPageHeightMM: { el: "#bookPageHeightMM", type: "number", clamp: [1, 100000] },
  bookEdgeFoldPos: { el: "#bookEdgeFoldPos", out: "#bookEdgeFoldPosValue", type: "range" },

  // TAB TWO: fold analysis
  numDesiredSlices: { el: "#numDesiredSlices", type: "number", clamp: [1, 100000] },
  threshold: { el: "#sliderThreshold", out: "#sliderThresholdValue", type: "range" },
  multiStrategy: { el: "#multiStrategy", type: "select" },
  invertImage: { el: "#btnInvertImage", type: "toggle" },
  useMaxSlices: { el: "#btnMaxSlice", type: "button" },

  // TAB THREE: outputs
  totalFolds: { el: "#totalFoldsDisplay", type: "display" },
  foldIndex: { el: "#foldIndexDisplay", type: "display" },
  pageTopFold: { el: "#pageTopFoldDisplay", type: "display" },
  pageBotFold: { el: "#pageBotFoldDisplay", type: "display" },

  // Actions
  _btnPrev: { el: "#btnPreviousFoldPage", type: "button" },
  _btnNext: { el: "#btnNextFoldPage", type: "button" },
  _btnExport: { el: "#btnExportPDF", type: "button" },
};

// Sets/writes ouput readouts
function setRangePct(el) {
  if (!el) return;
  const min = parseFloat(el.min || "0");
  const max = parseFloat(el.max || "100");
  const val = parseFloat(el.value);
  el.style.setProperty("--pct", `${((val - min) / (max - min)) * 100}%`);
}
function writeSuggestedStartPageDisplay(val) {
  const el = document.getElementById("sugStartPageDisplay") || document.getElementById("sugStartOageDisplay");
  if (el) el.textContent = String(val);
}
function writeCurrentFoldPageDisplay(val) {
  const el = document.getElementById("curFoldPageDisplay");
  if (el) el.textContent = String(val);
}
function writeDisplay(sel, val) {
  const el = document.querySelector(sel);
  if (el) el.textContent = String(val);
}

// Calculate a centered start page so the fold span sits near the book center.
function computeSuggestedStartPage() {
  const P = Math.max(1, params.bookPages | 0);
  const F = Math.max(0, params.totalFolds | 0);
  if (F <= 0) {
    params.suggestedStartPage = 1;
    writeSuggestedStartPageDisplay(1);
    updateCurrentFoldPage();
    return 1;
  }
  const maxStart = Math.max(1, P - F + 1);
  const centered = Math.floor((P - F) / 2) + 1; // 1-based
  const S = clamp(centered, 1, maxStart);
  params.suggestedStartPage = S;
  writeSuggestedStartPageDisplay(S);
  updateCurrentFoldPage();
  return S;
}

// Track the “physical” page in the book for the selected fold.
function updateCurrentFoldPage() {
  const Fidx = Math.max(1, params.foldIndex | 0);
  const S = Math.max(1, params.suggestedStartPage | 0);
  const P = Math.max(1, params.bookPages | 0);
  const page = clamp(S + (Fidx - 1), 1, P);
  params.currentFoldPage = page;
  writeCurrentFoldPageDisplay(page);
  return page;
}

/**
 * Global flag to prevent redundant frame requests.
 * _raf stores the ID of the currently pending requestAnimationFrame() call.
 * When _raf == 0, no redraw is queued.
 */
let _raf = 0;

/**
 * Performs a full visual redraw of the app.
 * 
 * Called whenever the display geometry changes (e.g. window resize,
 * orientation change, image loaded). It recalculates stage and HUD layout,
 * then redraws the overlay and fold preview to keep them aligned.
 */
function redrawAll() {
  applyStageLayoutForImage();
  layoutHud();
  if (_proc.result?.guide) {
    drawOverlay();
    drawFoldPreview();
  }
}

/**
 * Schedules a single redraw on the next animation frame.
 * 
 * - Prevents multiple redundant redraws within the same frame.
 * - Batches expensive layout and drawing operations together.
 * - Resets _raf to 0 after the frame has been rendered so new
 *   updates can be scheduled later.
 */
function requestRender() {
  if (_raf) return;           
  _raf = requestAnimationFrame(() => {
    _raf = 0;
    redrawAll();               
  });
}

/**
 * Wire up all HUD controls from a declarative `schema`.
 *
 * INIT
 * - For each etry set the control’s initial value from `params`.
 * - Update any paired readouts
 *
 * EVENTS
 * - update toggle, range, number, text, select, and button events
 *
 * - bath any UI sync by calling requestRender()
 */
function bindFromSchema() {
  // Initializes each control and wires updates from DOM to params.
  for (const [key, cfg] of Object.entries(schema)) {
    const el = document.querySelector(cfg.el);
    if (!el) continue;
    const out = cfg.out ? document.querySelector(cfg.out) : null;
    const paramName = cfg.param || key;
    const renderOut = raw => { if (out) out.textContent = String(raw); };

    // INIT from params
    switch (cfg.type) {
      case "toggle": {
        const on = !!params[paramName];
        el.setAttribute("aria-pressed", String(on));
        el.textContent = `${on ? "On" : "Off"}`;
        break;
      }
      case "range": {
        el.value = String(params[paramName]);
        setRangePct(el);
        if (paramName === "bookEdgeFoldPos") {
          const pct = Math.round((+el.value) * 100);
          if (out) out.textContent = `${pct}% from fore-edge`;
        } else {
          renderOut?.(el.value);
        }
        break;
      }
      case "number": el.value = String(params[paramName]); renderOut?.(el.value); break;
      case "text": el.value = String(params[paramName] ?? ""); break;
      case "select": el.value = String(params[paramName]); break;
      default: break;
    }

    // EVENTS to params
    switch (cfg.type) {
      case "toggle": {
        el.addEventListener("click", () => {
          const on = el.getAttribute("aria-pressed") !== "true";
          el.setAttribute("aria-pressed", String(on));
          el.textContent = `${on ? "On" : "Off"}`;
          params[paramName] = on;
          requestRender();
          if (paramName === "invertImage") scheduleAnalysis();
        });
        break;
      }
      case "range": {
        const update = () => {
          const raw = +el.value;
          params[paramName] = raw;
          if (paramName === "bookEdgeFoldPos") {
            const pct = Math.round(raw * 100);
            if (out) out.textContent = `${pct}% from fore-edge`;
            setRangePct(el);
            requestAnimationFrame(drawFoldPreview);
          } else if (paramName === "threshold") {
            renderOut?.(raw);
            setRangePct(el);
            requestRender();
            scheduleAnalysis();
          } else {
            renderOut?.(raw);
            setRangePct(el);
            requestRender();
          }
        };
        el.addEventListener("input", update);
        break;
      }
      case "number": {
        const update = () => {
          let raw = +el.value;
          if (cfg.clamp) raw = clamp(raw, cfg.clamp[0], cfg.clamp[1]);
          params[paramName] = raw;
          renderOut?.(raw);
          requestRender();

          // Dimension changes: refresh preview + readouts
          if (paramName === "bookPageWidthMM" || paramName === "bookPageHeightMM") {
            if (_proc.result?.guide) {
              writeFoldDisplays();
              requestAnimationFrame(drawFoldPreview);
            }
          }
          if (paramName === "numDesiredSlices") scheduleAnalysis();
          if (paramName === "bookPages") computeSuggestedStartPage();
        };
        el.addEventListener("input", update);
        el.addEventListener("change", update);
        break;
      }
      case "text": {
        const update = () => { params[paramName] = el.value; requestRender(); };
        el.addEventListener("input", update);
        el.addEventListener("change", update);
        break;
      }
      case "select": {
        const update = () => { params[paramName] = el.value; requestRender(); scheduleAnalysis(); };
        el.addEventListener("change", update);
        break;
      }
      case "button": {
        const id = el.id;
        if (id === "btnPreviousFoldPage") {
          el.addEventListener("click", () => updateFoldSelection(-1));
        } else if (id === "btnNextFoldPage") {
          el.addEventListener("click", () => updateFoldSelection(+1));
        } else if (id === "btnExportPDF") {
          el.addEventListener("click", async () => {
            try {
              await exportFoldGuidePDF_PagedBySegmentsJS({
                paper: "letter", marginMM: 10, spacingMM: 5, strokeMM: 1,
              });
            } catch (err) {
              console.error("PDF export failed:", err);
              alert("PDF export failed. See console for details.");
            }
          });
        } else if (id === "btnMaxSlice") {
          const statusEl = document.getElementById("btnMaxSliceStatus");
          const clearStatusLater = (ms = 2000) => {
            if (!statusEl) return;
            const t = setTimeout(() => { statusEl.textContent = "\xa0"; }, ms);
          };
          el.addEventListener("click", async () => {
            const originalText = el.textContent;
            el.classList.add("is-busy");
            el.textContent = "Fitting…";
            el.disabled = true;
            if (statusEl) statusEl.textContent = "\xa0";
            try {
              const applied = await autoFitDesiredSlicesSimpleJS({
                usePickOnly: true, includeEmptySlices: true,
              });
              if (statusEl) statusEl.textContent = `Now ${applied} slices`;
              clearStatusLater(2000);
            } catch (err) {
              console.error("Auto-fit slices failed:", err);
              if (statusEl) statusEl.textContent = "Failed to fit slices";
              clearStatusLater(3000);
            } finally {
              el.textContent = originalText;
              el.classList.remove("is-busy");
              el.disabled = false;
            }
          });
        }
        break;
      }
      default: break;
    }
  }

  requestRender();
  if (stageImg && stageImg.naturalWidth) scheduleAnalysis();
}


/* ============================================================================
   9) STAGE OVERLAY GUIDES
   - Canvas over the image for soft white wash and segment/column lines.
   ========================================================================== */
const _overlay = { canvas: null, ctx: null, dpr: Math.max(1, window.devicePixelRatio || 1), w: 0, h: 0 };

/**
 * Ensures that an overlay canvas exists above the main stage image.
 *
 * Returns:
 *   {HTMLCanvasElement} The overlay canvas element.
 */
function ensureOverlayCanvas() {
  if (_overlay.canvas) return _overlay.canvas;
  const c = document.createElement("canvas");
  c.style.position = "absolute";
  c.style.left = "0";
  c.style.top = "0";
  c.style.pointerEvents = "none";
  c.style.zIndex = "2";
  stage.appendChild(c);
  _overlay.canvas = c;
  _overlay.ctx = c.getContext("2d");
  return c;
}

/**
 * Resizes the overlay canvas to match the currently displayed stage image.
 */
function sizeOverlayToDisplay() {
  if (!stageImg || !stageImg.naturalWidth || !stageImg.naturalHeight) return;
  ensureOverlayCanvas();
  const { w, h } = computeDisplaySize(stageImg.naturalWidth, stageImg.naturalHeight);
  _overlay.w = w; _overlay.h = h;
  const dpr = _overlay.dpr;
  _overlay.canvas.style.width = w + "px";
  _overlay.canvas.style.height = h + "px";
  _overlay.canvas.width = Math.max(1, Math.round(w * dpr));
  _overlay.canvas.height = Math.max(1, Math.round(h * dpr));
  const ctx = _overlay.ctx;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  ctx.clearRect(0, 0, w, h);
}

/**
 * draw the overlay with the desired stylings
 */
function drawOverlay() {
  // Soft wash + light columns + chosen fold segments (verticals)
  const G = _proc.result?.guide;
  if (!G) return;
  ensureOverlayCanvas();
  sizeOverlayToDisplay();

  const ctx = _overlay.ctx;
  const Wn = G.width, Hn = G.height;
  const Wd = _overlay.w, Hd = _overlay.h;
  const sx = Wd / Wn, sy = Hd / Hn;

  // Soft white wash (draw first, then strokes on top)
  const alpha = (typeof params?.overlaySoftenAlpha === "number")
    ? Math.max(0, Math.min(1, params.overlaySoftenAlpha))
    : 0.28;
  if (alpha > 0) {
    ctx.save();
    ctx.globalCompositeOperation = "source-over";
    ctx.fillStyle = `rgba(255,255,255,${alpha})`;
    ctx.fillRect(0, 0, Wd, Hd);
    ctx.restore();
  }

  // Column separators
  ctx.save();
  ctx.beginPath();
  const sliceWn = Wn / G.slices;
  for (let i = 1; i < G.slices; i++) {
    const x = Math.round(i * sliceWn * sx) + 0.5;
    ctx.moveTo(x, 0);
    ctx.lineTo(x, Hd);
  }
  ctx.strokeStyle = "rgba(0,0,0,0.1)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Chosen segments as vertical lines
  ctx.strokeStyle = "rgba(196, 201, 207, 1)";
  ctx.lineCap = "round";
  ctx.lineWidth = 2;
  for (const s of G.spans) {
    if (s.y0 == null) continue;
    const xd = Math.round(s.x * sx) + 0.5;
    const y0 = Math.round(s.y0 * sy) + 0.5;
    const y1 = Math.round((s.y1 + 1) * sy) + 0.5;
    ctx.beginPath();
    ctx.moveTo(xd, y0);
    ctx.lineTo(xd, y1);
    ctx.stroke();
  }
  ctx.restore();
}


/* ============================================================================
   10) IMAGE HELPERS
   - Detect transparency and create a white-flattened data URL for analysis.
   ========================================================================== */

/**
 * Checks whether an image contains any transparent pixels.
 *
 * @param {HTMLImageElement} img - The image to check for transparency.
 * @param {number} [sampleStep=4] - Sampling interval for faster checks.
 * @returns {boolean} True if transparency is detected, otherwise false.
 */
function imageHasTransparency(img, sampleStep = 4) {
  const w = img.naturalWidth, h = img.naturalHeight;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, w, h);
  const { data } = ctx.getImageData(0, 0, w, h);
  for (let i = 3; i < data.length; i += 4 * sampleStep) {
    if (data[i] < 255) return true;
  }
  return false;
}

/**
 * Flattens an image with transparency onto a solid white background.
 *
 * @param {HTMLImageElement} img - The image to flatten.
 * @returns {string} A data URL representing the flattened image.
 */
function flattenOnWhiteDataURL(img) {
  const w = img.naturalWidth, h = img.naturalHeight;
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#fff";
  ctx.fillRect(0, 0, w, h);
  ctx.drawImage(img, 0, 0, w, h);
  return c.toDataURL("image/png");
}


/* ============================================================================
   11) ANALYZE
   - Performs luma threshold, builds per-slice segments, picks fold per strategy,
     then updates readouts + overlay + preview.
   ========================================================================== */

/**
* Processing workspace used for image analysis. This is hidden and offscreen 
* but stores guide, width, and height into _proc.result
*
*/
const _proc = {
  canvas: document.createElement("canvas"),
  ctx: null,
  result: { guide: null, width: 0, height: 0 }, // latest analysis result
};
_proc.ctx = _proc.canvas.getContext("2d", { willReadFrequently: true });

//Schedules the image analysis process asynchronously.
function scheduleAnalysis() { Promise.resolve().then(analyzeImageAndUpdate); }

/**
 * Performs pixel-level analysis of the current stage image to identify fold segments.
 * Serving as the core analytical routine that translates an input image
 * into usable fold measurements for visualization and PDF export.
 */
function analyzeImageAndUpdate() {
  if (!_analysisSrc) return;

  const img = new Image();
  img.onload = () => {
    const width = img.naturalWidth, height = img.naturalHeight;

    _proc.canvas.width = width;
    _proc.canvas.height = height;
    _proc.ctx.drawImage(img, 0, 0, width, height);
    const imgData = _proc.ctx.getImageData(0, 0, width, height);
    const data = imgData.data; // RGBA

    const lumaAt = (x, y) => {
      const idx = (y * width + x) * 4;
      const r = data[idx], g = data[idx + 1], b = data[idx + 2];
      return (0.299 * r + 0.587 * g + 0.114 * b);
    };

    const slices = Math.max(1, Math.min(params.numDesiredSlices | 0 || 1, width));
    const colW = width / slices;
    const threshold255 = Math.round(clamp(params.threshold, 0, 1) * 255);
    const minLen = Math.max(1, Math.round(height * 0.004)); // suppress tiny noise

    let cycleIndex = 0, ping = 0, pingDir = 1;
    const spans = [];

    for (let s = 0; s < slices; s++) {
      const x = Math.floor((s + 0.5) * colW);

      const segs = [];
      let inRun = false, y0 = 0;

      for (let y = 0; y < height; y++) {
        const L = lumaAt(x, y);
        const solid = params.invertImage
          ? (L >= (255 - threshold255))  // inverted: bright counts as ink
          : (L <= threshold255);         // normal: dark counts as ink

        if (solid) {
          if (!inRun) { inRun = true; y0 = y; }
        } else if (inRun) {
          const y1 = y - 1;
          if ((y1 - y0 + 1) >= minLen) segs.push([y0, y1]);
          inRun = false;
        }
      }
      if (inRun) { const y1 = height - 1; if ((y1 - y0 + 1) >= minLen) segs.push([y0, y1]); }

      let chosen;
      if (segs.length === 0) {
        chosen = [null, null];
      } else if (segs.length === 1) {
        chosen = segs[0];
        cycleIndex = 0; ping = 0; pingDir = 1;
      } else {
        switch (params.multiStrategy) {
          case "cycle": chosen = segs[cycleIndex % segs.length]; cycleIndex++; break;
          case "pingpong": {
            if (ping < 0) ping = 0;
            if (ping >= segs.length) ping = segs.length - 1;
            chosen = segs[ping];
            if (segs.length > 1) {
              ping += pingDir;
              if (ping >= segs.length) { ping = segs.length - 2; pingDir = -1; }
              else if (ping < 0) { ping = 1; pingDir = 1; }
            } else { ping = 0; pingDir = 1; }
            break;
          }
          case "longest": chosen = segs.reduce((a, b) => ((b[1] - b[0]) > (a[1] - a[0]) ? b : a)); break;
          case "first":
          default: chosen = segs[0]; break;
        }
      }

      spans.push({ x, y0: chosen[0], y1: chosen[1] });
    }

    _proc.result = { ..._proc.result, width, height, guide: { slices, width, height, spans } };

    const total = spans.reduce((acc, s) => acc + (s.y0 == null ? 0 : 1), 0);
    params.totalFolds = total;
    writeDisplay("#totalFoldsDisplay", total);

    const present = spans.filter(s => s.y0 != null);
    params.foldIndex = clamp(params.foldIndex, 1, Math.max(1, present.length));
    writeDisplay("#foldIndexDisplay", params.foldIndex);

    const cur = present[params.foldIndex - 1] || null;
    params.pageTopFold = cur ? cur.y0 : 0;
    params.pageBotFold = cur ? cur.y1 : 0;

    computeSuggestedStartPage();
    writeFoldDisplays();

    requestRender();
    drawOverlay();
    drawFoldPreview();
  };
  img.src = _analysisSrc;
}


/* ============================================================================
   12) AUTO-FIT SLICES
   - Probes different slice counts to approximate bookPages across the span.
   ========================================================================== */

/**
* Retrieves raw pixel data (RGBA) from the current analysis source image
* providing a reusable way to access the full pixel data without re-running 
* the full analysis routine.
*/
async function getAnalysisImageData() {
  return new Promise(resolve => {
    const img = new Image();
    img.onload = () => {
      const width = img.naturalWidth, height = img.naturalHeight;
      _proc.canvas.width = width; _proc.canvas.height = height;
      _proc.ctx.drawImage(img, 0, 0, width, height);
      const imgData = _proc.ctx.getImageData(0, 0, width, height);
      resolve({ width, height, data: imgData.data });
    };
    img.src = _analysisSrc;
  });
}

/**
  * Scans an image vertically across multiple slices to detect foldable dark (or bright) segments.
 *
 * @param {Object} image - The image data object containing:
 *   @param {number} image.width  - Image width in pixels.
 *   @param {number} image.height - Image height in pixels.
 *   @param {Uint8ClampedArray} image.data - RGBA pixel data from getImageData().
 *
 * @param {number} s - Desired number of vertical slices (columns) to analyze.
 * @param {number} threshold255 - Brightness threshold (0–255) that determines what counts as “ink.”
 * @param {boolean} invert - Whether to treat bright pixels as ink instead of dark ones.
 * @param {string} strategy - Segment selection strategy when multiple folds exist in one slice:
 *   - `"first"`    Selects the first detected segment.
 *   - `"cycle"`    Cycles sequentially through segments across slices.
 *   - `"pingpong"` Bounces back and forth between segments.
 *   - `"longest"`  Chooses the longest detected segment.
 *
 * @returns {Object} An object describing the analyzed slice spans:
 *   @property {Array<Object>} spans - Array of { x, y0, y1 } representing fold segment positions per slice.
 *   @property {number[]} segCounts - Array with the number of segments detected per slice.
 *   @property {number} slices - The actual number of slices analyzed (bounded to image width).
 */
function computeSpansAtSlices(image, s, threshold255, invert, strategy) {
  const { width, height, data } = image;
  const lumaAt = (x, y) => {
    const idx = (y * width + x) * 4;
    const r = data[idx], g = data[idx + 1], b = data[idx + 2];
    return (0.299 * r + 0.587 * g + 0.114 * b);
  };
  const slices = Math.max(1, Math.min(s | 0 || 1, width));
  const colW = width / slices;
  const minLen = Math.max(1, Math.round(height * 0.004));
  let cycleIndex = 0, ping = 0, pingDir = 1;
  const spans = [];
  const segCounts = new Array(slices).fill(0);

  for (let i = 0; i < slices; i++) {
    const x = Math.floor((i + 0.5) * colW);
    const segs = [];
    let inRun = false, y0 = 0;

    for (let y = 0; y < height; y++) {
      const L = lumaAt(x, y);
      const solid = invert ? (L >= (255 - threshold255)) : (L <= threshold255);
      if (solid) { if (!inRun) { inRun = true; y0 = y; } }
      else if (inRun) {
        const y1 = y - 1;
        if ((y1 - y0 + 1) >= minLen) segs.push([y0, y1]);
        inRun = false;
      }
    }
    if (inRun) { const y1 = height - 1; if ((y1 - y0 + 1) >= minLen) segs.push([y0, y1]); }

    segCounts[i] = segs.length;

    let chosen;
    if (segs.length === 0) chosen = [null, null];
    else if (segs.length === 1) { chosen = segs[0]; cycleIndex = 0; ping = 0; pingDir = 1; }
    else {
      switch (strategy) {
        case "cycle": chosen = segs[cycleIndex % segs.length]; cycleIndex++; break;
        case "pingpong": {
          if (ping < 0) ping = 0;
          if (ping >= segs.length) ping = segs.length - 1;
          chosen = segs[ping];
          if (segs.length > 1) {
            ping += pingDir;
            if (ping >= segs.length) { ping = segs.length - 2; pingDir = -1; }
            else if (ping < 0) { ping = 1; pingDir = 1; }
          } else { ping = 0; pingDir = 1; }
          break;
        }
        case "longest": chosen = segs.reduce((a, b) => ((b[1] - b[0]) > (a[1] - a[0]) ? b : a)); break;
        case "first":
        default: chosen = segs[0]; break;
      }
    }
    spans.push({ x, y0: chosen[0], y1: chosen[1] });
  }

  return { spans, segCounts, slices };
}

/**
 * Computes the "effective" number of foldable slices based on detected spans.
 *
 * @param {Array<Object>} spans - Array of span objects ({ y0, y1 }) representing
 *   the detected fold positions for each slice. A `null` y0 means no fold detected.
 *
 * @param {number[]} segCounts - Array of the number of detected segments per slice.
 *
 * @param {Object} options - Configuration flags for how to count folds.
 * @param {boolean} options.includeEmptySlices - If true, counts the full span from
 *   the first to last detected fold (including slices without folds inside).
 * @param {boolean} options.usePickOnly - If true, counts only slices where a fold
 *   was *chosen* (based on segment picking logic), otherwise counts all slices
 *   that have any detected segments.
 *
 * @returns {number} The total number of effective folds within the detected span.
 */
function effectiveFoldCount(spans, segCounts, { includeEmptySlices, usePickOnly }) {
  const present = (usePickOnly ? spans.map(s => s.y0 != null) : segCounts.map(c => c > 0));
  const first = present.indexOf(true);
  if (first === -1) return 0;
  const last = present.lastIndexOf(true);
  if (includeEmptySlices) return last - first + 1;
  let n = 0; for (let i = first; i <= last; i++) if (present[i]) n++;
  return n;
}

/**
 * Iteratively adjusts the number of desired slices so the effective fold count
 * approximates the total number of foldable book pages.
 *
 * @async
 * @param {Object} [options={}] - Configuration options.
 * @param {boolean} [options.usePickOnly=true] - Whether to count only slices with a chosen/picked fold
 *   (based on current segment selection strategy). If false, counts any detected segment.
 * @param {boolean} [options.includeEmptySlices=true] - Whether to count empty slices inside the
 *   detected fold span (includes gaps between the first and last detected folds).
 *
 * @returns {Promise<number>} The adjusted number of slices (numDesiredSlices) applied to the model.
 */
async function autoFitDesiredSlicesSimpleJS({ usePickOnly = true, includeEmptySlices = true } = {}) {
  if (!_analysisSrc) return;
  const img = await getAnalysisImageData();
  const width = img.width;
  const target = Math.max(1, params.bookPages | 0 || 1);
  let s = Math.max(1, Math.min(params.bookPages | 0 || 1, width));
  const threshold255 = Math.round(clamp(params.threshold, 0, 1) * 255);
  const invert = !!params.invertImage;
  const strategy = params.multiStrategy;

  for (let iter = 0; iter < 8; iter++) {
    const { spans, segCounts } = computeSpansAtSlices(img, s, threshold255, invert, strategy);
    const eff = effectiveFoldCount(spans, segCounts, { includeEmptySlices, usePickOnly });

    if (eff === target) {
      params.numDesiredSlices = s;
      const input = document.querySelector("#numDesiredSlices");
      if (input) input.value = String(s);
      scheduleAnalysis();
      return s;
    }
    if (eff === 0) {
      const newS = Math.min(width, Math.max(s + 1, s * 2));
      if (newS === s) break;
      s = newS; continue;
    }
    if (eff > target) {
      let newS = Math.max(1, Math.floor((s * target) / eff));
      if (newS === s) newS = Math.max(1, s - 1);
      s = newS;
    } else {
      let newS = Math.min(width, Math.max(s + 1, Math.floor((s * target) / Math.max(1, eff))));
      if (newS === s) newS = Math.min(width, s + 1);
      s = newS;
    }
  }
  params.numDesiredSlices = s;
  const input = document.querySelector("#numDesiredSlices");
  if (input) input.value = String(s);
  scheduleAnalysis();
  return s;
}


/* ============================================================================
   13) OUTPUT PREVIEW
   - Right-half canvas: page polygon (6 points), two flaps, and mm labels.
   ========================================================================== */
/**
* Global state object for the fold preview canvas and its rendering context.
*
* @property {HTMLElement|null} el - The container element for the output visualization.
* @property {HTMLCanvasElement|null} canvas - The canvas used to draw the fold preview.
* @property {CanvasRenderingContext2D|null} ctx - The 2D rendering context of the canvas.
* @property {number} dpr - Device pixel ratio (for HiDPI / Retina displays).
* @property {number} w - Current display width of the canvas (in CSS pixels).
* @property {number} h - Current display height of the canvas (in CSS pixels).
*/
const _out = { el: null, canvas: null, ctx: null, dpr: Math.max(1, window.devicePixelRatio || 1), w: 0, h: 0 };
// track resize foo the preview container
let _outObserver = null;

// Ensures the two mm labels have a minimum vertical gap.
function separateLabels(yA, yB, minY, maxY, minGap) {

  let a = yA, b = yB;
  if (Math.abs(b - a) >= minGap) return [a, b];
  const mid = (a + b) / 2;
  a = Math.max(minY, mid - minGap / 2);
  b = Math.min(maxY, mid + minGap / 2);
  if (b - a < minGap) {
    if (a <= minY) b = Math.min(maxY, a + minGap);
    else if (b >= maxY) a = Math.max(minY, b - minGap);
  }
  return [a, b];
}

/**
 * Ensures that the fold preview canvas exists and is ready for drawing.
 *
 * @returns {HTMLCanvasElement|null} The existing or newly created canvas element.
 */
function ensureOutputCanvas() {
  if (!_out.el) _out.el = document.querySelector(".output-right");
  if (!_out.el) return null;
  if (_out.canvas) return _out.canvas;
  const c = document.createElement("canvas");
  c.style.width = "100%";
  c.style.height = "100%";
  c.style.display = "block";
  _out.el.appendChild(c);
  _out.canvas = c;
  _out.ctx = c.getContext("2d");
  return c;
}

/**
 * Resizes the output preview canvas to match its container element (.output-right).
 * Applies device-pixel-ratio scaling for crisp rendering on high-DPI displays.
 */
function sizeOutputCanvas() {
  if (!_out.el) _out.el = document.querySelector(".output-right");
  if (!_out.el) return;
  ensureOutputCanvas();
  const rect = _out.el.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;
  _out.w = Math.max(1, Math.floor(rect.width));
  _out.h = Math.max(1, Math.floor(rect.height));
  const dpr = _out.dpr;
  _out.canvas.width = Math.max(1, Math.round(_out.w * dpr));
  _out.canvas.height = Math.max(1, Math.round(_out.h * dpr));
  _out.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}

/**
 * Watches for resize events on the output panel and triggers redraws.
 */
function watchOutputPanel() {
  if (_outObserver || !_out.el) return;
  _outObserver = new ResizeObserver(() => {
    if (_proc.result?.guide) drawFoldPreview();
  });
  _outObserver.observe(_out.el);
}

/**
 * Reflects a point P across a line segment AB.
 * @param {{x:number, y:number}} P - The point to reflect.
 * @param {{x:number, y:number}} A - Line segment start.
 * @param {{x:number, y:number}} B - Line segment end.
 * @returns {{x:number, y:number}} The mirrored point of P across line AB.
 */
function reflectPointAcrossLine(P, A, B) {
  if (Math.hypot(B.x - A.x, B.y - A.y) < 1e-6) return { x: P.x, y: P.y };
  const APx = P.x - A.x, APy = P.y - A.y;
  const ABx = B.x - A.x, ABy = B.y - A.y;
  const ab2 = ABx * ABx + ABy * ABy;
  const t = (APx * ABx + APy * ABy) / ab2;
  const H = { x: A.x + t * ABx, y: A.y + t * ABy };
  return { x: 2 * H.x - P.x, y: 2 * H.y - P.y };
}

/**
 * Draws a triangular fold "flap" between line AB and its reflected corner.
 * @param {CanvasRenderingContext2D} ctx - Canvas drawing context.
 * @param {{x:number,y:number}} A - Start point of the fold line.
 * @param {{x:number,y:number}} B - End point of the fold line.
 * @param {{x:number,y:number}} corner - The external corner point to reflect.
 * @param {string} fillStyle - The fill color or pattern for the flap.
 */
function drawFoldFlap(ctx, A, B, corner, fillStyle) {
  const cornerPrime = reflectPointAcrossLine(corner, A, B);
  ctx.beginPath();
  ctx.moveTo(A.x, A.y);
  ctx.lineTo(B.x, B.y);
  ctx.lineTo(cornerPrime.x, cornerPrime.y);
  ctx.closePath();
  ctx.fillStyle = fillStyle; ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.6)"; ctx.lineWidth = 1; ctx.stroke();
}

/**
 * Converts a vertical pixel coordinate (in image space) to millimeters
 * relative to the actual page height.
 * @param {number} px - Y-coordinate in image pixels.
 * @returns {number} Equivalent position in millimeters.
 */
function foldPxToMM(px) {
  // Converts an image-space Y pixel into mm on the physical page.
  const imgH = Math.max(1, _proc.result?.height || 1);
  const pageHmm = Math.max(1, +params.bookPageHeightMM || 1);
  return (clamp(px, 0, imgH) / imgH) * pageHmm;
}

/**
 * Updates the numeric fold position readouts in the HUD.
 * Converts current fold pixel positions into millimeters and writes
 * them into the corresponding display elements.
 */
function writeFoldDisplays() {
  // Left-side readouts (mm only)
  const topPx = params.pageTopFold ?? 0;
  const botPx = params.pageBotFold ?? 0;
  const topMM = Math.round(foldPxToMM(topPx));
  const botMM = Math.round(foldPxToMM(botPx));
  writeDisplay("#pageTopFoldDisplay", `${topMM}`);
  writeDisplay("#pageBotFoldDisplay", `${botMM}`);
}

/**
 * Calculates the scaled preview size for a page so it fits within
 * the output preview panel while respecting its aspect ratio.
 *
 * @param {number} W - Panel width (pixels).
 * @param {number} H - Panel height (pixels).
 * @param {number} pageWmm - Page width in mm.
 * @param {number} pageHmm - Page height in mm.
 * @param {number} maxPreviewW - Maximum allowed preview width.
 * @returns {{pageW:number, pageH:number}} Scaled preview dimensions.
 */
function fitPagePreview(W, H, pageWmm, pageHmm, maxPreviewW) {
  // Fits a page of aspect (Wmm/Hmm) into panel W×H with a width cap.
  const aspect = pageWmm / pageHmm;
  let pageW = Math.min(W, maxPreviewW);
  let pageH = pageW / aspect;
  if (pageH > H) { pageH = H; pageW = pageH * aspect; }
  return { pageW, pageH };
}

/**
 * Renders the fold preview in the Output panel (right side).
 *
 * Draws:
 *  - A 6-point page polygon (with folded corners excluded from the main shape)
 *  - Two triangular “flaps” representing top/bottom corner folds
 *  - A caption (current fold / total)
 *  - Millimeter labels for top/bottom fold positions with dotted leader lines
 *    and simple overlap avoidance
 */
function drawFoldPreview() {
  // Draws the right-half visual: page polygon, two flaps, and mm labels/leaders.
  if (!_out.el) _out.el = document.querySelector(".output-right");
  if (!_out.el) return;

  ensureOutputCanvas();
  sizeOutputCanvas();
  watchOutputPanel();

  const ctx = _out.ctx;
  const W = _out.w, H = _out.h;
  ctx.clearRect(0, 0, W, H);

  const G = _proc.result?.guide;
  if (!G) {
    ctx.fillStyle = "rgba(0,0,0,0.4)";
    ctx.font = "14px Poppins, sans-serif";
    ctx.fillText("Load an image to preview folds…", 12, 24);
    return;
  }

  // Inner drawing area
  const M = 20;
  const innerW = Math.max(10, W - M * 2);
  const innerH = Math.max(10, H - M * 2);

  // Physical page size (mm) and preview px
  const pageWmm = Math.max(1, +params.bookPageWidthMM || 100);
  const pageHmm = Math.max(1, +params.bookPageHeightMM || 200);
  const { pageW, pageH } = fitPagePreview(innerW, innerH, pageWmm, pageHmm, Math.max(120, params.previewMaxWidthPx || 380));

  // Page placement
  const px = M + (innerW - pageW) * 0.5;
  const py = M + (innerH - pageH) * 0.5;
  const xr = px + pageW;

  // Current fold positions → % → page Y
  const imgH = Math.max(1, _proc.result.height || 1);
  const topYpx = params.pageTopFold ?? 0;
  const botYpx = params.pageBotFold ?? 0;
  const topPct = clamp(topYpx / imgH, 0, 1);
  const botPct = clamp(botYpx / imgH, 0, 1);
  const yTop = clamp(py + topPct * pageH, py, py + pageH);
  const yBot = clamp(py + botPct * pageH, py, py + pageH);

  // Fold edge anchor from slider (0..1 from right/fore-edge toward left)
  const pctFromFore = Math.max(0, Math.min(1, +params.bookEdgeFoldPos || 0));
  const xFoldEdge = (px + pageW) - (pctFromFore * pageW);

  // 6-point page polygon (excludes corner triangles)
  const TL = { x: px, y: py };
  const TEF = { x: xFoldEdge, y: py };
  const TSP = { x: xr, y: yTop };
  const BSP = { x: xr, y: yBot };
  const BEF = { x: xFoldEdge, y: py + pageH };
  const BL = { x: px, y: py + pageH };

  ctx.beginPath();
  ctx.moveTo(TL.x, TL.y);
  ctx.lineTo(TEF.x, TEF.y);
  ctx.lineTo(TSP.x, TSP.y);
  ctx.lineTo(BSP.x, BSP.y);
  ctx.lineTo(BEF.x, BEF.y);
  ctx.lineTo(BL.x, BL.y);
  ctx.closePath();
  ctx.fillStyle = "#c4c9cf";
  ctx.fill();
  ctx.strokeStyle = "rgba(0,0,0,0.6)";
  ctx.lineWidth = 1;
  ctx.stroke();

  // Flaps (folded corners)
  const A_top = { x: xr, y: yTop }, B_top = { x: xFoldEdge, y: py }, C_top = { x: xr, y: py };
  const A_bot = { x: xr, y: yBot }, B_bot = { x: xFoldEdge, y: py + pageH }, D_bot = { x: xr, y: py + pageH };
  drawFoldFlap(ctx, A_top, B_top, C_top, "#8e9ca5");
  drawFoldFlap(ctx, A_bot, B_bot, D_bot, "#8e9ca5");

  // Caption
  ctx.fillStyle = "#111"; ctx.font = "12px Poppins, sans-serif";
  ctx.fillText(`Fold ${params.foldIndex} / ${params.totalFolds}`, px, py - 8);

  // mm labels with overlap avoidance and dotted leaders
  const topMM = Math.round(topPct * pageHmm);
  const botMM = Math.round(botPct * pageHmm);
  const MIN_LABEL_GAP_PX = 16;

  const [yTopLabel, yBotLabel] = separateLabels(yTop, yBot, py, py + pageH, MIN_LABEL_GAP_PX);

  function drawLeader(fromY, toY) {
    if (Math.abs(fromY - toY) < 1) return;
    ctx.save();
    ctx.setLineDash([3, 3]);
    ctx.strokeStyle = "rgba(0,0,0,0.5)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(px + pageW + 4, fromY);
    ctx.lineTo(px + pageW + 8, toY);
    ctx.stroke();
    ctx.restore();
  }
  drawLeader(yTop, yTopLabel);
  drawLeader(yBot, yBotLabel);

  ctx.fillText(`${topMM}mm`, px + pageW + 8, yTopLabel + 4);
  ctx.fillText(`${botMM}mm`, px + pageW + 8, yBotLabel + 4);
}

/**
 * Steps the current fold selection forward/backward and refreshes the preview.
 *
 * @param {number} delta - +1 to go to the next fold, -1 for the previous fold.
 */
function updateFoldSelection(delta) {
  // Moves to previous/next present fold and updates readouts + preview.
  const G = _proc.result?.guide;
  if (!G) return;
  const present = G.spans.filter(s => s.y0 != null);
  if (!present.length) return;

  params.foldIndex = clamp((params.foldIndex | 0) + delta, 1, present.length);
  writeDisplay("#foldIndexDisplay", params.foldIndex);

  const cur = present[params.foldIndex - 1];
  params.pageTopFold = cur.y0 ?? 0;
  params.pageBotFold = cur.y1 ?? 0;

  updateCurrentFoldPage();
  writeFoldDisplays();
  drawFoldPreview();
}


/* ============================================================================
   14) PDF EXPORT
   - Multi-page fold guide; packs vertical lines with fixed spacing; QR on p1.
   ========================================================================== */
/**
* Dynamically loads the jsPDF library (UMD build) if it isn’t already available.
*
* @returns {Promise<typeof jsPDF>} Resolves with the jsPDF constructor once loaded.
*/
async function loadJsPDF() {
  if (window.jspdf?.jsPDF) return window.jspdf.jsPDF;
  await import("https://cdn.jsdelivr.net/npm/jspdf@2.5.1/dist/jspdf.umd.min.js");
  if (!window.jspdf?.jsPDF) throw new Error("jsPDF failed to load");
  return window.jspdf.jsPDF;
}

/**
 * Generates a QR code image as a data URL (PNG).
 *
 * @param {string} text - The text or URL to encode in the QR code.
 * @param {number} [sizePx=256] - Target QR image size in pixels.
 * @returns {Promise<string>} A base64 PNG data URL representing the QR code.
 */
async function makeQrDataUrl(text, sizePx = 256) {
  if (typeof window.qrcode !== "function") {
    await new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = "https://cdnjs.cloudflare.com/ajax/libs/qrcode-generator/1.4.4/qrcode.min.js";
      s.async = true;
      s.onload = () => (typeof window.qrcode === "function" ? resolve() : reject(new Error("qrcode missing")));
      s.onerror = () => reject(new Error("Failed to load qrcode-generator"));
      document.head.appendChild(s);
    });
  }
  const qr = window.qrcode(0, "M");
  qr.addData(String(text || "")); qr.make();

  const modules = qr.getModuleCount();
  const cellSize = Math.max(1, Math.floor(sizePx / modules));
  const size = cellSize * modules;

  const c = document.createElement("canvas");
  c.width = c.height = size;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#fff"; ctx.fillRect(0, 0, size, size);
  ctx.fillStyle = "#000";
  for (let r = 0; r < modules; r++) {
    for (let col = 0; col < modules; col++) {
      if (qr.isDark(r, col)) ctx.fillRect(col * cellSize, r * cellSize, cellSize, cellSize);
    }
  }
  return c.toDataURL("image/png");
}

/**
 * Exports the current fold analysis as a multi-page PDF guide.
 *
 * @param {Object} [options={}] - Export configuration.
 * @param {"a4"|"letter"} [options.paper="a4"] - Paper size in millimeters.
 * @param {number} [options.marginMM=10] - Margin around content in mm.
 * @param {number} [options.spacingMM=5] - Spacing between fold lines in mm.
 * @param {number} [options.strokeMM=1] - Stroke width for fold lines in mm.
 * @returns {Promise<void>} Saves the generated PDF directly to the user’s device.
 */
async function exportFoldGuidePDF_PagedBySegmentsJS({
  paper = "a4",
  marginMM = 10,
  spacingMM = 5,
  strokeMM = 1,
} = {}) {
  const jsPDF = await loadJsPDF();

  const guide = _proc.result?.guide;
  if (!guide) { alert("Please analyze an image first."); return; }

  const firstIdx0 = guide.spans.findIndex(s => s.y0 != null);
  const lastIdx0 = [...guide.spans].reverse().findIndex(s => s.y0 != null);
  const lastReal = (lastIdx0 === -1) ? -1 : (guide.spans.length - 1 - lastIdx0);
  if (firstIdx0 < 0 || lastReal < firstIdx0) { alert("No folds present at the current settings."); return; }

  const N = (lastReal - firstIdx0) + 1;
  if (N <= 0) { alert("Empty span."); return; }

  const bandH_mm = Math.max(1, +params.bookPageHeightMM || 1);

  const paperSize = (p) => (String(p).toLowerCase() === "letter")
    ? { w: 215.9, h: 279.4 }
    : { w: 210, h: 297 };

  let { w: baseW, h: baseH } = paperSize(paper);

  let pageW = baseW, pageH = baseH, orientation = "portrait";
  const margin = Math.max(0, marginMM);
  const usableW_portrait = pageW - 2 * margin;
  const usableH_portrait = pageH - 2 * margin;
  if (bandH_mm > usableH_portrait) {
    const lw = baseH, lh = baseW; // try landscape
    const usableW_land = lw - 2 * margin, usableH_land = lh - 2 * margin;
    if (bandH_mm <= usableH_land) {
      pageW = lw; pageH = lh; orientation = "landscape";
    } else {
      pageW = lw; pageH = bandH_mm + 2 * margin; orientation = "landscape";
    }
  }
  let usableW = pageW - 2 * margin;
  let usableH = pageH - 2 * margin;

  const gap = Math.max(0.5, spacingMM);
  const sw = Math.max(0.1, strokeMM);

  let linesPerPage = Math.max(1, Math.floor(usableW / gap) + 1);
  const pages = Math.ceil(N / linesPerPage);

  const customFormat = [pageW, pageH];
  const doc = new jsPDF({ unit: "mm", format: customFormat, orientation });

  const imgH = Math.max(1, guide.height || 1);
  const pxToMM = (px) => (clamp(px, 0, imgH) / imgH) * bandH_mm;

  const projectTitle = (params.bookTitle || "Fold Guide").trim();
  const projectLink = (params.projectLink || "https://yahirrendon.github.io/").trim();
  let qrDataUrl = null;
  try { qrDataUrl = await makeQrDataUrl(projectLink, 192); } catch (e) { console.warn("QR generation failed", e); }

  const inSpan = (i) => (i >= firstIdx0 && i <= lastReal);
  const hasPick = (i) => { if (!inSpan(i)) return false; const s = guide.spans[i]; return s && s.y0 != null; };

  let drawn = 0, pageNum = 0;
  for (let p = 0; p < pages; p++) {
    if (p > 0) doc.addPage(customFormat, orientation);
    pageNum++;

    doc.setDrawColor(0, 0, 0);
    doc.setLineWidth(.5);

    const pStart = p * linesPerPage;
    const pCount = Math.min(linesPerPage, N - pStart);

    const yTop = margin + Math.max(0, (usableH - bandH_mm) * 0.5);
    const yBot = yTop + bandH_mm;

    doc.setLineWidth(1);
    doc.setDrawColor(0);      // black
    for (let j = 0; j < pCount; j++) {
      const i = firstIdx0 + pStart + j;
      const x = margin + j * gap;
      if (!inSpan(i)) continue;

      if (hasPick(i)) {
        // draw gray line:
        doc.setDrawColor(210);      // light gray
        // doc.setLineWidth(0.3);      // thinner than the fold line
        doc.line(x, yTop, x, yBot); // full-height guide


        const s = guide.spans[i];
        const topMM = pxToMM(s.y0);
        const botMM = pxToMM((s.y1 ?? s.y0));
        let y1 = yTop + clamp(topMM, 0, bandH_mm);
        let y2 = yTop + clamp(botMM, 0, bandH_mm);

        doc.setDrawColor(0);      // BACK TO BLACK
        if (Math.abs(y2 - y1) < 0.2) { const mid = (y1 + y2) * 0.5; y1 = mid - 0.1; y2 = mid + 0.1; }
        doc.line(x, y1, x, y2);
      } else {
        doc.line(x, yTop, x, yBot);
      }
      drawn++;
    }

    // draw top and bottom lines
    const contentW = (pCount > 1) ? gap * (pCount - 1) : 0;
    const xL = margin, xR = margin + contentW;
    doc.line(xL - 1, yTop, xR + 1 , yTop);
    doc.line(xL - 1, yBot, xR + 1, yBot);

    // Footer: title (left), page X/Y (center), QR only on first page (right)
    const footerBaseline = pageH - margin * 0.6;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(50);
    doc.text(`${projectTitle}`, margin, footerBaseline, { baseline: "bottom" });
    if (p === 0 && qrDataUrl) {
      const qrSize = 12; // mm
      const qrX = pageW - margin - qrSize;
      const qrY = pageH - margin - qrSize;
      doc.addImage(qrDataUrl, "PNG", qrX, qrY, qrSize, qrSize);
    }
    doc.setTextColor(100);
    doc.text(`Page ${pageNum} / ${pages}`, pageW / 2, footerBaseline, { align: "center", baseline: "bottom" });
  }

  const safeName = (projectTitle || "fold-guide").replace(/[^\w\-]+/g, "_");
  doc.save(`${safeName}_fold_guide.pdf`);
}


/* ============================================================================
   15) NAVIGATION & INIT
   - Arrow buttons, window resize, and app bootstrap.
   ========================================================================== */
/** 
* Navigation buttons: cycle through available stage images.
*/
prevBtn?.addEventListener("click", () => showIndex(currentIndex - 1));
nextBtn?.addEventListener("click", () => showIndex(currentIndex + 1));

/**
 * Global resize handler. Recomputes layout and redraws visuals when the 
 * browser window is resized.
 */
window.addEventListener("resize", () => {
  // applyStageLayoutForImage();
  // layoutHud();
  // if (_proc.result?.guide) {
  //   drawOverlay();
  //   drawFoldPreview();
  // }
  requestRender();
});

// Orientation can fire before sizes stabilize; do two passes.
window.addEventListener("orientationchange", () => {
  requestRender();
  setTimeout(requestRender, 120);
});

// If user returns to tab after rotation / zoom, refresh once shown.
document.addEventListener("visibilitychange", () => {
  if (!document.hidden) requestRender();
});

// If your stage element resizes without a window resize, keep overlay in sync.
const ro = new ResizeObserver(() => requestRender());
ro.observe(stage); 

// refresh overlay scaling on pixel rescaling
let _lastDPR = window.devicePixelRatio || 1;
setInterval(() => {
  const dpr = window.devicePixelRatio || 1;
  if (dpr !== _lastDPR) {
    _lastDPR = dpr;
    if (_overlay) _overlay.dpr = Math.max(1, dpr);
    requestRender();
  }
}, 500);

/**
 * Main initialization routine (runs once on page load).
 *
 * - Displays the first stage image if images are preloaded, otherwise
 *   just sets up the stage layout for when an image is added.
 * - Initializes all UI controls and bindings (bindFromSchema()).
 * - Positions the HUD relative to the stage.
 * - Computes the suggested start page for the folding guide.
 */
(async function init() {
  if (STAGE_IMAGES.length) {
    await showIndex(currentIndex); // random start
  } else {
    applyStageLayoutForImage();
  }
  bindFromSchema();
  layoutHud();
  computeSuggestedStartPage();
})();
