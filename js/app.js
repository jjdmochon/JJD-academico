// ============================================================
// APP.JS — Navigation, Toggles, Filters, Scroll Reveal
// ============================================================

document.addEventListener('DOMContentLoaded', () => {
  initNavigation();
  renderPublications();
  renderTheses();
  renderPatents();
  renderProjects();
  initProjectFilters();
  initModalClose();
  initHoverPopup();
  initCharts();
  initGlobalTimeline();
  initKnowledgeGraph();
  initScrollReveal();
});

// ── Navigation ──
function initNavigation() {
  const navbar = document.querySelector('.navbar');
  const toggle = document.querySelector('.nav-toggle');
  const links = document.querySelector('.nav-links');

  // Sticky shadow
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Mobile toggle
  if (toggle) {
    toggle.addEventListener('click', () => {
      links.classList.toggle('open');
      const spans = toggle.querySelectorAll('span');
      spans[0].style.transform = links.classList.contains('open') ? 'rotate(45deg) translate(5px, 5px)' : '';
      spans[1].style.opacity = links.classList.contains('open') ? '0' : '1';
      spans[2].style.transform = links.classList.contains('open') ? 'rotate(-45deg) translate(5px, -5px)' : '';
    });
  }

  // Active link on scroll
  const sections = document.querySelectorAll('section[id]');
  const navLinks = document.querySelectorAll('.nav-links a');

  window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
      const top = section.offsetTop - 100;
      if (window.scrollY >= top) current = section.id;
    });
    navLinks.forEach(link => {
      link.classList.remove('active');
      if (link.getAttribute('href') === '#' + current) link.classList.add('active');
    });
  });

  // Close mobile menu on link click
  navLinks.forEach(link => {
    link.addEventListener('click', () => links.classList.remove('open'));
  });
}

// ── Publications ──
let currentPubView = 'cards';
let currentPubFilter = { search: '', type: 'all' };

function renderPublications() {
  const cardsContainer = document.getElementById('pub-cards-view');
  const tableContainer = document.getElementById('pub-table-view');
  if (!cardsContainer || !tableContainer) return;

  const pubs = filterPublications();
  renderPubCards(cardsContainer, pubs);
  renderPubTable(tableContainer, pubs);

  // Set up toggle
  document.querySelectorAll('#pub-toggle button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#pub-toggle button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentPubView = btn.dataset.view;

      cardsContainer.classList.toggle('view-hidden', currentPubView !== 'cards');
      tableContainer.classList.toggle('view-hidden', currentPubView !== 'table');
    });
  });

  // Set up filters
  const searchInput = document.getElementById('pub-search');
  const typeSelect = document.getElementById('pub-type-filter');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentPubFilter.search = searchInput.value.toLowerCase();
      renderPublications();
    });
  }

  if (typeSelect) {
    typeSelect.addEventListener('change', () => {
      currentPubFilter.type = typeSelect.value;
      renderPublications();
    });
  }

  // Attach modal trigger click listeners to both cards and table rows
  document.querySelectorAll('[data-pub-idx]').forEach(el => {
    el.addEventListener('click', (e) => {
      if (e.target.closest('.pub-card-doi')) return;
      const idx = el.dataset.pubIdx;
      const p = DATA.publications[idx];
      if (p && p.abstract) {
        showDetailModal(
          p.title,
          p.authors,
          p.abstract,
          [
            { label: 'Revista / Medio', value: p.journal + (p.volume ? `, vol. ${p.volume}` : '') },
            { label: 'Año de Publicación', value: p.year },
            { label: 'Tipo de Documento', value: p.type.charAt(0).toUpperCase() + p.type.slice(1) },
            { label: 'DOI', value: p.doi ? `<a href="https://doi.org/${p.doi}" target="_blank">${p.doi}</a>` : '-' }
          ],
          p.image
        );
      }
    });
  });
}

function filterPublications() {
  return DATA.publications.filter(p => {
    const matchSearch = !currentPubFilter.search ||
      p.title.toLowerCase().includes(currentPubFilter.search) ||
      p.authors.toLowerCase().includes(currentPubFilter.search) ||
      (p.journal && p.journal.toLowerCase().includes(currentPubFilter.search));
    const matchType = currentPubFilter.type === 'all' || p.type === currentPubFilter.type;
    return matchSearch && matchType;
  });
}

