# Sphere: Procedural Planet Generator

An interactive 3D planet generator built with Babylon.js that creates procedurally generated terrain using Simplex Noise algorithms. The application renders a customizable globe with realistic terrain features, optional cloud layers, and interactive capabilities.

## ✨ Features

- **Procedural Terrain Generation**: Create diverse planetary landscapes using Simplex Noise
- **Dynamic Cloud Layer**: Optional animated cloud coverage with shader-based rendering
- **Interactive Visualization**: Rotate, zoom, and explore the generated planet
- **Customizable Parameters**: Control terrain complexity, seed values, and visual features
- **Exportable Models**: Save your generated planet as a 3D model

## 🚀 Getting Started

### Prerequisites

- A modern web browser
- Node.js and npm (for running locally)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/hperantunes/sphere.git
cd sphere
```

2. Start a local server:
```bash
npx serve .
```

3. Open your browser and navigate to `http://localhost:3000`

## 🎮 Controls

- **Left Mouse Button + Drag**: Rotate the planet
- **Scroll Wheel**: Zoom in/out
- **Middle Mouse Button**: Highlight a specific face on the terrain (debugging feature)

## ⚙️ Configuration Options

You can customize the planet generation through URL parameters:

| Parameter | Description | Default |
|-----------|-------------|---------|
| `s` | Seed value for terrain generation | Random value |
| `m` | Resolution (higher values = more detailed terrain) | 100 |
| `c` | Enable cloud layer (any value = enabled) | Disabled |
| `p` | Show pole indicators (any value = enabled) | Disabled |
| `export` | Export the model as GLB when present | N/A |

### Examples

- Basic planet with seed 12345: `?s=12345`
- High-resolution planet with clouds: `?m=200&c=true`
- Export high-res planet: `?m=150&export`

## 🔧 Technical Details

### Terrain Generation

The terrain is generated using a Goldberg polyhedron mesh with Simplex Noise applied to create elevation variations. The noise parameters control the terrain characteristics:

- **Frequency**: Controls the scale of terrain features
- **Octaves**: Determines the level of detail and complexity
- **Persistence**: Affects the amplitude of each successive noise layer

### Cloud System

Clouds are rendered as a separate spherical mesh with a custom shader that creates dynamic cloud patterns. The cloud layer:

- Animates slowly over time to simulate atmospheric movement
- Has configurable noise parameters separate from the terrain
- Can be horizontally elongated to create more realistic cloud shapes

### Coloring System

The terrain uses elevation-based coloring with multiple thresholds:

- Deep ocean: Dark blue
- Shallow water: Light blue
- Lowlands: Green
- Hills/Mountains: Brown and gray
- Polar regions: White (ice)

## 📄 License

[MIT License](LICENSE)
