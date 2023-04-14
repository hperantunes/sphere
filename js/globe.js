var globe = (function () {
    var create = function (canvasElement, cells) {

        var width = 1000,
            height = 800,
            scale = 300, // default = 150
            clipAngle = 90;

        // this must be moved out of globe.js
        var svg = d3.select(canvasElement)
            .append('svg')
            .attr('width', width)
            .attr('height', height);

        var projection = d3.geo.orthographic()
            .translate([width / 2, height / 2])
            .scale(scale)
            .clipAngle(clipAngle);

        var path = d3.geo.path().projection(projection);

        /* mouse drag, this must me moved out of globe.js */
        var sensibility = 150 / projection.scale() / 2, // 150 is the default scale
            maxRotationY = 36; // 36 degrees
        var drag = d3.behavior.drag()
            .origin(function () {
                var r = projection.rotate();
                return {
                    x: r[0] / sensibility,
                    y: -r[1] / sensibility
                };
            })
            .on("drag", function () {
                var lambda = d3.event.x * sensibility,
                    phi = -d3.event.y * sensibility,
                    rotate = projection.rotate();
                //Restriction for rotating upside-down
                phi = phi > maxRotationY ? maxRotationY :
                    phi < -maxRotationY ? -maxRotationY :
                        phi;
                projection.rotate([lambda, phi]);
                redraw();
            });

        // this will never be generated on client
        var cellClass = function (cell) {
            var result = Math.random() > .5 ? 'land grass' : 'sea shallow';
            if (Math.abs(d3.geo.centroid(cell)[1]) > 66.5) result += ' frozen';
            return result;
        };

        // this must be moved out of globe.js
        var cellClick = function (cell) {
            if (d3.event.defaultPrevented)
                return; // click suppressed
            console.log(cell);
        };

        // this must be moved out of globe.js
        var cellMouseOver = function (d, i) {
            d3.select(this)
                .classed('hover', true);
        };

        // this must be moved out of globe.js
        var cellMouseOut = function (d, i) {
            d3.select(this)
                .classed('hover', false);
        }

        var globe = svg.selectAll('path')
            .data(cells)
            .enter()
            .append('path')
            .attr('class', cellClass)       // classes to be moved out of globe.js
            .on('click', cellClick)         // mouse click to be moved out of globe.js
            .on('mouseover', cellMouseOver) // mouse events to be moved out of globe.js
            .on('mouseout', cellMouseOut)   // mouse events to be moved out of globe.js
            .call(drag);                    // drag behaviour to be moved out of globe.js

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
