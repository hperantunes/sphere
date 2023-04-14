var globe = (function () {
    var create = function (canvasElement, cells) {

        var width = 1000,
            height = 800,
            scale = 300, // default = 150
            clipAngle = 90;

        var svg = d3.select(canvasElement)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        var projection = d3.geoOrthographic()
            .translate([width / 2, height / 2])
            .scale(scale)
            .clipAngle(clipAngle);

        var path = d3.geoPath().projection(projection);

        var sensibility = 150 / projection.scale() / 2,
            maxRotationY = 36;

        var prevCoords;
        var drag = d3.drag()
            .on("start", function (event) {
                prevCoords = d3.pointer(event);
                var rotate = projection.rotate();
                d3.select(this).datum({
                    x: rotate[0] / sensibility,
                    y: -rotate[1] / sensibility
                });
            })
            .on("drag", function (event) {
                var current = d3.select(this).datum();
                var currCoords = d3.pointer(event);
                var dx = currCoords[0] - prevCoords[0];
                var dy = currCoords[1] - prevCoords[1];

                var lambda = current.x + dx / sensibility,
                    phi = current.y - dy / sensibility,
                    rotate = projection.rotate();

                // Restriction for rotating upside-down
                phi = phi > maxRotationY ? maxRotationY :
                    phi < -maxRotationY ? -maxRotationY :
                        phi;
                projection.rotate([lambda, phi]);
                redraw();

                prevCoords = currCoords;
            });

        var cellClass = function (cell) {
            var result = Math.random() > .5 ? 'land grass' : 'sea shallow';
            if (Math.abs(d3.geoCentroid(cell)[1]) > 66.5) result += ' frozen';
            return result;
        };

        var cellClick = function (event, cell) {
            if (event.defaultPrevented)
                return;
            console.log(cell);
        };

        var cellMouseOver = function (event, d) {
            d3.select(this)
                .classed('hover', true);
        };

        var cellMouseOut = function (event, d) {
            d3.select(this)
                .classed('hover', false);
        }

        var globe = svg.selectAll('path')
            .data(cells)
            .join('path')
            .attr('class', cellClass)
            .on('click', cellClick)
            .on('mouseover', cellMouseOver)
            .on('mouseout', cellMouseOut)
            .call(drag);

        var autoRotate = function (speed) {
            var velocity = [speed / 100, .000],
                t0 = Date.now();

            var func = function () {
                var time = Date.now() - t0;
                projection.rotate([time * velocity[0], time * velocity[1]]);
                redraw();
            };

            d3.timer(func);
        };

        var redraw = function () {
            globe.attr('d', path);
        };

        redraw();

        return {
            projection: projection,
            globe: globe,
            redraw: redraw,
            autoRotate: autoRotate
        };
    }

    return {
        create: create
    };
}());