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

function dragoverHandler(event) {
    if (!event.target.closest(".grid-cell")) return;
    event.preventDefault();
    event.dataTransfer.dropEffect = dragAction;
}

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
        return;
    }

    if (!grid.contains(item) || item.parentElement === cell) return;
    cell.replaceChildren(item);
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
}

function placeCaret(item, x, y) {
    const selection = window.getSelection();
    if (!selection) return;

    let range = document.caretRangeFromPoint ? document.caretRangeFromPoint(x, y) : null;
    if (!range || !item.contains(range.startContainer)) {
        range = document.createRange();
        range.selectNodeContents(item);
        range.collapse(false);
    }

    selection.removeAllRanges();
    selection.addRange(range);
}

function insertImage(event) {
    const file = event.target.files && event.target.files[0];
    const grid = document.getElementById("grid-container");
    if (!file || !grid) return;

    if (!file.type.startsWith("image/")) {
        window.alert("Please select an image file.");
        event.target.value = "";
        return;
    }

    if (grid.dataset.backgroundImageURL) {
        URL.revokeObjectURL(grid.dataset.backgroundImageURL);
    }

    const imageURL = URL.createObjectURL(file);
    grid.dataset.backgroundImageURL = imageURL;
    grid.style.backgroundImage = 'url("' + imageURL + '")';
    grid.style.backgroundSize = "cover";
    grid.style.backgroundPosition = "center";
    grid.style.backgroundRepeat = "no-repeat";
    grid.classList.add("has-background");
    event.target.value = "";
}

document.addEventListener("DOMContentLoaded", function () {
    const grid = document.getElementById("grid-container");
    if (!grid) return;

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

    updateGrid(3, 3);
});