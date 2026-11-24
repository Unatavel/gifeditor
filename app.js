(() => {
  const CAPTURE_FPS = 30;
  const MAX_SECONDS = 30;
  const MIN_SIZE = 16;
  const MAX_SIZE = 1280;

  const FORMATS = [
    { label: "MP4", exts: ["mp4"], color: "#0b5cab" },
    { label: "MOV", exts: ["mov", "qt"], color: "#1464a0" },
    { label: "WEBM", exts: ["webm"], color: "#1aa6c8" },
    { label: "MKV", exts: ["mkv"], color: "#0e7c8b" },
    { label: "AVI", exts: ["avi"], color: "#2f6fed" },
    { label: "WMV", exts: ["wmv"], color: "#3d5a80" },
    { label: "FLV", exts: ["flv", "f4v"], color: "#c44b1c" },
    { label: "MPEG", exts: ["mpeg", "mpg", "mpe", "m2v"], color: "#5b4b8a" },
    { label: "M4V", exts: ["m4v"], color: "#0b7d5b" },
    { label: "3GP", exts: ["3gp", "3g2"], color: "#8a5a12" },
    { label: "OGV", exts: ["ogv", "ogg"], color: "#6a7f1f" },
    { label: "TS", exts: ["ts", "mts", "m2ts"], color: "#1f4e79" },
    { label: "VOB", exts: ["vob"], color: "#4a5568" },
    { label: "ASF", exts: ["asf"], color: "#7a3e6b" },
    { label: "DIVX", exts: ["divx"], color: "#2b6cb0" }
  ];

  const EXT_MAP = new Map();
  FORMATS.forEach((format) => {
    format.exts.forEach((ext) => EXT_MAP.set(ext, format));
  });

  const dropzone = document.getElementById("dropzone");
  const pickButton = document.getElementById("pick-button");
  const fileInput = document.getElementById("file-input");
  const toast = document.getElementById("toast");
  const formatList = document.getElementById("format-list");
  const landing = document.getElementById("landing");
  const workbench = document.getElementById("workbench");
  const explore = document.getElementById("explore");
  const navMake = document.getElementById("nav-make");
  const navExplore = document.getElementById("nav-explore");
  const toolRail = document.getElementById("tool-rail");
  const shareButton = document.getElementById("share-button");
  const shareSheet = document.getElementById("share-sheet");
  const shareName = document.getElementById("share-name");
  const qrPanel = document.getElementById("qr-panel");
  const qrStatus = document.getElementById("qr-status");
  const qrTarget = document.getElementById("qr-target");
  const qrLink = document.getElementById("qr-link");
  const qrCopy = document.getElementById("qr-copy");
  const replaceFileButton = document.getElementById("replace-file-button");
  const fileInfo = document.getElementById("file-info");
  const previewCanvas = document.getElementById("preview-canvas");
  const previewStatus = document.getElementById("preview-status");
  const playButton = document.getElementById("play-button");
  const pauseButton = document.getElementById("pause-button");
  const restartButton = document.getElementById("restart-button");
  const framePos = document.getElementById("frame-pos");
  const speedSlider = document.getElementById("speed-slider");
  const speedValue = document.getElementById("speed-value");
  const fpsSlider = document.getElementById("fps-slider");
  const fpsValue = document.getElementById("fps-value");
  const orderChips = document.getElementById("order-chips");
  const sizePresets = document.getElementById("size-presets");
  const outWidth = document.getElementById("out-width");
  const outHeight = document.getElementById("out-height");
  const keepRatio = document.getElementById("keep-ratio");
  const padColor = document.getElementById("pad-color");
  const generateButton = document.getElementById("generate-button");
  const progressBar = document.getElementById("progress-bar");
  const progressFill = document.getElementById("progress-fill");
  const progressPct = document.getElementById("progress-pct");
  const progressLabel = document.getElementById("progress-label");
  const downloadButton = document.getElementById("download-button");
  const thumbStrip = document.getElementById("thumb-strip");
  const thumbHint = document.getElementById("thumb-hint");

  const previewCtx = previewCanvas.getContext("2d", { alpha: false });

  let jobToken = 0;
  let gifBlob = null;
  let downloadName = "video.gif";
  let currentFile = null;
  let sourceFrames = [];
  let sourceWidth = 0;
  let sourceHeight = 0;
  let duration = 0;
  let ready = false;
  let playing = false;
  let playIndex = 0;
  let rafId = 0;
  let lastTick = 0;
  let syncingSize = false;
  let playDuration = 0;
  let playFrameCount = 0;

  const settings = {
    speed: 1,
    fps: 30,
    keepRatio: true,
    outW: 480,
    outH: 270,
    startTime: 0,
    endTime: 0,
    reverse: false,
    padColor: "#111827"
  };

  const EMOJIS = ["😀", "😂", "😍", "😎", "😭", "🤩", "🔥", "❤️", "👍", "🎉", "⭐", "💯", "🌈", "✨", "🚀", "👀", "💪", "🥳"];
  const cropToolButton = document.getElementById("crop-tool-button");
  const cropApplyButton = document.getElementById("crop-apply-button");
  const cropCancelButton = document.getElementById("crop-cancel-button");
  const cropReeditButton = document.getElementById("crop-reedit-button");
  const addTextButton = document.getElementById("add-text-button");
  const textList = document.getElementById("text-list");
  const textEditor = document.getElementById("text-editor");
  const textContent = document.getElementById("text-content");
  const textSize = document.getElementById("text-size");
  const textSizeValue = document.getElementById("text-size-value");
  const textColor = document.getElementById("text-color");
  const textFont = document.getElementById("text-font");
  const textBold = document.getElementById("text-bold");
  const textOutline = document.getElementById("text-outline");
  const textOutlineColor = document.getElementById("text-outline-color");
  const textOutlineWidth = document.getElementById("text-outline-width");
  const textShadow = document.getElementById("text-shadow");
  const textOpacity = document.getElementById("text-opacity");
  const textOpacityValue = document.getElementById("text-opacity-value");
  const deleteTextButton = document.getElementById("delete-text-button");
  const stickerGrid = document.getElementById("sticker-grid");
  const uploadStickerButton = document.getElementById("upload-sticker-button");
  const stickerFile = document.getElementById("sticker-file");
  const stickerList = document.getElementById("sticker-list");
  const stickerEditor = document.getElementById("sticker-editor");
  const stickerScaleValue = document.getElementById("sticker-scale-value");
  const stickerRotateValue = document.getElementById("sticker-rotate-value");
  const stickerOpacity = document.getElementById("sticker-opacity");
  const stickerOpacityValue = document.getElementById("sticker-opacity-value");
  const flipStickerButton = document.getElementById("flip-sticker-button");
  const duplicateStickerButton = document.getElementById("duplicate-sticker-button");
  const deleteStickerButton = document.getElementById("delete-sticker-button");
  const cropRatios = document.getElementById("crop-ratios");
  const cropWidthInput = document.getElementById("crop-width");
  const cropHeightInput = document.getElementById("crop-height");

  const compCanvas = document.createElement("canvas");
  const compCtx = compCanvas.getContext("2d", { alpha: false });

  let texts = [];
  let stickers = [];
  let selectedId = null;
  let layerSeq = 1;
  let fillingEditor = false;
  let drag = null;
  let canvasPointerId = null;
  const crop = {
    editing: false,
    applied: false,
    nx: 0.08,
    ny: 0.08,
    nw: 0.84,
    nh: 0.84,
    ratio: "free"
  };

  const filters = {
    preset: "none",
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    grayscale: 0,
    sepia: 0,
    compare: false
  };

  const filterPresets = document.getElementById("filter-presets");
  const filterBrightness = document.getElementById("filter-brightness");
  const filterBrightnessValue = document.getElementById("filter-brightness-value");
  const filterContrast = document.getElementById("filter-contrast");
  const filterContrastValue = document.getElementById("filter-contrast-value");
  const filterSaturation = document.getElementById("filter-saturation");
  const filterSaturationValue = document.getElementById("filter-saturation-value");
  const filterBlur = document.getElementById("filter-blur");
  const filterBlurValue = document.getElementById("filter-blur-value");
  const filterCompareButton = document.getElementById("filter-compare-button");
  const filterResetButton = document.getElementById("filter-reset-button");
  const drawTools = document.getElementById("draw-tools");
  const drawColor = document.getElementById("draw-color");
  const drawWidth = document.getElementById("draw-width");
  const drawWidthValue = document.getElementById("draw-width-value");
  const drawUndoButton = document.getElementById("draw-undo-button");
  const drawRedoButton = document.getElementById("draw-redo-button");
  const drawList = document.getElementById("draw-list");
  const drawEditor = document.getElementById("draw-editor");
  const deleteDrawButton = document.getElementById("delete-draw-button");
  const drawCanvas = document.createElement("canvas");
  const drawCtx = drawCanvas.getContext("2d");

  let drawings = [];
  let drawTool = "select";
  let currentStroke = null;
  let undoStack = [];
  let redoStack = [];
  let selectedDrawingId = null;

  formatList.innerHTML = FORMATS.map((format) => `
    <li>
      ${formatIcon(format.label, format.color)}
      <span>${format.label}</span>
    </li>
  `).join("");

  const GRAPHICS = [
    { id: "heart", label: "하트", svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#ff3b5c" d="M32 56S8 40 8 24a12 12 0 0 1 24-4 12 12 0 0 1 24 4c0 16-24 32-24 32z"/></svg>' },
    { id: "star", label: "별", svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#ffc107" d="m32 6 7 18h19l-15 11 6 19-17-12-17 12 6-19L6 24h19z"/></svg>' },
    { id: "arrow", label: "화살표", svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#1aa6c8" d="M8 28h30l-8-12 6-4 20 20-20 20-6-4 8-12H8z"/></svg>' },
    { id: "bubble", label: "말풍선", svg: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path fill="#ffffff" stroke="#0b5cab" stroke-width="4" d="M10 10h44v32H28L16 54V42H10z"/></svg>' }
  ];
  stickerGrid.innerHTML = [
    ...EMOJIS.map((emoji) => `<button type="button" data-emoji="${emoji}" aria-label="${emoji} 스티커">${emoji}</button>`),
    ...GRAPHICS.map((item) => `<button type="button" data-graphic="${item.id}" aria-label="${item.label} 스티커">${item.svg}</button>`)
  ].join("");

  pickButton.addEventListener("click", () => fileInput.click());
  if (replaceFileButton) replaceFileButton.addEventListener("click", () => fileInput.click());

  toolRail.addEventListener("click", (event) => {
    const button = event.target.closest("[data-panel]");
    if (button) showPanel(button.dataset.panel);
  });

  shareButton.addEventListener("click", () => openShare());
  document.getElementById("share-close").addEventListener("click", () => closeShare());
  shareSheet.addEventListener("click", (event) => {
    if (event.target === shareSheet) closeShare();
  });
  shareSheet.querySelectorAll("[data-send]").forEach((button) => {
    button.addEventListener("click", () => sendGif(button.dataset.send));
  });
  qrCopy.addEventListener("click", async () => {
    const url = qrLink.dataset.url || qrLink.href;
    if (!url || url === "#") return;
    try {
      await navigator.clipboard.writeText(url);
      qrCopy.textContent = "복사됨";
    } catch (_) {
      qrCopy.textContent = "복사 실패";
    }
  });
  fileInput.addEventListener("change", () => {
    const file = fileInput.files && fileInput.files[0];
    fileInput.value = "";
    if (file) handleFile(file);
  });

  ["dragenter", "dragover"].forEach((type) => {
    dropzone.addEventListener(type, (event) => {
      event.preventDefault();
      dropzone.classList.add("is-over");
    });
  });

  ["dragleave", "drop"].forEach((type) => {
    dropzone.addEventListener(type, (event) => {
      event.preventDefault();
      dropzone.classList.remove("is-over");
    });
  });

  dropzone.addEventListener("drop", (event) => {
    const files = event.dataTransfer && event.dataTransfer.files;
    if (!files || !files.length) return;
    handleFile(files[0], files.length > 1);
  });

  speedSlider.addEventListener("input", () => {
    settings.speed = Number(speedSlider.value);
    speedValue.textContent = `${settings.speed.toFixed(2)}×`;
    invalidateGif();
  });

  fpsSlider.addEventListener("input", () => {
    settings.fps = Number(fpsSlider.value);
    fpsValue.textContent = String(settings.fps);
    invalidateGif();
    applyTimelineChange();
  });

  const playRange = createDualRange("play-range", {
    label: "재생 구간",
    endpoints: ["시작 시간", "끝 시간"],
    format: (frame) => `${playBoundaryTime(frame).toFixed(2)}초`,
    minGap: 1,
    onChange(start, end) {
      settings.startTime = playBoundaryTime(start);
      settings.endTime = playBoundaryTime(end);
      invalidateGif();
      applyTimelineChange();
    }
  });
  const drawFrameRange = createFrameRange("draw-frame-range", () => drawings.find((layer) => layer.id === selectedDrawingId));
  const textFrameRange = createFrameRange("text-frame-range", () => findText(selectedId));
  const stickerFrameRange = createFrameRange("sticker-frame-range", () => findSticker(selectedId));

  orderChips.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-order]");
    if (!button) return;
    settings.reverse = button.dataset.order === "reverse";
    orderChips.querySelectorAll("button").forEach((node) => {
      const selected = node === button;
      node.classList.toggle("is-selected", selected);
      node.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    playIndex = 0;
    invalidateGif();
    applyTimelineChange();
  });

  filterPresets.addEventListener("click", (event) => {
    const button = event.target.closest("[data-preset]");
    if (!button) return;
    applyFilterPreset(button.dataset.preset);
  });
  filterBrightness.addEventListener("input", () => {
    filters.brightness = Number(filterBrightness.value);
    filterBrightnessValue.textContent = String(filters.brightness);
    filters.preset = "custom";
    markFilterPreset(null);
    invalidateGif();
    drawPreview();
  });
  filterContrast.addEventListener("input", () => {
    filters.contrast = Number(filterContrast.value);
    filterContrastValue.textContent = String(filters.contrast);
    filters.preset = "custom";
    markFilterPreset(null);
    invalidateGif();
    drawPreview();
  });
  filterSaturation.addEventListener("input", () => {
    filters.saturation = Number(filterSaturation.value);
    filterSaturationValue.textContent = String(filters.saturation);
    filters.preset = "custom";
    markFilterPreset(null);
    invalidateGif();
    drawPreview();
  });
  filterBlur.addEventListener("input", () => {
    filters.blur = Number(filterBlur.value);
    filterBlurValue.textContent = String(filters.blur);
    filters.preset = "custom";
    markFilterPreset(null);
    invalidateGif();
    drawPreview();
  });
  filterCompareButton.addEventListener("click", () => {
    filters.compare = !filters.compare;
    filterCompareButton.classList.toggle("is-selected", filters.compare);
    filterCompareButton.textContent = filters.compare ? "필터 결과 보기" : "원본과 비교";
    drawPreview();
  });
  filterResetButton.addEventListener("click", () => applyFilterPreset("none"));

  drawTools.addEventListener("click", (event) => {
    const button = event.target.closest("[data-tool]");
    if (!button) return;
    drawTool = button.dataset.tool;
    drawTools.querySelectorAll("button").forEach((node) => {
      const selected = node === button;
      node.classList.toggle("is-selected", selected);
      node.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    if (drawTool !== "select") {
      stopPlayback();
      selectedDrawingId = null;
      fillDrawEditor();
    }
  });
  drawWidth.addEventListener("input", () => {
    drawWidthValue.textContent = drawWidth.value;
  });
  drawUndoButton.addEventListener("click", () => undoDraw());
  drawRedoButton.addEventListener("click", () => redoDraw());
  deleteDrawButton.addEventListener("click", () => deleteSelectedDrawing());
  drawList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-id]");
    if (!button) return;
    selectedDrawingId = Number(button.dataset.id);
    selectedId = null;
    drawTool = "select";
    markDrawTool("select");
    fillDrawEditor();
    renderLayerLists();
    drawPreview();
  });
  sizePresets.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-preset]");
    if (!button) return;
    applyWidth(Number(button.dataset.preset), true);
  });

  outWidth.addEventListener("input", () => applyWidth(Number(outWidth.value), false));
  outHeight.addEventListener("input", () => applyHeight(Number(outHeight.value)));
  keepRatio.addEventListener("change", () => {
    settings.keepRatio = keepRatio.checked;
    if (settings.keepRatio) applyWidth(settings.outW, false);
    invalidateGif();
    drawPreview();
  });
  padColor.addEventListener("input", () => {
    settings.padColor = padColor.value;
    invalidateGif();
    drawPreview();
  });

  playButton.addEventListener("click", () => startPlayback());
  pauseButton.addEventListener("click", () => stopPlayback());
  restartButton.addEventListener("click", () => {
    playIndex = 0;
    lastTick = 0;
    drawPreview();
    if (!playing) startPlayback();
  });

  generateButton.addEventListener("click", () => generateGif());
  downloadButton.addEventListener("click", () => {
    if (!gifBlob) return;
    const link = document.createElement("a");
    link.href = URL.createObjectURL(gifBlob);
    link.download = downloadName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(link.href), 2000);
  });

  thumbStrip.addEventListener("click", (event) => {
    const button = event.target.closest("[data-index]");
    if (!button) return;
    playIndex = Number(button.dataset.index);
    drawPreview();
  });

  addTextButton.addEventListener("click", () => addTextLayer());
  deleteTextButton.addEventListener("click", () => removeLayer(selectedId, "text"));
  textList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-id]");
    if (button) selectLayer(Number(button.dataset.id));
  });
  ["input", "change"].forEach((type) => {
    [textContent, textSize, textColor, textFont, textBold, textOutline, textOutlineColor, textOutlineWidth, textShadow, textOpacity].forEach((node) => {
      node.addEventListener(type, () => applyTextEditor());
    });
  });

  stickerGrid.addEventListener("click", (event) => {
    const emojiButton = event.target.closest("[data-emoji]");
    if (emojiButton) {
      addEmojiSticker(emojiButton.dataset.emoji);
      return;
    }
    const graphicButton = event.target.closest("[data-graphic]");
    if (graphicButton) addGraphicSticker(graphicButton.dataset.graphic);
  });
  uploadStickerButton.addEventListener("click", () => stickerFile.click());
  stickerFile.addEventListener("change", () => {
    const file = stickerFile.files && stickerFile.files[0];
    stickerFile.value = "";
    if (file) addImageSticker(file);
  });
  stickerList.addEventListener("click", (event) => {
    const button = event.target.closest("[data-id]");
    if (button) selectLayer(Number(button.dataset.id));
  });
  ["input", "change"].forEach((type) => {
    stickerOpacity.addEventListener(type, () => applyStickerEditor());
  });
  flipStickerButton.addEventListener("click", () => {
    const layer = findSticker(selectedId);
    if (!layer) return;
    layer.flipX = !layer.flipX;
    invalidateGif();
    drawPreview();
  });
  duplicateStickerButton.addEventListener("click", () => duplicateSticker());
  deleteStickerButton.addEventListener("click", () => removeLayer(selectedId, "sticker"));

  cropToolButton.addEventListener("click", () => beginCropEdit());
  cropApplyButton.addEventListener("click", () => applyCrop());
  cropCancelButton.addEventListener("click", () => cancelCrop());
  cropReeditButton.addEventListener("click", () => beginCropEdit());
  cropRatios.addEventListener("click", (event) => {
    const button = event.target.closest("[data-ratio]");
    if (!button) return;
    crop.ratio = button.dataset.ratio;
    cropRatios.querySelectorAll("button").forEach((node) => {
      const selected = node === button;
      node.classList.toggle("is-selected", selected);
      node.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    if (crop.ratio !== "free") fitCropToRatio();
    syncCropInputs();
    invalidateGif();
    drawPreview();
  });
  cropWidthInput.addEventListener("input", () => setCropSize(Number(cropWidthInput.value), null));
  cropHeightInput.addEventListener("input", () => setCropSize(null, Number(cropHeightInput.value)));

  previewCanvas.addEventListener("pointerdown", onCanvasPointerDown);
  window.addEventListener("pointermove", onCanvasPointerMove);
  window.addEventListener("pointerup", onCanvasPointerUp);
  window.addEventListener("pointercancel", onCanvasPointerUp);
  previewCanvas.addEventListener("keydown", onCanvasKeyDown);
  new ResizeObserver(() => {
    if (ready && !playing && previewCanvas.clientWidth) drawPreview();
  }).observe(previewCanvas);

  function playlistCount() {
    return getPlaylist().length;
  }

  function lastFrameIndex() {
    return Math.max(1, playlistCount());
  }

  function createDualRange(id, { label, endpoints, format, minGap = 0, onChange }) {
    const root = document.getElementById(id);
    root.innerHTML = `
      <div class="setting-label"><span id="${id}-label">${label}</span><output></output></div>
      <div class="dual-range" role="group" aria-labelledby="${id}-label">
        <div class="dual-range-track">
          <span class="dual-range-selection" aria-hidden="true"></span>
          <button type="button" class="dual-range-thumb" role="slider" data-endpoint="start"></button>
          <button type="button" class="dual-range-thumb" role="slider" data-endpoint="end"></button>
        </div>
      </div>`;
    const group = root.querySelector(".dual-range");
    const track = root.querySelector(".dual-range-track");
    const output = root.querySelector("output");
    const thumbs = [...root.querySelectorAll(".dual-range-thumb")];
    let min = 0;
    let max = 0;
    let values = [0, 0];
    let pointer = null;

    function bounds(index) {
      return index === 0 ? [min, Math.max(min, values[1] - minGap)] : [Math.min(max, values[0] + minGap), max];
    }

    function spaceThumbs() {
      const span = max - min || 1;
      group.classList.toggle("is-close", max > min && ((values[1] - values[0]) / span) * track.clientWidth < 28);
    }

    function render() {
      const span = max - min || 1;
      const percentages = max === min ? [0, 100] : values.map((value) => ((value - min) / span) * 100);
      group.style.setProperty("--range-start", `${percentages[0]}%`);
      group.style.setProperty("--range-end", `${percentages[1]}%`);
      output.value = `${format(values[0])} ~ ${format(values[1])}`;
      thumbs.forEach((thumb, index) => {
        const [lo, hi] = bounds(index);
        thumb.disabled = max === min;
        thumb.setAttribute("aria-valuemin", String(lo));
        thumb.setAttribute("aria-valuemax", String(hi));
        thumb.setAttribute("aria-valuenow", String(values[index]));
        thumb.setAttribute("aria-valuetext", format(values[index]));
      });
      group.classList.toggle("is-fixed", max === min);
      spaceThumbs();
    }

    function change(index, value) {
      const next = clamp(value, ...bounds(index));
      if (values[index] === next) return false;
      values[index] = next;
      render();
      return true;
    }

    thumbs.forEach((thumb, index) => {
      thumb.setAttribute("aria-label", endpoints[index]);
      thumb.addEventListener("keydown", (event) => {
        const [lo, hi] = bounds(index);
        const page = Math.max(1, Math.round((max - min) / 10));
        const steps = { ArrowLeft: -1, ArrowDown: -1, ArrowRight: 1, ArrowUp: 1, PageDown: -page, PageUp: page };
        const value = event.key === "Home" ? lo : event.key === "End" ? hi : values[index] + steps[event.key];
        if (!Number.isFinite(value)) return;
        event.preventDefault();
        if (!pointer && change(index, value)) onChange(...values);
      });
    });

    function move(event) {
      if (pointer?.id !== event.pointerId) return;
      const rect = track.getBoundingClientRect();
      if (!rect.width) return;
      const fraction = (event.clientX - pointer.offset - rect.left) / rect.width;
      change(pointer.index, min + Math.round(fraction * (max - min)));
    }

    function finish(event, canceled) {
      if (pointer?.id !== event.pointerId) return;
      if (canceled) change(pointer.index, pointer.original);
      else move(event);
      const changed = values[pointer.index] !== pointer.original;
      pointer.listeners.abort();
      pointer = null;
      if (changed) onChange(...values);
    }

    group.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || pointer || max === min) return;
      const rect = track.getBoundingClientRect();
      if (!rect.width) return;
      const value = min + ((event.clientX - rect.left) / rect.width) * (max - min);
      const thumb = event.target.closest(".dual-range-thumb");
      const closest = value <= (values[0] + values[1]) / 2 ? 0 : 1;
      const index = thumb ? thumbs.indexOf(thumb) : closest;
      const center = rect.left + ((values[index] - min) / (max - min)) * rect.width;
      const listeners = new AbortController();
      pointer = {
        id: event.pointerId, index, offset: thumb ? event.clientX - center : 0,
        original: values[index], listeners
      };
      event.preventDefault();
      thumbs[index].focus({ preventScroll: true });
      group.setPointerCapture(event.pointerId);
      const options = { signal: listeners.signal };
      window.addEventListener("pointermove", move, options);
      window.addEventListener("pointerup", (endEvent) => finish(endEvent, false), options);
      window.addEventListener("pointercancel", (endEvent) => finish(endEvent, true), options);
      move(event);
    });
    new ResizeObserver(spaceThumbs).observe(track);
    render();
    return {
      set(lo, hi, start, end) {
        pointer?.listeners.abort();
        pointer = null;
        min = lo;
        max = hi;
        values = [start, end];
        render();
      }
    };
  }

  function createFrameRange(id, getLayer) {
    return createDualRange(id, {
      label: "프레임 범위",
      endpoints: ["시작 프레임", "끝 프레임"],
      format: (frame) => `${frame}프레임`,
      onChange(start, end) {
        const layer = getLayer();
        if (!layer) return;
        layer.startFrame = start;
        layer.endFrame = end;
        stopPlayback();
        if (!layerVisible(layer, playIndex)) playIndex = start - 1;
        renderLayerLists();
        invalidateGif();
        drawPreview();
      }
    });
  }

  function resetOverlays() {
    if (canvasPointerId !== null && previewCanvas.hasPointerCapture(canvasPointerId)) {
      previewCanvas.releasePointerCapture(canvasPointerId);
    }
    canvasPointerId = null;
    drag = null;
    texts = [];
    stickers.forEach((layer) => {
      if (layer.url) URL.revokeObjectURL(layer.url);
    });
    stickers = [];
    selectedId = null;
    layerSeq = 1;
    crop.editing = false;
    crop.applied = false;
    crop.nx = 0.08;
    crop.ny = 0.08;
    crop.nw = 0.84;
    crop.nh = 0.84;
    crop.ratio = "free";
    cropRatios.querySelectorAll("button").forEach((node) => {
      const selected = node.dataset.ratio === "free";
      node.classList.toggle("is-selected", selected);
      node.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    textEditor.hidden = true;
    stickerEditor.hidden = true;
    drawings = [];
    currentStroke = null;
    undoStack = [];
    redoStack = [];
    selectedDrawingId = null;
    drawTool = "select";
    markDrawTool("select");
    drawEditor.hidden = true;
    applyFilterPreset("none", true);
    renderLayerLists();
    syncCropInputs();
    updateCropButtons();
  }

  function clampOverlayFrames() {
    const max = lastFrameIndex();
    texts.concat(stickers, drawings).forEach((layer) => {
      layer.startFrame = clamp(layer.startFrame || 1, 1, max);
      layer.endFrame = clamp(layer.endFrame || max, layer.startFrame, max);
    });
    fillEditors();
    fillDrawEditor();
    renderLayerLists();
  }

  function addTextLayer() {
    const max = lastFrameIndex();
    const layer = {
      id: layerSeq++,
      type: "text",
      content: "텍스트",
      nx: 0.5,
      ny: 0.78,
      size: 36,
      color: "#ffffff",
      font: '"Noto Sans KR", sans-serif',
      bold: true,
      outline: true,
      outlineColor: "#000000",
      outlineWidth: 4,
      shadow: true,
      opacity: 1,
      startFrame: 1,
      endFrame: max
    };
    texts.push(layer);
    selectLayer(layer.id);
    invalidateGif();
    drawPreview();
  }

  function addEmojiSticker(emoji) {
    const max = lastFrameIndex();
    const layer = {
      id: layerSeq++,
      type: "sticker",
      kind: "emoji",
      emoji,
      label: emoji,
      nx: 0.5,
      ny: 0.32,
      scale: 0.2,
      aspect: 1,
      rotation: 0,
      flipX: false,
      opacity: 1,
      startFrame: 1,
      endFrame: max
    };
    stickers.push(layer);
    selectLayer(layer.id);
    invalidateGif();
    drawPreview();
  }

  function addGraphicSticker(id) {
    const item = GRAPHICS.find((entry) => entry.id === id);
    if (!item) return;
    const image = new Image();
    image.src = `data:image/svg+xml;utf8,${encodeURIComponent(item.svg)}`;
    image.onload = () => {
      const max = lastFrameIndex();
      stickers.push({
        id: layerSeq++,
        type: "sticker",
        kind: "image",
        image,
        label: item.label,
        nx: 0.72,
        ny: 0.28,
        scale: 0.18,
        aspect: 1,
        rotation: 0,
        flipX: false,
        opacity: 1,
        startFrame: 1,
        endFrame: max
      });
      selectLayer(stickers[stickers.length - 1].id);
      invalidateGif();
      drawPreview();
    };
  }

  async function addImageSticker(file) {
    const type = (file.type || "").toLowerCase();
    const ext = extensionOf(file.name);
    if (!["image/png", "image/webp"].includes(type) && !["png", "webp"].includes(ext)) {
      showToast("스티커는 PNG 또는 WebP 파일만 올릴 수 있습니다.");
      return;
    }
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.src = url;
    await new Promise((resolve, reject) => {
      image.onload = resolve;
      image.onerror = reject;
    });
    const max = lastFrameIndex();
    const layer = {
      id: layerSeq++,
      type: "sticker",
      kind: "image",
      image,
      url,
      label: file.name,
      nx: 0.5,
      ny: 0.38,
      scale: 0.24,
      aspect: image.height / image.width || 1,
      rotation: 0,
      flipX: false,
      opacity: 1,
      startFrame: 1,
      endFrame: max
    };
    stickers.push(layer);
    selectLayer(layer.id);
    invalidateGif();
    drawPreview();
  }

  function duplicateSticker() {
    const layer = findSticker(selectedId);
    if (!layer) return;
    const copy = { ...layer, id: layerSeq++, nx: clamp(layer.nx + 0.06, 0.05, 0.95), ny: clamp(layer.ny + 0.06, 0.05, 0.95) };
    stickers.push(copy);
    selectLayer(copy.id);
    invalidateGif();
    drawPreview();
  }

  function removeLayer(id, type) {
    if (type === "text") texts = texts.filter((layer) => layer.id !== id);
    if (type === "sticker") {
      const layer = findSticker(id);
      if (layer && layer.url) URL.revokeObjectURL(layer.url);
      stickers = stickers.filter((item) => item.id !== id);
    }
    if (selectedId === id) selectedId = null;
    renderLayerLists();
    fillEditors();
    invalidateGif();
    drawPreview();
  }

  function findText(id) {
    return texts.find((layer) => layer.id === id) || null;
  }

  function findSticker(id) {
    return stickers.find((layer) => layer.id === id) || null;
  }

  function findLayer(id) {
    return findText(id) || findSticker(id);
  }

  function selectLayer(id) {
    selectedId = id;
    selectedDrawingId = null;
    const sticker = findSticker(id);
    if (sticker) {
      if (drawTool !== "select") markDrawTool("select");
      stopPlayback();
      if (!layerVisible(sticker, playIndex)) playIndex = sticker.startFrame - 1;
    }
    renderLayerLists();
    fillEditors();
    fillDrawEditor();
    drawPreview();
  }

  function renderLayerLists() {
    textList.innerHTML = texts.map((layer) => `
      <li><button type="button" data-id="${layer.id}" class="${layer.id === selectedId ? "is-selected" : ""}">${escapeHtml(layer.content || "텍스트")} · ${layer.startFrame}-${layer.endFrame}프레임</button></li>
    `).join("");
    stickerList.innerHTML = stickers.map((layer) => `
      <li><button type="button" data-id="${layer.id}" class="${layer.id === selectedId ? "is-selected" : ""}">${escapeHtml(layer.label || "스티커")} · ${layer.startFrame}-${layer.endFrame}프레임</button></li>
    `).join("");
    const names = { pen: "펜", highlight: "형광펜", eraser: "지우개", line: "직선", arrow: "화살표", rect: "사각형", circle: "원형" };
    drawList.innerHTML = drawings.map((layer, index) => `
      <li><button type="button" data-id="${layer.id}" class="${layer.id === selectedDrawingId ? "is-selected" : ""}">${names[layer.type] || "그림"} ${index + 1} · ${layer.startFrame}-${layer.endFrame}프레임</button></li>
    `).join("");
  }

  function fillEditors() {
    fillingEditor = true;
    const text = findText(selectedId);
    textEditor.hidden = !text;
    if (text) {
      textContent.value = text.content;
      textSize.value = String(text.size);
      textSizeValue.textContent = String(text.size);
      textColor.value = text.color;
      textFont.value = text.font;
      textBold.checked = text.bold;
      textOutline.checked = text.outline;
      textOutlineColor.value = text.outlineColor;
      textOutlineWidth.value = String(text.outlineWidth);
      textShadow.checked = text.shadow;
      textOpacity.value = String(Math.round(text.opacity * 100));
      textOpacityValue.textContent = `${Math.round(text.opacity * 100)}%`;
      textFrameRange.set(1, lastFrameIndex(), text.startFrame, text.endFrame);
    }
    const sticker = findSticker(selectedId);
    stickerEditor.hidden = !sticker;
    if (sticker) {
      updateStickerTransformValues(sticker);
      stickerOpacity.value = String(Math.round(sticker.opacity * 100));
      stickerOpacityValue.textContent = `${Math.round(sticker.opacity * 100)}%`;
      stickerFrameRange.set(1, lastFrameIndex(), sticker.startFrame, sticker.endFrame);
    }
    fillingEditor = false;
  }

  function applyTextEditor() {
    if (fillingEditor) return;
    const layer = findText(selectedId);
    if (!layer) return;
    layer.content = textContent.value;
    layer.size = Number(textSize.value);
    textSizeValue.textContent = String(layer.size);
    layer.color = textColor.value;
    layer.font = textFont.value;
    layer.bold = textBold.checked;
    layer.outline = textOutline.checked;
    layer.outlineColor = textOutlineColor.value;
    layer.outlineWidth = Number(textOutlineWidth.value);
    layer.shadow = textShadow.checked;
    layer.opacity = Number(textOpacity.value) / 100;
    textOpacityValue.textContent = `${textOpacity.value}%`;
    renderLayerLists();
    invalidateGif();
    drawPreview();
  }

  function applyStickerEditor() {
    if (fillingEditor) return;
    const layer = findSticker(selectedId);
    if (!layer) return;
    layer.opacity = Number(stickerOpacity.value) / 100;
    stickerOpacityValue.textContent = `${stickerOpacity.value}%`;
    invalidateGif();
    drawPreview();
  }

  function updateStickerTransformValues(layer) {
    stickerScaleValue.textContent = `${Math.round(layer.scale * 100)}%`;
    stickerRotateValue.textContent = `${layer.rotation}°`;
  }

  function layerVisible(layer, frameIndex) {
    const frame = frameIndex + 1;
    return frame >= layer.startFrame && frame <= layer.endFrame;
  }

  function prepareCompCanvas() {
    if (compCanvas.width !== settings.outW || compCanvas.height !== settings.outH) {
      compCanvas.width = settings.outW;
      compCanvas.height = settings.outH;
    }
  }

  function drawComposition(ctx, frame, frameIndex, withGuides) {
    drawLetterbox(ctx, frame, settings.outW, settings.outH, settings.padColor);
    drawDrawingLayers(ctx, frameIndex);
    texts.forEach((layer) => {
      if (layerVisible(layer, frameIndex)) drawTextLayer(ctx, layer);
    });
    stickers.forEach((layer) => {
      if (layerVisible(layer, frameIndex)) drawStickerLayer(ctx, layer);
    });
    if (withGuides) drawLayerGuides(ctx, 0, 0);
  }

  function drawTextLayer(ctx, layer) {
    const x = layer.nx * settings.outW;
    const y = layer.ny * settings.outH;
    ctx.save();
    ctx.globalAlpha = layer.opacity;
    ctx.font = `${layer.bold ? "700" : "400"} ${layer.size}px ${layer.font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    if (layer.shadow) {
      ctx.shadowColor = "rgba(0,0,0,0.55)";
      ctx.shadowBlur = 8;
      ctx.shadowOffsetX = 2;
      ctx.shadowOffsetY = 3;
    }
    if (layer.outline) {
      ctx.lineWidth = layer.outlineWidth;
      ctx.strokeStyle = layer.outlineColor;
      ctx.lineJoin = "round";
      ctx.strokeText(layer.content, x, y);
    }
    ctx.fillStyle = layer.color;
    ctx.fillText(layer.content, x, y);
    ctx.restore();
  }

  function drawStickerLayer(ctx, layer) {
    const { x, y, w, h, angle } = stickerGeometry(layer);
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.scale(layer.flipX ? -1 : 1, 1);
    ctx.globalAlpha = layer.opacity;
    if (layer.kind === "emoji") {
      ctx.font = `${Math.max(12, w)}px "Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif`;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(layer.emoji, 0, 0);
    } else if (layer.image) {
      ctx.drawImage(layer.image, -w / 2, -h / 2, w, h);
    }
    ctx.restore();
  }

  function drawLayerGuides(ctx, offsetX, offsetY) {
    const drawing = drawings.find((item) => item.id === selectedDrawingId);
    const text = findText(selectedId);
    const target = drawing && layerVisible(drawing, playIndex) ? drawingBox(drawing) : text && layerVisible(text, playIndex) ? textBox(text) : null;
    const sticker = selectedStickerForTransform();
    if (!target && sticker) {
      drawStickerGuides(ctx, sticker, offsetX, offsetY);
      return;
    }
    if (!target) return;
    ctx.save();
    ctx.strokeStyle = "#4ea3ff";
    ctx.lineWidth = 1.5;
    ctx.setLineDash([5, 4]);
    ctx.strokeRect(target.x - offsetX, target.y - offsetY, target.w, target.h);
    ctx.restore();
  }

  function textBox(layer) {
    previewCtx.font = `${layer.bold ? "700" : "400"} ${layer.size}px ${layer.font}`;
    const w = Math.max(24, previewCtx.measureText(layer.content || " ").width);
    const h = layer.size * 1.2;
    return { x: layer.nx * settings.outW - w / 2, y: layer.ny * settings.outH - h / 2, w, h };
  }

  function stickerGeometry(layer) {
    const w = layer.scale * settings.outW;
    return {
      x: layer.nx * settings.outW,
      y: layer.ny * settings.outH,
      w,
      h: w * (layer.aspect || 1),
      angle: layer.rotation * Math.PI / 180
    };
  }

  function selectedStickerForTransform() {
    if (crop.editing || drawTool !== "select") return null;
    const layer = findSticker(selectedId);
    return layer && layerVisible(layer, playIndex) ? layer : null;
  }

  function stickerHandles(geometry, rotationSide) {
    const { x, y, w, h, angle } = geometry;
    const area = outputArea();
    const unit = previewCanvas.width / (previewCanvas.clientWidth || previewCanvas.width);
    const insetX = Math.min(13 * unit, area.w / 2);
    const insetY = Math.min(13 * unit, area.h / 2);
    const position = (dx, dy) => ({
      x: x + dx * Math.cos(angle) - dy * Math.sin(angle),
      y: y + dx * Math.sin(angle) + dy * Math.cos(angle)
    });
    const onCanvas = (point) => ({
      x: clamp(point.x, area.x + insetX, area.x + area.w - insetX),
      y: clamp(point.y, area.y + insetY, area.y + area.h - insetY)
    });
    const top = position(0, -h / 2 - 28 * unit);
    const bottom = position(0, h / 2 + 28 * unit);
    const clipping = (point) => {
      const inside = onCanvas(point);
      return Math.hypot(point.x - inside.x, point.y - inside.y);
    };
    const side = rotationSide ?? (clipping(top) <= clipping(bottom) ? -1 : 1);
    const handles = [[-1, -1], [1, -1], [1, 1], [-1, 1]].map(([dx, dy]) => ({
      ...onCanvas(position(dx * w / 2, dy * h / 2)),
      kind: "sticker-resize"
    }));
    handles.push({ ...onCanvas(side < 0 ? top : bottom), kind: "sticker-rotate", side });
    return { handles, edge: position(0, side * h / 2), unit };
  }

  function drawStickerGuides(ctx, layer, offsetX, offsetY) {
    const geometry = stickerGeometry(layer);
    const { x, y, w, h, angle } = geometry;
    const side = drag?.kind === "sticker-rotate" && drag.id === layer.id ? drag.rotationSide : undefined;
    const { handles, edge, unit } = stickerHandles(geometry, side);
    const rotation = handles.at(-1);
    ctx.save();
    ctx.translate(-offsetX, -offsetY);
    ctx.strokeStyle = "#1561ca";
    ctx.lineWidth = 2 * unit;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeRect(-w / 2, -h / 2, w, h);
    ctx.restore();
    ctx.beginPath();
    ctx.moveTo(edge.x, edge.y);
    ctx.lineTo(rotation.x, rotation.y);
    ctx.stroke();
    handles.forEach((handle) => {
      ctx.fillStyle = "#ffffff";
      ctx.beginPath();
      if (handle.kind === "sticker-rotate") ctx.arc(handle.x, handle.y, 10 * unit, 0, 2 * Math.PI);
      else ctx.rect(handle.x - 5 * unit, handle.y - 5 * unit, 10 * unit, 10 * unit);
      ctx.fill();
      ctx.stroke();
    });
    ctx.fillStyle = "#104a9e";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `${16 * unit}px system-ui`;
    ctx.fillText("↻", rotation.x, rotation.y);
    ctx.restore();
  }

  function outputArea() {
    if (crop.applied && !crop.editing) return cropRectPx();
    return { x: 0, y: 0, w: settings.outW, h: settings.outH };
  }

  function previewViewSize() {
    if (crop.editing) return { w: settings.outW, h: settings.outH };
    return outputArea();
  }

  function cropRectPx() {
    return {
      x: clamp(Math.round(crop.nx * settings.outW), 0, settings.outW - 16),
      y: clamp(Math.round(crop.ny * settings.outH), 0, settings.outH - 16),
      w: clamp(Math.round(crop.nw * settings.outW), 16, settings.outW),
      h: clamp(Math.round(crop.nh * settings.outH), 16, settings.outH)
    };
  }

  function blitOutput(ctx, area) {
    ctx.drawImage(compCanvas, area.x, area.y, area.w, area.h, 0, 0, area.w, area.h);
  }

  function drawCropGuides(ctx) {
    const rect = cropRectPx();
    ctx.save();
    ctx.fillStyle = "rgba(8, 16, 28, 0.46)";
    ctx.fillRect(0, 0, settings.outW, rect.y);
    ctx.fillRect(0, rect.y + rect.h, settings.outW, settings.outH - rect.y - rect.h);
    ctx.fillRect(0, rect.y, rect.x, rect.h);
    ctx.fillRect(rect.x + rect.w, rect.y, settings.outW - rect.x - rect.w, rect.h);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(rect.x + 1, rect.y + 1, rect.w - 2, rect.h - 2);
    cropHandles(rect).forEach((handle) => {
      ctx.fillStyle = "#4ea3ff";
      ctx.fillRect(handle.x - 5, handle.y - 5, 10, 10);
    });
    ctx.restore();
  }

  function cropHandles(rect) {
    return [
      { id: "nw", x: rect.x, y: rect.y },
      { id: "n", x: rect.x + rect.w / 2, y: rect.y },
      { id: "ne", x: rect.x + rect.w, y: rect.y },
      { id: "e", x: rect.x + rect.w, y: rect.y + rect.h / 2 },
      { id: "se", x: rect.x + rect.w, y: rect.y + rect.h },
      { id: "s", x: rect.x + rect.w / 2, y: rect.y + rect.h },
      { id: "sw", x: rect.x, y: rect.y + rect.h },
      { id: "w", x: rect.x, y: rect.y + rect.h / 2 }
    ];
  }

  function beginCropEdit() {
    crop.editing = true;
    stopPlayback();
    showPanel("crop");
    syncCropInputs();
    updateCropButtons();
    drawPreview();
  }

  function applyCrop() {
    crop.editing = false;
    crop.applied = true;
    invalidateGif();
    updateCropButtons();
    drawPreview();
  }

  function cancelCrop() {
    crop.editing = false;
    crop.applied = false;
    invalidateGif();
    updateCropButtons();
    drawPreview();
  }

  function updateCropButtons() {
    cropToolButton.hidden = crop.editing;
    cropApplyButton.hidden = !crop.editing;
    cropCancelButton.hidden = !crop.editing && !crop.applied;
    cropReeditButton.hidden = !crop.applied || crop.editing;
  }

  function syncCropInputs() {
    const rect = cropRectPx();
    cropWidthInput.value = String(rect.w);
    cropHeightInput.value = String(rect.h);
  }

  function setCropSize(width, height) {
    let w = width == null ? crop.nw * settings.outW : width;
    let h = height == null ? crop.nh * settings.outH : height;
    if (crop.ratio !== "free") {
      const [rw, rh] = crop.ratio.split(":").map(Number);
      if (width != null) h = w * (rh / rw);
      else w = h * (rw / rh);
    }
    w = clamp(w, 16, settings.outW);
    h = clamp(h, 16, settings.outH);
    crop.nw = w / settings.outW;
    crop.nh = h / settings.outH;
    crop.nx = clamp(crop.nx, 0, 1 - crop.nw);
    crop.ny = clamp(crop.ny, 0, 1 - crop.nh);
    syncCropInputs();
    invalidateGif();
    drawPreview();
  }

  function fitCropToRatio() {
    const [rw, rh] = crop.ratio.split(":").map(Number);
    const maxW = settings.outW;
    const maxH = settings.outH;
    let w = maxW;
    let h = w * (rh / rw);
    if (h > maxH) {
      h = maxH;
      w = h * (rw / rh);
    }
    const cx = crop.nx + crop.nw / 2;
    const cy = crop.ny + crop.nh / 2;
    crop.nw = w / maxW;
    crop.nh = h / maxH;
    crop.nx = clamp(cx - crop.nw / 2, 0, 1 - crop.nw);
    crop.ny = clamp(cy - crop.nh / 2, 0, 1 - crop.nh);
  }

  function canvasPoint(event) {
    const rect = previewCanvas.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * previewCanvas.width;
    const y = ((event.clientY - rect.top) / rect.height) * previewCanvas.height;
    if (crop.applied && !crop.editing) {
      const area = cropRectPx();
      return { x: x + area.x, y: y + area.y };
    }
    return { x, y };
  }

  function hitCropHandle(point) {
    return cropHandles(cropRectPx()).find((handle) => Math.abs(handle.x - point.x) <= 10 && Math.abs(handle.y - point.y) <= 10);
  }

  function hitCropBody(point) {
    const rect = cropRectPx();
    return point.x >= rect.x && point.x <= rect.x + rect.w && point.y >= rect.y && point.y <= rect.y + rect.h;
  }

  function hitLayer(point) {
    const list = texts.concat(stickers).reverse();
    return list.find((layer) => {
      if (!layerVisible(layer, playIndex)) return false;
      if (layer.type === "sticker") {
        const { x, y, w, h, angle } = stickerGeometry(layer);
        const dx = point.x - x;
        const dy = point.y - y;
        const localX = dx * Math.cos(angle) + dy * Math.sin(angle);
        const localY = -dx * Math.sin(angle) + dy * Math.cos(angle);
        return Math.abs(localX) <= w / 2 && Math.abs(localY) <= h / 2;
      }
      const box = textBox(layer);
      return point.x >= box.x && point.x <= box.x + box.w && point.y >= box.y && point.y <= box.y + box.h;
    }) || null;
  }

  function hitStickerHandle(point) {
    const layer = selectedStickerForTransform();
    if (!layer) return null;
    const geometry = stickerGeometry(layer);
    const { handles, unit } = stickerHandles(geometry);
    let closest = null;
    let distance = 14 * unit;
    for (const handle of handles) {
      const delta = Math.hypot(handle.x - point.x, handle.y - point.y);
      if (delta <= distance) {
        closest = handle;
        distance = delta;
      }
    }
    return closest && { ...closest, layer, geometry };
  }

  function onCanvasPointerDown(event) {
    if (!ready || event.button !== 0 || drag) return;
    beginCanvasDrag(canvasPoint(event));
    if (!drag) return;
    canvasPointerId = event.pointerId;
    previewCanvas.setPointerCapture(event.pointerId);
  }

  function beginCanvasDrag(point) {
    if (crop.editing) {
      const handle = hitCropHandle(point);
      if (handle) {
        drag = { kind: "crop-handle", id: handle.id, start: { ...crop }, point };
      } else if (hitCropBody(point)) {
        drag = { kind: "crop-move", start: { ...crop }, point };
      }
      stopPlayback();
      return;
    }
    if (drawTool !== "select") {
      stopPlayback();
      beginStroke(point);
      return;
    }
    const handle = hitStickerHandle(point);
    if (handle) {
      const { kind, layer, geometry } = handle;
      const dx = point.x - geometry.x;
      const dy = point.y - geometry.y;
      drag = {
        kind, id: layer.id, center: geometry, scale: layer.scale, rotation: layer.rotation,
        dx, dy, angle: Math.atan2(dy, dx), rotationSide: handle.side
      };
      stopPlayback();
      previewCanvas.style.cursor = kind === "sticker-rotate" ? "grabbing" : "nwse-resize";
      return;
    }
    const layer = hitLayer(point);
    const drawing = layer?.type === "sticker" ? null : hitDrawing(point);
    if (drawing) {
      selectedDrawingId = drawing.id;
      selectedId = null;
      drag = { kind: "drawing", id: drawing.id, point, points: drawing.points.map((item) => ({ ...item })) };
      fillEditors();
      fillDrawEditor();
      renderLayerLists();
      stopPlayback();
      drawPreview();
      return;
    }
    if (layer) {
      selectedDrawingId = null;
      selectLayer(layer.id);
      drag = { kind: "layer", id: layer.id, dx: point.x - layer.nx * settings.outW, dy: point.y - layer.ny * settings.outH };
      stopPlayback();
    } else {
      selectedId = null;
      selectedDrawingId = null;
      fillEditors();
      fillDrawEditor();
      renderLayerLists();
      drawPreview();
    }
  }

  function onCanvasPointerMove(event) {
    if (!drag) {
      if (event.target === previewCanvas) updateCanvasCursor(event);
      return;
    }
    if (event.pointerId !== canvasPointerId) return;
    const point = canvasPoint(event);
    if (drag.kind === "sticker-resize" || drag.kind === "sticker-rotate") {
      const layer = findSticker(drag.id);
      if (!layer) return;
      const dx = point.x - drag.center.x;
      const dy = point.y - drag.center.y;
      if (drag.kind === "sticker-resize") {
        const factor = (dx * drag.dx + dy * drag.dy) / Math.max(1, drag.dx ** 2 + drag.dy ** 2);
        layer.scale = clamp(drag.scale * factor, 0.06, 0.8);
      } else if (Math.hypot(dx, dy) > 1) {
        layer.rotation = normalizeRotation(drag.rotation + (Math.atan2(dy, dx) - drag.angle) * 180 / Math.PI);
      }
      updateStickerTransformValues(layer);
      invalidateGif();
      drawPreview();
      return;
    }
    if (drag.kind === "stroke") {
      continueStroke(point);
      return;
    }
    if (drag.kind === "drawing") {
      const drawing = drawings.find((item) => item.id === drag.id);
      if (!drawing) return;
      const dx = (point.x - drag.point.x) / settings.outW;
      const dy = (point.y - drag.point.y) / settings.outH;
      drawing.points = drag.points.map((item) => ({
        nx: clamp(item.nx + dx, 0, 1),
        ny: clamp(item.ny + dy, 0, 1)
      }));
      invalidateGif();
      drawPreview();
      return;
    }
    if (drag.kind === "layer") {
      const layer = findLayer(drag.id);
      if (!layer) return;
      layer.nx = clamp((point.x - drag.dx) / settings.outW, 0.02, 0.98);
      layer.ny = clamp((point.y - drag.dy) / settings.outH, 0.02, 0.98);
      invalidateGif();
      drawPreview();
      return;
    }
    if (drag.kind === "crop-move") {
      const dx = (point.x - drag.point.x) / settings.outW;
      const dy = (point.y - drag.point.y) / settings.outH;
      crop.nx = clamp(drag.start.nx + dx, 0, 1 - crop.nw);
      crop.ny = clamp(drag.start.ny + dy, 0, 1 - crop.nh);
      syncCropInputs();
      invalidateGif();
      drawPreview();
      return;
    }
    if (drag.kind === "crop-handle") {
      resizeCrop(drag.id, point);
      if (crop.ratio !== "free") enforceCropFromHandle(drag.id);
      clampCrop();
      syncCropInputs();
      invalidateGif();
      drawPreview();
    }
  }

  function onCanvasPointerUp(event) {
    if (event.pointerId !== canvasPointerId) return;
    const rotated = drag?.kind === "sticker-rotate";
    if (drag && drag.kind === "stroke") finishStroke();
    if (drag && drag.kind === "drawing") pushDrawHistory();
    drag = null;
    canvasPointerId = null;
    if (rotated) drawPreview();
    updateCanvasCursor(event);
  }

  function normalizeRotation(degrees) {
    return ((Math.round(degrees) + 180) % 360 + 360) % 360 - 180;
  }

  function onCanvasKeyDown(event) {
    const layer = selectedStickerForTransform();
    if (!layer || !ready || drag || event.ctrlKey || event.metaKey || event.altKey) return;
    if (event.key === "+" || event.key === "=" || event.key === "-" || event.key === "−") {
      layer.scale = clamp(layer.scale + (event.key === "-" || event.key === "−" ? -0.02 : 0.02), 0.06, 0.8);
    } else if (event.key === "[" || event.key === "]") {
      layer.rotation = normalizeRotation(layer.rotation + (event.key === "[" ? -5 : 5));
    } else {
      return;
    }
    event.preventDefault();
    stopPlayback();
    updateStickerTransformValues(layer);
    invalidateGif();
    drawPreview();
  }

  function updateCanvasCursor(event) {
    if (!ready) return;
    const point = canvasPoint(event);
    if (crop.editing) {
      const handle = hitCropHandle(point);
      previewCanvas.style.cursor = handle ? `${handle.id}-resize`.replace("n", "n").replace("s", "s") : hitCropBody(point) ? "move" : "crosshair";
      const map = { nw: "nwse-resize", se: "nwse-resize", ne: "nesw-resize", sw: "nesw-resize", n: "ns-resize", s: "ns-resize", e: "ew-resize", w: "ew-resize" };
      previewCanvas.style.cursor = handle ? map[handle.id] : hitCropBody(point) ? "move" : "crosshair";
      return;
    }
    if (drawTool !== "select") {
      previewCanvas.style.cursor = drawTool === "eraser" ? "cell" : "crosshair";
      return;
    }
    const handle = hitStickerHandle(point);
    if (handle) previewCanvas.style.cursor = handle.kind === "sticker-rotate" ? "grab" : "nwse-resize";
    else previewCanvas.style.cursor = hitDrawing(point) || hitLayer(point) ? "grab" : "default";
  }

  function resizeCrop(handle, point) {
    const left = crop.nx * settings.outW;
    const top = crop.ny * settings.outH;
    const right = left + crop.nw * settings.outW;
    const bottom = top + crop.nh * settings.outH;
    let x1 = left;
    let y1 = top;
    let x2 = right;
    let y2 = bottom;
    if (handle.includes("w")) x1 = clamp(point.x, 0, x2 - 16);
    if (handle.includes("e")) x2 = clamp(point.x, x1 + 16, settings.outW);
    if (handle.includes("n")) y1 = clamp(point.y, 0, y2 - 16);
    if (handle.includes("s")) y2 = clamp(point.y, y1 + 16, settings.outH);
    crop.nx = x1 / settings.outW;
    crop.ny = y1 / settings.outH;
    crop.nw = (x2 - x1) / settings.outW;
    crop.nh = (y2 - y1) / settings.outH;
  }

  function enforceCropFromHandle(handle) {
    const [rw, rh] = crop.ratio.split(":").map(Number);
    let w = crop.nw * settings.outW;
    let h = w * (rh / rw);
    if (handle === "n" || handle === "s") {
      h = crop.nh * settings.outH;
      w = h * (rw / rh);
    }
    if (handle.includes("e") || handle === "n" || handle === "s") {
      crop.nw = clamp(w / settings.outW, 16 / settings.outW, 1 - crop.nx);
    } else if (handle.includes("w")) {
      const right = crop.nx + crop.nw;
      crop.nw = clamp(w / settings.outW, 16 / settings.outW, right);
      crop.nx = right - crop.nw;
    }
    if (handle.includes("s") || handle === "e" || handle === "w") {
      crop.nh = clamp(h / settings.outH, 16 / settings.outH, 1 - crop.ny);
    } else if (handle.includes("n")) {
      const bottom = crop.ny + crop.nh;
      crop.nh = clamp(h / settings.outH, 16 / settings.outH, bottom);
      crop.ny = bottom - crop.nh;
    }
  }

  function clampCrop() {
    crop.nw = clamp(crop.nw, 16 / settings.outW, 1);
    crop.nh = clamp(crop.nh, 16 / settings.outH, 1);
    crop.nx = clamp(crop.nx, 0, 1 - crop.nw);
    crop.ny = clamp(crop.ny, 0, 1 - crop.nh);
  }

  function filterCss() {
    return [
      `brightness(${filters.brightness}%)`,
      `contrast(${filters.contrast}%)`,
      `saturate(${filters.saturation}%)`,
      `blur(${filters.blur}px)`,
      `grayscale(${filters.grayscale})`,
      `sepia(${filters.sepia})`
    ].join(" ");
  }

  function applyFilterPreset(name, silent) {
    const map = {
      none: { brightness: 100, contrast: 100, saturation: 100, blur: 0, grayscale: 0, sepia: 0 },
      bw: { brightness: 100, contrast: 110, saturation: 100, blur: 0, grayscale: 1, sepia: 0 },
      sepia: { brightness: 105, contrast: 100, saturation: 90, blur: 0, grayscale: 0, sepia: 1 },
      vintage: { brightness: 110, contrast: 90, saturation: 75, blur: 0.4, grayscale: 0, sepia: 0.45 }
    };
    const preset = map[name] || map.none;
    Object.assign(filters, preset, { preset: name, compare: false });
    filterBrightness.value = String(filters.brightness);
    filterBrightnessValue.textContent = String(filters.brightness);
    filterContrast.value = String(filters.contrast);
    filterContrastValue.textContent = String(filters.contrast);
    filterSaturation.value = String(filters.saturation);
    filterSaturationValue.textContent = String(filters.saturation);
    filterBlur.value = String(filters.blur);
    filterBlurValue.textContent = String(filters.blur);
    filterCompareButton.classList.remove("is-selected");
    filterCompareButton.textContent = "원본과 비교";
    markFilterPreset(name === "custom" ? null : name);
    if (!silent) {
      invalidateGif();
      drawPreview();
    }
  }

  function markFilterPreset(name) {
    filterPresets.querySelectorAll("button").forEach((node) => {
      const selected = node.dataset.preset === name;
      node.classList.toggle("is-selected", selected);
      node.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  }

  function markDrawTool(name) {
    drawTool = name;
    drawTools.querySelectorAll("button").forEach((node) => {
      const selected = node.dataset.tool === name;
      node.classList.toggle("is-selected", selected);
      node.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  }

  function toNorm(point) {
    return { nx: point.x / settings.outW, ny: point.y / settings.outH };
  }

  function beginStroke(point) {
    const max = lastFrameIndex();
    const type = drawTool;
    currentStroke = {
      id: layerSeq++,
      type,
      color: type === "highlight" ? "#ffe14a" : drawColor.value,
      width: type === "highlight" ? Math.max(14, Number(drawWidth.value) * 2) : Number(drawWidth.value),
      opacity: type === "highlight" ? 0.38 : type === "eraser" ? 1 : 1,
      points: [toNorm(point), toNorm(point)],
      startFrame: 1,
      endFrame: max
    };
    drag = { kind: "stroke" };
    selectedDrawingId = currentStroke.id;
    drawPreview();
  }

  function continueStroke(point) {
    if (!currentStroke) return;
    const norm = toNorm(point);
    if (currentStroke.type === "pen" || currentStroke.type === "highlight" || currentStroke.type === "eraser") {
      currentStroke.points.push(norm);
    } else {
      currentStroke.points[1] = norm;
    }
    drawPreview();
  }

  function finishStroke() {
    if (!currentStroke) return;
    drawings.push(currentStroke);
    currentStroke = null;
    pushDrawHistory();
    fillDrawEditor();
    renderLayerLists();
    invalidateGif();
    drawPreview();
  }

  function pushDrawHistory() {
    undoStack.push(JSON.parse(JSON.stringify(drawings)));
    if (undoStack.length > 40) undoStack.shift();
    redoStack = [];
  }

  function undoDraw() {
    if (!undoStack.length) return;
    redoStack.push(JSON.parse(JSON.stringify(drawings)));
    undoStack.pop();
    drawings = undoStack.length ? JSON.parse(JSON.stringify(undoStack[undoStack.length - 1])) : [];
    selectedDrawingId = null;
    fillDrawEditor();
    renderLayerLists();
    invalidateGif();
    drawPreview();
  }

  function redoDraw() {
    if (!redoStack.length) return;
    drawings = redoStack.pop();
    undoStack.push(JSON.parse(JSON.stringify(drawings)));
    fillDrawEditor();
    renderLayerLists();
    invalidateGif();
    drawPreview();
  }

  function deleteSelectedDrawing() {
    if (selectedDrawingId == null) return;
    drawings = drawings.filter((item) => item.id !== selectedDrawingId);
    selectedDrawingId = null;
    pushDrawHistory();
    fillDrawEditor();
    renderLayerLists();
    invalidateGif();
    drawPreview();
  }

  function fillDrawEditor() {
    const drawing = drawings.find((item) => item.id === selectedDrawingId);
    drawEditor.hidden = !drawing;
    if (!drawing) return;
    drawFrameRange.set(1, lastFrameIndex(), drawing.startFrame, drawing.endFrame);
  }

  function drawDrawingLayers(ctx, frameIndex) {
    if (drawCanvas.width !== settings.outW || drawCanvas.height !== settings.outH) {
      drawCanvas.width = settings.outW;
      drawCanvas.height = settings.outH;
    }
    drawCtx.clearRect(0, 0, settings.outW, settings.outH);
    drawings.concat(currentStroke ? [currentStroke] : []).forEach((item) => {
      if (item && (item === currentStroke || layerVisible(item, frameIndex))) drawStroke(drawCtx, item);
    });
    ctx.drawImage(drawCanvas, 0, 0);
  }

  function drawStroke(ctx, item) {
    const pts = item.points.map((point) => ({
      x: point.nx * settings.outW,
      y: point.ny * settings.outH
    }));
    if (pts.length < 2 && item.type !== "rect" && item.type !== "circle") return;
    ctx.save();
    if (item.type === "eraser") ctx.globalCompositeOperation = "destination-out";
    ctx.globalAlpha = item.opacity;
    ctx.strokeStyle = item.color;
    ctx.fillStyle = item.color;
    ctx.lineWidth = item.width;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    if (item.type === "pen" || item.type === "highlight" || item.type === "eraser") {
      ctx.beginPath();
      pts.forEach((point, index) => (index ? ctx.lineTo(point.x, point.y) : ctx.moveTo(point.x, point.y)));
      ctx.stroke();
    } else if (item.type === "line") {
      ctx.beginPath();
      ctx.moveTo(pts[0].x, pts[0].y);
      ctx.lineTo(pts[1].x, pts[1].y);
      ctx.stroke();
    } else if (item.type === "arrow") {
      drawArrow(ctx, pts[0], pts[1], item.width);
    } else if (item.type === "rect") {
      ctx.strokeRect(pts[0].x, pts[0].y, pts[1].x - pts[0].x, pts[1].y - pts[0].y);
    } else if (item.type === "circle") {
      ctx.beginPath();
      ctx.ellipse(
        (pts[0].x + pts[1].x) / 2,
        (pts[0].y + pts[1].y) / 2,
        Math.abs(pts[1].x - pts[0].x) / 2,
        Math.abs(pts[1].y - pts[0].y) / 2,
        0,
        0,
        Math.PI * 2
      );
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawArrow(ctx, from, to, width) {
    const angle = Math.atan2(to.y - from.y, to.x - from.x);
    const head = 10 + width * 1.4;
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(to.x, to.y);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(to.x, to.y);
    ctx.lineTo(to.x - head * Math.cos(angle - 0.4), to.y - head * Math.sin(angle - 0.4));
    ctx.lineTo(to.x - head * Math.cos(angle + 0.4), to.y - head * Math.sin(angle + 0.4));
    ctx.closePath();
    ctx.fill();
  }

  function drawingBox(item) {
    const xs = item.points.map((point) => point.nx * settings.outW);
    const ys = item.points.map((point) => point.ny * settings.outH);
    const pad = item.width / 2 + 4;
    const x = Math.min(...xs) - pad;
    const y = Math.min(...ys) - pad;
    return {
      x,
      y,
      w: Math.max(...xs) - Math.min(...xs) + pad * 2,
      h: Math.max(...ys) - Math.min(...ys) + pad * 2
    };
  }

  function hitDrawing(point) {
    return drawings.slice().reverse().find((item) => {
      if (!layerVisible(item, playIndex)) return false;
      const box = drawingBox(item);
      return point.x >= box.x && point.x <= box.x + box.w && point.y >= box.y && point.y <= box.y + box.h;
    }) || null;
  }

  function formatIcon(label, color) {
    const size = label.length > 3 ? 13 : 16;
    return `
      <svg class="format-icon" viewBox="0 0 80 80" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${label} 형식">
        <rect width="80" height="80" rx="18" fill="${color}"/>
        <rect x="12" y="14" width="6" height="8" rx="2" fill="rgba(255,255,255,0.32)"/>
        <rect x="12" y="36" width="6" height="8" rx="2" fill="rgba(255,255,255,0.32)"/>
        <rect x="12" y="58" width="6" height="8" rx="2" fill="rgba(255,255,255,0.32)"/>
        <rect x="62" y="14" width="6" height="8" rx="2" fill="rgba(255,255,255,0.32)"/>
        <rect x="62" y="36" width="6" height="8" rx="2" fill="rgba(255,255,255,0.32)"/>
        <rect x="62" y="58" width="6" height="8" rx="2" fill="rgba(255,255,255,0.32)"/>
        <rect x="20" y="18" width="40" height="44" rx="7" fill="#ffffff"/>
        <text x="40" y="45" text-anchor="middle" font-size="${size}" font-weight="800" fill="${color}" font-family="system-ui, sans-serif">${label}</text>
      </svg>
    `;
  }

  async function handleFile(file, manyDropped) {
    const ext = extensionOf(file.name);
    const format = EXT_MAP.get(ext) || guessFormatByMime(file.type);
    if (!format) {
      setEditorOpen(false);
      showToast("이 파일 형식은 GIF로 변환할 수 없습니다. 변환 가능한 형식의 파일을 선택해 주세요.");
      return;
    }

    currentFile = file;
    downloadName = `${baseNameOf(file.name)}.gif`;
    if (manyDropped) {
      showToast("한 번에 한 파일만 선택할 수 있습니다. 첫 번째 파일만 사용합니다.");
    } else {
      hideToast();
    }
    setEditorOpen(true);
    showPanel("play");
    renderInfo(file, format, null);
    await preparePreview(file, format);
  }

  async function preparePreview(file, format) {
    const token = ++jobToken;
    stopPlayback();
    clearFrames();
    ready = false;
    gifBlob = null;
    playIndex = 0;
    generateButton.disabled = true;
    downloadButton.disabled = true;
    shareButton.disabled = true;
    thumbStrip.innerHTML = "";
    previewStatus.textContent = "미리보기용 프레임을 준비하고 있습니다.";
    thumbHint.textContent = "프레임을 읽고 있습니다.";
    setProgress(0, "동영상을 읽는 중");
    resetSettingsUi();
    resetOverlays();

    const url = URL.createObjectURL(file);
    const video = document.createElement("video");
    video.muted = true;
    video.playsInline = true;
    video.preload = "auto";
    video.src = url;

    try {
      await waitForMetadata(video);
      if (token !== jobToken) return;
      try {
        await video.play();
        video.pause();
      } catch (_) {
        /* metadata is enough in some browsers */
      }

      if (!video.videoWidth || !video.videoHeight || !Number.isFinite(video.duration) || video.duration <= 0) {
        throw new Error("decode");
      }

      duration = video.duration;
      const usedDuration = Math.min(duration, MAX_SECONDS);
      sourceWidth = video.videoWidth;
      sourceHeight = video.videoHeight;
      const frameCount = Math.max(1, Math.round(usedDuration * CAPTURE_FPS));
      const captureWidth = Math.max(MIN_SIZE, Math.min(720, sourceWidth));
      const captureHeight = Math.max(1, Math.round(sourceHeight * (captureWidth / sourceWidth)));

      settings.startTime = 0;
      settings.endTime = usedDuration;
      applyWidth(480, true);
      renderInfo(file, format, {
        width: sourceWidth,
        height: sourceHeight,
        duration,
        usedDuration,
        frameCount
      });

      const canvas = document.createElement("canvas");
      canvas.width = captureWidth;
      canvas.height = captureHeight;
      const ctx = canvas.getContext("2d", { willReadFrequently: true, alpha: false });

      for (let index = 0; index < frameCount; index += 1) {
        if (token !== jobToken) return;
        const time = Math.min(usedDuration - 0.0005, index / CAPTURE_FPS);
        await seekVideo(video, time);
        ctx.drawImage(video, 0, 0, captureWidth, captureHeight);
        sourceFrames.push(await snapshotFrame(canvas));
        setProgress(Math.round(((index + 1) / frameCount) * 100), `미리보기 준비 ${index + 1} / ${frameCount}`);
        await yieldUi();
      }

      if (token !== jobToken) return;
      ready = true;
      playDuration = usedDuration;
      playFrameCount = frameCount;
      playRange.set(0, frameCount, 0, frameCount);
      generateButton.disabled = false;
      previewStatus.textContent = "설정을 바꾸면 바로 반영됩니다. 실제 파일은 GIF 생성 뒤에 만들어집니다.";
      setProgress(0, "미리보기를 확인한 뒤 생성하세요.");
      applyTimelineChange();
      startPlayback();
    } catch (error) {
      if (token !== jobToken) return;
      ready = false;
      setProgress(0, "미리보기를 만들 수 없음");
      showToast("이 파일은 변환할 수 없습니다. 변환 가능한 형식의 파일을 선택해 주세요.");
    } finally {
      URL.revokeObjectURL(url);
      video.removeAttribute("src");
      video.load();
    }
  }

  async function generateGif() {
    if (!ready) return;
    const token = ++jobToken;
    const playlist = getPlaylist();
    if (!playlist.length) {
      showToast("선택한 구간에 프레임이 없습니다. 구간을 다시 정하세요.");
      return;
    }

    generateButton.disabled = true;
    downloadButton.disabled = true;
    shareButton.disabled = true;
    gifBlob = null;
    const compareWasOn = filters.compare;
    filters.compare = false;
    setProgress(0, "설정대로 GIF를 만드는 중");

    const area = outputArea();
    const canvas = document.createElement("canvas");
    canvas.width = area.w;
    canvas.height = area.h;
    const ctx = canvas.getContext("2d", { willReadFrequently: true, alpha: false });
    const encoded = [];
    const delayCs = gifDelay(settings.fps, settings.speed);
    prepareCompCanvas();

    try {
      for (let index = 0; index < playlist.length; index += 1) {
        if (token !== jobToken) return;
        drawComposition(compCtx, playlist[index], index, false);
        blitOutput(ctx, area);
        encoded.push(quantize(ctx.getImageData(0, 0, area.w, area.h)));
        setProgress(Math.round(((index + 1) / playlist.length) * 92), `${index + 1} / ${playlist.length}장 묶는 중`);
        await yieldUi();
      }

      if (token !== jobToken) return;
      setProgress(96, "GIF 파일을 저장하는 중");
      await yieldUi();
      gifBlob = encodeGif(encoded, area.w, area.h, delayCs);
      downloadButton.disabled = false;
      shareButton.disabled = false;
      generateButton.disabled = false;
      setProgress(100, "생성이 끝났습니다. 오른쪽 버튼으로 받으세요.");
    } catch (error) {
      if (token !== jobToken) return;
      generateButton.disabled = false;
      setProgress(0, "생성에 실패했습니다.");
      showToast("GIF를 만들지 못했습니다. 설정을 바꾼 뒤 다시 생성해 주세요.");
    } finally {
      filters.compare = compareWasOn;
    }
  }

  function getPlaylist() {
    if (!sourceFrames.length) return [];
    const start = clamp(Math.round(settings.startTime * CAPTURE_FPS), 0, sourceFrames.length - 1);
    const end = clamp(Math.round(settings.endTime * CAPTURE_FPS) - 1, start, sourceFrames.length - 1);
    const step = Math.max(1, Math.round(CAPTURE_FPS / settings.fps));
    const list = [];
    for (let index = start; index <= end; index += step) {
      list.push(sourceFrames[index]);
    }
    if (!list.length) list.push(sourceFrames[start]);
    return settings.reverse ? list.slice().reverse() : list;
  }

  function applyTimelineChange() {
    const playlist = getPlaylist();
    playIndex = playlist.length ? Math.min(playIndex, playlist.length - 1) : 0;
    clampOverlayFrames();
    renderThumbs(playlist);
    drawPreview();
  }

  function startPlayback() {
    const playlist = getPlaylist();
    if (!playlist.length) return;
    if (playIndex >= playlist.length) playIndex = 0;
    playing = true;
    lastTick = performance.now();
    drawPreview();
    cancelAnimationFrame(rafId);
    rafId = requestAnimationFrame(tick);
  }

  function stopPlayback() {
    playing = false;
    cancelAnimationFrame(rafId);
  }

  function tick(now) {
    if (!playing) return;
    const interval = 1000 / (settings.fps * settings.speed);
    if (!lastTick || now - lastTick >= interval) {
      lastTick = now;
      const playlist = getPlaylist();
      if (playlist.length) {
        playIndex = (playIndex + 1) % playlist.length;
        drawPreview();
      }
    }
    rafId = requestAnimationFrame(tick);
  }

  function drawPreview() {
    const playlist = getPlaylist();
    const view = previewViewSize();
    if (previewCanvas.width !== view.w || previewCanvas.height !== view.h) {
      previewCanvas.width = view.w;
      previewCanvas.height = view.h;
    }
    if (!playlist.length) {
      previewCtx.fillStyle = settings.padColor;
      previewCtx.fillRect(0, 0, view.w, view.h);
      framePos.textContent = "프레임 0 / 0";
      return;
    }
    playIndex = clamp(playIndex, 0, playlist.length - 1);
    prepareCompCanvas();
    drawComposition(compCtx, playlist[playIndex], playIndex, false);
    const area = outputArea();
    if (crop.editing) {
      previewCtx.drawImage(compCanvas, 0, 0);
      drawCropGuides(previewCtx);
      drawLayerGuides(previewCtx, 0, 0);
    } else {
      blitOutput(previewCtx, area);
      if (!crop.applied) drawLayerGuides(previewCtx, 0, 0);
      else drawLayerGuides(previewCtx, area.x, area.y);
    }
    framePos.textContent = `프레임 ${playIndex + 1} / ${playlist.length}`;
    highlightThumb();
    updateCropButtons();
  }

  function drawLetterbox(ctx, source, boxW, boxH, color) {
    ctx.fillStyle = color;
    ctx.fillRect(0, 0, boxW, boxH);
    if (!source) return;
    const srcW = source.width || source.videoWidth;
    const srcH = source.height || source.videoHeight;
    const scale = Math.min(boxW / srcW, boxH / srcH);
    const width = Math.max(1, srcW * scale);
    const height = Math.max(1, srcH * scale);
    const x = (boxW - width) / 2;
    const y = (boxH - height) / 2;
    ctx.save();
    if (!filters.compare) ctx.filter = filterCss();
    ctx.drawImage(source, x, y, width, height);
    ctx.restore();
  }

  function applyWidth(value, fromPreset) {
    if (syncingSize) return;
    syncingSize = true;
    settings.outW = clamp(Math.round(value) || settings.outW, MIN_SIZE, MAX_SIZE);
    if (settings.keepRatio && sourceWidth && sourceHeight) {
      settings.outH = clamp(Math.round(settings.outW * (sourceHeight / sourceWidth)), MIN_SIZE, MAX_SIZE);
    }
    outWidth.value = String(settings.outW);
    outHeight.value = String(settings.outH);
    syncingSize = false;
    markPreset(fromPreset ? settings.outW : null);
    invalidateGif();
    drawPreview();
  }

  function applyHeight(value) {
    if (syncingSize) return;
    syncingSize = true;
    settings.outH = clamp(Math.round(value) || settings.outH, MIN_SIZE, MAX_SIZE);
    if (settings.keepRatio && sourceWidth && sourceHeight) {
      settings.outW = clamp(Math.round(settings.outH * (sourceWidth / sourceHeight)), MIN_SIZE, MAX_SIZE);
    }
    outWidth.value = String(settings.outW);
    outHeight.value = String(settings.outH);
    syncingSize = false;
    markPreset(null);
    invalidateGif();
    drawPreview();
  }

  function markPreset(width) {
    sizePresets.querySelectorAll("button").forEach((node) => {
      const selected = Number(node.dataset.preset) === width;
      node.classList.toggle("is-selected", selected);
      node.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  }

  function playBoundaryTime(frame) {
    return frame === playFrameCount ? playDuration : frame / CAPTURE_FPS;
  }

  function resetSettingsUi() {
    playDuration = 0;
    playFrameCount = 0;
    playRange.set(0, 0, 0, 0);
    settings.speed = 1;
    settings.fps = 30;
    settings.keepRatio = true;
    settings.reverse = false;
    settings.padColor = "#111827";
    speedSlider.value = "1";
    speedValue.textContent = "1.00×";
    fpsSlider.value = "30";
    fpsValue.textContent = "30";
    keepRatio.checked = true;
    padColor.value = "#111827";
    orderChips.querySelectorAll("button").forEach((node) => {
      const selected = node.dataset.order === "forward";
      node.classList.toggle("is-selected", selected);
      node.setAttribute("aria-pressed", selected ? "true" : "false");
    });
  }

  function renderThumbs(playlist) {
    thumbStrip.innerHTML = "";
    if (!playlist.length) {
      thumbHint.textContent = "선택한 구간에 프레임이 없습니다.";
      return;
    }
    const maxThumbs = 40;
    const step = Math.max(1, Math.ceil(playlist.length / maxThumbs));
    thumbHint.textContent = `${playlist.length}장 · ${settings.outW}×${settings.outH} · ${settings.fps}FPS · ${settings.speed.toFixed(2)}×`;
    for (let index = 0; index < playlist.length; index += step) {
      const thumb = document.createElement("canvas");
      const width = 108;
      const height = Math.max(1, Math.round(playlist[index].height * (width / playlist[index].width)));
      thumb.width = width;
      thumb.height = height;
      thumb.getContext("2d").drawImage(playlist[index], 0, 0, width, height);
      const button = document.createElement("button");
      button.type = "button";
      button.className = "thumb";
      button.dataset.index = String(index);
      button.setAttribute("aria-label", `${index + 1}번째 프레임`);
      const image = document.createElement("img");
      image.src = thumb.toDataURL("image/jpeg", 0.7);
      image.alt = `${index + 1}번째 프레임`;
      button.appendChild(image);
      thumbStrip.appendChild(button);
    }
    highlightThumb();
  }

  function highlightThumb() {
    thumbStrip.querySelectorAll(".thumb").forEach((node) => {
      node.classList.toggle("is-active", Number(node.dataset.index) === playIndex);
    });
  }

  function invalidateGif() {
    gifBlob = null;
    downloadButton.disabled = true;
    shareButton.disabled = true;
    if (ready) setProgress(0, "설정이 바뀌었습니다. 다시 생성하면 이 설정이 적용됩니다.");
  }

  function setEditorOpen(open) {
    showAppView(open ? "editor" : "make");
  }

  function showAppView(view) {
    const exploring = view === "explore";
    const editing = view === "editor";
    const gifEditing = view === "gif-edit";
    const making = view === "make" || editing;
    document.getElementById("gif-editor").hidden = !gifEditing;
    landing.hidden = view !== "make";
    workbench.hidden = !editing;
    explore.hidden = !exploring;
    document.body.classList.toggle("is-editing", editing);
    document.body.classList.toggle("is-explore", exploring);
    document.body.classList.toggle("is-gif-edit", gifEditing);
    navGifEdit.classList.toggle("is-selected", gifEditing);
    navGifEdit.setAttribute("aria-pressed", String(gifEditing));
    navMake.classList.toggle("is-selected", making);
    navExplore.classList.toggle("is-selected", exploring);
    navMake.setAttribute("aria-pressed", String(making));
    navExplore.setAttribute("aria-pressed", exploring ? "true" : "false");
    if (exploring && !exploreState.loadedOnce) loadExplore(false);
  }

  function showPanel(name) {
    toolRail.querySelectorAll("[data-panel]").forEach((node) => {
      const selected = node.dataset.panel === name;
      node.classList.toggle("is-selected", selected);
      node.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    document.querySelectorAll("[data-inspector]").forEach((panel) => {
      panel.hidden = panel.dataset.inspector !== name;
    });
  }

  function openShare() {
    if (!gifBlob) return;
    shareName.textContent = downloadName;
    qrPanel.hidden = true;
    qrCopy.textContent = "링크 복사";
    shareSheet.hidden = false;
  }

  function closeShare() {
    shareSheet.hidden = true;
    qrPanel.hidden = true;
  }

  async function sendGif(action) {
    if (!gifBlob) return;
    if (action === "qr") {
      showQr().catch((error) => showToast(error.message || "QR을 만들지 못했습니다."));
      return;
    }
    const file = new File([gifBlob], downloadName, { type: "image/gif" });
    const text = "스마트 GIF 생성기에서 만든 GIF입니다.";
    if (await tryShare(file, downloadName, text)) {
      closeShare();
      return;
    }
    downloadButton.click();
    if (action === "mail") {
      window.location.href = `mailto:?subject=${encodeURIComponent(downloadName)}&body=${encodeURIComponent(`${text} 방금 저장한 파일을 메일에 첨부해 보내 주세요.`)}`;
    } else if (action === "sms") {
      window.location.href = `sms:?body=${encodeURIComponent(`${text} 저장한 GIF를 첨부해 보내 주세요.`)}`;
    } else {
      showToast("이 브라우저에는 앱 공유가 없습니다. GIF를 저장한 뒤 카카오톡에서 보내 주세요.");
    }
  }

  async function tryShare(file, title, text) {
    if (!navigator.share) return false;
    const payload = { title, text, files: [file] };
    try {
      if (navigator.canShare && !navigator.canShare(payload)) {
        await navigator.share({ title, text });
        return true;
      }
      await navigator.share(payload);
      return true;
    } catch (error) {
      return !!(error && error.name === "AbortError");
    }
  }

  async function showQr() {
    shareSheet.hidden = false;
    qrPanel.hidden = false;
    qrTarget.innerHTML = "";
    qrLink.textContent = "";
    qrLink.href = "#";
    qrLink.dataset.url = "";
    qrStatus.textContent = "다른 기기에서 받을 수 있는 링크를 만드는 중입니다.";
    const url = await uploadTemp(gifBlob, downloadName);
    qrStatus.textContent = "QR을 찍으면 GIF를 받을 수 있습니다. 링크는 잠시 동안만 유지됩니다.";
    qrLink.href = url;
    qrLink.dataset.url = url;
    qrLink.textContent = url;
    if (typeof QRCode !== "function") throw new Error("QR 기능을 불러오지 못했습니다.");
    new QRCode(qrTarget, { text: url, width: 220, height: 220, correctLevel: QRCode.CorrectLevel.M });
  }

  async function uploadTemp(blob, name) {
    const file = new File([blob], name, { type: blob.type || "image/gif" });
    const tmp = new FormData();
    tmp.append("file", file);
    try {
      const res = await fetch("https://tmpfiles.org/api/v1/upload", { method: "POST", body: tmp });
      if (res.ok) {
        const json = await res.json();
        const url = json && json.data && json.data.url;
        if (url) return url.replace("tmpfiles.org/", "tmpfiles.org/dl/");
      }
    } catch (_) {
      /* try next host */
    }
    const cat = new FormData();
    cat.append("reqtype", "fileupload");
    cat.append("fileToUpload", file);
    const res = await fetch("https://catbox.moe/user/api.php", { method: "POST", body: cat });
    if (!res.ok) throw new Error("공유 링크를 만들지 못했습니다.");
    const url = (await res.text()).trim();
    if (!/^https?:\/\//.test(url)) throw new Error("공유 링크를 만들지 못했습니다.");
    return url;
  }

  function renderInfo(file, format, media) {
    const rows = [
      ["파일 이름", file.name],
      ["형식", format ? format.label : "알 수 없음"],
      ["확장자", extensionOf(file.name) ? `.${extensionOf(file.name)}` : "없음"],
      ["MIME", file.type || "없음"],
      ["파일 크기", formatBytes(file.size)],
      ["수정한 시각", file.lastModified ? new Date(file.lastModified).toLocaleString("ko-KR") : "없음"]
    ];
    if (media) {
      rows.push(
        ["해상도", `${media.width} × ${media.height} px`],
        ["화면 비율", aspectRatio(media.width, media.height)],
        ["재생 시간", formatDuration(media.duration)],
        ["사용 구간", media.duration > MAX_SECONDS ? `앞 ${MAX_SECONDS}초` : "전체"],
        ["원본 프레임", `${media.frameCount}장 · 최대 30FPS`]
      );
    }
    fileInfo.innerHTML = rows.map(([key, value]) => `<dt>${key}</dt><dd>${escapeHtml(String(value))}</dd>`).join("");
  }

  function setProgress(value, label) {
    const pct = Math.max(0, Math.min(100, value));
    progressFill.style.width = `${pct}%`;
    progressBar.setAttribute("aria-valuenow", String(pct));
    progressPct.textContent = `${pct}%`;
    if (label) progressLabel.textContent = label;
  }

  function showToast(message) {
    toast.hidden = false;
    toast.textContent = message;
  }

  function hideToast() {
    toast.hidden = true;
    toast.textContent = "";
  }

  function clearFrames() {
    sourceFrames.forEach((frame) => {
      if (frame && typeof frame.close === "function") frame.close();
    });
    sourceFrames = [];
  }

  async function snapshotFrame(canvas) {
    if (typeof createImageBitmap === "function") {
      return createImageBitmap(canvas);
    }
    const copy = document.createElement("canvas");
    copy.width = canvas.width;
    copy.height = canvas.height;
    copy.getContext("2d").drawImage(canvas, 0, 0);
    return copy;
  }

  function gifDelay(fps, speed) {
    return Math.max(2, Math.round(100 / (fps * speed)));
  }

  function clamp(value, min, max) {
    return Math.min(max, Math.max(min, value));
  }

  function extensionOf(name) {
    const match = /\.([^.]+)$/.exec(name || "");
    return match ? match[1].toLowerCase() : "";
  }

  function baseNameOf(name) {
    return String(name || "video").replace(/\.[^.]+$/, "") || "video";
  }

  function guessFormatByMime(type) {
    if (!type || !type.startsWith("video/")) return null;
    const raw = type.replace("video/", "").split(";")[0].toLowerCase();
    const alias = {
      "x-matroska": "mkv",
      quicktime: "mov",
      "x-msvideo": "avi",
      "x-ms-wmv": "wmv",
      "x-flv": "flv",
      mp2t: "ts",
      "mpeg-ts": "ts",
      ogg: "ogv"
    };
    return EXT_MAP.get(alias[raw] || raw) || null;
  }

  function formatBytes(bytes) {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
    if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(2)} MB`;
    return `${(bytes / 1024 ** 3).toFixed(2)} GB`;
  }

  function formatDuration(seconds) {
    const total = Math.max(0, seconds);
    const h = Math.floor(total / 3600);
    const m = Math.floor((total % 3600) / 60);
    const s = total % 60;
    const body = `${String(m).padStart(2, "0")}:${s.toFixed(1).padStart(4, "0")}`;
    return h ? `${h}:${body}` : body;
  }

  function aspectRatio(width, height) {
    const gcd = (a, b) => (b ? gcd(b, a % b) : a);
    const g = gcd(width, height) || 1;
    return `${width / g}:${height / g}`;
  }

  function escapeHtml(value) {
    return value.replace(/[&<>"']/g, (char) => ({
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;"
    }[char]));
  }

  function waitForMetadata(video) {
    if (video.readyState >= 1 && video.videoWidth) return Promise.resolve();
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup();
        reject(new Error("timeout"));
      }, 16000);
      const ok = () => {
        cleanup();
        resolve();
      };
      const fail = () => {
        cleanup();
        reject(new Error("decode"));
      };
      const cleanup = () => {
        clearTimeout(timer);
        video.removeEventListener("loadedmetadata", ok);
        video.removeEventListener("error", fail);
      };
      video.addEventListener("loadedmetadata", ok);
      video.addEventListener("error", fail);
      video.load();
    });
  }

  function seekVideo(video, time) {
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        cleanup();
        resolve();
      }, 1200);
      const ok = () => {
        cleanup();
        resolve();
      };
      const fail = () => {
        cleanup();
        reject(new Error("seek"));
      };
      const cleanup = () => {
        clearTimeout(timer);
        video.removeEventListener("seeked", ok);
        video.removeEventListener("error", fail);
      };
      video.addEventListener("seeked", ok);
      video.addEventListener("error", fail);
      try {
        video.currentTime = time;
      } catch (error) {
        cleanup();
        reject(error);
      }
    });
  }

  function yieldUi() {
    return new Promise((resolve) => {
      requestAnimationFrame(() => setTimeout(resolve, 0));
    });
  }

  function quantize(imageData) {
    const { data, width, height } = imageData;
    const counts = new Map();
    for (let i = 0; i < data.length; i += 4) {
      const key = ((data[i] >> 3) << 10) | ((data[i + 1] >> 3) << 5) | (data[i + 2] >> 3);
      counts.set(key, (counts.get(key) || 0) + 1);
    }

    const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 256);
    const palette = new Uint8Array(256 * 3);
    top.forEach(([key], index) => {
      palette[index * 3] = ((key >> 10) & 31) * 8 + 4;
      palette[index * 3 + 1] = ((key >> 5) & 31) * 8 + 4;
      palette[index * 3 + 2] = (key & 31) * 8 + 4;
    });

    const lookup = new Int16Array(32768).fill(-1);
    top.forEach(([key], index) => {
      lookup[key] = index;
    });

    const indexed = new Uint8Array(width * height);
    let pixel = 0;
    for (let i = 0; i < data.length; i += 4, pixel += 1) {
      const key = ((data[i] >> 3) << 10) | ((data[i + 1] >> 3) << 5) | (data[i + 2] >> 3);
      let index = lookup[key];
      if (index < 0) {
        let best = 0;
        let bestDist = Infinity;
        const r = (key >> 10) & 31;
        const g = (key >> 5) & 31;
        const b = key & 31;
        for (let c = 0; c < top.length; c += 1) {
          const pr = palette[c * 3] >> 3;
          const pg = palette[c * 3 + 1] >> 3;
          const pb = palette[c * 3 + 2] >> 3;
          const dist = (pr - r) ** 2 + (pg - g) ** 2 + (pb - b) ** 2;
          if (dist < bestDist) {
            bestDist = dist;
            best = c;
          }
        }
        index = best;
        lookup[key] = index;
      }
      indexed[pixel] = index;
    }

    return { palette, indexed };
  }

  function encodeGif(frames, width, height, delayCs) {
    const out = [];
    const pushStr = (text) => {
      for (let i = 0; i < text.length; i += 1) out.push(text.charCodeAt(i));
    };
    const push16 = (value) => {
      out.push(value & 255, (value >> 8) & 255);
    };

    pushStr("GIF89a");
    push16(width);
    push16(height);
    out.push(0x70, 0, 0);
    out.push(0x21, 0xff, 11);
    pushStr("NETSCAPE2.0");
    out.push(3, 1, 0, 0, 0);

    frames.forEach((frame) => {
      out.push(0x21, 0xf9, 4, 0x04, delayCs & 255, (delayCs >> 8) & 255, 0, 0);
      out.push(0x2c);
      push16(0);
      push16(0);
      push16(width);
      push16(height);
      out.push(0x87);
      for (let i = 0; i < 256 * 3; i += 1) out.push(frame.palette[i] || 0);
      out.push(8);
      const compressed = lzwEncode(frame.indexed, 8);
      for (let i = 0; i < compressed.length; i += 255) {
        const end = Math.min(i + 255, compressed.length);
        out.push(end - i);
        for (let j = i; j < end; j += 1) out.push(compressed[j]);
      }
      out.push(0);
    });

    out.push(0x3b);
    return new Blob([Uint8Array.from(out)], { type: "image/gif" });
  }

  function lzwEncode(pixels, minCodeSize) {
    const clear = 1 << minCodeSize;
    const eoi = clear + 1;
    const bits = [];
    let acc = 0;
    let nbits = 0;
    let codeSize = minCodeSize + 1;
    let nextCode = eoi + 1;
    let dict = new Map();

    const emit = (code) => {
      acc |= code << nbits;
      nbits += codeSize;
      while (nbits >= 8) {
        bits.push(acc & 255);
        acc >>>= 8;
        nbits -= 8;
      }
    };

    const reset = () => {
      dict = new Map();
      codeSize = minCodeSize + 1;
      nextCode = eoi + 1;
    };

    emit(clear);
    let prefix = pixels[0];

    for (let i = 1; i < pixels.length; i += 1) {
      const k = pixels[i];
      const key = (prefix << 8) + k;
      if (dict.has(key)) {
        prefix = dict.get(key);
      } else {
        emit(prefix);
        if (nextCode < 4096) {
          dict.set(key, nextCode);
          if (nextCode === 1 << codeSize && codeSize < 12) codeSize += 1;
          nextCode += 1;
        } else {
          emit(clear);
          reset();
        }
        prefix = k;
      }
    }

    emit(prefix);
    emit(eoi);
    if (nbits > 0) bits.push(acc & 255);
    return bits;
  }

  const GIPHY_KEY = "sXpGFDGZs0Dv1mmNFvYaGUvYwKX0PWIh";
  const GIPHY_LIMIT = 24;
  const EXPLORE_CATS = {
    trending: { label: "인기 GIF", query: "" },
    funny: { label: "웃긴 짤", query: "funny meme lol" },
    animals: { label: "동물", query: "cute animals" },
    gaming: { label: "게임", query: "gaming game" },
    anime: { label: "애니메이션", query: "anime cartoon animation" },
    reaction: { label: "반응", query: "reaction" },
    sports: { label: "스포츠", query: "sports" },
    love: { label: "사랑", query: "love heart" }
  };

  const exploreForm = document.getElementById("explore-form");
  const exploreQuery = document.getElementById("explore-query");
  const exploreCats = document.getElementById("explore-cats");
  const exploreStatus = document.getElementById("explore-status");
  const exploreGrid = document.getElementById("explore-grid");
  const exploreMore = document.getElementById("explore-more");
  const exploreSheet = document.getElementById("explore-sheet");
  const explorePreviewTitle = document.getElementById("explore-preview-title");
  const explorePreviewImage = document.getElementById("explore-preview-image");
  const explorePreviewMeta = document.getElementById("explore-preview-meta");
  const explorePreviewUrl = document.getElementById("explore-preview-url");
  const exploreCopy = document.getElementById("explore-copy");
  const exploreOpen = document.getElementById("explore-open");
  const explorePreviewClose = document.getElementById("explore-preview-close");
  const exploreTransferStatus = document.getElementById("explore-transfer-status");
  const explorePreviewStatus = document.getElementById("explore-preview-status");
  const exploreActions = {
    download: { label: "다운로드", busy: "다운로드 중…", icon: "M12 3v12m-4-4 4 4 4-4M4 16v4a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-4" },
    edit: { label: "편집으로 보내기", busy: "편집기로 보내는 중…", icon: "m13 6 5 5M4 20l5-1L20 8l-5-5L4 14z" }
  };
  const exploreDownloads = new Set();
  let exploreSending = null;
  let exploreNoticeTimer;
  let explorePreviewTrigger;

  const exploreState = {
    mode: "trending",
    query: "",
    offset: 0,
    total: 0,
    loading: false,
    items: new Map(),
    selected: null,
    loadedOnce: false
  };

  const navGifEdit = document.getElementById("nav-gif-edit");
  navGifEdit.addEventListener("click", () => showAppView("gif-edit"));
  navMake.addEventListener("click", () => showAppView(currentFile ? "editor" : "make"));
  navExplore.addEventListener("click", () => showAppView("explore"));

  exploreForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = exploreQuery.value.trim();
    if (!query) {
      setExploreCategory("trending");
      return;
    }
    setExploreCategory(null);
    exploreState.mode = "search";
    exploreState.query = query;
    loadExplore(false);
  });

  exploreCats.addEventListener("click", (event) => {
    const button = event.target.closest("[data-cat]");
    if (button) setExploreCategory(button.dataset.cat);
  });

  exploreMore.addEventListener("click", () => loadExplore(true));

  exploreGrid.addEventListener("click", (event) => {
    const tile = event.target.closest(".explore-tile");
    if (!tile) return;
    const item = exploreState.items.get(tile.closest("[data-gif-id]").dataset.gifId);
    if (item) openExplorePreview(item, tile);
  });

  exploreCopy.addEventListener("click", async () => {
    const url = exploreState.selected && exploreState.selected.pageUrl;
    if (!url) return;
    exploreCopy.textContent = (await copyText(url)) ? "복사됨" : "복사 실패";
  });

  explorePreviewClose.addEventListener("click", () => closeExplorePreview());
  exploreSheet.addEventListener("click", (event) => {
    if (event.target === exploreSheet) closeExplorePreview();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && !exploreSheet.hidden) closeExplorePreview();
  });

  function setExploreCategory(name) {
    exploreCats.querySelectorAll("[data-cat]").forEach((node) => {
      const selected = node.dataset.cat === name;
      node.classList.toggle("is-selected", selected);
      node.setAttribute("aria-pressed", selected ? "true" : "false");
    });
    if (!name) return;
    exploreQuery.value = "";
    exploreState.mode = name === "trending" ? "trending" : "category";
    exploreState.query = EXPLORE_CATS[name] ? EXPLORE_CATS[name].query : name;
    loadExplore(false);
  }

  async function loadExplore(append) {
    if (exploreState.loading) return;
    exploreState.loading = true;
    if (!append) {
      exploreState.offset = 0;
      exploreGrid.innerHTML = "";
      exploreState.items.clear();
      exploreMore.hidden = true;
      exploreStatus.textContent = "GIF를 불러오는 중입니다.";
    } else {
      exploreStatus.textContent = "GIF를 더 불러오는 중입니다.";
    }

    try {
      const json = await fetchGiphy(exploreState.offset);
      const list = (json.data || []).map(normalizeGiphy).filter((item) => item.thumb);
      list.forEach((item) => {
        exploreState.items.set(item.id, item);
        exploreGrid.appendChild(exploreTile(item));
      });
      const pagination = json.pagination || {};
      exploreState.offset = (pagination.offset || 0) + (pagination.count || list.length);
      exploreState.total = pagination.total_count || exploreState.offset;
      exploreState.loadedOnce = true;
      const label = exploreHeading();
      if (!exploreState.items.size) {
        exploreStatus.textContent = `${label}에 맞는 GIF를 찾지 못했습니다.`;
      } else {
        exploreStatus.textContent = `${label} · ${exploreState.items.size}장`;
      }
      exploreMore.hidden = exploreState.offset >= exploreState.total || !list.length;
    } catch (error) {
      exploreStatus.textContent = error.message || "GIF를 가져오지 못했습니다.";
      showToast("인터넷 GIF를 불러오지 못했습니다. 잠시 뒤 다시 시도해 주세요.");
    } finally {
      exploreState.loading = false;
    }
  }

  function exploreHeading() {
    if (exploreState.mode === "search") return `"${exploreState.query}" 검색`;
    if (exploreState.mode === "trending") return EXPLORE_CATS.trending.label;
    const match = Object.values(EXPLORE_CATS).find((item) => item.query === exploreState.query);
    return match ? match.label : exploreState.query;
  }

  async function fetchGiphy(offset) {
    const url = new URL(exploreState.mode === "trending"
      ? "https://api.giphy.com/v1/gifs/trending"
      : "https://api.giphy.com/v1/gifs/search");
    url.searchParams.set("api_key", GIPHY_KEY);
    url.searchParams.set("limit", String(GIPHY_LIMIT));
    url.searchParams.set("offset", String(offset));
    url.searchParams.set("rating", "pg-13");
    url.searchParams.set("lang", "ko");
    if (exploreState.mode !== "trending") url.searchParams.set("q", exploreState.query);
    const res = await fetch(url);
    if (!res.ok) throw new Error("GIPHY에서 GIF를 가져오지 못했습니다.");
    return res.json();
  }

  function normalizeGiphy(item) {
    const images = item.images || {};
    const thumb = (images.fixed_width && (images.fixed_width.webp || images.fixed_width.url))
      || (images.preview_gif && images.preview_gif.url)
      || "";
    const full = (images.downsized_medium && images.downsized_medium.url)
      || (images.original && images.original.url)
      || thumb;
    return {
      id: item.id,
      title: (item.title || "").trim(),
      pageUrl: item.url || `https://giphy.com/gifs/${item.id}`,
      thumb,
      full,
      gifUrl: images.original?.url || images.downsized_medium?.url || images.fixed_width?.url
    };
  }

  function makeExploreAction(action, getItem) {
    const { label, icon } = exploreActions[action];
    const button = document.createElement("button");
    button.type = "button";
    button.className = "ghost explore-action";
    button.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
      stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${icon}"/></svg><span>${label}</span>`;
    button.dataset.exploreAction = action;
    button.addEventListener("click", () => {
      const item = getItem();
      if (item) transferExploreGif(item, action);
    });
    return button;
  }

  function updateExploreAction(button, item) {
    const action = button.dataset.exploreAction;
    const busy = action === "download" ? exploreDownloads.has(item.id) : exploreSending === item.id;
    const disabled = busy || (action === "edit" && exploreSending !== null);
    button.setAttribute("aria-busy", String(busy));
    button.setAttribute("aria-disabled", String(disabled));
    button.querySelector("span").textContent = busy ? exploreActions[action].busy : exploreActions[action].label;
  }

  function refreshExploreActions() {
    for (const button of exploreGrid.querySelectorAll("[data-explore-action]")) {
      const item = exploreState.items.get(button.closest("[data-gif-id]").dataset.gifId);
      if (item) updateExploreAction(button, item);
    }
    if (exploreState.selected) {
      for (const button of exploreSheet.querySelectorAll("[data-explore-action]")) {
        updateExploreAction(button, exploreState.selected);
      }
    }
  }

  function exploreTile(item) {
    const card = document.createElement("article");
    card.className = "explore-item";
    card.dataset.gifId = item.id;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "explore-tile";
    button.setAttribute("aria-label", `${item.title || "GIF"} 크게 보기`);
    const img = document.createElement("img");
    img.src = item.thumb;
    img.alt = "";
    img.loading = "lazy";
    img.decoding = "async";
    button.appendChild(img);
    const actions = document.createElement("div");
    actions.className = "explore-tile-actions";
    for (const action of Object.keys(exploreActions)) {
      const control = makeExploreAction(action, () => item);
      updateExploreAction(control, item);
      actions.append(control);
    }
    card.append(button, actions);
    return card;
  }

  const previewActions = exploreOpen.parentElement;
  for (const action of Object.keys(exploreActions)) {
    previewActions.append(makeExploreAction(action, () => exploreState.selected));
  }

  function openExplorePreview(item, trigger) {
    exploreState.selected = item;
    explorePreviewTrigger = trigger;
    explorePreviewTitle.textContent = item.title || "GIF 미리보기";
    explorePreviewImage.src = item.full;
    explorePreviewImage.alt = item.title || "선택한 GIF";
    explorePreviewMeta.textContent = "이 GIF의 링크를 복사해 공유할 수 있습니다.";
    explorePreviewUrl.href = item.pageUrl;
    explorePreviewUrl.textContent = item.pageUrl;
    exploreOpen.href = item.pageUrl;
    exploreCopy.textContent = "링크 복사";
    explorePreviewStatus.hidden = true;
    exploreSheet.hidden = false;
    refreshExploreActions();
    explorePreviewClose.focus();
  }

  function closeExplorePreview(restoreFocus = true) {
    exploreSheet.hidden = true;
    explorePreviewImage.removeAttribute("src");
    exploreState.selected = null;
    if (restoreFocus) explorePreviewTrigger?.focus();
    explorePreviewTrigger = null;
  }

  function showExploreTransfer(item, action, message, { error = false, pending = false } = {}) {
    const inPreview = !exploreSheet.hidden && exploreState.selected?.id === item.id;
    const notice = inPreview ? explorePreviewStatus : exploreTransferStatus;
    const key = `${item.id}:${action}`;
    if (inPreview && exploreTransferStatus.dataset.transfer === key) exploreTransferStatus.hidden = true;
    notice.dataset.transfer = key;
    notice.textContent = message;
    notice.hidden = false;
    notice.classList.toggle("is-error", error);
    if (!inPreview) {
      clearTimeout(exploreNoticeTimer);
      if (!pending) exploreNoticeTimer = setTimeout(() => { notice.hidden = true; }, 6500);
    }
  }

  function exploreFileName(item) {
    const clean = (name) => Array.from(name.replace(/[^\S\r\n]+/g, " ")
      .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "_").trim().replace(/[. ]+$/, "")
      .replace(/\.gif$/i, "").replace(/[. ]+$/, "")).slice(0, 100).join("").trim();
    let base = clean(item.title) || clean(String(item.id)) || "animation";
    if (/^(?:CON|PRN|AUX|NUL|COM[1-9¹²³]|LPT[1-9¹²³])(?:\.|$)/i.test(base)) base = `_${base}`;
    return `${base}.gif`;
  }

  async function fetchExploreGif(item) {
    if (!item.gifUrl) throw new Error("GIF 파일 주소가 없습니다.");
    const response = await fetch(item.gifUrl, { credentials: "omit", signal: AbortSignal.timeout(30000) });
    if (!response.ok) throw new Error("GIPHY에서 GIF 파일을 받지 못했습니다.");
    const blob = await response.blob();
    const header = await blob.slice(0, 6).text();
    if (header !== "GIF87a" && header !== "GIF89a") throw new Error("받은 파일이 GIF 형식이 아닙니다.");
    return new File([blob], exploreFileName(item), { type: "image/gif" });
  }

  function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = name;
    document.body.append(link);
    link.click();
    link.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
  }

  async function transferExploreGif(item, action) {
    const download = action === "download";
    if (download ? exploreDownloads.has(item.id) : exploreSending !== null) return;
    if (download) exploreDownloads.add(item.id);
    else exploreSending = item.id;
    refreshExploreActions();
    showExploreTransfer(item, action, download ? "GIF를 다운로드하는 중입니다…" : "GIF를 편집기로 보내는 중입니다…", { pending: true });
    try {
      const file = await fetchExploreGif(item);
      if (download) {
        downloadBlob(file, file.name);
        showExploreTransfer(item, action, `GIF 다운로드 완료 · ${file.name}`);
      } else {
        await gifEditor.openFile(file);
        if (!exploreSheet.hidden) closeExplorePreview(false);
        showAppView("gif-edit");
        gifEditor.focusTools();
        showExploreTransfer(item, action, "GIF를 편집기에 열었습니다.");
      }
    } catch (error) {
      const detail = error instanceof TypeError ? "" : ` ${error.message}`;
      const message = download ? "GIF 다운로드에 실패했습니다." : "GIF를 편집기로 보내지 못했습니다.";
      showExploreTransfer(item, action, message + detail, { error: true });
    } finally {
      if (download) exploreDownloads.delete(item.id);
      else exploreSending = null;
      refreshExploreActions();
    }
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch (_) {
      const field = document.createElement("textarea");
      field.value = text;
      field.setAttribute("readonly", "");
      field.style.position = "fixed";
      field.style.left = "-9999px";
      document.body.appendChild(field);
      field.select();
      const ok = document.execCommand("copy");
      field.remove();
      return ok;
    }
  }
  const gifEditor = window.initializeGifEditor({ lzwEncode, formatBytes, downloadBlob });
  showAppView("gif-edit");
})();