function renderPubCards(container, pubs) {
  const grouped = {};
  pubs.forEach(p => {
    if (!grouped[p.year]) grouped[p.year] = [];
    grouped[p.year].push(p);
  });

  const years = Object.keys(grouped).sort((a, b) => b - a);
  let html = '';

  years.forEach(year => {
    html += `<div class="pub-year-group reveal">`;
    html += `<div class="pub-year-label">${year} <span>(${grouped[year].length} publicaciones)</span></div>`;
    html += `<div class="pub-cards">`;

    grouped[year].forEach(p => {
      const typeLabel = { article: 'Artículo', chapter: 'Capítulo', abstract: 'Abstract', preprint: 'Preprint' };
      const origIdx = DATA.publications.findIndex(orig => orig.title === p.title);
      const isInteractive = p.abstract ? 'interactive' : '';
      
      html += `
        <div class="pub-card ${isInteractive}" ${p.abstract ? `data-pub-idx="${origIdx}"` : ''}>
          <div class="pub-card-title">
            ${p.title}
            <span class="pub-type-badge ${p.type}">${typeLabel[p.type] || p.type}</span>
          </div>
          <div class="pub-card-authors">${p.authors}</div>
          <div class="pub-card-journal">${p.journal || ''}${p.volume ? ', vol. ' + p.volume : ''}</div>
          <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; margin-top:8px;">
            <div>
              ${p.doi ? `<a class="pub-card-doi" href="https://doi.org/${p.doi}" target="_blank" rel="noopener">DOI ↗</a>` : ''}
            </div>
            ${p.abstract ? `<span class="card-action-hint">Ver Resumen ↗</span>` : ''}
          </div>
        </div>
      `;
    });

    html += `</div></div>`;
  });

  container.innerHTML = html;
  initScrollReveal();
}

function renderPubTable(container, pubs) {
  const sorted = [...pubs].sort((a, b) => b.year - a.year);
  let html = `
    <div class="pub-table-wrapper">
      <table class="pub-table">
        <thead>
          <tr>
            <th>Año</th>
            <th>Título</th>
            <th>Revista</th>
            <th>Tipo</th>
            <th>DOI</th>
          </tr>
        </thead>
        <tbody>
  `;

  sorted.forEach(p => {
    const typeLabel = { article: 'Artículo', chapter: 'Capítulo', abstract: 'Abstract', preprint: 'Preprint' };
    const origIdx = DATA.publications.findIndex(orig => orig.title === p.title);
    const isInteractive = p.abstract ? `class="interactive" data-pub-idx="${origIdx}"` : '';
    
    html += `
      <tr ${isInteractive}>
        <td>${p.year}</td>
        <td>
          ${p.title}
          ${p.abstract ? '<span class="card-action-hint" style="margin-top:0; margin-left:8px;">Ver Resumen ↗</span>' : ''}
        </td>
        <td>${p.journal || '-'}</td>
        <td><span class="pub-type-badge ${p.type}">${typeLabel[p.type] || p.type}</span></td>
        <td>${p.doi ? `<a href="https://doi.org/${p.doi}" target="_blank" rel="noopener" class="pub-card-doi">↗</a>` : '-'}</td>
      </tr>
    `;
  });

  html += `</tbody></table></div>`;
  container.innerHTML = html;
}

// ── Theses ──
function renderTheses() {
  const timelineContainer = document.getElementById('thesis-timeline-view');
  const gridContainer = document.getElementById('thesis-grid-view');
  if (!timelineContainer || !gridContainer) return;

  renderThesisTimeline(timelineContainer);
  renderThesisGrid(gridContainer);

  // Attach click listeners to theses
  document.querySelectorAll('[data-thesis-idx]').forEach(el => {
    el.addEventListener('click', () => {
      const idx = el.dataset.thesisIdx;
      const t = DATA.theses[idx];
      if (t) {
        showDetailModal(
          t.title,
          `Doctorando/a: ${t.candidate}`,
          t.abstract || "Resumen de tesis no disponible en formato corto.",
          [
            { label: 'Universidad', value: t.university },
            { label: 'Año de Defensa', value: t.year },
            { label: 'Directores de Tesis', value: t.advisors || 'Juan José Díaz-Mochón' }
          ],
          t.image
        );
      }
    });
  });

  // Toggle
  document.querySelectorAll('#thesis-toggle button').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('#thesis-toggle button').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const view = btn.dataset.view;
      timelineContainer.classList.toggle('view-hidden', view !== 'timeline');
      gridContainer.classList.toggle('view-hidden', view !== 'grid');
    });
  });
}

