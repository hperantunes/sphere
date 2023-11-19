attribute vec3 position;
varying vec3 vPosition;
uniform mat4 worldViewProjection;

void main(void) {
  vPosition = normalize(position);
  gl_Position = worldViewProjection * vec4(position, 1.0);
}