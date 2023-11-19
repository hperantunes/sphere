attribute vec3 position;
attribute vec3 normal;
varying vec3 vPosition;
varying vec3 vNormal;
uniform mat4 world, worldViewProjection;

void main(void) {
  vPosition = position;
  vNormal = vec3(world * vec4(normal, 0.0));
  gl_Position = worldViewProjection * vec4(position, 1.0);
}