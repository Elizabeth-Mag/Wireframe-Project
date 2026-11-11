
let dragAction = "copy";
let pointer = null;

function wireItemFromEvent(event) {
    return event.target.closest(".wire-item");
}

function dragstartHandler(event) {
    const item = wireItemFromEvent(event);
    if (!item || !item.id) return;

    dragAction = item.closest(".tool-list") ? "copy" : "move";

    if (pointer && pointer.id === item.id) pointer.moved = true;

    event.dataTransfer.effectAllowed = dragAction;
    event.dataTransfer.setData("text/plain", item.id);
}


/* DRAG AND DROP HANDLERS */
function dragoverHandler(event) {
    if (!event.target.closest(".grid-cell")) return;

    event.preventDefault();
    event.dataTransfer.dropEffect = dragAction;
}

let resizetime= false;

//allows objects dragged and copied from tool list to grid 
function dropHandler(ev) {
  ev.preventDefault();
  const data = ev.dataTransfer.getData("text");
  ev.target.appendChild(document.getElementById(data).cloneNode(true));

  ResizeTextBox();
}

function TextDragStart(){
  resizetime= true;
  console.log("its true!")
}


function ResizeTextBox() {
  if (resizetime== true){
    console.log("this happened");
    resizetime= false;
  }else{
    console.log("nothing happened");
  }
}


//grid stuff
function dropHandler(event) {
    const cell = event.target.closest(".grid-cell");
    const grid = document.getElementById("grid-container");

    if (!cell || !grid || !grid.contains(cell)) return;

    event.preventDefault();

    const item = document.getElementById(event.dataTransfer.getData("text/plain"));
    if (!item) return;

    if (item.closest(".tool-list")) {
        const copy = item.cloneNode(true);
        copy.id = item.id + "-" + Date.now();

        cell.replaceChildren(copy);
        saveDesign();
        return;
    }

    if (!grid.contains(item) || item.parentElement === cell) return;

    cell.replaceChildren(item);
    saveDesign();
}

function updateGrid(rows, cols) {
    const container = document.getElementById("grid-container");
    if (!container) return;

    const cellSize = 50;

    container.innerHTML = "";
    container.style.display = "grid";
    container.style.gridTemplateColumns = "repeat(" + cols + ", " + cellSize + "px)";
    container.style.gridTemplateRows = "repeat(" + rows + ", " + cellSize + "px)";

    const totalCells = rows * cols;

    for (let i = 0; i < totalCells; i++) {
        const cell = document.createElement("div");
        cell.className = "grid-cell";
        container.appendChild(cell);
    }

    saveDesign();
}

/*
// 3x3 grid on load
updateGrid(3, 3); //Not showing on load not urgent 


// Select all grid cells
const cells = document.querySelectorAll('.grid-cell');

cells.forEach(cell => {
  cell.addEventListener('click', () => {
    // Toggle the color on and off for the clicked cell
    cell.classList.toggle('active');
    
  });
});
/*


/* TEXT EDITING / PLACEMENT OF CURSOR*/
function placeCaret(item, x, y) {
    const selection = window.getSelection();
    if (!selection) return;

    let range = document.caretRangeFromPoint
        ? document.caretRangeFromPoint(x, y)
        : null;

    if (!range || !item.contains(range.startContainer)) {
        range = document.createRange();
        range.selectNodeContents(item);
        range.collapse(false);
    }

    selection.removeAllRanges();
    selection.addRange(range);
}

/* UPLOADING IMAGE INTO GRID BACKGROUND */
function insertImage(event) {
    const file = event.target.files && event.target.files[0];
    const grid = document.getElementById("grid-container");

    if (!file || !grid) return;

    if (!file.type.startsWith("image/")) {
        window.alert("Please select an image file.");
        event.target.value = "";
        return;
    }

    const reader = new FileReader();

    reader.onload = function () {
        grid.style.backgroundImage = 'url("' + reader.result + '")';
        grid.style.backgroundSize = "cover";
        grid.style.backgroundPosition = "center";
        grid.style.backgroundRepeat = "no-repeat";
        grid.classList.add("has-background");

        saveDesign();
    };

    reader.readAsDataURL(file);
    event.target.value = "";
}

