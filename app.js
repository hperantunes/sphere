window.addEventListener('DOMContentLoaded', function () {
  var canvas = document.getElementById('renderCanvas');
  var engine = new BABYLON.Engine(canvas, true);

  const terrain = {
    mesh: {
      m: 100,
      n: 0,
      diameter: 2,
      isPickable: true
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
    mesh: {
      diameter: 2.1,
      yRotation: BABYLON.Tools.ToRadians(90)
    },
    shader: {
      path: "./shaders/clouds",
      noise: {
        offset: Math.random() * 1000, // generate a random offset
        frequency: 0.4,
        octaves: 4,
        persistence: 0.6
      },
      fastTime: Math.pow(10, -6),
      slowTime: Math.pow(10, -7)
    }
  };

  const simplex = new SimplexNoise();

  const getNoise = (x, y, z, { frequency, octaves, persistence }) => {
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

  const getTerrainColor = (noise, colors) => {
    if (noise > 0.55) {
      return colors.ice1;
    } else if (noise > 0.5) {
      return colors.land5;
    } else if (noise > 0.45) {
      return colors.land4;
    } else if (noise > 0.3) {
      return colors.land3;
    } else if (noise > 0.15) {
      return colors.land2;
    } else if (noise > 0) {
      return colors.land1;
    } else if (noise > -0.1) {
      return colors.water1;
    } else {
      return colors.water2;
    }
  };

  const scene = new BABYLON.Scene(engine);
  scene.clearColor = new BABYLON.Color4(0, 0, 0, 1); // RGBA values

  const light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);

  // Set the light intensity
  light.intensity = 1; // 0.7: Adjust as needed

  // Use similar colors for the sky and ground to ensure uniform lighting
  light.groundColor = new BABYLON.Color3(1, 1, 1); // 0.75, 0.75, 0.75: Soft grey
  light.diffuse = new BABYLON.Color3(1, 1, 1); // 1, 1, 1: Bright white
  light.specular = new BABYLON.Color3(1, 1, 1); // 0, 0, 0: No specular highlights

  const camera = new BABYLON.ArcRotateCamera("camera1", -Math.PI / 2, Math.PI / 2.2, 3, new BABYLON.Vector3(0, 0, 0), scene);

  camera.attachControl(canvas, true);

  // Slow down the zoom speed
  camera.wheelPrecision = 50; // The default value is 3. Adjust as needed for your scenario

  // Prevent the camera from zooming inside the mesh
  camera.lowerRadiusLimit = 2; // Set this to the radius of your mesh or slightly more

  // Adjust the camera's angular sensibility for smoother drag rotation
  camera.angularSensibilityX = 2500; // Default is usually 1000, increase if the rotation is too fast
  camera.angularSensibilityY = 2500; // Same as above, adjust as needed

  const goldbergMesh = BABYLON.MeshBuilder.CreateGoldberg("g", {
    m: terrain.mesh.m,
    n: terrain.mesh.n,
    diameter: terrain.mesh.diameter
  });
  goldbergMesh.isPickable = terrain.mesh.isPickable;  // Ensure the mesh can be picked

  // Create an array to hold all face color data
  const faceColors = goldbergMesh.goldbergData.faceCenters.map((face, i) => {
    const noise = getNoise(face._x, face._y, face._z, terrain.noise);
    const color = getTerrainColor(noise, terrain.colors);
    return [i, i, color];
  });

  // Apply all face color updates in a single call
  goldbergMesh.setGoldbergFaceColors(faceColors);

  const getFaceNumberFromFacetId = ((faceId) => {
    if (faceId < 36) { // First 12 Goldberg faces are pentagons formed by 3 triangles each
      return Math.floor(faceId / 3);
    } else { // Remaining Goldberg faces are hexagons formed by 4 triangles each
      return Math.floor((faceId - 36) / 4) + 12;
    }
  });

  // Event listener for mouse clicks on the Goldberg polyhedron
  scene.onPointerDown = function (evt, pickResult) {
    // Middle-mouse click
    if (evt.button !== 1) {
      return;
    }
    // Check if we hit the goldberg mesh
    if (pickResult.hit && pickResult.pickedMesh === goldbergMesh) {
      const faceId = pickResult.faceId;
      const f = getFaceNumberFromFacetId(faceId);
      goldbergMesh.setGoldbergFaceColors([[f, f, terrain.color.highlight1]]);
    }
  };

  const cloudsShaderMaterial = new BABYLON.ShaderMaterial("cloudsShader", scene, clouds.shader.path, {
    attributes: ["position", "normal", "uv"],
    uniforms: ["world", "worldView", "worldViewProjection", "view", "projection"]
  });

  cloudsShaderMaterial.setFloat("offset", clouds.shader.noise.offset);
  cloudsShaderMaterial.setFloat("frequency", clouds.shader.noise.frequency);
  cloudsShaderMaterial.setInt("octaves", clouds.shader.noise.octaves);
  cloudsShaderMaterial.setFloat("persistence", clouds.shader.noise.persistence);
  cloudsShaderMaterial.backFaceCulling = false;

  const cloudsMesh = BABYLON.MeshBuilder.CreateSphere("cloudsMesh", { diameter: clouds.mesh.diameter }, scene); // Adjust the diameter as needed
  cloudsMesh.material = cloudsShaderMaterial;
  cloudsMesh.rotation.y = clouds.mesh.yRotation;

  engine.runRenderLoop(function () {
    let time = performance.now();
    cloudsShaderMaterial.setFloat("fastTime", time * clouds.shader.fastTime);
    cloudsShaderMaterial.setFloat("slowTime", time * clouds.shader.slowTime);
    scene.render();
  });

  window.addEventListener('resize', function () {
    engine.resize();
  });

  console.log("Number of faces:", goldbergMesh.goldbergData.faceCenters.length);
  this.window.goldberg = goldbergMesh;
});
