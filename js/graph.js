document.addEventListener('DOMContentLoaded', () => {
  const graphContainer = document.getElementById('graph-container');

  if (!graphContainer) {
    console.error('Graph container not found');
    return;
  }

  let width = graphContainer.clientWidth;
  let height = graphContainer.clientHeight;

  const svg = d3.select("#graph-container").append("svg")
    .attr("width", width)
    .attr("height", height)
    .attr("viewBox", [-width / 2, -height / 2, width, height])
    .style("display", "block");

  // Define the data for the graph
  const nodes = [
    { id: 1, title: "Klimaanpassung", text: "Strategien für eine resiliente Zukunft.", image: "/assets/images/placeholder_klima.svg" },
    { id: 2, title: "Digitale Transformation", text: "Den digitalen Wandel nachhaltig gestalten.", image: "/assets/images/placeholder_digital.svg" },
    { id: 3, title: "Bürgerbeteiligung", text: "Partizipative Prozesse schaffen.", image: "/assets/images/placeholder_beteiligung.svg" },
    { id: 4, title: "Nachhaltige Mobilität", text: "Innovative Verkehrskonzepte.", image: "/assets/images/placeholder_mobilitaet.svg" },
    { id: 5, title: "Circular Economy", text: "Ressourcenkreisläufe schließen.", image: "/assets/images/placeholder_circular.svg" }
  ];

  const links = [
    { source: 1, target: 2 },
    { source: 1, target: 3 },
    { source: 1, target: 5 },
    { source: 2, target: 4 },
    { source: 3, target: 4 },
    { source: 5, target: 2 }
  ];

  const simulation = d3.forceSimulation(nodes)
    .force("link", d3.forceLink(links).id(d => d.id).distance(280))
    .force("charge", d3.forceManyBody().strength(-800))
    .force("center", d3.forceCenter(0, 0))
    .on("tick", ticked);

  const link = svg.append("g")
    .attr("class", "links")
    .selectAll("line")
    .data(links)
    .enter().append("line");

  const nodeGroup = svg.append("g")
    .attr("class", "nodes")
    .selectAll("g")
    .data(nodes)
    .enter().append("g")
    .attr("class", "node-card");

  const cardWidth = 240;
  const cardHeight = 160;
  const imageHeight = 100;
  // Layout/Kollisions-Parameter
  const nodePadding = 14;
  const halfW = cardWidth / 2;
  const halfH = cardHeight / 2;
  const collideRadius = Math.hypot(cardWidth, cardHeight) / 2 + nodePadding;

  // Zusätzliche weiche Ausrichtung und grobe Kreis-Kollision
  simulation
    .force('collide', d3.forceCollide().radius(collideRadius).iterations(2))
    .force('x', d3.forceX(0).strength(0.08))
    .force('y', d3.forceY(0).strength(0.08));

  nodeGroup.append("rect")
    .attr("width", cardWidth)
    .attr("height", cardHeight)
    .attr("rx", 8)
    .attr("ry", 8);

  nodeGroup.append("image")
    .attr("href", d => d.image)
    .attr("width", cardWidth)
    .attr("height", imageHeight)
    .attr("preserveAspectRatio", "xMidYMid slice")
    .attr("clip-path", "inset(0% 0% 0% 0% round 8px)");


  nodeGroup.append("foreignObject")
    .attr("width", cardWidth)
    .attr("height", cardHeight - imageHeight)
    .attr("y", imageHeight)
    .append("xhtml:div")
    .attr("class", "node-text-content")
    .html(d => `
      <h3 class="node-title">${d.title}</h3>
      <p class="node-text">${d.text}</p>
    `);

  // Drag functionality
  const drag = d3.drag()
    .on("start", dragstarted)
    .on("drag", dragged)
    .on("end", dragended);

  nodeGroup.call(drag);

  function ticked() {
    // 1) Rechteckige Kollisionen auflösen (keine Überlappungen)
    rectCollide(nodes, halfW, halfH, nodePadding);

    // 2) In die sichtbaren Bounds clampen
    const minX = -width / 2 + halfW + 24;
    const maxX =  width / 2 - halfW - 24;
    const minY = -height / 2 + halfH + 24;
    const maxY =  height / 2 - halfH - 24;
    for (const n of nodes) {
      if (n.fx == null) n.x = Math.max(minX, Math.min(maxX, n.x));
      if (n.fy == null) n.y = Math.max(minY, Math.min(maxY, n.y));
    }

    // 3) Links und Knoten rendern
    link
      .attr("x1", d => d.source.x)
      .attr("y1", d => d.source.y)
      .attr("x2", d => d.target.x)
      .attr("y2", d => d.target.y);

    nodeGroup
      .attr("transform", d => `translate(${d.x - cardWidth / 2}, ${d.y - cardHeight / 2})`);
  }

  // Rechteckige Kollisionsbehandlung über Quadtree
  function rectCollide(nodes, hw, hh, pad){
    const tree = d3.quadtree(nodes, d => d.x, d => d.y);
    nodes.forEach(node => {
      const nx1 = node.x - hw - pad, nx2 = node.x + hw + pad;
      const ny1 = node.y - hh - pad, ny2 = node.y + hh + pad;
      tree.visit((quad, x1, y1, x2, y2) => {
        const other = quad.data;
        if (other && other !== node){
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const xOverlap = (hw + pad + hw) - Math.abs(dx);
          const yOverlap = (hh + pad + hh) - Math.abs(dy);
          if (xOverlap > 0 && yOverlap > 0){
            if (xOverlap < yOverlap){
              const sx = Math.sign(dx) || (Math.random() < 0.5 ? 1 : -1);
              const shift = (xOverlap / 2) * sx;
              if (node.fx == null) node.x += shift;
              if (other.fx == null) other.x -= shift;
            } else {
              const sy = Math.sign(dy) || (Math.random() < 0.5 ? 1 : -1);
              const shift = (yOverlap / 2) * sy;
              if (node.fy == null) node.y += shift;
              if (other.fy == null) other.y -= shift;
            }
          }
        }
        // True = diesen Ast nicht weiter besuchen (keine Überschneidung der Suchbox)
        return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
      });
    });
  }

  function dragstarted(event, d) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    d.fx = d.x;
    d.fy = d.y;
  }

  function dragged(event, d) {
    d.fx = event.x;
    d.fy = event.y;
  }

  function dragended(event, d) {
    if (!event.active) simulation.alphaTarget(0);
    d.fx = null;
    d.fy = null;
  }

  // Resize handler
  window.addEventListener('resize', () => {
    const newWidth = graphContainer.clientWidth;
    const newHeight = graphContainer.clientHeight;
    width = newWidth; height = newHeight;
    svg.attr("width", newWidth)
       .attr("height", newHeight)
       .attr("viewBox", [-newWidth / 2, -newHeight / 2, newWidth, newHeight]);
    simulation.force("center", d3.forceCenter(0, 0)).alpha(0.4).restart();
  });
});
