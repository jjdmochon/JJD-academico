// ============================================================
// GRAPH.JS — D3.js Force-Directed Knowledge Graph
// ============================================================

function initKnowledgeGraph() {
  const container = document.getElementById('knowledge-graph');
  if (!container) return;

  const width = container.clientWidth;
  const height = 500;

  // Build nodes and links
  const nodes = [];
  const links = [];
  const nodeMap = {};

  function addNode(id, label, type, size) {
    if (!nodeMap[id]) {
      const node = { id, label, type, size: size || 8 };
      nodes.push(node);
      nodeMap[id] = node;
    }
    return nodeMap[id];
  }

  // Add JJD as central node
  addNode('jjd', 'J.J. Díaz-Mochón', 'central', 20);

  // Add projects
  DATA.projects.forEach(p => {
    addNode('proj_' + p.name, p.name, 'project', 14);
    links.push({ source: 'jjd', target: 'proj_' + p.name, strength: 0.8 });
  });

  // Add thesis candidates
  DATA.theses.forEach(t => {
    const id = 'thesis_' + t.candidate.replace(/\s/g, '_');
    addNode(id, t.candidate.split(' ').slice(0, 2).join(' '), 'thesis', 10);
    links.push({ source: 'jjd', target: id, strength: 0.6 });
  });

  // Add top coauthors (recurring)
  const coauthors = [
    'R.M. Sánchez-Martín', 'S. Pernagallo', 'M. Bradley',
    'B. López-Longarela', 'M. Tabraue-Chávez', 'A. Unciti-Broceta',
    'A. Orte', 'J.A. Lorente', 'M.J. Serrano'
  ];

  coauthors.forEach(name => {
    const id = 'coauth_' + name.replace(/[\s.]/g, '_');
    addNode(id, name, 'coauthor', 9);
    links.push({ source: 'jjd', target: id, strength: 0.4 });
  });

  // Connect coauthors to projects where relevant
  const coauthProjectLinks = [
    ['coauth_RM_Sánchez-Martín', 'proj_CRISPNA'],
    ['coauth_S_Pernagallo', 'proj_DestiNA Spin-Tube'],
    ['coauth_S_Pernagallo', 'proj_LIQBIOPSENS'],
    ['coauth_MJ_Serrano', 'proj_LIQBIOPSENS'],
    ['coauth_JA_Lorente', 'proj_LIQBIOPSENS'],
    ['coauth_M_Tabraue-Chávez', 'proj_CoVradar'],
  ];

  coauthProjectLinks.forEach(([s, t]) => {
    if (nodeMap[s] && nodeMap[t]) {
      links.push({ source: s, target: t, strength: 0.3 });
    }
  });

  // Add key research themes
  const themes = [
    'Química Dinámica', 'Biopsia Líquida', 'Nanotecnología',
    'CRISPR/PNA', 'microRNA', 'Purinas'
  ];

  themes.forEach(theme => {
    const id = 'theme_' + theme.replace(/[\s/]/g, '_');
    addNode(id, theme, 'theme', 11);
    links.push({ source: 'jjd', target: id, strength: 0.5 });
  });

  // Color scale
  const colorMap = {
    central: '#008080',
    project: '#3b82f6',
    thesis: '#3EB489',
    coauthor: '#FF7F50',
    theme: '#8b5cf6'
  };

  // Create SVG
  const svg = d3.select(container)
    .append('svg')
    .attr('width', width)
    .attr('height', height)
    .attr('viewBox', `0 0 ${width} ${height}`);

  // Add zoom
  const g = svg.append('g');
  svg.call(d3.zoom().scaleExtent([0.3, 3]).on('zoom', (event) => {
    g.attr('transform', event.transform);
  }));

  // Force simulation
  const simulation = d3.forceSimulation(nodes)
    .force('link', d3.forceLink(links).id(d => d.id).distance(100).strength(d => d.strength || 0.5))
    .force('charge', d3.forceManyBody().strength(-200))
    .force('center', d3.forceCenter(width / 2, height / 2))
    .force('collision', d3.forceCollide().radius(d => d.size + 8));

  // Draw links
  const link = g.append('g')
    .selectAll('line')
    .data(links)
    .enter().append('line')
    .attr('stroke', 'rgba(0,0,0,0.08)')
    .attr('stroke-width', 1.5);

  // Draw nodes
  const node = g.append('g')
    .selectAll('g')
    .data(nodes)
    .enter().append('g')
    .call(d3.drag()
      .on('start', (event, d) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x; d.fy = d.y;
      })
      .on('drag', (event, d) => {
        d.fx = event.x; d.fy = event.y;
      })
      .on('end', (event, d) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null; d.fy = null;
      })
    );

  node.append('circle')
    .attr('r', d => d.size)
    .attr('fill', d => colorMap[d.type] || '#999')
    .attr('stroke', '#fff')
    .attr('stroke-width', 2)
    .style('cursor', 'pointer')
    .on('mouseover', function() {
      d3.select(this).transition().duration(200).attr('r', d => d.size * 1.3);
    })
    .on('mouseout', function() {
      d3.select(this).transition().duration(200).attr('r', d => d.size);
    });

  node.append('text')
    .text(d => d.label)
    .attr('x', d => d.size + 6)
    .attr('y', 4)
    .attr('font-size', d => d.type === 'central' ? '12px' : '10px')
    .attr('font-family', "'Montserrat', sans-serif")
    .attr('font-weight', d => d.type === 'central' ? '700' : '500')
    .attr('fill', '#36454F');

  // Tick
  simulation.on('tick', () => {
    link
      .attr('x1', d => d.source.x)
      .attr('y1', d => d.source.y)
      .attr('x2', d => d.target.x)
      .attr('y2', d => d.target.y);

    node.attr('transform', d => `translate(${d.x},${d.y})`);
  });
}