// ── Patents ──
function renderPatents() {
  const container = document.getElementById('patent-grid');
  if (!container) return;

  const sorted = [...DATA.patents].sort((a, b) => {
    return new Date(b.priority) - new Date(a.priority);
  });

  let html = '';
  sorted.forEach(p => {
    const origIdx = DATA.patents.findIndex(orig => orig.number === p.number);
    const isInteractive = p.abstract ? 'interactive' : '';
    const categoryBadge = p.category === 'industry' 
      ? '<span class="patent-category-badge industry">🏢 En explotación</span>' 
      : '<span class="patent-category-badge academic">🎓 Académica</span>';
    
    html += `
      <div class="patent-card reveal ${isInteractive}" ${p.abstract ? `data-patent-idx="${origIdx}"` : ''}>
        <div style="display:flex; justify-content:space-between; align-items:flex-start; flex-wrap:wrap; gap:4px; margin-bottom:8px;">
          ${p.status === 'granted' ? `<span class="patent-status granted">✅ Concedida</span>` : '<span></span>'}
          <div style="display:flex; gap:4px; flex-wrap:wrap;">
            ${categoryBadge}
          </div>
        </div>
        <div class="patent-title">${p.title}</div>
        <div class="patent-meta"><strong>Inventores:</strong> ${p.inventors}</div>
        <div class="patent-meta"><strong>Solicitante:</strong> ${p.applicants}</div>
        ${p.partner ? `<div class="patent-meta"><strong>Socio Industrial:</strong> ${p.partner}</div>` : ''}
        <div class="patent-meta"><strong>Prioridad:</strong> ${p.priority} · <strong>Región:</strong> ${p.region}</div>
        <div style="display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; margin-top:8px;">
          <span class="patent-number">${p.number}</span>
          ${p.abstract ? `<span class="card-action-hint">Ver Resumen ↗</span>` : ''}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Attach click listeners to patent cards
  document.querySelectorAll('[data-patent-idx]').forEach(el => {
    el.addEventListener('click', () => {
      const idx = el.dataset.patentIdx;
      const p = DATA.patents[idx];
      if (p && p.abstract) {
        showDetailModal(
          p.title,
          `Patente Internacional · Número: ${p.number}`,
          p.abstract,
          [
            { label: 'Inventores', value: p.inventors },
            { label: 'Solicitante', value: p.applicants },
            { label: 'Número de Patente', value: p.number },
            { label: 'Estado', value: p.status === 'granted' ? 'Concedida' : 'Solicitada' },
            { label: 'Fecha de Prioridad', value: p.priority },
            { label: 'Región/Oficina', value: p.region }
          ]
        );
      }
    });
  });

  initScrollReveal();
}

// ── Projects ──
let currentProjectFilter = { search: '', role: 'all' };

function renderProjects() {
  const container = document.getElementById('project-grid');
  if (!container) return;

  // Filter projects
  const filtered = DATA.projects.filter(p => {
    const matchSearch = !currentProjectFilter.search ||
      p.name.toLowerCase().includes(currentProjectFilter.search) ||
      p.ref.toLowerCase().includes(currentProjectFilter.search) ||
      p.call.toLowerCase().includes(currentProjectFilter.search) ||
      p.agency.toLowerCase().includes(currentProjectFilter.search);
      
    const matchRole = currentProjectFilter.role === 'all' || 
      p.role.toLowerCase() === currentProjectFilter.role;
      
    return matchSearch && matchRole;
  });

  // Calculate and display statistics (full projects stats)
  let totalFundingIP = 0;
  let totalFundingColab = 0;
  let countIP = 0;
  let countColab = 0;
  
  DATA.projects.forEach(p => {
    if (p.role === 'IP') {
      totalFundingIP += p.budget;
      countIP++;
    } else {
      totalFundingColab += p.budget;
      countColab++;
    }
  });

  const formatEuro = (num) => {
    return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(num);
  };

  const fundingEl = document.getElementById('project-total-funding');
  const ipEl = document.getElementById('project-total-ip');
  const colabEl = document.getElementById('project-total-colab');
  const fundingIpEl = document.getElementById('project-funding-ip');
  const fundingColabEl = document.getElementById('project-funding-colab');

  if (fundingEl) fundingEl.textContent = formatEuro(totalFundingIP + totalFundingColab);
  if (ipEl) ipEl.textContent = countIP;
  if (colabEl) colabEl.textContent = countColab;
  if (fundingIpEl) fundingIpEl.textContent = formatEuro(totalFundingIP);
  if (fundingColabEl) fundingColabEl.textContent = formatEuro(totalFundingColab);

  // Render cards
  let html = '';
  filtered.forEach(p => {
    const origIdx = DATA.projects.findIndex(orig => orig.ref === p.ref);
    const roleLabel = p.role === 'IP' ? 'Investigador Principal' : 'Colaborador';
    const budgetLabel = p.budget > 0 ? formatEuro(p.budget) : 'Convocatoria sin presupuesto individualizado';
    
    html += `
      <div class="project-card reveal interactive" data-project-idx="${origIdx}">
        <div class="project-card-header">
          <span class="project-ref-badge">${p.ref}</span>
          <span class="project-tag ${p.role.toLowerCase()}">${roleLabel}</span>
        </div>
        <div class="project-name">${p.name}</div>
        <div class="project-card-body">
          <div class="project-meta-item"><strong>Organismo:</strong> ${p.agency}</div>
          <div class="project-meta-item"><strong>Presupuesto:</strong> ${budgetLabel}</div>
          <div class="project-meta-item"><strong>Periodo:</strong> ${p.period}</div>
        </div>
        <div class="project-tag-container">
          ${p.linkedPatents.length ? `<span class="project-tag budget">🔑 ${p.linkedPatents.length} patentes</span>` : ''}
          ${p.linkedPubs ? `<span class="project-tag year">📚 ${p.linkedPubs} publicaciones</span>` : ''}
        </div>
        <div class="card-action-hint">Ver Detalles del Proyecto ↗</div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Attach click listeners to project cards
  document.querySelectorAll('[data-project-idx]').forEach(el => {
    el.addEventListener('click', () => {
      const idx = el.dataset.projectIdx;
      const p = DATA.projects[idx];
      if (p) {
        showDetailModal(
          p.name,
          `Proyecto de Investigación · Referencia: ${p.ref}`,
          `Este proyecto de investigación, titulado "<strong>${p.name}</strong>", ha sido financiado por el organismo <strong>${p.agency}</strong> en el marco de la convocatoria <em>${p.call}</em>.<br><br>El Profesor Juan José Díaz-Mochón participó en calidad de <strong>${p.role === 'IP' ? 'Investigador Principal' : 'Colaborador'}</strong> durante el periodo <strong>${p.period}</strong>.<br><br>La subvención total otorgada al proyecto fue de <strong>${formatEuro(p.budget)}</strong>.`,
          [
            { label: 'Referencia', value: p.ref },
            { label: 'Rol del Investigador', value: p.role === 'IP' ? 'Investigador Principal (IP)' : 'Colaborador del Equipo' },
            { label: 'Organismo Financiador', value: p.agency },
            { label: 'Convocatoria', value: p.call },
            { label: 'Presupuesto Asignado', value: formatEuro(p.budget) },
            { label: 'Periodo de Ejecución', value: p.period },
            { label: 'Patentes Vinculadas', value: p.linkedPatents.length ? p.linkedPatents.join(', ') : 'Ninguna' }
          ]
        );
      }
    });
  });

  initScrollReveal();
}

function initProjectFilters() {
  const searchInput = document.getElementById('project-search');
  const roleSelect = document.getElementById('project-role-filter');

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      currentProjectFilter.search = searchInput.value.toLowerCase();
      renderProjects();
    });
  }

  if (roleSelect) {
    roleSelect.addEventListener('change', () => {
      currentProjectFilter.role = roleSelect.value;
      renderProjects();
    });
  }
}

