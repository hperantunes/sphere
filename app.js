window.addEventListener('DOMContentLoaded', function () {
  var canvas = document.getElementById('renderCanvas');
  var engine = new BABYLON.Engine(canvas, true);

  let m = 100;
  let n = 0;

  // Define noise parameters
  const frequency = 0.5;
  const octaves = 8;
  const persistence = 0.6;

  const colorWater2 = BABYLON.Color4.FromHexString("#0A0B46FF");
  const colorWater1 = BABYLON.Color4.FromHexString("#090A59FF");
  const colorLand1 = BABYLON.Color4.FromHexString("#558747FF");
  const colorLand2 = BABYLON.Color4.FromHexString("#6E876EFF");
  const colorLand3 = BABYLON.Color4.FromHexString("#576348FF");
  const colorLand4 = BABYLON.Color4.FromHexString("#362211FF");
  const colorLand5 = BABYLON.Color4.FromHexString("#1C0D13FF");
  const colorIce = BABYLON.Color4.FromHexString("#E3F2FDFF");
  const colorRed = BABYLON.Color4.FromHexString("#F44336FF");
  const colorBlack = BABYLON.Color4.FromHexString("#000000FF");

  const simplex = new SimplexNoise();

  const getNoise = (x, y, z, freq, octaves, persistence) => {
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

  const getColor = (noise) => {
    if (noise > 0.6) {
      return colorIce;
    } else if (noise > 0.55) {
      return colorLand5;
    } else if (noise > 0.45) {
      return colorLand4;
    } else if (noise > 0.35) {
      return colorLand3;
    } else if (noise > 0.25) {
      return colorLand2;
    } else if (noise > 0.1) {
      return colorLand1;
    } else if (noise > 0) {
      return colorWater1;
    } else {
      return colorWater2;
    }
  };

  const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    const light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);

    // Set the light intensity
    light.intensity = 1; // 0.7: Adjust as needed

    // Use similar colors for the sky and ground to ensure uniform lighting
    light.groundColor = new BABYLON.Color3(1, 1, 1); // 0.75, 0.75, 0.75: Soft grey
    light.diffuse = new BABYLON.Color3(1, 1, 1); // 1, 1, 1: Bright white
    light.specular = new BABYLON.Color3(.2, .2, .2); // 0, 0, 0: No specular highlights

    const camera = new BABYLON.ArcRotateCamera("camera1", -Math.PI / 2, Math.PI / 2.2, 3, new BABYLON.Vector3(0, 0, 0), scene);

    camera.attachControl(canvas, true);

    // Slow down the zoom speed
    camera.wheelPrecision = 50; // The default value is 3. Adjust as needed for your scenario

    // Prevent the camera from zooming inside the mesh
    camera.lowerRadiusLimit = 2; // Set this to the radius of your mesh or slightly more

    // Adjust the camera's angular sensibility for smoother drag rotation
    camera.angularSensibilityX = 2500; // Default is usually 1000, increase if the rotation is too fast
    camera.angularSensibilityY = 2500; // Same as above, adjust as needed

    const goldberg = BABYLON.MeshBuilder.CreateGoldberg("g", { m: m, n: n, size: 1 });

    // Create an array to hold all face color data
    const faceColors = goldberg.goldbergData.faceCenters.map((face, i) => {
      const noise = getNoise(face._x, face._y, face._z, frequency, octaves, persistence);
      const color = getColor(noise);
      return [i, i, color];
    });

    console.log("number of faces: ", faceColors.length);

    // Apply all face color updates in a single call
    goldberg.setGoldbergFaceColors(faceColors);

    return scene;
  };

  var scene = createScene();

  engine.runRenderLoop(function () {
    scene.render();
  });

  window.addEventListener('resize', function () {
    engine.resize();
  });
});
