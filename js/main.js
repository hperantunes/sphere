var canvasElement = document.getElementById('map');

var n = 6;

var cells = grid.generate(n);

console.log(JSON.stringify(cells));
console.log("n: " + n);
console.log("cells: " + cells.length);

var map = globe
  .create(canvasElement, cells);