// ── Modal Handlers ──
function showDetailModal(title, subtitle, content, metaItems, imagePath) {
  const modal = document.getElementById('details-modal');
  const titleEl = document.getElementById('modal-title-content');
  const subtitleEl = document.getElementById('modal-subtitle-content');
  const bodyEl = document.getElementById('modal-body-content');
  
  if (!modal || !titleEl || !subtitleEl || !bodyEl) return;
  
  titleEl.innerHTML = title;
  subtitleEl.innerHTML = subtitle;
  
  let html = '';
  
  // Show image if it exists in the publication details
  if (imagePath) {
    html += `
      <div class="modal-body-section" style="text-align: center; margin-bottom: 24px;">
        <img src="${imagePath}" alt="Graphic Abstract / Figure" style="max-width: 100%; max-height: 280px; border-radius: var(--radius-md); box-shadow: var(--shadow-md); border: 1px solid rgba(0,0,0,0.05); object-fit: contain;">
      </div>
    `;
  }
  
  html += `<div class="modal-body-section">`;
  html += `<h4>Resumen / Detalles</h4>`;
  const renderedContent = window.marked ? marked.parse(content) : content;
  html += `<div class="modal-body-text">${renderedContent}</div>`;
  html += `</div>`;
  
  if (metaItems && metaItems.length) {
    html += `<div class="modal-meta-grid">`;
    metaItems.forEach(item => {
      html += `
        <div class="modal-meta-item">
          <strong>${item.label}:</strong> ${item.value}
        </div>
      `;
    });
    html += `</div>`;
  }
  
  bodyEl.innerHTML = html;
  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function initModalClose() {
  const modal = document.getElementById('details-modal');
  const closeBtn = document.getElementById('modal-close-btn');
  if (!modal) return;
  
  const closeModal = () => {
    modal.classList.remove('open');
    document.body.style.overflow = '';
  };
  
  if (closeBtn) {
    closeBtn.addEventListener('click', closeModal);
  }
  
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closeModal();
    }
  });
}

