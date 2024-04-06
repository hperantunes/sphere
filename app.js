window.addEventListener('DOMContentLoaded', function () {
  var canvas = document.getElementById('renderCanvas');
  var engine = new BABYLON.Engine(canvas, true);

  const terrain = {
    mesh: {
      m: 100,
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
  };

  const clouds = {
    render: true,
    mesh: {
      diameter: 2.1,
      isPickable: false,
    },
    shader: {
      path: "./shaders/clouds",
      noise: {
        offset: Math.random() * 1000, // generate a random offset
        frequency: 0.4,
        octaves: 4,
        persistence: 0.6
      },
      horizontalElongate: 10, // elongate clouds on by amount of times
      verticalTiltAngle: -15, // tilt clouds by degrees
      fastTime: Math.pow(10, -6),
      slowTime: Math.pow(10, -7)
    }
  };

  const elevationSimplex = new SimplexNoise();

  const getNoise = (x, y, z, { frequency, octaves, persistence }, simplex) => {
    let freq = frequency;
    let value = 0;
    let amplitude = 1;
    let maxValue = 0; // Used for normalizing result to -1.0 - 1.0
    for (let i = 0; i < octaves; i++) {
      value += simplex.noise3D(x * freq, y * freq, z * freq) * amplitude;
      maxValue += amplitude;
      amplitude *= persistence;
      freq *= 2;
    }
    return value / maxValue;
  };

  const getTerrainColorByElevation = (elevationNoise, colors) => {
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
  };

  const scene = new BABYLON.Scene(engine);
  scene.clearColor = BABYLON.Color3.Black();

  const planetMesh = BABYLON.MeshBuilder.CreateGoldberg("g", {
    m: terrain.mesh.m,
    n: terrain.mesh.n,
    size: terrain.mesh.size
  });

  console.log("Number of faces:", planetMesh.goldbergData.faceCenters.length);
  this.window.planet = planetMesh;

  if (new URLSearchParams(window.location.search).has("export")) {
    const fileName = `goldberg_${terrain.mesh.m}`;
    BABYLON.GLTF2Export.GLBAsync(scene, fileName, { shouldExportNode: (node) => node === planetMesh }).then((glb) => {
      glb.downloadFiles();
    });
    return;
  }

  planetMesh.isPickable = terrain.mesh.isPickable;
  planetMesh.rotation.x = terrain.mesh.verticalRotation;

  // Create a new StandardMaterial
  var planetMaterial = new BABYLON.StandardMaterial("material", scene);

  // Assign the material to the planetMesh
  planetMesh.material = planetMaterial;

  // Create a light
  const hemisphericLight = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 0, 0), scene);
  hemisphericLight.intensity = 1; // 0.7: Adjust as needed

  // Use similar colors for the sky and ground to ensure uniform lighting
  hemisphericLight.groundColor = new BABYLON.Color3(1, 1, 1); // 0.75, 0.75, 0.75: Soft grey
  hemisphericLight.diffuse = new BABYLON.Color3(1, 1, 1); // 1, 1, 1: Bright white
  hemisphericLight.specular = new BABYLON.Color3(0, 0, 0); // 0, 0, 0: No specular highlights

  const camera = new BABYLON.ArcRotateCamera("camera", BABYLON.Tools.ToRadians(0), BABYLON.Tools.ToRadians(90), 4, BABYLON.Vector3.Zero(), scene);

  // Attach the camera to the canvas
  camera.attachControl(canvas, true);

  // Slow down the zoom speed
  camera.wheelPrecision = 50; // The default value is 3. Adjust as needed for your scenario

  // Prevent the camera from zooming inside the mesh
  camera.lowerRadiusLimit = 2; // Set this to the radius of your mesh or slightly more

  // Adjust the camera's angular sensibility for smoother drag rotation
  camera.angularSensibilityX = 2500; // Default is usually 1000, increase if the rotation is too fast
  camera.angularSensibilityY = 2500; // Same as above, adjust as needed



  // Create an array to hold all face color data
  const faceColors = planetMesh.goldbergData.faceCenters.map((face, i) => {
    // Highlight faces at the poles
    const latitude = face._y * 90;
    if (latitude > 89.5) {
      return [i, i, BABYLON.Color3.Green()];
    } else if (latitude < -89.5) {
      return [i, i, BABYLON.Color3.Red()];
    }

    // Get the elevation noise value for the current face
    const elevationNoise = getNoise(face._x, face._y, face._z, terrain.noise, elevationSimplex);

    // Get the color based on the elevation
    const color = getTerrainColorByElevation(elevationNoise, terrain.colors);

    return [i, i, color];
  });

  // Apply all face color updates in a single call
  planetMesh.setGoldbergFaceColors(faceColors);

  const getFaceNumberFromFacetId = ((faceId) => {
    if (faceId < 36) { // First 12 Goldberg faces are pentagons formed by 3 triangles each
      return Math.floor(faceId / 3);
    } else { // Remaining Goldberg faces are hexagons formed by 4 triangles each
      return Math.floor((faceId - 36) / 4) + 12;
    }
  });

  const cloudsShaderMaterial = new BABYLON.ShaderMaterial("cloudsShader", scene, clouds.shader.path, {
    attributes: ["position", "normal", "uv"],
    uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
  });

  cloudsShaderMaterial.setFloat("frequency", clouds.shader.noise.frequency);
  cloudsShaderMaterial.setInt("octaves", clouds.shader.noise.octaves);
  cloudsShaderMaterial.setFloat("persistence", clouds.shader.noise.persistence);
  cloudsShaderMaterial.setFloat("offset", clouds.shader.noise.offset);
  cloudsShaderMaterial.setFloat("horizontalElongate", clouds.shader.horizontalElongate);
  cloudsShaderMaterial.setFloat("verticalTiltAngle", clouds.shader.verticalTiltAngle);
  cloudsShaderMaterial.backFaceCulling = false;

  if (clouds.render) {
    const cloudsMesh = BABYLON.MeshBuilder.CreateSphere("cloudsMesh", { diameter: clouds.mesh.diameter }, scene);
    cloudsMesh.material = cloudsShaderMaterial;
    cloudsMesh.isPickable = clouds.mesh.isPickable;
  }

  // Event listener for mouse clicks on the Goldberg polyhedron
  scene.onPointerDown = (evt, pickResult) => {
    // Middle-mouse click
    if (evt.button !== 1) {
      return;
    }
    // Check if we hit the goldberg mesh
    if (pickResult.hit && pickResult.pickedMesh === planetMesh) {
      const faceId = pickResult.faceId;
      const f = getFaceNumberFromFacetId(faceId);
      planetMesh.setGoldbergFaceColors([[f, f, terrain.colors.highlight1]]);
    }
  };

  engine.runRenderLoop(() => {
    let time = performance.now();
    cloudsShaderMaterial.setFloat("fastTime", time * clouds.shader.fastTime);
    cloudsShaderMaterial.setFloat("slowTime", time * clouds.shader.slowTime);
    scene.render();
  });

  window.addEventListener('resize', () => {
    engine.resize();
  });


  
});
