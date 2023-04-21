// main.js
var canvasElement = document.getElementById('map');

let n = 24; // Initialize the n variable
let map = globe.create(canvasElement, initCells(n));
map.autoRotate(0);

function initCells(n) {
  var cells = grid.generate(n);

  console.log(JSON.stringify(cells));
  console.log("n: " + n);
  console.log("cells: " + cells.length);

  return cells;
}

function updateGlobe(value) {
  n = Math.floor(value);
  const newCells = initCells(n);
  map.setCells(newCells);
  map.redraw();
}

const increaseNButton = document.getElementById("increase-n");
const decreaseNButton = document.getElementById("decrease-n");

increaseNButton.addEventListener("click", () => {
  updateGlobe(n * 2);
});

decreaseNButton.addEventListener("click", () => {
  if (n > 1) {
    updateGlobe(n / 2);
  }
});
