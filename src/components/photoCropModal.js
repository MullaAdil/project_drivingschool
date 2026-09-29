/* =============================================================
   GAFOOR DRIVING SCHOOL — PHOTO & LOGO UPLOAD / CROP MODAL
   • Zero yellow lines or borders anywhere
   • Crisp high-resolution extraction directly from pristine source
   • "Apply Crop" for circular / square cropped avatar
   • "Use Full Logo / Photo" for uncropped logos/badges
   • Universal Mac/Safari/Chrome compatible file selector
   ============================================================= */

/**
 * Triggers a file picker and opens the crop/logo modal on selection.
 * @param {Function} onApply - callback receiving the resulting dataURL string
 */
export function triggerPhotoUpload(onApply) {
  let fileInput = document.getElementById('gds-global-photo-picker');
  if (!fileInput) {
    fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.id = 'gds-global-photo-picker';
    fileInput.accept = 'image/png,image/jpeg,image/jpg,image/webp,image/gif';
    fileInput.style.position = 'fixed';
    fileInput.style.top = '-9999px';
    fileInput.style.left = '-9999px';
    fileInput.style.opacity = '0';
    document.body.appendChild(fileInput);
  }

  // Clear previous value so the same file can be re-selected if needed
  fileInput.value = '';

  const changeHandler = () => {
    fileInput.removeEventListener('change', changeHandler);
    const file = fileInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => openPhotoCropModal(ev.target.result, onApply);
    reader.readAsDataURL(file);
  };

  fileInput.addEventListener('change', changeHandler);
  fileInput.click();
}

/**
 * Opens the Canvas-based crop & logo modal.
 * @param {string} dataUrl - source image data URL
 * @param {Function} onApply - callback receiving (dataURL)
 */
