/* ==========================================================================
   GAFOOR DRIVING SCHOOL — UNIFIED ANIMATED BRAND LOGO COMPONENT
   Synchronized Circular Road Circuit Logo Badge:
   - Outer Black & White Rumble Kerb (Classic Motorsport & AP RTO track style)
   - Solid Asphalt Road Ring with inner/outer boundary markers
   - Animated White Dashed Centerline Flow (Synchronized with Hero Arena)
   - Inner Gold Ring framing the Official Gafoor Driving School Crest
   - Global Turbo Mode sync across the entire website
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
    <div class="gafoor-logo-track-wrap gafoor-logo-track-${size} ${className}" ${idAttr} ${styleAttr} title="Gafoor Driving School · Walk in &amp; Drive out (AP RTO Accredited)">
      <svg class="gafoor-logo-track-svg" viewBox="0 0 100 100" aria-hidden="true">
        <!-- Outer Rumble Kerb (Classic RTO Track Style) -->
        <circle cx="50" cy="50" r="48" fill="none" stroke="#18181b" stroke-width="2" />
        <circle cx="50" cy="50" r="48" fill="none" stroke="#ffffff" stroke-width="2" stroke-dasharray="3.5 3.5" />
        <circle cx="50" cy="50" r="49.5" fill="none" stroke="rgba(0,0,0,0.12)" stroke-width="0.8" />

        <!-- Asphalt Road Ring -->
        <circle cx="50" cy="50" r="41.5" fill="none" stroke="#18181b" stroke-width="8" />

        <!-- Road Solid Boundary Lines -->
        <circle cx="50" cy="50" r="45.5" fill="none" stroke="#ffffff" stroke-width="0.8" opacity="0.9" />
        <circle cx="50" cy="50" r="37.5" fill="none" stroke="#ffffff" stroke-width="0.8" opacity="0.9" />

        <!-- ANIMATED WHITE DASHED CENTERLINE (SYNCHRONIZED ROAD FLOW) -->
        <circle cx="50" cy="50" r="41.5" fill="none" stroke="#ffffff" stroke-width="1.3" stroke-dasharray="2.5 3.5" class="bw-road-dashed-divider" />

        <!-- Inner Rumble Kerb -->
        <circle cx="50" cy="50" r="37" fill="none" stroke="#18181b" stroke-width="1.2" />
        <circle cx="50" cy="50" r="37" fill="none" stroke="#ffffff" stroke-width="1.2" stroke-dasharray="2 2" />

        <!-- Inner Gold Accent Rim -->
        <circle cx="50" cy="50" r="34.8" fill="none" stroke="rgba(198, 146, 59, 0.85)" stroke-width="1.4" />
      </svg>
      <img src="/logo.png" alt="${alt}" class="gafoor-logo-img" />
    </div>
  `;
}
