/* ==========================================================================
   GAFOOR DRIVING SCHOOL — CLEAN BRAND LOGO COMPONENT
   Official Gafoor Driving School Logo without circular road/ring outline.
   ========================================================================== */

export function renderBrandLogo({
  size = 'md', // 'sm' | 'admin' | 'header' | 'md' | 'banner' | 'lg' | 'xl'
  alt = 'Gafoor Driving School Logo',
  className = '',
  id = '',
  style = ''
} = {}) {
  const idAttr = id ? `id="${id}"` : '';
  const styleAttr = style ? `style="${style}"` : '';

  return `
    <div class="gafoor-brand-logo-wrap gafoor-logo-${size} ${className}" ${idAttr} ${styleAttr} title="Gafoor Driving School · Pulivendula">
      <img src="/logo.png" alt="${alt}" class="gafoor-logo-img" />
    </div>
  `;
}
