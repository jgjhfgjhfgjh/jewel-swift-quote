/**
 * Točící se zeměkoule ve favicone — značková škála (modrá → tyrkys → smaragd),
 * stejná, jakou nese gradientový indikátor v logu.
 *
 * Prohlížeče animovaná SVG favicony nepřehrávají, takže se otáčení kreslí na
 * canvas a mění se href ikony. Šetří se: frame se maluje jen při viditelné
 * kartě a `prefers-reduced-motion` dostane jediný statický snímek.
 */
export function startFaviconGlobe() {
  if (typeof document === 'undefined') return;
  const S = 64;
  const CX = S / 2;
  const CY = S / 2;
  const R = 26;

  const canvas = document.createElement('canvas');
  canvas.width = S;
  canvas.height = S;
  const ctx = canvas.getContext('2d');
  if (!ctx) return;

  let link =
    document.querySelector<HTMLLinkElement>('link[rel="icon"][type="image/svg+xml"]') ??
    document.querySelector<HTMLLinkElement>('link[rel="icon"]');
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.type = 'image/png';

  const draw = (phase: number) => {
    ctx.clearRect(0, 0, S, S);

    // koule ve značkovém gradientu
    const g = ctx.createLinearGradient(CX - R, CY - R, CX + R, CY + R);
    g.addColorStop(0, '#3b82f6');
    g.addColorStop(0.5, '#22d3ee');
    g.addColorStop(1, '#34d399');
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.fillStyle = g;
    ctx.fill();

    // mřížka jen uvnitř koule
    ctx.save();
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.clip();
    ctx.strokeStyle = 'rgba(255,255,255,0.65)';
    ctx.lineWidth = 2.2;

    // rovnoběžky — statické (rotace kolem svislé osy je nemění)
    for (const lat of [-0.62, 0, 0.62]) {
      const ry = R * Math.cos(Math.asin(Math.sin(lat)));
      const y = CY - R * Math.sin(lat) * 0.92;
      ctx.beginPath();
      ctx.ellipse(CX, y, ry * 0.98, ry * 0.24, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // poledníky — fáze jimi otáčí, |sin| dává perspektivní zúžení
    for (let k = 0; k < 3; k++) {
      const lon = phase + (k * Math.PI) / 3;
      const rx = Math.abs(R * Math.sin(lon));
      if (rx < 1.5) continue;
      ctx.beginPath();
      ctx.ellipse(CX, CY, rx, R, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();

    // obrys
    ctx.beginPath();
    ctx.arc(CX, CY, R, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = 2.4;
    ctx.stroke();

    link!.href = canvas.toDataURL('image/png');
  };

  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    draw(0.9);
    return;
  }

  let phase = 0;
  draw(phase);
  window.setInterval(() => {
    if (document.hidden) return;
    phase += 0.16;
    draw(phase);
  }, 160);
}
