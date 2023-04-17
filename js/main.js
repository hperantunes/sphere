// main.js
var canvasElement = document.getElementById('map');

var n = 24;

var cells = grid.generate(n);

console.log(JSON.stringify(cells));
console.log("n: " + n);
console.log("cells: " + cells.length);

var map = globe
  .create(canvasElement, cells)
  .autoRotate(0);

function generateGoldbergPolyhedron(n) {
  const polygons = d3.geodesic.polygons(n);
  const triangles = polygons.map((poly) => poly.coordinates[0]);

  const vertexMap = new Map();
  const vertices = [];
  triangles.forEach((triangle) => {
    triangle.forEach((vertex) => {
      const key = JSON.stringify(vertex);
      if (!vertexMap.has(key)) {
        vertexMap.set(key, vertices.length);
        vertices.push(vertex);
      }
    });
  });

  const faces = triangles.map((triangle) =>
    triangle.map((point) => vertexMap.get(JSON.stringify(point)))
  );

  return {
    vertices,
    faces,
  };
}

/*
The generateGoldbergPolyhedron function returns an object with two properties: vertices and faces.

vertices: This is an array of 3D points (each point is represented as an array of three numbers [x, y, z]). These points are the unique vertices of the Goldberg polyhedron.

faces: This is an array of triangular faces, where each face is represented as an array of three indices. Each index corresponds to a vertex in the vertices array. These indices specify the vertices that form the triangle, connecting them in a counterclockwise direction when looking at the face from outside the polyhedron.

The object returned by this function can be used to represent the Goldberg polyhedron in a way that is independent of the D3.js library. You can use this data to render the polyhedron using a different rendering engine or perform other operations on the polyhedron, like applying custom colors to the faces or modifying the vertices.
*/