window.addEventListener('DOMContentLoaded', initApplication);

function initApplication() {
  // Configuration and parameters setup
  const params = initParameters();
  const config = createConfig(params);
  initUI(params);

  // Scene setup
  const canvas = document.getElementById('renderCanvas');
  const engine = new BABYLON.Engine(canvas, true);
  const scene = createScene(engine, canvas, config);

  // Export handling
  if (new URLSearchParams(window.location.search).has("export")) {
    handleExport(scene, config.terrain.mesh.m);
    return;
  }

  // Main render loop
  startRenderLoop(engine, scene, config);

  // Event listeners
  window.addEventListener('resize', () => engine.resize());
}

function initParameters() {
  const urlParams = new URLSearchParams(window.location.search);

  return {
    seed: urlParams.get("s") || Math.floor(Math.random() * 1000000000),
    m: Number.parseInt(urlParams.get("m")) || 100,
    renderClouds: urlParams.get("c"),
    renderPoleIndicators: urlParams.get("p"),
    urlParams: urlParams
  };
}

function initUI(params) {
  const seedInput = document.getElementById('seedInput');
  const mInput = document.getElementById('mInput');
  const updateButton = document.getElementById('updateButton');

  seedInput.value = params.seed;
  mInput.value = params.m;

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      updateButton.click();
    }
  };

  seedInput.addEventListener('keydown', handleKeyDown);
  mInput.addEventListener('keydown', handleKeyDown);

  updateButton.addEventListener('click', function () {
    params.urlParams.set('s', seedInput.value);
    params.urlParams.set('m', mInput.value);
    window.history.replaceState({}, '', '?' + params.urlParams.toString());
    window.location.reload();
  });
}

function createConfig(params) {
  return {
    terrain: {
      mesh: {
        m: params.m,
        n: 0,
        size: 1,
        isPickable: true,
        verticalRotation: BABYLON.Tools.ToRadians(-15),
      },
      noise: {
        frequency: 0.5,
        octaves: 8,
        persistence: 0.6
      },
      colors: {
        land1: BABYLON.Color4.FromHexString("#558747FF"),
        land2: BABYLON.Color4.FromHexString("#6E876EFF"),
        land3: BABYLON.Color4.FromHexString("#576348FF"),
        land4: BABYLON.Color4.FromHexString("#362211FF"),
        land5: BABYLON.Color4.FromHexString("#1C0D13FF"),
        water1: BABYLON.Color4.FromHexString("#090A59FF"),
        water2: BABYLON.Color4.FromHexString("#0A0B46FF"),
        ice1: BABYLON.Color4.FromHexString("#E3F2FDFF"),
        highlight1: BABYLON.Color4.FromHexString("#F44336FF")
      }
    },
    clouds: {
      render: params.renderClouds,
      mesh: {
        diameter: 2.1,
        isPickable: false,
      },
      shader: {
        path: "./shaders/clouds",
        noise: {
          offset: Math.random() * 1000,
          frequency: 0.4,
          octaves: 4,
          persistence: 0.6
        },
        horizontalElongate: 10,
        verticalTiltAngle: -15,
        fastTime: Math.pow(10, -6),
        slowTime: Math.pow(10, -7)
      }
    },
    renderPoleIndicators: params.renderPoleIndicators,
    seed: params.seed
  };
}

function createScene(engine, canvas, config) {
  const scene = new BABYLON.Scene(engine);
  scene.clearColor = BABYLON.Color3.Black();

  // Create planet mesh
  const planetMesh = createPlanetMesh(scene, config);
  window.planet = planetMesh;

  // Setup lighting
  setupLighting(scene);

  // Setup camera
  setupCamera(scene, canvas);

  // Setup planet surface
  const elevationSimplex = new SimplexNoise(config.seed);
  applyTerrainToMesh(planetMesh, elevationSimplex, config);

  // Create clouds if enabled
  if (config.clouds.render) {
    createCloudsLayer(scene, config);
  }

  // Setup click interaction
  setupPointerInteractions(scene, planetMesh, config);

  return scene;
}

function createPlanetMesh(scene, config) {
  const planetMesh = BABYLON.MeshBuilder.CreateGoldberg("g", {
    m: config.terrain.mesh.m,
    n: config.terrain.mesh.n,
    size: config.terrain.mesh.size
  });

  console.log("Seed:", config.seed);
  console.log("Number of faces:", planetMesh.goldbergData.faceCenters.length);
  console.log("Triangles count:", planetMesh.getIndices().length / 3);

  planetMesh.isPickable = config.terrain.mesh.isPickable;
  planetMesh.rotation.x = config.terrain.mesh.verticalRotation;

  const planetMaterial = new BABYLON.StandardMaterial("material", scene);
  planetMesh.material = planetMaterial;

  return planetMesh;
}

function setupLighting(scene) {
  const hemisphericLight = new BABYLON.HemisphericLight(
    "HemiLight",
    new BABYLON.Vector3(0, 0, 0),
    scene
  );
  hemisphericLight.intensity = 1;
  hemisphericLight.groundColor = new BABYLON.Color3(1, 1, 1);
  hemisphericLight.diffuse = new BABYLON.Color3(1, 1, 1);
  hemisphericLight.specular = new BABYLON.Color3(0, 0, 0);
}