// ── Scroll Reveal ──
function initScrollReveal() {
  const elements = document.querySelectorAll('.reveal:not(.visible)');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, index * 50);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

  elements.forEach(el => observer.observe(el));
}

// ── Hover Popup Preview Logic ──
function initHoverPopup() {
  const popup = document.getElementById('hover-popup');
  if (!popup) return;

  const showPopup = (e, title, content) => {
    popup.innerHTML = `<h4>${title}</h4><p>${content}</p>`;
    popup.classList.add('visible');
    positionPopup(e);
  };

  const positionPopup = (e) => {
    const popupWidth = popup.offsetWidth || 380;
    const popupHeight = popup.offsetHeight || 150;
    const gap = 15;
    
    let left = e.clientX + gap;
    let top = e.clientY + gap;
    
    // Boundary check right/bottom
    if (left + popupWidth > window.innerWidth) {
      left = e.clientX - popupWidth - gap;
    }
    if (top + popupHeight > window.innerHeight) {
      top = e.clientY - popupHeight - gap;
    }
    
    // Avoid offscreen top/left
    if (left < 0) left = 10;
    if (top < 0) top = 10;
    
    popup.style.left = `${left + window.scrollX}px`;
    popup.style.top = `${top + window.scrollY}px`;
  };

  const hidePopup = () => {
    popup.classList.remove('visible');
  };

  // Hover detection using event delegation
  document.addEventListener('mouseover', (e) => {
    const target = e.target.closest('[data-pub-idx], [data-thesis-idx], [data-patent-idx], [data-project-idx]');
    if (!target) return;
    
    let title = "";
    let content = "";
    
    if (target.dataset.pubIdx !== undefined) {
      const p = DATA.publications[target.dataset.pubIdx];
      if (p && p.abstract) {
        title = "Publicación: " + p.title + (p.image ? " 🖼️" : "");
        content = p.abstract;
      }
    } else if (target.dataset.thesisIdx !== undefined) {
      const t = DATA.theses[target.dataset.thesisIdx];
      if (t && t.abstract) {
        title = "Tesis de: " + t.candidate;
        content = t.abstract;
      }
    } else if (target.dataset.patentIdx !== undefined) {
      const p = DATA.patents[target.dataset.patentIdx];
      if (p && p.abstract) {
        title = "Patente: " + p.title;
        content = p.abstract;
      }
    } else if (target.dataset.projectIdx !== undefined) {
      const p = DATA.projects[target.dataset.projectIdx];
      if (p) {
        title = "Proyecto: " + p.name;
        content = `<strong>Convocatoria:</strong> ${p.call}<br><strong>Presupuesto:</strong> ${new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(p.budget)}<br><strong>Periodo:</strong> ${p.period}`;
      }
    }
    
    if (content) {
      // Truncate hover preview content to keep it concise
      const limit = 280;
      let cleanContent = content;
      if (cleanContent.length > limit) {
        cleanContent = cleanContent.substring(0, limit) + "... <em>(haz clic para leer completo)</em>";
      }
      showPopup(e, title, cleanContent);
    }
  });

  document.addEventListener('mousemove', (e) => {
    if (popup.classList.contains('visible')) {
      positionPopup(e);
    }
  });

  document.addEventListener('mouseout', (e) => {
    const target = e.target.closest('[data-pub-idx], [data-thesis-idx], [data-patent-idx], [data-project-idx]');
    if (target) {
      hidePopup();
    }
  });
}

