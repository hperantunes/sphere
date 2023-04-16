var globe = (function () {
    var create = function (canvasElement, cells) {
        var cellClass = function (cell) {
            var result = Math.random() > .5 
                ? 'green' 
                : 'blue';
            if (Math.abs(d3.geoCentroid(cell)[1]) > 66.5) {
                result = 'white';
            }
            return result;
        };

        cells.forEach(function(cell) {
            cell.style = cellClass(cell);
        });

        var width = 1000,
            height = 800,
            scale = 300,
            clipAngle = 90;

        var canvas = d3.select(canvasElement)
            .append('canvas')
            .attr('width', width)
            .attr('height', height);

        var context = canvas.node().getContext('2d');
        context.fillStyle = 'black';
        context.fillRect(0, 0, width, height);

        var projection = d3.geoOrthographic()
            .translate([width / 2, height / 2])
            .scale(scale)
            .clipAngle(clipAngle);

        var path = d3.geoPath().projection(projection).context(context);

        var redraw = function () {
            context.fillStyle = 'black';
            context.fillRect(0, 0, width, height);

            cells.forEach(function(cell) {
                context.beginPath();
                path(cell);
                context.fillStyle = cell.hovered ? 'red' : cell.style;
                context.fill();
                context.strokeStyle = 'black';
                context.lineWidth = .1;
                context.stroke();
            });
        };

        var hoverCell = null;

        canvas.on('mousemove', function(event) {
            var mousePos = d3.pointer(event);
            var mouseCell = cells.find(cell => d3.geoContains(cell, projection.invert(mousePos)));

            if (hoverCell !== mouseCell) {
                if (hoverCell) {
                    hoverCell.hovered = false;
                }

                if (mouseCell) {
                    hoverCell = mouseCell;
                    hoverCell.hovered = true;
                } else {
                    hoverCell = null;
                }

                redraw();
            }
        });

        var drag = d3.drag()
            .on("drag", function(event) {
                var rotate = projection.rotate();
                var k = 150 / projection.scale() / 2;
                projection.rotate([
                    rotate[0] + event.dx * k,
                    rotate[1] - event.dy * k
                ]);
                redraw();
            });

        canvas.call(drag);
        redraw();

        function autoRotate(speed) {
            d3.timer(function () {
                var rotate = projection.rotate();
                projection.rotate([rotate[0] + speed, rotate[1]]);
                redraw();
                return false;
            }, 1000 / 60);
        }

        return {
            projection: projection,
            redraw: redraw,
            autoRotate: autoRotate
        };
    }

    return {
        create: create
    };
}());