function setupCamera(scene, canvas) {
  const camera = new BABYLON.ArcRotateCamera(
    "camera",
    BABYLON.Tools.ToRadians(0),
    BABYLON.Tools.ToRadians(90),
    4,
    BABYLON.Vector3.Zero(),
    scene
  );

  camera.attachControl(canvas, true);
  camera.wheelPrecision = 50;
  camera.lowerRadiusLimit = 2;
  camera.angularSensibilityX = 2500;
  camera.angularSensibilityY = 2500;
}

function getNoise(x, y, z, noiseConfig, simplex) {
  let freq = noiseConfig.frequency;
  let value = 0;
  let amplitude = 1;
  let maxValue = 0;

  for (let i = 0; i < noiseConfig.octaves; i++) {
    value += simplex.noise3D(x * freq, y * freq, z * freq) * amplitude;
    maxValue += amplitude;
    amplitude *= noiseConfig.persistence;
    freq *= 2;
  }

  return value / maxValue;
}

function getTerrainColorByElevation(elevationNoise, colors) {
  if (elevationNoise > 0.55) {
    return colors.ice1;
  } else if (elevationNoise > 0.5) {
    return colors.land5;
  } else if (elevationNoise > 0.45) {
    return colors.land4;
  } else if (elevationNoise > 0.3) {
    return colors.land3;
  } else if (elevationNoise > 0.15) {
    return colors.land2;
  } else if (elevationNoise > 0) {
    return colors.land1;
  } else if (elevationNoise > -0.1) {
    return colors.water1;
  } else {
    return colors.water2;
  }
}

function applyTerrainToMesh(planetMesh, elevationSimplex, config) {
  const faceColors = planetMesh.goldbergData.faceCenters.map((face, i) => {
    if (config.renderPoleIndicators) {
      const latitude = face._y * 90;
      if (latitude > 89.5) {
        return [i, i, BABYLON.Color3.Green()];
      } else if (latitude < -89.5) {
        return [i, i, BABYLON.Color3.Red()];
      }
    }

    const elevationNoise = getNoise(
      face._x, face._y, face._z,
      config.terrain.noise,
      elevationSimplex
    );

    const color = getTerrainColorByElevation(
      elevationNoise,
      config.terrain.colors
    );

    return [i, i, color];
  });

  planetMesh.setGoldbergFaceColors(faceColors);
}

function createCloudsLayer(scene, config) {
  const cloudsShaderMaterial = new BABYLON.ShaderMaterial(
    "cloudsShader",
    scene,
    config.clouds.shader.path,
    {
      attributes: ["position", "normal", "uv"],
      uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
    }
  );

  cloudsShaderMaterial.setFloat("frequency", config.clouds.shader.noise.frequency);
  cloudsShaderMaterial.setInt("octaves", config.clouds.shader.noise.octaves);
  cloudsShaderMaterial.setFloat("persistence", config.clouds.shader.noise.persistence);
  cloudsShaderMaterial.setFloat("offset", config.clouds.shader.noise.offset);
  cloudsShaderMaterial.setFloat("horizontalElongate", config.clouds.shader.horizontalElongate);
  cloudsShaderMaterial.setFloat("verticalTiltAngle", config.clouds.shader.verticalTiltAngle);
  cloudsShaderMaterial.backFaceCulling = false;

  const cloudsMesh = BABYLON.MeshBuilder.CreateSphere(
    "cloudsMesh",
    { diameter: config.clouds.mesh.diameter },
    scene
  );

  cloudsMesh.material = cloudsShaderMaterial;
  cloudsMesh.isPickable = config.clouds.mesh.isPickable;

  return { cloudsMesh, cloudsShaderMaterial };
}

function getFaceNumberFromFacetId(faceId) {
  if (faceId < 36) { // First 12 Goldberg faces are pentagons formed by 3 triangles each
    return Math.floor(faceId / 3);
  } else { // Remaining Goldberg faces are hexagons formed by 4 triangles each
    return Math.floor((faceId - 36) / 4) + 12;
  }
}

function setupPointerInteractions(scene, planetMesh, config) {
  scene.onPointerDown = (evt, pickResult) => {
    // Middle-mouse click
    if (evt.button !== 1) {
      return;
    }

    if (pickResult.hit && pickResult.pickedMesh === planetMesh) {
      const faceId = pickResult.faceId;
      const faceNumber = getFaceNumberFromFacetId(faceId);
      planetMesh.setGoldbergFaceColors([
        [faceNumber, faceNumber, config.terrain.colors.highlight1]
      ]);
    }
  };
}

function startRenderLoop(engine, scene, config) {
  // Get the clouds shader material if clouds are rendered
  let cloudsShaderMaterial;
  if (config.clouds.render) {
    cloudsShaderMaterial = scene.getMaterialByName("cloudsShader");
  }

  engine.runRenderLoop(() => {
    if (cloudsShaderMaterial) {
      const time = performance.now();
      cloudsShaderMaterial.setFloat("fastTime", time * config.clouds.shader.fastTime);
      cloudsShaderMaterial.setFloat("slowTime", time * config.clouds.shader.slowTime);
    }

    scene.render();
  });
}

function handleExport(scene, meshSize) {
  const fileName = `goldberg_${meshSize}`;

  BABYLON.GLTF2Export.GLBAsync(
    scene,
    fileName,
    { shouldExportNode: (node) => node === window.planet }
  ).then((glb) => {
    glb.downloadFiles();
  });
}
