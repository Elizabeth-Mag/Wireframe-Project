
function dragstartHandler(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function dragoverHandler(ev) {
  ev.preventDefault();
}

function dropHandler(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  ev.target.appendChild(document.getElementById(data).cloneNode(true));
}

function createGrid(rows, cols) {
  const container = document.getElementById('grid-container');
  
  // Set up the grid structure dynamically using CSS variables
  container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;

  // Loop to generate individual items
  for (let i = 0; i < rows * cols; i++) {
    const item = document.createElement('div');
    item.classList.add('grid-item');
    item.textContent = i + 1; // Add label/number
    container.appendChild(item);
  }
}

// Create a 4x4 grid
createGrid(4, 4);