/* LOCAL STORAGE PARTS */
function saveDesign() {
    const grid = document.getElementById("grid-container");
    if (!grid) return;

    localStorage.setItem("savedDesign", grid.innerHTML);
    localStorage.setItem("savedBackground", grid.style.backgroundImage);
    localStorage.setItem("savedColumns", grid.style.gridTemplateColumns);
    localStorage.setItem("savedRows", grid.style.gridTemplateRows);
}

/* LOADS THE DESIGN INTO THE FINAL PAGE */
function loadDesign() {
    const grid = document.getElementById("grid-container");
    if (!grid) return false;

    const savedDesign = localStorage.getItem("savedDesign");

    if (savedDesign === null) return false;

    grid.innerHTML = savedDesign;

    grid.style.display = "grid";
    grid.style.gridTemplateColumns =
        localStorage.getItem("savedColumns") || "";
    grid.style.gridTemplateRows =
        localStorage.getItem("savedRows") || "";

    grid.style.backgroundImage =
        localStorage.getItem("savedBackground") || "";

    if (grid.style.backgroundImage && grid.style.backgroundImage !== "none") {
        grid.style.backgroundSize = "cover";
        grid.style.backgroundPosition = "center";
        grid.style.backgroundRepeat = "no-repeat";
        grid.classList.add("has-background");
    }

    return true;
}

document.addEventListener("DOMContentLoaded", function () {
    const grid = document.getElementById("grid-container");

    if (!grid) return;

    if (document.body.id === "final-page") {
        loadDesign();
        return;
    }

    // Restore the previous design instead of creating an empty grid.
    if (!loadDesign()) {
        updateGrid(3, 3);
    }

    // Save changes to editable text.
    grid.addEventListener("input", function (event) {
        if (event.target.closest(".wire-item")) {
            saveDesign();
        }
    });

    // Save immediately before opening the final page.
    const finalLink = document.querySelector('a[href="final.html"]');

    if (finalLink) {
        finalLink.addEventListener("click", saveDesign);
    }

    document.addEventListener("dragstart", dragstartHandler, true);
    grid.addEventListener("dragover", dragoverHandler);
    grid.addEventListener("drop", dropHandler);

    document.addEventListener("mousedown", function (event) {
        const item = event.target.closest(".wire-item");

        if (!item || !item.isContentEditable) {
            pointer = null;
            return;
        }

        item.draggable = true;

        pointer = {
            id: item.id,
            x: event.clientX,
            y: event.clientY,
            moved: false
        };
    });

    document.addEventListener("mouseup", function () {
        if (!pointer || pointer.moved) {
            pointer = null;
            return;
        }

        const item = document.getElementById(pointer.id);
        const x = pointer.x;
        const y = pointer.y;

        pointer = null;

        if (!item) return;

        item.draggable = false;
        item.focus();
        placeCaret(item, x, y);
    });

    document.addEventListener("focusout", function (event) {
        const item = event.target.closest(".wire-item");

        if (!item || !item.isContentEditable) return;
        if (event.relatedTarget && item.contains(event.relatedTarget)) return;

        item.draggable = true;
    });
});

function toggleGridLines() {
    const grid = document.getElementById("grid-container");
    const button = document.querySelector("#final-page .controls button");

    if (!grid || !button) return;

    grid.classList.toggle("hide-grid");

    if (grid.classList.contains("hide-grid")) {
        button.textContent = "Show Grid";
    } else {
        button.textContent = "Hide Grid";
    }
}

/* CLEARS DESIGN WHEN YOU EXIT AND RELOAD */
function clearSavedDesign() {
    localStorage.removeItem("savedDesign");
    localStorage.removeItem("savedBackground");
    localStorage.removeItem("savedColumns");
    localStorage.removeItem("savedRows");
}
