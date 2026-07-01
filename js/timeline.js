// ============================================================
// TIMELINE.JS — Global Timeline + Thesis Timeline
// ============================================================

function initGlobalTimeline() {
  const container = document.getElementById('global-timeline-track');
  if (!container) return;

  // Collect all items with years
  const items = [];

  DATA.publications.forEach(p => {
    items.push({ year: p.year, type: 'pub', label: p.title.substring(0, 60) + '...' });
  });

  DATA.theses.forEach(t => {
    items.push({ year: t.year, type: 'thesis', label: `Tesis: ${t.candidate}` });
  });

  DATA.patents.forEach(p => {
    const y = parseInt(p.priority.split('-')[0]);
    items.push({ year: y, type: 'patent', label: p.title.substring(0, 50) + '...' });
  });

  DATA.projects.forEach(p => {
    items.push({ year: p.yearStart, type: 'project', label: `Proyecto: ${p.name}` });
  });

  // Get year range
  const years = [...new Set(items.map(i => i.year))].sort((a, b) => a - b);

  // Build columns
  let html = '';
  years.forEach(year => {
    const yearItems = items.filter(i => i.year === year);
    html += `<div class="timeline-year-col">`;
    html += `<div class="timeline-dots">`;
    yearItems.forEach(item => {
      html += `<div class="timeline-dot ${item.type}"><span class="tooltip">${item.label}</span></div>`;
    });
    html += `</div>`;
    html += `<div class="timeline-year-label">${year}</div>`;
    html += `</div>`;
  });

  container.innerHTML = html;
}

function renderThesisTimeline(container) {
  let html = '';
  const sorted = [...DATA.theses].sort((a, b) => b.year - a.year);

  sorted.forEach(t => {
    const originalIndex = DATA.theses.findIndex(orig => orig.candidate === t.candidate);
    html += `
      <div class="thesis-node reveal interactive" data-thesis-idx="${originalIndex}">
        <span class="thesis-year-badge">${t.year}</span>
        <div class="thesis-candidate">${t.candidate}</div>
        <div class="thesis-title">${t.title}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:8px;">
          <span class="text-muted" style="font-size:0.8rem;">📍 ${t.university}</span>
          <span class="card-action-hint">Ver Resumen ↗</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  initScrollReveal();
}

function renderThesisGrid(container) {
  let html = '';
  const sorted = [...DATA.theses].sort((a, b) => b.year - a.year);

  sorted.forEach(t => {
    const originalIndex = DATA.theses.findIndex(orig => orig.candidate === t.candidate);
    html += `
      <div class="thesis-grid-card reveal interactive" data-thesis-idx="${originalIndex}">
        <span class="thesis-year-badge">${t.year}</span>
        <div class="thesis-candidate" style="margin-top:12px;">${t.candidate}</div>
        <div class="thesis-title" style="margin-top:8px;">${t.title}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; margin-top:10px;">
          <span class="text-muted" style="font-size:0.8rem;">📍 ${t.university}</span>
          <span class="card-action-hint">Ver Resumen ↗</span>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
  initScrollReveal();
}

