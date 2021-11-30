import {vec2, vec3, vec4, mat4} from 'gl-matrix';
import Drawable from './Drawable';
import {gl} from '../../globals';

var activeProgram: WebGLProgram = null;

export class Shader {
  shader: WebGLShader;

  constructor(type: number, source: string) {
    this.shader = gl.createShader(type);
    gl.shaderSource(this.shader, source);
    gl.compileShader(this.shader);

    if (!gl.getShaderParameter(this.shader, gl.COMPILE_STATUS)) {
      throw gl.getShaderInfoLog(this.shader);
    }
  }
};

class ShaderProgram {
  prog: WebGLProgram;

  attrPos: number;
  attrNor: number;

  unifRef: WebGLUniformLocation;
  unifEye: WebGLUniformLocation;
  unifUp: WebGLUniformLocation;
  unifDimensions: WebGLUniformLocation;
  unifTime: WebGLUniformLocation;

  unifModel: WebGLUniformLocation;
  unifModelInvTra: WebGLUniformLocation;
  unifViewProj: WebGLUniformLocation;

  unifFrontLeftLegAngle: WebGLUniformLocation;
  unifFrontRightLegAngle: WebGLUniformLocation;
  unifBackLeftLegAngle: WebGLUniformLocation;
  unifBackRightLegAngle: WebGLUniformLocation;

  constructor(shaders: Array<Shader>) {
    this.prog = gl.createProgram();

    for (let shader of shaders) {
      gl.attachShader(this.prog, shader.shader);
    }
    gl.linkProgram(this.prog);
    if (!gl.getProgramParameter(this.prog, gl.LINK_STATUS)) {
      throw gl.getProgramInfoLog(this.prog);
    }

    this.attrPos = gl.getAttribLocation(this.prog, "vs_Pos");
    this.attrNor = gl.getAttribLocation(this.prog, "vs_Nor");

    this.unifEye   = gl.getUniformLocation(this.prog, "u_Eye");
    this.unifRef   = gl.getUniformLocation(this.prog, "u_Ref");
    this.unifUp   = gl.getUniformLocation(this.prog, "u_Up");
    this.unifDimensions   = gl.getUniformLocation(this.prog, "u_Dimensions");
    this.unifTime   = gl.getUniformLocation(this.prog, "u_Time");

    this.unifModel   = gl.getUniformLocation(this.prog, "u_Model");
    this.unifModelInvTra   = gl.getUniformLocation(this.prog, "u_ModelInvTra");
    this.unifViewProj   = gl.getUniformLocation(this.prog, "u_ViewProj");

    this.unifFrontLeftLegAngle   = gl.getUniformLocation(this.prog, "u_FrontLeftLegAngle");
    this.unifFrontRightLegAngle   = gl.getUniformLocation(this.prog, "u_FrontRightLegAngle");
    this.unifBackLeftLegAngle   = gl.getUniformLocation(this.prog, "u_BackLeftLegAngle");
    this.unifBackRightLegAngle   = gl.getUniformLocation(this.prog, "u_BackRightLegAngle");
  }

  use() {
    if (activeProgram !== this.prog) {
      gl.useProgram(this.prog);
      activeProgram = this.prog;
    }
  }

  setEyeRefUp(eye: vec3, ref: vec3, up: vec3) {
    this.use();
    if(this.unifEye !== -1) {
      gl.uniform3f(this.unifEye, eye[0], eye[1], eye[2]);
    }
    if(this.unifRef !== -1) {
      gl.uniform3f(this.unifRef, ref[0], ref[1], ref[2]);
    }
    if(this.unifUp !== -1) {
      gl.uniform3f(this.unifUp, up[0], up[1], up[2]);
    }
  }

  setDimensions(width: number, height: number) {
    this.use();
    if(this.unifDimensions !== -1) {
      gl.uniform2f(this.unifDimensions, width, height);
    }
  }

  setTime(t: number) {
    this.use();
    if(this.unifTime !== -1) {
      gl.uniform1f(this.unifTime, t);
    }
  }

  setModelMatrix(model: mat4) {
    this.use();
    if (this.unifModel !== -1) {
      gl.uniformMatrix4fv(this.unifModel, false, model);
    }

    if (this.unifModelInvTra !== -1) {
      let modelInvTran: mat4 = mat4.create();
      mat4.transpose(modelInvTran, model);
      mat4.invert(modelInvTran, modelInvTran);
      gl.uniformMatrix4fv(this.unifModelInvTra, false, modelInvTran);
    }
  }

  setViewProjMatrix(vp: mat4) {
    this.use();
    if (this.unifViewProj !== -1) {
      gl.uniformMatrix4fv(this.unifViewProj, false, vp);
    }
  }

  setFrontLeftLegAngle(t: number) {
    this.use();
    if(this.unifTime !== -1) {
      gl.uniform1f(this.unifFrontLeftLegAngle, t);
    }
  }
  setFrontRightLegAngle(t: number) {
    this.use();
    if(this.unifTime !== -1) {
      gl.uniform1f(this.unifFrontRightLegAngle, t);
    }
  }
  setBackLeftLegAngle(t: number) {
    this.use();
    if(this.unifTime !== -1) {
      gl.uniform1f(this.unifBackLeftLegAngle, t);
    }
  }
  setBackRightLegAngle(t: number) {
    this.use();
    if(this.unifTime !== -1) {
      gl.uniform1f(this.unifBackRightLegAngle, t);
    }
  }

  draw(d: Drawable) {
    this.use();

    if (this.attrPos != -1 && d.bindPos()) {
      gl.enableVertexAttribArray(this.attrPos);
      gl.vertexAttribPointer(this.attrPos, 4, gl.FLOAT, false, 0, 0);
    }

    d.bindIdx();
    gl.drawElements(d.drawMode(), d.elemCount(), gl.UNSIGNED_INT, 0);

    if (this.attrPos != -1) gl.disableVertexAttribArray(this.attrPos);
  }
};

export default ShaderProgram;
