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

  unifHeadLRAngle: WebGLUniformLocation;
  unifHeadUDAngle: WebGLUniformLocation;
  unifNeckAngle: WebGLUniformLocation;
  unifTorsoAngle: WebGLUniformLocation;

  unifFrontLeftLegTopAngle: WebGLUniformLocation;
  unifFrontRightLegTopAngle: WebGLUniformLocation;
  unifBackLeftLegTopAngle: WebGLUniformLocation;
  unifBackRightLegTopAngle: WebGLUniformLocation;

  unifFrontLeftLegAngle: WebGLUniformLocation;
  unifFrontRightLegAngle: WebGLUniformLocation;
  unifBackLeftLegAngle: WebGLUniformLocation;
  unifBackRightLegAngle: WebGLUniformLocation;

  unifLegLength: WebGLUniformLocation;
  unifNeckLength: WebGLUniformLocation;
  unifMouthLength: WebGLUniformLocation;
  unifTorsoLength: WebGLUniformLocation;

  unifShade1: WebGLUniformLocation;
  unifShade2: WebGLUniformLocation;
  unifShade3: WebGLUniformLocation;
  unifShade4: WebGLUniformLocation;
  unifShade5: WebGLUniformLocation;

  unifOutlineThickness: WebGLUniformLocation;

  unifLightXAngle: WebGLUniformLocation;
  unifLightYAngle: WebGLUniformLocation;
  unifLightZAngle: WebGLUniformLocation;
  unifLightXPos: WebGLUniformLocation;
  unifLightYPos: WebGLUniformLocation;
  unifLightZPos: WebGLUniformLocation;

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

    this.unifHeadLRAngle   = gl.getUniformLocation(this.prog, "u_HeadLRAngle");
    this.unifHeadUDAngle   = gl.getUniformLocation(this.prog, "u_HeadUDAngle");
    this.unifNeckAngle   = gl.getUniformLocation(this.prog, "u_NeckAngle");
    this.unifTorsoAngle   = gl.getUniformLocation(this.prog, "u_TorsoAngle");

    this.unifFrontLeftLegAngle   = gl.getUniformLocation(this.prog, "u_FrontLeftLegAngle");
    this.unifFrontRightLegAngle   = gl.getUniformLocation(this.prog, "u_FrontRightLegAngle");
    this.unifBackLeftLegAngle   = gl.getUniformLocation(this.prog, "u_BackLeftLegAngle");
    this.unifBackRightLegAngle   = gl.getUniformLocation(this.prog, "u_BackRightLegAngle");

    this.unifFrontLeftLegTopAngle   = gl.getUniformLocation(this.prog, "u_FrontLeftLegTopAngle");
    this.unifFrontRightLegTopAngle   = gl.getUniformLocation(this.prog, "u_FrontRightLegTopAngle");
    this.unifBackLeftLegTopAngle   = gl.getUniformLocation(this.prog, "u_BackLeftLegTopAngle");
    this.unifBackRightLegTopAngle   = gl.getUniformLocation(this.prog, "u_BackRightLegTopAngle");

    this.unifLegLength   = gl.getUniformLocation(this.prog, "u_LegLength");

    this.unifNeckLength   = gl.getUniformLocation(this.prog, "u_NeckLength");
    this.unifMouthLength   = gl.getUniformLocation(this.prog, "u_MouthLength");
    this.unifTorsoLength   = gl.getUniformLocation(this.prog, "u_TorsoLength");

    this.unifShade1   = gl.getUniformLocation(this.prog, "u_Shade1");
    this.unifShade2   = gl.getUniformLocation(this.prog, "u_Shade2");
    this.unifShade3   = gl.getUniformLocation(this.prog, "u_Shade3");
    this.unifShade4   = gl.getUniformLocation(this.prog, "u_Shade4");
    this.unifShade5   = gl.getUniformLocation(this.prog, "u_Shade5");

    this.unifOutlineThickness   = gl.getUniformLocation(this.prog, "u_OutlineThickness");

    this.unifLightXAngle   = gl.getUniformLocation(this.prog, "u_LightXAngle");
    this.unifLightYAngle   = gl.getUniformLocation(this.prog, "u_LightYAngle");
    this.unifLightZAngle   = gl.getUniformLocation(this.prog, "u_LightZAngle");

    this.unifLightXPos   = gl.getUniformLocation(this.prog, "u_LightXPos");
    this.unifLightYPos   = gl.getUniformLocation(this.prog, "u_LightYPos");
    this.unifLightZPos   = gl.getUniformLocation(this.prog, "u_LightZPos");
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

  setMouthLength(t: number) {
    this.use();
    if (this.unifMouthLength !== -1) {
      gl.uniform1f(this.unifMouthLength, t);
    }
  }
  setNeckLength(t: number) {
    this.use();
    if (this.unifNeckLength !== -1) {
      gl.uniform1f(this.unifNeckLength, t);
    }
  }
  setTorsoLength(t: number) {
    this.use();
    if (this.unifTorsoLength !== -1) {
      gl.uniform1f(this.unifTorsoLength, t);
    }
  }

  setLegLength(t: number) {
    this.use();
    if (this.unifLegLength !== -1) {
      gl.uniform1f(this.unifLegLength, t);
    }
  }

  setHeadLRAngle(t: number) {
    this.use();
    if(this.unifHeadLRAngle !== -1) {
      gl.uniform1f(this.unifHeadLRAngle, t);
    }
  }

  setHeadUDAngle(t: number) {
    this.use();
    if(this.unifHeadUDAngle !== -1) {
      gl.uniform1f(this.unifHeadUDAngle, t);
    }
  }

  setNeckAngle(t: number) {
    this.use();
    if(this.unifNeckAngle !== -1) {
      gl.uniform1f(this.unifNeckAngle, t);
    }
  }

  setTorsoAngle(t: number) {
    this.use();
    if(this.unifTorsoAngle !== -1) {
      gl.uniform1f(this.unifTorsoAngle, t);
    }
  }

  setFrontLeftLegTopAngle(t: number) {
    this.use();
    if(this.unifFrontLeftLegTopAngle !== -1) {
      gl.uniform1f(this.unifFrontLeftLegTopAngle, t);
    }
  }
  setFrontRightLegTopAngle(t: number) {
    this.use();
    if(this.unifFrontRightLegTopAngle !== -1) {
      gl.uniform1f(this.unifFrontRightLegTopAngle, t);
    }
  }
  setBackLeftLegTopAngle(t: number) {
    this.use();
    if(this.unifBackLeftLegTopAngle !== -1) {
      gl.uniform1f(this.unifBackLeftLegTopAngle, t);
    }
  }
  setBackRightLegTopAngle(t: number) {
    this.use();
    if(this.unifBackRightLegTopAngle !== -1) {
      gl.uniform1f(this.unifBackRightLegTopAngle, t);
    }
  }

  setFrontLeftLegAngle(t: number) {
    this.use();
    if(this.unifFrontLeftLegAngle !== -1) {
      gl.uniform1f(this.unifFrontLeftLegAngle, t);
    }
  }
  setFrontRightLegAngle(t: number) {
    this.use();
    if(this.unifFrontRightLegAngle !== -1) {
      gl.uniform1f(this.unifFrontRightLegAngle, t);
    }
  }
  setBackLeftLegAngle(t: number) {
    this.use();
    if(this.unifBackLeftLegAngle !== -1) {
      gl.uniform1f(this.unifBackLeftLegAngle, t);
    }
  }
  setBackRightLegAngle(t: number) {
    this.use();
    if(this.unifBackRightLegAngle !== -1) {
      gl.uniform1f(this.unifBackRightLegAngle, t);
    }
  }

  setShade1(t: number) {
    this.use();
    if(this.unifShade1 !== -1) {
      gl.uniform1f(this.unifShade1, t);
    }
  }
  setShade2(t: number) {
    this.use();
    if(this.unifShade2 !== -1) {
      gl.uniform1f(this.unifShade2, t);
    }
  }
  setShade3(t: number) {
    this.use();
    if(this.unifShade3 !== -1) {
      gl.uniform1f(this.unifShade3, t);
    }
  }
  setShade4(t: number) {
    this.use();
    if(this.unifShade4 !== -1) {
      gl.uniform1f(this.unifShade4, t);
    }
  }
  setShade5(t: number) {
    this.use();
    if(this.unifShade5 !== -1) {
      gl.uniform1f(this.unifShade5, t);
    }
  }
  
  setOutlineThickness(t: number) {
    this.use();
    if(this.unifOutlineThickness !== -1) {
      gl.uniform1f(this.unifOutlineThickness, t);
    }
  }

  setLightXAngle(t: number) {
    this.use();
    if(this.unifLightXAngle !== -1) {
      gl.uniform1f(this.unifLightXAngle, t);
    }
  }
  setLightYAngle(t: number) {
    this.use();
    if(this.unifLightYAngle !== -1) {
      gl.uniform1f(this.unifLightYAngle, t);
    }
  }
  setLightZAngle(t: number) {
    this.use();
    if(this.unifLightZAngle !== -1) {
      gl.uniform1f(this.unifLightZAngle, t);
    }
  }

  setLightXPos(t: number) {
    this.use();
    if(this.unifLightXPos !== -1) {
      gl.uniform1f(this.unifLightXPos, t);
    }
  }
  setLightYPos(t: number) {
    this.use();
    if(this.unifLightYPos !== -1) {
      gl.uniform1f(this.unifLightYPos, t);
    }
  }
  setLightZPos(t: number) {
    this.use();
    if(this.unifLightZPos !== -1) {
      gl.uniform1f(this.unifLightZPos, t);
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
