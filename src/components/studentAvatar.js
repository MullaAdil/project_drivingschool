/* =============================================================
   STUDENT AVATAR HELPER
   Returns an HTML string for a student's avatar / logo.
   • If the student has profilePhotoData → clearly visible photo / logo
     (clean background, zero yellow lines)
   • Otherwise → initials badge
   ============================================================= */

/**
 * @param {object} trainee   - trainee object from store
 * @param {number} [size=44] - diameter in px
 * @param {string} [extraStyle=''] - additional inline CSS for the wrapper
 * @returns {string} HTML string
 */
export function renderStudentAvatar(trainee, size = 44, extraStyle = '') {
  if (!trainee) return '';
  const initials = trainee.avatar || (trainee.name || 'ST').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  const fontSize = Math.round(size * 0.36);

  if (trainee.profilePhotoData) {
    return `
      <div style="
        width:${size}px; height:${size}px; border-radius:50%;
        overflow:hidden; flex-shrink:0;
        background:#ffffff;
        border:1.5px solid rgba(255,255,255,0.25);
        box-shadow:0 3px 10px rgba(0,0,0,0.35);
        display:flex; align-items:center; justify-content:center;
        ${extraStyle}
      ">
        <img
          src="${trainee.profilePhotoData}"
          alt="${initials}"
          style="width:100%; height:100%; object-fit:cover; display:block; border-radius:50%;"
        />
      </div>
    `;
  }

  // Fallback: gold initials badge
  return `
    <div style="
      width:${size}px; height:${size}px; border-radius:50%;
      background:rgba(243,209,130,0.12);
      border:1.5px solid rgba(243,209,130,0.35);
      display:flex; align-items:center; justify-content:center;
      font-weight:800; color:var(--primary-gold);
      font-size:${fontSize}px; flex-shrink:0;
      letter-spacing:0.02em;
      ${extraStyle}
    ">${initials}</div>
  `;
}

/**
 * Variant that uses the existing CSS class `student-box-avatar` but overrides
 * it with a clean photo / logo when available.
 */
export function renderStudentBoxAvatar(trainee, boxStyle = '') {
  if (!trainee) return '';
  const initials = trainee.avatar || (trainee.name || 'ST').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();

  if (trainee.profilePhotoData) {
    return `
      <div class="student-box-avatar" style="padding:0; overflow:hidden; background:#ffffff; border:1px solid rgba(255,255,255,0.35); box-shadow:0 2px 8px rgba(0,0,0,0.25); ${boxStyle}">
        <img src="${trainee.profilePhotoData}" alt="${initials}"
          style="width:100%; height:100%; object-fit:cover; display:block; border-radius:inherit;" />
      </div>
    `;
  }
  return `<div class="student-box-avatar" style="${boxStyle}">${initials}</div>`;
}
