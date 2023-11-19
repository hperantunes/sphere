varying vec3 vPosition;
varying vec3 vNormal;

uniform vec3 lightDirection;

void main(void) {
    vec3 normal = normalize(vNormal);
    float light = max(dot(normal, lightDirection), 0.0);

    if (light > 0.5) {
        gl_FragColor = vec4(1.0, 1.0, 1.0, 1.0); // Lit side color
    } else {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); // Unlit side color
    }
}