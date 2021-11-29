#version 300 es
precision highp float;

// The vertex shader used to render the background of the scene

uniform mat4 u_Model;       // The matrix that defines the transformation of the
                            // object we're rendering. In this assignment,
                            // this will be the result of traversing your scene graph.

uniform mat4 u_ModelInvTra;  // The inverse transpose of the model matrix.
                            // This allows us to transform the object's normals properly
                            // if the object has been non-uniformly scaled.

uniform mat4 u_ViewProj;    

in vec4 vs_Pos;
in vec4 vs_Nor;

out vec4 fs_Pos;
out vec4 fs_Nor;

void main() {
  fs_Pos = vs_Pos;
  mat3 invTranspose = mat3(u_ModelInvTra);
  fs_Nor = normalize(vec4(invTranspose * vec3(vs_Nor), 0)); // Pass the vertex normals to the fragment shader for interpolation.
                                                            // Transform the geometry's normals by the inverse transpose of the
                                                            // model matrix. This is necessary to ensure the normals remain
                                                            // perpendicular to the surface after the surface is transformed by
                                                            // the model matrix.
  

  gl_Position = vs_Pos;
}
