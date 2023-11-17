float noise(vec3 pos) {
    return fract(sin(dot(pos, vec3(12.9898, 78.233, 37.719)))*43758.5453);
}

void main(void) {
    // Calculate the noise values for the current fragment
    float noiseValue1 = noise(gl_FragCoord.xyz / 200.0); // Larger scale for less noise
    float noiseValue2 = noise(vec3(gl_FragCoord.x, gl_FragCoord.y + noiseValue1 * 20.0, gl_FragCoord.z) / 100.0); // Add swirling effect
    float noiseValue3 = noise(vec3(gl_FragCoord.x, gl_FragCoord.y + noiseValue2 * 20.0, gl_FragCoord.z) / 50.0); // Add swirling effect

    // Combine the noise values to create a cloud pattern
    float cloudiness = noiseValue1 * 0.5 + noiseValue2 * 0.3 + noiseValue3 * 0.2;

    // Discard the fragment if the cloudiness value is below the threshold
    if (cloudiness < 0.85) { // Higher threshold for wider gaps
        discard;
    }

    // Otherwise, output a solid color
    gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // White color
}