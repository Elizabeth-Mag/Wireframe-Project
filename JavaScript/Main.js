//Setting up drag and drop... I think
function dragstartHandler(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}

function dragstartHandler2(ev) {
  ev.dataTransfer.setData("text", ev.target.id);
}



function dragoverHandler(ev) {
  ev.preventDefault(); // Default is open as link on drop 
}

//allows objects dragged and copied from hotbar to grid 
function dropHandler(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  ev.target.appendChild(document.getElementById(data).cloneNode(true));
}

//allows object to move between cells still need to figure out where to put it
function dropHandler2(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  ev.target.appendChild(document.getElementById(data));
}



//grid stuff
function updateGrid(rows, cols) {
  const container = document.getElementById('grid-container');
  
  // trash prev grid
  container.innerHTML = '';
  
  // Set the grid template columns and rows
  container.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
  container.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
  
  // fill the grid with items
  const totalCells = rows * cols;
  for (let i = 1; i <= totalCells; i++) {
    const cell = document.createElement('div');
    cell.classList.add('grid-cell');
    //cell.textContent = i;
    container.appendChild(cell);
  }
}

// 3x3 grid on load
updateGrid(3, 3); //Not showing on load not urgent 