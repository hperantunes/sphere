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

        var cellClass = function (cell) {
            var result = Math.random() > .5 ? 'land grass' : 'sea shallow';
            if (Math.abs(d3.geoCentroid(cell)[1]) > 66.5) result += ' frozen';
            return result;
        };

        var cellClick = function (cell) {
            console.log(cell);
        };

        var cellMouseOver = function (d, i) {
            d3.select(this)
                .classed('hover', true);
        };

        var cellMouseOut = function (d, i) {
            d3.select(this)
                .classed('hover', false);
        }

        var globe = svg.selectAll('path')
            .data(cells)
            .enter()
            .append('path')
            .attr('class', cellClass)
            .on('click', cellClick)
            .on('mouseover', cellMouseOver)
            .on('mouseout', cellMouseOut);

        const sensitivity = 75;

        svg.call(d3.drag()
            .on('drag', (event) => {
                const rotate = projection.rotate();
                const k = sensitivity / projection.scale();
                projection.rotate([
                    rotate[0] + event.dx * k,
                    rotate[1] - event.dy * k
                ]);
                path = d3.geoPath().projection(projection);
                globe.attr('d', path);
            }));

        var redraw = function () {
            globe.attr('d', path);
        };

        redraw();

        return {
            projection: projection,
            globe: globe,
            redraw: redraw
        };
    }

    return {
        create: create
    };
}());
