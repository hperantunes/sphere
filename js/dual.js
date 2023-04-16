var dual = (function () {

    var normalisePoint = function (point) {
        return point[0].toFixed(2) + ',' + point[1].toFixed(2);
    };

    var generateDuals = function (triangles) {
        var facesAroundPoint = {};

        triangles.forEach(function (triangle) {
            triangle.duals = [];
            triangle.coordinates[0].map(normalisePoint).forEach(function (point) {
                var neighbours = facesAroundPoint[point] || [];
                neighbours = neighbours.concat(triangle).filter(function (item, index, array) {
                    return array.indexOf(item) === index;
                });
                facesAroundPoint[point] = neighbours;
            });
        });

        var duals = [];
        var id = 0;

        for (let centre in facesAroundPoint) {
            let neighbours = facesAroundPoint[centre];

            // sets face's "type" as required by d3.geodesic
            // sets simple incremental id for each face
            var dual = {
                "type": "Polygon",
                "id": id++
            };

            var orderedFaces = [neighbours[0]];

            function addValidCandidate(candidate) {
                if (neighbours.includes(candidate) && !orderedFaces.includes(candidate)) {
                    orderedFaces.push(candidate);
                    return true;
                }
                return false;
            }

            while (orderedFaces.length < neighbours.length) {
                var points = orderedFaces[orderedFaces.length - 1].coordinates[0].map(normalisePoint);
                facesAroundPoint[points[points.lastIndexOf(centre) - 1]].some(addValidCandidate);
            }

            orderedFaces.push(orderedFaces[0]);

            // sets face's coordinates
            dual.coordinates = [orderedFaces.map(d3.geoCentroid)];

            // adds face's centroid coordinates
            dual.c = d3.polygonCentroid(dual.coordinates[0]);
            dual.c[0] = parseFloat(dual.c[0].toFixed(3));
            dual.c[1] = parseFloat(dual.c[1].toFixed(3));

            // rounds each coordinate to 3 decimal places
            dual.coordinates[0].map(function (face) {
                face[0] = parseFloat(face[0].toFixed(3));
                face[1] = parseFloat(face[1].toFixed(3));
            });

            for (var f = 0; f < neighbours.length; ++f) {
                neighbours[f].duals.push(dual);
            }

            duals.push(dual);
        }

        return duals;
    };

    return {
        generateDuals: generateDuals
    };
}());
