(() => {
  "use strict";

  const MAX_PIXELS = 64 * 1024 * 1024;
  const PICKER_ID = "gif-editor-source";
  const TOOLS = {
    Resize: ["M9 4H4v5m11-5h5v5m0 6v5h-5M4 15v5h5M4 4l5 5m11 11-5-5", "크기 조절"],
    Crop: ["M7 3v14h14M3 7h14v14m0-14 3-3", "이미지 자르기"],
    Downsizing: ["M4 4l6 6m0-5v5H5m15 10-6-6m0 5v-5h5", "용량 줄이기"],
    "Format Convert": ["M4 7h15m-4-4 4 4-4 4M20 17H5m4-4-4 4 4 4", "형식 변환"],
    Rotate: ["M4 11a8 8 0 1 1 3 7M4 5v6h6", "회전·뒤집기"],
    Optimize: ["M13 2 4 14h7l-1 8 10-12h-7l1-8z", "최적화"],
    Reverse: ["M14 5 5 12l9 7zM19 5v14", "역재생"],
    Speed: ["M4 19a9 9 0 1 1 16 0H4zm8-4 4-5", "재생 속도"],
    Cut: ["M4 7a3 3 0 1 0 6 0 3 3 0 1 0-6 0zm0 10a3 3 0 1 0 6 0 3 3 0 1 0-6 0zm5-8 12 11M9 15 21 4", "구간 자르기"]
  };

  const LOCKED = "M7 11V7a5 5 0 0 1 10 0v4M5 11h14v10H5z";
  const UNLOCKED = "M7 11V7a5 5 0 0 1 9-3M5 11h14v10H5z";
  const icon = (path) => `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="${path}"/></svg>`;
  const label = (en, ko) => `${en} · ${ko}`;
  const markedLabel = (en, ko) => `<span class="gif-label"><span lang="en">${en}</span> · ${ko}</span>`;
  const hint = (en, ko) => `<p class="gif-hint"><span lang="en">${en}</span><span lang="ko">${ko}</span></p>`;
  class GifEditorError extends Error {
    constructor(en, ko) { super(label(en, ko)); }
  }
  const readableError = (error, en, ko) => error instanceof GifEditorError ? error.message : label(en, ko);
  const wait = (ms = 0) => new Promise((resolve) => setTimeout(resolve, ms));
  const totalDelay = (frames) => frames.reduce((sum, frame) => sum + frame.delay, 0);

  function makeCanvas(width, height) {
    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    return canvas;
  }

  function checkSize(width, height, count) {
    if (!width || !height || Math.max(width, height) > 16384 || width * height * count > MAX_PIXELS) {
      throw new GifEditorError("The image or frame count is too large. Try a smaller GIF.", "이미지 크기나 프레임 수가 너무 큽니다. 더 작은 GIF를 사용해 주세요.");
    }
  }

  // Read the loop extension and find comments that can be removed without re-encoding.
  function inspectGif(data) {
    const signature = String.fromCharCode(...data.subarray(0, 6));
    if (!/^GIF8[79]a$/.test(signature) || data.length < 14) {
      throw new GifEditorError("Invalid file. Select a GIF to edit.", "잘못된 파일입니다. 편집 가능한 포맷은 GIF입니다. GIF 파일을 다시 선택해 주세요.");
    }
    let offset = 13;
    let loop = null;
    const comments = [];
    if (data[10] & 128) offset += 3 * (2 << (data[10] & 7));
    const skipBlocks = () => {
      while (offset < data.length) {
        const length = data[offset++];
        if (!length) return;
        offset += length;
      }
      throw new GifEditorError("The GIF data is incomplete.", "GIF 파일의 데이터가 끝까지 들어 있지 않습니다.");
    };

    while (offset < data.length) {
      const start = offset;
      const block = data[offset++];
      if (block === 0x3b) return { loop, comments, end: offset };
      if (block === 0x21) {
        const label = data[offset++];
        if (label === 0xff && data[offset] === 11 && data[offset + 12] === 3 && data[offset + 13] === 1) {
          const name = String.fromCharCode(...data.subarray(offset + 1, offset + 12));
          if (name === "NETSCAPE2.0" || name === "ANIMEXTS1.0") {
            loop = data[offset + 14] + 256 * data[offset + 15];
          }
        }
        skipBlocks();
        if (label === 0xfe) comments.push([start, offset]);
      } else if (block === 0x2c) {
        const flags = data[offset + 8];
        offset += 9;
        if (flags & 128) offset += 3 * (2 << (flags & 7));
        offset += 1;
        skipBlocks();
      } else {
        break;
      }
    }
    throw new GifEditorError("The GIF is damaged. Try another GIF.", "손상된 GIF 파일입니다. 다른 GIF 파일을 선택해 주세요.");
  }

  async function decodeGif(file) {
    const data = new Uint8Array(await file.arrayBuffer());
    const { loop } = inspectGif(data);
    if (!("ImageDecoder" in window) || !await ImageDecoder.isTypeSupported("image/gif")) {
      throw new GifEditorError("GIF editing requires a supported browser such as Chrome or Edge.", "이 브라우저에서는 GIF 편집을 지원하지 않습니다. Chrome 또는 Edge에서 열어 주세요.");
    }
    const decoder = new ImageDecoder({ data, type: "image/gif" });
    try {
      await decoder.tracks.ready;
      const count = decoder.tracks.selectedTrack?.frameCount || 0;
      if (!count) throw new GifEditorError("The GIF has no playable frames.", "재생할 수 있는 GIF 프레임이 없습니다.");
      const frames = [];
      for (let i = 0; i < count; i += 1) {
        const { image } = await decoder.decode({ frameIndex: i });
        try {
          const width = image.displayWidth;
          const height = image.displayHeight;
          checkSize(width, height, count);
          const canvas = makeCanvas(width, height);
          canvas.getContext("2d", { willReadFrequently: true }).drawImage(image, 0, 0);
          frames.push({ canvas, delay: Math.max(1, Math.round((image.duration || 100000) / 10000)) });
        } finally {
          image.close();
        }
      }
      return { frames, loop, width: frames[0].canvas.width, height: frames[0].canvas.height };
    } finally {
      decoder.close();
    }
  }

  function indexColors(pixels, limit, exactOnly, useTransparency) {
    const indexed = new Uint8Array(pixels.length / 4);
    const colors = useTransparency ? [0] : [];
    const lookup = new Map();
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 128) continue;
      const key = (pixels[i] << 16) | (pixels[i + 1] << 8) | pixels[i + 2];
      if (!lookup.has(key)) {
        if (colors.length === limit) {
          return exactOnly ? null : reduceColors(pixels, limit, useTransparency);
        }
        lookup.set(key, colors.length);
        colors.push(key);
      }
      indexed[i / 4] = lookup.get(key);
    }
    return { indexed, colors };
  }

  function reduceColors(pixels, limit, useTransparency) {
    const counts = new Map();
    const keyAt = (i) => ((pixels[i] >> 3) << 10) | ((pixels[i + 1] >> 3) << 5) | (pixels[i + 2] >> 3);
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 128) continue;
      const key = keyAt(i);
      counts.set(key, (counts.get(key) || 0) + 1);
    }
    const first = Number(useTransparency);
    const keys = [...counts.keys()].sort((a, b) => counts.get(b) - counts.get(a)).slice(0, limit - first);
    const channels = (key) => [key >> 10, (key >> 5) & 31, key & 31];
    const palette = keys.map(channels);
    const colors = useTransparency ? [0] : [];
    for (const [r, g, b] of palette) colors.push(((r * 8 + 4) << 16) | ((g * 8 + 4) << 8) | (b * 8 + 4));
    const lookup = new Map(keys.map((key, i) => [key, i + first]));
    const indexed = new Uint8Array(pixels.length / 4);
    for (let i = 0; i < pixels.length; i += 4) {
      if (pixels[i + 3] < 128) continue;
      const key = keyAt(i);
      if (!lookup.has(key)) {
        const [r, g, b] = channels(key);
        let nearest = 0;
        let distance = Infinity;
        palette.forEach(([pr, pg, pb], j) => {
          const error = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2;
          if (error < distance) {
            distance = error;
            nearest = j;
          }
        });
        lookup.set(key, nearest + first);
      }
      indexed[i / 4] = lookup.get(key);
    }
    return { indexed, colors };
  }

  function changedArea(before, after, width, height) {
    let left = width;
    let right = -1;
    let top = height;
    let bottom = -1;
    for (let i = 0; i < after.length; i += 1) {
      if (before[i] === after[i]) continue;
      const x = i % width;
      const y = Math.floor(i / width);
      left = Math.min(left, x);
      right = Math.max(right, x);
      top = Math.min(top, y);
      bottom = Math.max(bottom, y);
    }
    if (right === -1) return null;
    return { left, top, w: right - left + 1, h: bottom - top + 1 };
  }

  async function encodeGif(animation, lzwEncode, { limit = 256, optimize = false } = {}) {
    const { width, height, frames, loop } = animation;
    checkSize(width, height, frames.length);
    const parts = [];
    const word = (value) => [value & 255, (value >> 8) & 255];
    const append = (...bytes) => parts.push(Uint8Array.from(bytes));
    const full = { left: 0, top: 0, w: width, h: height };
    const transparent = frames.some(({ canvas }) => {
      const pixels = canvas.getContext("2d").getImageData(0, 0, width, height).data;
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] < 128) return true;
      }
      return false;
    });
    parts.push("GIF89a");
    append(...word(width), ...word(height), 0xf0, 0, 0, 0, 0, 0, 0, 0, 0);
    if (loop !== null) {
      append(0x21, 0xff, 11);
      parts.push("NETSCAPE2.0");
      append(3, 1, ...word(loop), 0);
    }

    let previous;
    for (const frame of frames) {
      const context = frame.canvas.getContext("2d");
      let area = full;
      if (optimize && !transparent) {
        const pixels = new Uint32Array(context.getImageData(0, 0, width, height).data.buffer);
        if (previous) area = changedArea(previous, pixels, width, height) || { left: 0, top: 0, w: 1, h: 1 };
        previous = pixels;
      }
      const { left, top, w, h } = area;
      const data = context.getImageData(left, top, w, h).data;
      const result = indexColors(data, limit, optimize, transparent);
      if (!result) return null;
      const { indexed, colors } = result;
      const bits = Math.max(1, Math.ceil(Math.log2(colors.length || 1)));
      const codeSize = Math.max(2, bits);
      const palette = new Uint8Array((1 << bits) * 3);
      colors.forEach((color, i) => {
        palette[i * 3] = color >> 16;
        palette[i * 3 + 1] = color >> 8;
        palette[i * 3 + 2] = color;
      });
      const compressed = lzwEncode(indexed, codeSize);
      for (let delay = frame.delay; delay > 0; delay -= 65535) {
        append(0x21, 0xf9, 4, transparent ? 0x09 : 0x04, ...word(Math.min(delay, 65535)), 0, 0);
        append(0x2c, ...word(left), ...word(top), ...word(w), ...word(h), 0x80 | (bits - 1));
        parts.push(palette);
        append(codeSize);
        for (let i = 0; i < compressed.length; i += 255) {
          const chunk = compressed.slice(i, i + 255);
          const block = Uint8Array.from([chunk.length, ...chunk]);
          parts.push(block);
        }
        append(0);
      }
      await wait();
    }
    append(0x3b);
    return new Blob(parts, { type: "image/gif" });
  }

  async function transform(animation, width, height, draw) {
    checkSize(width, height, animation.frames.length);
    const frames = [];
    for (const frame of animation.frames) {
      const canvas = makeCanvas(width, height);
      draw(canvas.getContext("2d", { willReadFrequently: true }), frame.canvas);
      frames.push({ canvas, delay: frame.delay });
      await wait();
    }
    return { ...animation, frames, width, height };
  }

  async function optimizeGif(animation, blob, lzwEncode) {
    const data = new Uint8Array(await blob.arrayBuffer());
    const { comments, end } = inspectGif(data);
    const parts = [];
    let offset = 0;
    for (const [start, next] of comments) {
      parts.push(data.subarray(offset, start));
      offset = next;
    }
    parts.push(data.subarray(offset, end));
    const stripped = new Blob(parts, { type: "image/gif" });
    const encoded = await encodeGif(animation, lzwEncode, { optimize: true });
    return encoded && encoded.size < stripped.size ? encoded : stripped;
  }

  function mp4Type() {
    return window.MediaRecorder && ["video/mp4;codecs=avc1", "video/mp4"].find((type) => MediaRecorder.isTypeSupported(type));
  }

  async function convertMp4(animation) {
    const type = mp4Type();
    if (!type) throw new GifEditorError("This browser does not support MP4 conversion.", "이 브라우저에서는 MP4 변환을 지원하지 않습니다.");
    const width = animation.width + animation.width % 2;
    const height = animation.height + animation.height % 2;
    const canvas = makeCanvas(width, height);
    const context = canvas.getContext("2d", { alpha: false });
    const stream = canvas.captureStream(60);
    const track = stream.getVideoTracks()[0];
    try {
      const recorder = new MediaRecorder(stream, { mimeType: type });
      const chunks = [];
      const stopped = new Promise((resolve, reject) => {
        recorder.addEventListener("dataavailable", (event) => chunks.push(event.data));
        recorder.addEventListener("stop", () => resolve(new Blob(chunks, { type: "video/mp4" })));
        recorder.addEventListener("error", (event) => reject(event.error), { once: true });
      });
      const record = async () => {
        recorder.start();
        let deadline = performance.now();
        for (const frame of animation.frames) {
          if (recorder.state !== "recording") return;
          context.fillStyle = "#fff";
          context.fillRect(0, 0, width, height);
          context.drawImage(frame.canvas, 0, 0);
          track.requestFrame();
          deadline += Math.max(17, frame.delay * 10);
          await wait(Math.max(0, deadline - performance.now()));
        }
        // Keep the final frame available to the encoder before stopping.
        context.drawImage(animation.frames.at(-1).canvas, 0, 0);
        track.requestFrame();
        await wait(20);
        if (recorder.state === "recording") recorder.stop();
      };
      const [blob] = await Promise.all([stopped, record()]);
      if (!blob.size) throw new GifEditorError("Could not create the MP4.", "MP4 파일을 만들 수 없습니다.");
      return { blob, width, height, extension: "mp4" };
    } finally {
      track.stop();
    }
  }

  function convertJpg(animation, frameIndex) {
    const { width, height } = animation;
    const canvas = makeCanvas(width, height);
    const context = canvas.getContext("2d");
    context.fillStyle = "#fff";
    context.fillRect(0, 0, width, height);
    context.drawImage(animation.frames[frameIndex].canvas, 0, 0);
    return new Promise((resolve, reject) => canvas.toBlob((blob) => {
      if (blob) resolve({ blob, width, height, extension: "jpg" });
      else reject(new GifEditorError("Could not create the JPG.", "JPG 파일을 만들 수 없습니다."));
    }, "image/jpeg", 0.94));
  }

  window.initializeGifEditor = ({ lzwEncode, formatBytes, downloadBlob }) => {
    const get = (id) => document.getElementById(`gif-${id}`);
    const upload = get("upload");
    const input = get("file");
    const pick = get("pick");
    const uploadError = get("upload-error");
    const workspace = get("workspace");
    const grid = get("tool-grid");
    const heading = get("tools-title");
    const form = get("tool-form");
    const options = get("tool-options");
    const apply = get("apply");
    const cancel = get("cancel");
    const save = get("save");
    const reset = get("reset");
    const download = get("download");
    const status = get("work-status");
    const originalPanel = get("original");
    const resultPanel = get("result");
    let source;
    let sourceHandle;
    let animation;
    let gifBlob;
    let result;
    let tool;
    let toolButtons;
    let busy = false;
    const previewUrls = new Map();

    function report(message = "", error = false) {
      status.textContent = message;
      status.hidden = !message;
      status.classList.toggle("gif-error", error);
    }

    function setBusy(value) {
      busy = value;
      pick.disabled = value;
      cancel.disabled = value;
      apply.disabled = value;
      reset.disabled = value;
      download.disabled = value;
      save.disabled = value || !result;
      toolButtons.forEach((button) => { button.disabled = value; });
    }

    function releasePreview(id) {
      if (previewUrls.has(id)) URL.revokeObjectURL(previewUrls.get(id));
      previewUrls.delete(id);
      get(`${id}-preview`).replaceChildren();
    }

    function display(id, blob, name, meta) {
      releasePreview(id);
      const isVideo = blob.type === "video/mp4";
      const media = document.createElement(isVideo ? "video" : "img");
      if (isVideo) {
        media.controls = true;
        media.playsInline = true;
      } else {
        media.alt = id === "original" ? label("Original GIF preview", "원본 GIF 미리보기") : label("Edit result preview", "편집 결과 미리보기");
      }
      const url = URL.createObjectURL(blob);
      previewUrls.set(id, url);
      media.src = url;
      get(`${id}-preview`).append(media);
      const fields = {
        [label("Filename", "파일명")]: name,
        [label("Dimensions", "크기")]: `${meta.width} × ${meta.height} px`,
        [label("File Size", "용량")]: formatBytes(blob.size)
      };
      if (meta.frames) {
        fields[label("Frames", "프레임")] = String(meta.frames.length);
        fields[label("Duration", "재생 시간")] = `${(totalDelay(meta.frames) / 100).toFixed(2)} s`;
      }
      const list = get(`${id}-meta`);
      list.replaceChildren();
      for (const [key, value] of Object.entries(fields)) {
        const dt = document.createElement("dt");
        const dd = document.createElement("dd");
        dt.textContent = key;
        dd.textContent = value;
        list.append(dt, dd);
      }
    }

    function showUploadNotice(message = "") {
      uploadError.hidden = !message;
      uploadError.textContent = message;
    }

    async function openFile(file, getHandle) {
      if (busy) throw new GifEditorError("Wait for the current edit to finish.", "진행 중인 작업이 끝난 후 다시 시도해 주세요.");
      setBusy(true);
      showUploadNotice();
      pick.textContent = "GIF 여는 중…";
      try {
        const [decoded, handle] = await Promise.all([decodeGif(file), getHandle || null]);
        source = file;
        sourceHandle = handle?.kind === "file" ? handle : null;
        animation = decoded;
        gifBlob = file.slice(0, file.size, "image/gif");
        result = null;
        resultPanel.hidden = true;
        releasePreview("result");
        report();
        showGrid(false);
        display("original", gifBlob, source.name, animation);
        originalPanel.open = true;
        upload.hidden = true;
        workspace.hidden = false;
      } finally {
        setBusy(false);
        pick.textContent = "GIF 파일 선택";
      }
    }

    const focusTools = () => heading.focus();
    async function loadSelectedFile(file, getHandle) {
      if (!file || busy) return;
      try {
        await openFile(file, getHandle);
        focusTools();
      } catch (error) {
        showUploadNotice(readableError(error, "Could not open the GIF. Try another file.", "GIF를 열 수 없습니다. 다른 GIF 파일을 선택해 주세요."));
      }
    }

    pick.addEventListener("click", async () => {
      if (!window.showOpenFilePicker) {
        input.click();
        return;
      }
      try {
        const [handle] = await window.showOpenFilePicker({
          id: PICKER_ID,
          multiple: false,
          types: [{ description: "GIF 이미지", accept: { "image/gif": [".gif"] } }]
        });
        await loadSelectedFile(await handle.getFile(), handle);
      } catch (error) {
        if (error.name === "SecurityError") input.click();
        else if (error.name !== "AbortError") showUploadNotice("파일을 열 수 없습니다. GIF 파일을 다시 선택해 주세요.");
      }
    });
    input.addEventListener("change", () => {
      loadSelectedFile(input.files[0]);
      input.value = "";
    });
    upload.addEventListener("dragover", (event) => {
      event.preventDefault();
      upload.classList.add("is-dragging");
    });
    upload.addEventListener("dragleave", (event) => {
      if (!upload.contains(event.relatedTarget)) upload.classList.remove("is-dragging");
    });
    upload.addEventListener("drop", (event) => {
      event.preventDefault();
      upload.classList.remove("is-dragging");
      if (busy) return;
      const { files, items } = event.dataTransfer;
      if (files.length !== 1) {
        showUploadNotice("GIF 파일 한 개만 놓아 주세요.");
        return;
      }
      const handle = items[0]?.getAsFileSystemHandle?.().catch(() => null);
      loadSelectedFile(files[0], handle);
    });

    toolButtons = Object.entries(TOOLS).map(([name, [path, korean]]) => {
      const button = document.createElement("button");
      button.type = "button";
      button.dataset.tool = name;
      button.innerHTML = `${icon(path)}<span lang="en">${name}</span><span lang="ko">${korean}</span>`;
      button.addEventListener("click", () => showTool(name));
      grid.append(button);
      return button;
    });

    function showGrid(moveFocus = true) {
      const focus = toolButtons[Object.keys(TOOLS).indexOf(tool)];
      tool = null;
      form.hidden = true;
      grid.hidden = false;
      get("footer").hidden = false;
      heading.innerHTML = markedLabel("Editor Tools", "편집 도구");
      options.replaceChildren();
      if (moveFocus) (focus && !focus.disabled ? focus : heading).focus();
    }

    function range(id, label, min, max, value, step, unit) {
      return `<label class="gif-control"><span class="gif-range-label"><span>${label}</span><output for="${id}">${value}${unit}</output></span>
        <input type="range" id="${id}" name="${id}" min="${min}" max="${max}" step="${step}" value="${value}" data-unit="${unit}"></label>`;
    }

    function showTool(name) {
      if (busy) return;
      tool = name;
      const { width, height, frames } = animation;
      grid.hidden = true;
      get("footer").hidden = true;
      form.hidden = false;
      heading.innerHTML = markedLabel(name, TOOLS[name][1]);
      report();
      switch (name) {
        case "Resize":
          options.innerHTML = range("gif-width", label("Width (X)", "가로(X축)"), Math.max(1, Math.ceil(width * .05)), width * 3, width, 1, " px")
            + '<button type="button" class="gif-lock" id="gif-lock" aria-pressed="true"></button>'
            + range("gif-height", label("Height (Y)", "세로(Y축)"), Math.max(1, Math.ceil(height * .05)), height * 3, height, 1, " px");
          bindRatio(width, height);
          break;
        case "Crop":
          options.innerHTML = `<label class="gif-control">${markedLabel("Aspect Ratio", "출력 비율")}<select name="ratio">
            <option>1:1</option><option>4:3</option><option>16:9</option><option>9:16</option><option>3:2</option>
            </select></label>
            <label class="gif-control">${markedLabel("Fill Mode", "빈 공간 처리")}<select name="fill">
            <option value="color">Fit with solid color · 이미지 전체를 단색 배경에 맞추기</option>
            <option value="cover">Zoom to fill · 확대해 채우고 가장자리 자르기</option>
            </select></label>
            <label class="gif-control">${markedLabel("Fill Color", "채우기 색상")}<input name="color" type="color" value="#ffffff"></label>`;
          form.elements.fill.addEventListener("change", () => {
            form.elements.color.closest("label").hidden = form.elements.fill.value !== "color";
          });
          break;
        case "Downsizing":
          options.innerHTML = `<label class="gif-check"><input name="scale" type="checkbox"><span>${markedLabel("Scale to 75%", "가로·세로 75%로 축소")}</span></label>
            <label class="gif-check"><input name="drop" type="checkbox" ${frames.length === 1 ? "disabled" : ""}><span>${markedLabel("Keep every other frame", "프레임을 두 장마다 한 장 유지")}</span></label>
            <label class="gif-check"><input name="resolution" type="checkbox"><span>${markedLabel("Reduce detail and colors", "픽셀 디테일과 색상 수 줄이기")}</span></label>`;
          break;
        case "Format Convert":
          options.innerHTML = `<label class="gif-control">${markedLabel("Output Format", "저장 형식")}<select name="format">
            <option value="mp4" ${mp4Type() ? "" : "disabled"}>${mp4Type() ? "MP4 Video · MP4 동영상" : "MP4 (Unavailable) · MP4 (지원되지 않음)"}</option>
            <option value="jpg" ${mp4Type() ? "" : "selected"}>JPG Still Image · JPG 이미지 한 장</option>
            </select></label>
            <div id="gif-jpg-frame" ${mp4Type() ? "hidden" : ""}>${range("gif-frame", label("JPG Frame", "JPG로 저장할 프레임"), 1, frames.length, 1, 1, "")}</div>`;
          form.elements.format.addEventListener("change", () => {
            get("jpg-frame").hidden = form.elements.format.value !== "jpg";
          });
          break;
        case "Rotate":
          options.innerHTML = `<label class="gif-control">${markedLabel("Direction", "변환 방향")}<select name="rotation">
            <option value="90">90° Clockwise · 시계 방향 90°</option><option value="180">180° Rotation · 180° 회전</option>
            <option value="270">270° Clockwise · 시계 방향 270°</option>
            <option value="horizontal">Flip Horizontally · 좌우 뒤집기</option><option value="vertical">Flip Vertically · 상하 뒤집기</option>
            </select></label>`;
          break;
        case "Optimize":
          options.innerHTML = hint("Reduce file size while preserving image quality and playback duration.", "화질과 재생 시간을 유지하며 용량을 줄입니다.");
          break;
        case "Reverse":
          options.innerHTML = hint("Play the frames in reverse order.", "마지막 프레임부터 거꾸로 재생합니다.");
          break;
        case "Speed":
          options.innerHTML = range("gif-speed", label("Playback Speed", "재생 속도"), 0.25, 4, 1, 0.05, "×");
          break;
        case "Cut": {
          const duration = (totalDelay(frames) / 100).toFixed(2);
          options.innerHTML = `${hint(`Total duration: ${duration} s`, `전체 재생 시간 ${duration}초`)}
            <label class="gif-control">${markedLabel("Start Time (s)", "시작 시간(초)")}<input type="number" name="start" min="0" max="${duration}" step="0.01" value="0" required></label>
            <label class="gif-control">${markedLabel("End Time (s)", "끝 시간(초)")}<input type="number" name="end" min="0.01" max="${duration}" step="0.01" value="${duration}" required></label>`;
          break;
        }
      }
      options.querySelectorAll("input[type=range]").forEach((slider) => {
        slider.addEventListener("input", () => updateRange(slider));
      });
      heading.focus();
    }

    function updateRange(slider) {
      slider.closest("label").querySelector("output").value = slider.value + slider.dataset.unit;
    }

    function bindRatio(width, height) {
      const x = get("width");
      const y = get("height");
      const lock = get("lock");
      let locked = true;
      const renderLock = () => {
        lock.setAttribute("aria-pressed", String(locked));
        lock.innerHTML = icon(locked ? LOCKED : UNLOCKED)
          + markedLabel(locked ? "Ratio Locked" : "Ratio Unlocked", locked ? "비율 잠금" : "비율 잠금 해제");
      };
      const sync = (from, other, factor) => {
        if (!locked) return;
        other.value = String(Math.round(Number(from.value) * factor));
        updateRange(other);
      };
      x.addEventListener("input", () => sync(x, y, height / width));
      y.addEventListener("input", () => sync(y, x, width / height));
      lock.addEventListener("click", () => {
        locked = !locked;
        renderLock();
        sync(x, y, height / width);
      });
      renderLock();
    }

    cancel.addEventListener("click", () => {
      report();
      showGrid();
    });

    function resize(width, height) {
      return transform(animation, width, height, (context, frame) => {
        context.imageSmoothingQuality = "high";
        context.drawImage(frame, 0, 0, width, height);
      });
    }

    async function edit(values) {
      const { width, height, frames } = animation;
      switch (tool) {
        case "Resize":
          return resize(Number(values.get("gif-width")), Number(values.get("gif-height")));
        case "Crop": {
          const [x, y] = values.get("ratio").split(":").map(Number);
          const scale = Math.max(1, Math.floor(Math.min(width / x, height / y)));
          const w = x * scale;
          const h = y * scale;
          const padding = values.get("fill") === "color";
          const zoom = padding ? Math.min(w / width, h / height) : Math.max(w / width, h / height);
          return transform(animation, w, h, (context, frame) => {
            if (padding) {
              context.fillStyle = values.get("color");
              context.fillRect(0, 0, w, h);
            }
            context.imageSmoothingQuality = "high";
            context.drawImage(frame, (w - width * zoom) / 2, (h - height * zoom) / 2, width * zoom, height * zoom);
          });
        }
        case "Downsizing": {
          if (![...values.keys()].length) throw new GifEditorError("Select at least one way to reduce file size.", "용량을 줄일 방법을 한 가지 이상 선택해 주세요.");
          let next = values.has("scale") ? await resize(Math.max(1, Math.floor(width * .75)), Math.max(1, Math.floor(height * .75))) : animation;
          if (values.has("drop")) {
            const reduced = [];
            for (let i = 0; i < next.frames.length; i += 2) {
              const frame = next.frames[i];
              reduced.push({ ...frame, delay: frame.delay + (next.frames[i + 1]?.delay || 0) });
            }
            next = { ...next, frames: reduced };
          }
          if (values.has("resolution")) {
            const { width: w, height: h } = next;
            const small = makeCanvas(Math.max(1, Math.floor(w / 2)), Math.max(1, Math.floor(h / 2)));
            const smallContext = small.getContext("2d");
            next = await transform(next, w, h, (context, frame) => {
              smallContext.clearRect(0, 0, small.width, small.height);
              smallContext.drawImage(frame, 0, 0, small.width, small.height);
              context.imageSmoothingEnabled = false;
              context.drawImage(small, 0, 0, w, h);
            });
          }
          return next;
        }
        case "Rotate": {
          const direction = values.get("rotation");
          const quarter = direction === "90" || direction === "270";
          const w = quarter ? height : width;
          const h = quarter ? width : height;
          return transform(animation, w, h, (context, frame) => {
            context.translate(w / 2, h / 2);
            if (direction === "horizontal") context.scale(-1, 1);
            else if (direction === "vertical") context.scale(1, -1);
            else context.rotate(Number(direction) * Math.PI / 180);
            context.drawImage(frame, -width / 2, -height / 2);
          });
        }
        case "Reverse":
          return { ...animation, frames: frames.slice().reverse() };
        case "Speed": {
          const speed = Number(values.get("gif-speed"));
          let time = 0;
          let elapsed = 0;
          const adjusted = frames.map((frame) => {
            time += frame.delay / speed;
            const delay = Math.max(2, Math.round(time) - elapsed);
            elapsed += delay;
            return { ...frame, delay };
          });
          return { ...animation, frames: adjusted };
        }
        case "Cut": {
          const start = Math.round(Number(values.get("start")) * 100);
          const end = Math.round(Number(values.get("end")) * 100);
          if (end <= start) throw new GifEditorError("The end time must be after the start time.", "끝 시간은 시작 시간보다 뒤여야 합니다.");
          let time = 0;
          const selected = [];
          for (const frame of frames) {
            const delay = Math.min(end, time + frame.delay) - Math.max(start, time);
            if (delay > 0) selected.push({ ...frame, delay });
            time += frame.delay;
          }
          return { ...animation, frames: selected };
        }
        default:
          return animation;
      }
    }

    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (busy || !tool) return;
      const values = new FormData(form);
      setBusy(true);
      const convertingMp4 = tool === "Format Convert" && values.get("format") === "mp4";
      report(convertingMp4
        ? label("Converting to MP4. Keep this tab open.", "MP4 변환 중입니다. 이 탭을 열어 두세요.")
        : label("Applying edit…", "편집 중입니다…"));
      try {
        await wait();
        const inputSize = gifBlob.size;
        let exported;
        if (tool === "Format Convert") {
          exported = values.get("format") === "mp4"
            ? await convertMp4(animation)
            : await convertJpg(animation, Number(values.get("gif-frame")) - 1);
        } else {
          const next = await edit(values);
          const blob = tool === "Optimize"
            ? await optimizeGif(next, gifBlob, lzwEncode)
            : await encodeGif(next, lzwEncode, { limit: values.has("resolution") ? 64 : 256 });
          if (tool !== "Optimize") {
            const decoded = await decodeGif(blob);
            // Browser decoders may clamp short GIF delays for playback. Keep the encoded timing for further edits.
            if (decoded.frames.length === next.frames.length) {
              decoded.frames.forEach((frame, i) => { frame.delay = next.frames[i].delay; });
            }
            animation = decoded;
          }
          gifBlob = blob;
          exported = { ...animation, blob, extension: "gif" };
        }
        const base = source.name.replace(/\.gif$/i, "") || "animation";
        const name = `${base}_ed.${exported.extension}`;
        const downloadName = tool === "Resize" ? `Resized_${source.name}` : name;
        result = { ...exported, name, downloadName };
        display("result", result.blob, downloadName, result);
        get("result-title").innerHTML = markedLabel(`${tool} Result`, `${TOOLS[tool][1]} 결과`);
        resultPanel.hidden = false;
        resultPanel.open = true;
        if (tool === "Resize") originalPanel.open = false;
        const unchanged = tool === "Optimize" && result.blob.size >= inputSize;
        const larger = tool === "Downsizing" && result.blob.size >= inputSize;
        showGrid();
        if (unchanged) report(label("No further reduction was possible at the same quality.", "화질을 유지하면서 용량을 더 줄일 수 없었습니다."));
        else if (larger) report(label("The edit was applied. File size did not decrease.", "선택한 방식은 적용됐지만 용량이 줄지 않았습니다."));
        else report(label("Edit complete.", "편집이 완료되었습니다."));
      } catch (error) {
        report(readableError(error, "Could not apply the edit. Try different settings.", "편집에 실패했습니다. 설정을 변경해 다시 시도해 주세요."), true);
      } finally {
        setBusy(false);
      }
    });

    download.addEventListener("click", () => {
      if (result && !busy) downloadBlob(result.blob, result.downloadName);
    });
    save.addEventListener("click", async () => {
      if (!result || busy) return;
      if (!window.showSaveFilePicker) {
        downloadBlob(result.blob, result.name);
        report(label("File sent to browser downloads.", "파일을 브라우저 다운로드로 보냈습니다."));
        return;
      }
      setBusy(true);
      let writable;
      try {
        const options = {
          id: PICKER_ID,
          suggestedName: result.name,
          types: [{ description: result.extension.toUpperCase(), accept: { [result.blob.type]: [`.${result.extension}`] } }]
        };
        if (sourceHandle) options.startIn = sourceHandle;
        const target = await window.showSaveFilePicker(options);
        if (sourceHandle && await target.isSameEntry(sourceHandle)) {
          report(label("Choose a different name or folder to preserve the original.", "원본을 보존하려면 다른 이름이나 폴더를 선택해 주세요."), true);
          return;
        }
        writable = await target.createWritable();
        await writable.write(result.blob);
        await writable.close();
        report(label("File saved.", "파일을 저장했습니다."));
      } catch (error) {
        await writable?.abort().catch(() => {});
        if (error.name === "SecurityError" && !writable) {
          downloadBlob(result.blob, result.name);
          report(label("File sent to browser downloads.", "파일을 브라우저 다운로드로 보냈습니다."));
        } else if (error.name !== "AbortError") {
          report(label("Could not save the file. Choose a different name or folder.", "파일을 저장할 수 없습니다. 다른 이름이나 폴더를 선택해 주세요."), true);
        }
      } finally {
        setBusy(false);
      }
    });

    reset.addEventListener("click", () => {
      if (busy) return;
      source = sourceHandle = animation = gifBlob = result = null;
      releasePreview("original");
      releasePreview("result");
      resultPanel.hidden = true;
      workspace.hidden = true;
      upload.hidden = false;
      report();
      showUploadNotice();
      setBusy(false);
      pick.focus();
    });

    return { openFile, focusTools };
  };
})();
