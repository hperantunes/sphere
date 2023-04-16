const globe = (() => {
    const create = (canvasElement, cells) => {
        const width = 1000;
        const height = 800;
        const scale = 300;
        const clipAngle = 90;

        const canvas = d3
            .select(canvasElement)
            .append("canvas")
            .attr("width", width)
            .attr("height", height);

        const context = canvas.node().getContext("2d");

        const projection = d3
            .geoOrthographic()
            .translate([width / 2, height / 2])
            .scale(scale)
            .clipAngle(clipAngle);

        const path = d3.geoPath().projection(projection).context(context);

        const simplex = new SimplexNoise();

        const noise = (x, y) => {
            let freq = 0.015;
            const octaves = 8;
            const persistence = 0.5;
            let value = 0;
            let amplitude = 1;
            let maxValue = 0;

            for (let i = 0; i < octaves; i++) {
                value += simplex.noise2D(x * freq, y * freq) * amplitude;
                maxValue += amplitude;
                amplitude *= persistence;
                freq *= 2;
            }

            return value / maxValue;
        };

        const cellClass = (cell) => {
            const centroid = d3.geoCentroid(cell);
            const n = noise(centroid[0], centroid[1]);

            if (Math.abs(centroid[1]) > 66.5) {
                return "white";
            } else if (n > 0.15) {
                return "green";
            } else {
                return "blue";
            }
        };

        cells.forEach((cell) => {
            cell.style = cellClass(cell);
        });

        const redraw = () => {
            context.fillStyle = "black";
            context.fillRect(0, 0, width, height);

            cells.forEach((cell) => {
                if (d3.geoContains({ type: "Sphere" }, d3.geoCentroid(cell))) {
                    context.beginPath();
                    path(cell);
                    context.fillStyle = cell.hovered ? "red" : cell.style;
                    context.fill();
                    context.strokeStyle = "black";
                    context.lineWidth = 0.2;
                }
            });
        };

        let hoverCell = null;

        canvas.on("mousemove", (event) => {
            const mousePos = d3.pointer(event);
            const [cx, cy] = projection.translate();
            const r = projection.scale();
            const dx = mousePos[0] - cx;
            const dy = mousePos[1] - cy;
            const d = Math.sqrt(dx * dx + dy * dy);

            if (d < r) {
                const mouseCell = cells.find((cell) =>
                    d3.geoContains(cell, projection.invert(mousePos))
                );

                if (hoverCell !== mouseCell) {
                    if (hoverCell) {
                        hoverCell.hovered = false;
                    }

                    if (mouseCell) {
                        hoverCell = mouseCell;
                        hoverCell.hovered = true;
                        redraw();
                    } else {
                        hoverCell = null;
                    }
                }
            } else {
                if (hoverCell) {
                    hoverCell.hovered = false;
                    hoverCell = null;
                    redraw();
                }
            }
        });

        const drag = d3
            .drag()
            .on("start", () => {
                d3.select(canvasElement).style("cursor", "grabbing");
            })
            .on("drag", (event) => {
                const rotate = projection.rotate();
                const k = 150 / projection.scale() / 2;
                projection.rotate([rotate[0] + event.dx * k, rotate[1] - event.dy * k]);
                redraw();
            })
            .on("end", () => {
                d3.select(canvasElement).style("cursor", "grab");
            });

        canvas.call(drag);
        redraw();

        const autoRotate = (speed) => {
            if (speed <= 0) {
                return;
            }
            const animate = () => {
                const rotate = projection.rotate();
                projection.rotate([rotate[0] + speed, rotate[1]]);
                redraw();
                requestAnimationFrame(animate);
            };
            animate();
        };

        return {
            projection,
            redraw,
            autoRotate,
        };
    };

    return {
        create,
    };
})();