export function openPhotoCropModal(dataUrl, onApply) {
  let modalRoot = document.getElementById('modal-root');
  if (!modalRoot) {
    modalRoot = document.createElement('div');
    modalRoot.id = 'modal-root';
    document.body.appendChild(modalRoot);
  }

  modalRoot.innerHTML = `
    <div class="mnc-modal-overlay" id="crop-modal-overlay" style="align-items:center; justify-content:center; z-index:99999;">
      <div style="background:#0d0e12; border:1px solid rgba(255,255,255,0.14); border-radius:14px; width:min(560px,96vw); max-height:92vh; display:flex; flex-direction:column; overflow:hidden; box-shadow:0 32px 80px rgba(0,0,0,0.9);">

        <!-- Header -->
        <div style="display:flex; align-items:center; justify-content:space-between; padding:1.1rem 1.4rem; border-bottom:1px solid rgba(255,255,255,0.08);">
          <div>
            <div style="font-size:1.05rem; font-weight:800; color:#ffffff;">Position Profile Photo or Logo</div>
            <div style="font-size:0.75rem; color:var(--slate-muted); margin-top:0.2rem;">Drag to center · Zoom slider to scale · Choose crop or full logo</div>
          </div>
          <button type="button" id="crop-modal-close" style="width:32px; height:32px; border-radius:50%; border:1px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.06); color:#ffffff; font-size:0.95rem; cursor:pointer; display:flex; align-items:center; justify-content:center;">✕</button>
        </div>

        <!-- Canvas area -->
        <div style="flex:1; overflow:hidden; display:flex; align-items:center; justify-content:center; background:#060709; position:relative; min-height:280px; max-height:360px;">
          <canvas id="crop-canvas" style="display:block; cursor:move; max-width:100%; max-height:360px;"></canvas>
        </div>

        <!-- Zoom slider -->
        <div style="padding:0.85rem 1.4rem 0.5rem; display:flex; align-items:center; gap:0.9rem; border-top:1px solid rgba(255,255,255,0.06); background:rgba(255,255,255,0.01);">
          <span style="font-size:0.75rem; color:#a1a1aa; font-weight:700; white-space:nowrap;">Zoom</span>
          <input type="range" id="crop-zoom" min="100" max="300" value="100" step="1"
            style="flex:1; accent-color:#ffffff; cursor:pointer;" />
          <span id="crop-zoom-val" style="font-size:0.75rem; color:#ffffff; font-weight:800; width:40px; text-align:right;">100%</span>
        </div>

        <!-- Preview & Action Bar -->
        <div style="padding:0.9rem 1.4rem 1.25rem; display:flex; align-items:center; gap:1.2rem; border-top:1px solid rgba(255,255,255,0.08); background:#0d0e12; flex-wrap:wrap;">
          <div style="display:flex; align-items:center; gap:0.75rem;">
            <div style="width:52px; height:52px; border-radius:50%; overflow:hidden; background:#ffffff; border:1.5px solid rgba(255,255,255,0.3); display:flex; align-items:center; justify-content:center; flex-shrink:0; box-shadow:0 2px 8px rgba(0,0,0,0.5);">
              <canvas id="crop-preview" width="52" height="52" style="display:block; border-radius:50%;"></canvas>
            </div>
            <div>
              <div style="font-size:0.65rem; color:var(--slate-muted); font-weight:700; text-transform:uppercase; letter-spacing:0.04em;">Preview</div>
              <div style="font-size:0.75rem; color:#ffffff; font-weight:700;">Clean Avatar</div>
            </div>
          </div>

          <div style="flex:1; display:flex; gap:0.55rem; justify-content:flex-end; flex-wrap:wrap; min-width:240px;">
            <button type="button" id="crop-cancel-btn" class="p-ghost-btn" style="font-size:0.8rem; padding:0.45rem 0.9rem;">Cancel</button>
            <button type="button" id="crop-full-btn" class="p-ghost-btn" style="font-size:0.8rem; padding:0.45rem 0.95rem; border-color:rgba(255,255,255,0.25); color:#ffffff;" title="Use entire image without cropping (best for square logos)">Use Full Logo</button>
            <button type="button" id="crop-apply-btn" class="btn-mnc btn-mnc-primary" style="font-size:0.8rem; padding:0.45rem 1.2rem; background:#ffffff; color:#000000; border-color:#ffffff; font-weight:800;">Apply Crop ✓</button>
          </div>
        </div>

      </div>
    </div>
  `;

  const canvas    = document.getElementById('crop-canvas');
  const preview   = document.getElementById('crop-preview');
  const zoomSlider = document.getElementById('crop-zoom');
  const zoomVal   = document.getElementById('crop-zoom-val');
  const ctx       = canvas.getContext('2d');
  const pCtx      = preview.getContext('2d');

  const img = new Image();
  img.onload = () => {
    // Fit image into display canvas
    const maxW = 500, maxH = 340;
    const dw = img.naturalWidth, dh = img.naturalHeight;
    const scale = Math.min(maxW / dw, maxH / dh, 1);
    canvas.width  = Math.max(160, Math.round(dw * scale));
    canvas.height = Math.max(160, Math.round(dh * scale));

    // Crop box: square, initially 75% of shorter side, centered
    const boxSize = Math.round(Math.min(canvas.width, canvas.height) * 0.75);
    let crop = {
      x: Math.round((canvas.width  - boxSize) / 2),
      y: Math.round((canvas.height - boxSize) / 2),
      s: boxSize
    };

    let zoom = 1;
    let dragging = false, resizing = false;
    let dragOx = 0, dragOy = 0;
    const HANDLE = 9;

    function draw() {
      const cx = crop.x + crop.s / 2;
      const cy = crop.y + crop.s / 2;
      const iw = canvas.width  * zoom;
      const ih = canvas.height * zoom;
      const ox = cx - iw * (cx / canvas.width);
      const oy = cy - ih * (cy / canvas.height);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, ox, oy, iw, ih);

      // Dark translucent backdrop outside crop circle
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.62)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Cut out crop circle
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(cx, cy, crop.s / 2, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Clean WHITE crop border (zero yellow)
      ctx.save();
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 4]);
      ctx.shadowColor = 'rgba(0, 0, 0, 0.7)';
      ctx.shadowBlur = 4;
      ctx.beginPath();
      ctx.arc(cx, cy, crop.s / 2, 0, Math.PI * 2);
      ctx.stroke();

      // Clean WHITE resize handle at bottom-right (zero yellow)
      const hx = crop.x + crop.s - crop.s * 0.146;
      const hy = crop.y + crop.s - crop.s * 0.146;
      ctx.setLineDash([]);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(hx, hy, HANDLE, 0, Math.PI * 2);
      ctx.fill();
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.6)';
      ctx.stroke();
      ctx.restore();

      // Live 52px preview: drawn from pristine source img (zero overlay/yellow)
      pCtx.clearRect(0, 0, 52, 52);
      pCtx.fillStyle = '#ffffff';
      pCtx.fillRect(0, 0, 52, 52); // white backdrop ensures transparent logos are visible
      pCtx.save();
      pCtx.beginPath();
      pCtx.arc(26, 26, 26, 0, Math.PI * 2);
      pCtx.clip();

      const srcScale = scale * zoom;
      const sx = (crop.x - ox) / srcScale;
      const sy = (crop.y - oy) / srcScale;
      const ss = crop.s / srcScale;

      pCtx.drawImage(img, sx, sy, ss, ss, 0, 0, 52, 52);
      pCtx.restore();
    }

    function getPos(e) {
      const r = canvas.getBoundingClientRect();
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const clientY = e.touches ? e.touches[0].clientY : e.clientY;
      return {
        x: (clientX - r.left) * (canvas.width  / r.width),
        y: (clientY - r.top)  * (canvas.height / r.height)
      };
    }

    function onHandle(px, py) {
      const hx = crop.x + crop.s - crop.s * 0.146;
      const hy = crop.y + crop.s - crop.s * 0.146;
      return Math.hypot(px - hx, py - hy) < HANDLE + 6;
    }

    function clampCrop() {
      crop.s = Math.max(40, Math.min(crop.s, canvas.width, canvas.height));
      crop.x = Math.max(0, Math.min(crop.x, canvas.width  - crop.s));
      crop.y = Math.max(0, Math.min(crop.y, canvas.height - crop.s));
    }

    function pointerDown(e) {
      e.preventDefault();
      const p = getPos(e);
      if (onHandle(p.x, p.y)) {
        resizing = true;
      } else if (p.x >= crop.x && p.x <= crop.x + crop.s &&
                 p.y >= crop.y && p.y <= crop.y + crop.s) {
        dragging = true;
        dragOx = p.x - crop.x;
        dragOy = p.y - crop.y;
      }
    }

    function pointerMove(e) {
      e.preventDefault();
      if (!dragging && !resizing) return;
      const p = getPos(e);
      if (dragging) {
        crop.x = p.x - dragOx;
        crop.y = p.y - dragOy;
      } else if (resizing) {
        const cx = crop.x + crop.s / 2;
        const cy = crop.y + crop.s / 2;
        const newS = Math.round(Math.max(40, Math.hypot(p.x - cx, p.y - cy) * 2));
        crop.x = cx - newS / 2;
        crop.y = cy - newS / 2;
        crop.s = newS;
      }
      clampCrop();
      draw();
    }

    function pointerUp() { dragging = false; resizing = false; }

    canvas.addEventListener('mousedown',  pointerDown);
    canvas.addEventListener('mousemove',  pointerMove);
    canvas.addEventListener('mouseup',    pointerUp);
    canvas.addEventListener('touchstart', pointerDown, { passive: false });
    canvas.addEventListener('touchmove',  pointerMove, { passive: false });
    canvas.addEventListener('touchend',   pointerUp);

    // Zoom slider
    zoomSlider.addEventListener('input', () => {
      zoom = parseInt(zoomSlider.value, 10) / 100;
      zoomVal.textContent = zoomSlider.value + '%';
      draw();
    });

    // ── Apply Crop: high-res extraction directly from pristine img ──
    document.getElementById('crop-apply-btn').addEventListener('click', () => {
      const output = document.createElement('canvas');
      const size = 320;
      output.width  = size;
      output.height = size;
      const octx = output.getContext('2d');
      octx.imageSmoothingEnabled = true;
      octx.imageSmoothingQuality = 'high';

      // Clean white backing so transparent PNG logos have maximum clarity
      octx.fillStyle = '#ffffff';
      octx.fillRect(0, 0, size, size);

      const cx = crop.x + crop.s / 2;
      const cy = crop.y + crop.s / 2;
      const iw = canvas.width  * zoom;
      const ih = canvas.height * zoom;
      const ox = cx - iw * (cx / canvas.width);
      const oy = cy - ih * (cy / canvas.height);
      const srcScale = scale * zoom;
      const sx = (crop.x - ox) / srcScale;
      const sy = (crop.y - oy) / srcScale;
      const ss = crop.s / srcScale;

      // Draw pristine source sub-rectangle
      octx.drawImage(img, sx, sy, ss, ss, 0, 0, size, size);
      const dataURL = output.toDataURL('image/jpeg', 0.94);

      modalRoot.innerHTML = '';
      if (typeof onApply === 'function') onApply(dataURL);
    });

    // ── Use Full Image / Logo: no cropping ─────────────────────────
    document.getElementById('crop-full-btn').addEventListener('click', () => {
      const output = document.createElement('canvas');
      const maxDim = 360;
      output.width  = maxDim;
      output.height = maxDim;
      const octx = output.getContext('2d');
      octx.imageSmoothingEnabled = true;
      octx.imageSmoothingQuality = 'high';

      // Clean white backdrop
      octx.fillStyle = '#ffffff';
      octx.fillRect(0, 0, maxDim, maxDim);

      const aspect = img.naturalWidth / img.naturalHeight;
      let drawW = maxDim, drawH = maxDim;
      if (aspect > 1) {
        drawH = Math.round(maxDim / aspect);
      } else {
        drawW = Math.round(maxDim * aspect);
      }
      const drawX = Math.round((maxDim - drawW) / 2);
      const drawY = Math.round((maxDim - drawH) / 2);

      octx.drawImage(img, drawX, drawY, drawW, drawH);
      const dataURL = output.toDataURL('image/jpeg', 0.94);

      modalRoot.innerHTML = '';
      if (typeof onApply === 'function') onApply(dataURL);
    });

    // ── Close / Cancel ─────────────────────────────────────────────
    const closeCrop = () => { modalRoot.innerHTML = ''; };
    document.getElementById('crop-modal-close').addEventListener('click', closeCrop);
    document.getElementById('crop-cancel-btn').addEventListener('click', closeCrop);

    draw();
  };

  img.src = dataUrl;
}
