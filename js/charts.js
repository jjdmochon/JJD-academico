// ============================================================
// CHARTS.JS — KPI Counters + Publication Bar Chart + Donut
// ============================================================

function initCharts() {
  initCounters();
  initBarChart();
  initDonutChart();
}

// ── Animated Counter ──
function initCounters() {
  const kpiGrid = document.querySelector('.kpi-grid');
  if (kpiGrid) {
    const kpiNumbers = kpiGrid.querySelectorAll('.kpi-number');
    if (kpiNumbers.length >= 4) {
      kpiNumbers[0].dataset.target = DATA.publications.length;
      kpiNumbers[1].dataset.target = DATA.patents.length;
      kpiNumbers[2].dataset.target = DATA.theses.length;
      kpiNumbers[3].dataset.target = DATA.projects.length;
    }
  }

  const counters = document.querySelectorAll('.kpi-number');
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = parseInt(el.dataset.target);
        animateCounter(el, target);
        observer.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(c => observer.observe(c));
}

function animateCounter(el, target) {
  const duration = 2000;
  const steps = 60;
  const increment = target / steps;
  let current = 0;
  const suffix = el.dataset.suffix || '';

  const timer = setInterval(() => {
    current += increment;
    if (current >= target) {
      current = target;
      clearInterval(timer);
    }
    el.textContent = Math.floor(current) + suffix;
  }, duration / steps);
}

// ── Publications per Year Bar Chart ──
function initBarChart() {
  const canvas = document.getElementById('pubsPerYearChart');
  if (!canvas) return;

  const pubs = DATA.publications;
  const yearCounts = {};
  pubs.forEach(p => {
    yearCounts[p.year] = (yearCounts[p.year] || 0) + 1;
  });

  const years = Object.keys(yearCounts).sort();
  const counts = years.map(y => yearCounts[y]);

  new Chart(canvas, {
    type: 'bar',
    data: {
      labels: years,
      datasets: [{
        label: 'Publicaciones',
        data: counts,
        backgroundColor: years.map((_, i) => {
          const ratio = i / years.length;
          if (ratio < 0.33) return 'rgba(0, 128, 128, 0.75)';
          if (ratio < 0.66) return 'rgba(62, 180, 137, 0.75)';
          return 'rgba(255, 127, 80, 0.75)';
        }),
        borderRadius: 6,
        borderSkipped: false,
        barThickness: 'flex',
        maxBarThickness: 28,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#36454F',
          titleFont: { family: "'Montserrat', sans-serif", weight: '700' },
          bodyFont: { family: "'Montserrat', sans-serif" },
          padding: 12,
          cornerRadius: 8,
        }
      },
      scales: {
        x: {
          grid: { display: false },
          ticks: {
            font: { family: "'Montserrat', sans-serif", size: 11, weight: '600' },
            color: '#64748B',
            maxRotation: 45,
          }
        },
        y: {
          beginAtZero: true,
          grid: { color: 'rgba(0,0,0,0.04)' },
          ticks: {
            font: { family: "'Montserrat', sans-serif", size: 11 },
            color: '#64748B',
            stepSize: 2,
          }
        }
      }
    }
  });
}

// ── Document Type Donut Chart ──
function initDonutChart() {
  const canvas = document.getElementById('docTypeChart');
  if (!canvas) return;

  const types = {article: 0, chapter: 0};
  DATA.publications.forEach(p => {
    types[p.type] = (types[p.type] || 0) + 1;
  });

  const patentCount = DATA.patents.length;
  const thesisCount = DATA.theses.length;

  new Chart(canvas, {
    type: 'doughnut',
    data: {
      labels: ['Artículos', 'Capítulos', 'Patentes', 'Tesis'],
      datasets: [{
        data: [types.article, types.chapter, patentCount, thesisCount],
        backgroundColor: [
          'rgba(0, 128, 128, 0.8)',
          'rgba(62, 180, 137, 0.8)',
          'rgba(255, 127, 80, 0.8)',
          'rgba(59, 130, 246, 0.8)',
        ],
        borderWidth: 3,
        borderColor: '#ffffff',
        hoverOffset: 8,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      cutout: '65%',
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            font: { family: "'Montserrat', sans-serif", size: 12, weight: '600' },
            color: '#36454F',
            padding: 16,
            usePointStyle: true,
            pointStyleWidth: 10,
          }
        },
        tooltip: {
          backgroundColor: '#36454F',
          titleFont: { family: "'Montserrat', sans-serif", weight: '700' },
          bodyFont: { family: "'Montserrat', sans-serif" },
          padding: 12,
          cornerRadius: 8,
        }
      }
    }
  });
}
