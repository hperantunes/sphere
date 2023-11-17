precision highp float;

float noise(vec3 pos) {
    return fract(sin(dot(pos, vec3(12.9898, 78.233, 37.719)))*43758.5453);
}

void main(void) {
    vec2 uv = gl_FragCoord.xy / 512.0;
    float noiseValue = noise(vec3(uv, 0.0));
    noiseValue = smoothstep(0.2, 0.8, noiseValue); // Increase contrast
    gl_FragColor = vec4(vec3(noiseValue), 1.0);
}