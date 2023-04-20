// globe.js
const globe = (() => {
  const width = 1000;
  const height = 800;

  const colorWater4 = "#0A0B46";
  const colorWater3 = "#090A59";
  const colorWater2 = "#2031A8";
  const colorWater1 = "#436DC5";
  const colorLand1 = "#558747";
  const colorLand2 = "#6E876E";
  const colorLand3 = "#576348";
  const colorLand4 = "#362211";
  const colorLand5 = "#1C0D13";
  const colorIce = "#E3F2FD";
  const colorRed = "#F44336";
  const colorBlack = "#000000"

  const create = (canvasElement, cells) => {
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

    const noise = (x, y, freq, octaves, persistence) => {
      let value = 0;
      let amplitude = 1;
      let maxValue = 0;
      let currFreq = freq;

      const angleX = (x / 180) * Math.PI;
      const angleY = (y / 180) * Math.PI;

      const r = Math.cos(angleY);
      const nx = r * Math.cos(angleX);
      const ny = r * Math.sin(angleX);
      const nz = Math.sin(angleY);

      for (let i = 0; i < octaves; i++) {
        value += simplex.noise3D(nx * currFreq, ny * currFreq, nz * currFreq) * amplitude;
        maxValue += amplitude;
        amplitude *= persistence;
        currFreq *= 2;
      }

      return value / maxValue;
    };

    const cellClass = (cell) => {
      const centroid = d3.geoCentroid(cell);
      const elevation = noise(centroid[0], centroid[1], 0.5, 8, 0.6);

      if (elevation > 0.6) {
        return colorIce;
      } else if (elevation > 0.55) {
        return colorLand5;
      } else if (elevation > 0.45) {
        return colorLand4;
      } else if (elevation > 0.35) {
        return colorLand3;
      } else if (elevation > 0.25) {
        return colorLand2;
      } else if (elevation > 0.1) {
        return colorLand1;
      } else if (elevation > 0.05) {
        return colorWater1;
      } else if (elevation > 0) {
        return colorWater2;
      } else if (elevation > -0.05) {
        return colorWater3;
      } else {
        return colorWater4;
      }
    };

    cells.forEach((cell) => {
      cell.style = cellClass(cell);
    });

    const redraw = () => {
      context.fillStyle = colorBlack;
      context.fillRect(0, 0, width, height);

      cells.forEach((cell) => {
        if (d3.geoContains({ type: "Sphere" }, d3.geoCentroid(cell))) {
          context.beginPath();
          path(cell);
          context.fillStyle = cell.hovered ? colorRed : cell.style;
          context.fill();
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

    const handleZoom = (event) => {
      const newScale = projection.scale() * (event.deltaY < 0 ? 1.1 : 0.9);
      projection.scale(newScale);
      redraw();
    };

    canvas.on('wheel', handleZoom);

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
