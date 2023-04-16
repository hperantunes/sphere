var grid = (function () {
    var generate = function (n) {
        if (n <= 0) {
            return [];
        }
        var triangles = d3.geodesic.polygons(n);
        var cells = dual.generateDuals(triangles);

        // for each dual, put the neighbour duals in an array which will
        // be created if it doesn't yet exist
        triangles.forEach(function (triangle) {
            triangle.duals.forEach(function (cell) {
                var others = triangle.duals.filter(function (item) {
                    return item !== cell;
                });
                cell.n = (cell.n || []).concat(others.filter(function (item) {
                    return (cell.n || []).indexOf(item.id) === -1;
                }).map(function (item) {
                    return item.id;
                }));
            });
        });

        return cells;
    };

    return {
        generate: generate
    };
}());