import {vec3, vec4} from 'gl-matrix';
const Stats = require('stats-js');
import * as DAT from 'dat.gui';
import Square from './geometry/Square';
import OpenGLRenderer from './rendering/gl/OpenGLRenderer';
import Camera from './Camera';
import {setGL} from './globals';
import ShaderProgram, {Shader} from './rendering/gl/ShaderProgram';

// Define an object with application parameters and button callbacks
// This will be referred to by dat.GUI's functions that add GUI elements.
const controls = {
  'Random Horse': randomHorse,
  'Random Pose': randomPose,
  'Random Light': randomLight,
  HeadLRAngle: 0,
  HeadUDAngle: 0,
  NeckAngle: 30.0,
  TorsoAngle: 0,
  FLTopLegAngle: 0,
  FLBotLegAngle: 0,
  FRTopLegAngle: 0,
  FRBotLegAngle: 0,
  BLTopLegAngle: 0,
  BLBotLegAngle: 0,
  BRTopLegAngle: 0,
  BRBotLegAngle: 0,
  BackgroundColor: 0.5,
  Shade1: 1.0,
  Shade2: 0.8,
  Shade3: 0.6,
  Shade4: 0.4,
  Shade5: 0.0,
  LightXPos: -8.0,
  LightYPos: 40.0,
  LightZPos: -12.0,
  OutlineThickness: 0.4,
  NoiseIntensity: 10.0,
  NoiseOctaves: 4.0,
};

let square: Square;
let time: number = 0;

let prevHeadLRAngle: number = 0;
let prevHeadUDAngle: number = 0;
let prevNeckAngle: number = 0;
let prevTorsoAngle: number = 0;

let prevFLTopLegAngle: number = 0;
let prevFRTopLegAngle: number = 0;
let prevBLTopLegAngle: number = 0;
let prevBRTopLegAngle: number = 0;

let prevFLBotLegAngle: number = 0;
let prevFRBotLegAngle: number = 0;
let prevBLBotLegAngle: number = 0;
let prevBRBotLegAngle: number = 0;

let prevBackgroundColor: number = 0;

let prevShade1: number = 0;
let prevShade2: number = 0;
let prevShade3: number = 0;
let prevShade4: number = 0;
let prevShade5: number = 0;

let prevLightXPos: number = 0;
let prevLightYPos: number = 0;
let prevLightZPos: number = 0;

let prevOutlineThickness: number = 0;
let prevNoiseIntensity: number = 0;
let prevNoiseOctaves: number = 0;

function randomHorse() {
  controls.HeadLRAngle = Math.random() * 90.0 - 45.0;
  controls.HeadUDAngle = Math.random() * 90.0 - 45.0;
  controls.NeckAngle = Math.random() * 80.0;
  controls.TorsoAngle = Math.random() * 90.0 - 45.0;

  controls.FLTopLegAngle = Math.random() * 70.0 - 35.0;
  controls.FRTopLegAngle = Math.random() * 70.0 - 35.0;
  controls.BLTopLegAngle = Math.random() * 70.0 - 35.0;
  controls.BRTopLegAngle = Math.random() * 70.0 - 35.0;

  controls.FLBotLegAngle = Math.random() * 120.0;
  controls.FRBotLegAngle = Math.random() * 120.0;
  controls.BLBotLegAngle = Math.random() * 120.0;
  controls.BRBotLegAngle = Math.random() * 120.0;

  controls.Shade1 = Math.random();
  controls.Shade2 = Math.random();
  controls.Shade3 = Math.random();
  controls.Shade4 = Math.random();
  controls.Shade5 = Math.random();

  controls.OutlineThickness = Math.random() * 0.6;
  controls.NoiseIntensity = Math.random() * 15.0 + 5.0;
  controls.NoiseOctaves = Math.random() * 5.0 + 3.0;
}

function randomPose() {
  controls.HeadLRAngle = Math.random() * 90.0 - 45.0;
  controls.HeadUDAngle = Math.random() * 90.0 - 45.0;
  controls.NeckAngle = Math.random() * 80.0;
  controls.TorsoAngle = Math.random() * 90.0 - 45.0;

  controls.FLTopLegAngle = Math.random() * 70.0 - 35.0;
  controls.FRTopLegAngle = Math.random() * 70.0 - 35.0;
  controls.BLTopLegAngle = Math.random() * 70.0 - 35.0;
  controls.BRTopLegAngle = Math.random() * 70.0 - 35.0;

  controls.FLBotLegAngle = Math.random() * 120.0;
  controls.FRBotLegAngle = Math.random() * 120.0;
  controls.BLBotLegAngle = Math.random() * 120.0;
  controls.BRBotLegAngle = Math.random() * 120.0;
}

function randomLight() {
  controls.LightXPos = Math.random() * 80.0 - 40.0;
  controls.LightYPos = Math.random() * 80.0 - 40.0;
  controls.LightZPos = Math.random() * 80.0 - 40.0;
}

function loadScene() {
  square = new Square(vec3.fromValues(0, 0, 0));
  square.create();
  // time = 0;
}

function main() {
  window.addEventListener('keypress', function (e) {
    // console.log(e.key);
    switch(e.key) {
      // Use this if you wish
    }
  }, false);

  window.addEventListener('keyup', function (e) {
    switch(e.key) {
      // Use this if you wish
    }
  }, false);

  // Initial display for framerate
  const stats = Stats();
  stats.setMode(0);
  stats.domElement.style.position = 'absolute';
  stats.domElement.style.left = '0px';
  stats.domElement.style.top = '0px';
  document.body.appendChild(stats.domElement);

  // // Add controls to the gui
  const gui = new DAT.GUI();
  gui.add(controls, 'Random Horse');
  gui.add(controls, 'Random Pose');
  gui.add(controls, 'Random Light');

  gui.add(controls, 'HeadLRAngle', -45, 45).step(1);
  gui.add(controls, 'HeadUDAngle', -45, 45).step(1);
  gui.add(controls, 'NeckAngle', 0, 80).step(1);
  gui.add(controls, 'TorsoAngle', -45, 45).step(1);
  gui.add(controls, 'FLTopLegAngle', -35, 35).step(1);
  gui.add(controls, 'FLBotLegAngle', 0, 120).step(1);
  gui.add(controls, 'FRTopLegAngle', -35, 35).step(1);
  gui.add(controls, 'FRBotLegAngle', 0, 120).step(1);
  gui.add(controls, 'BLTopLegAngle', -35, 35).step(1);
  gui.add(controls, 'BLBotLegAngle', 0, 120).step(1);
  gui.add(controls, 'BRTopLegAngle', -35, 35).step(1);
  gui.add(controls, 'BRBotLegAngle', 0, 120).step(1);

  gui.add(controls, 'BackgroundColor', 0.0, 1.0).step(0.01);
  gui.add(controls, 'Shade1', 0.0, 1.0).step(0.01);
  gui.add(controls, 'Shade2', 0.0, 1.0).step(0.01);
  gui.add(controls, 'Shade3', 0.0, 1.0).step(0.01);
  gui.add(controls, 'Shade4', 0.0, 1.0).step(0.01);
  gui.add(controls, 'Shade5', 0.0, 1.0).step(0.01);

  gui.add(controls, 'OutlineThickness', 0, 0.6).step(0.1);
  gui.add(controls, 'NoiseIntensity', 5, 20).step(1);
  gui.add(controls, 'NoiseOctaves', 3, 8).step(1);

  gui.add(controls, 'LightXPos', -40, 40).step(1);
  gui.add(controls, 'LightYPos', -40, 40).step(1);
  gui.add(controls, 'LightZPos', -40, 40).step(1);

  // get canvas and webgl context
  const canvas = <HTMLCanvasElement> document.getElementById('canvas');
  const gl = <WebGL2RenderingContext> canvas.getContext('webgl2');
  if (!gl) {
    alert('WebGL 2 not supported!');
  }
  // `setGL` is a function imported above which sets the value of `gl` in the `globals.ts` module.
  // Later, we can import `gl` from `globals.ts` to access it
  setGL(gl);

  // Initial call to load scene
  loadScene();

  const camera = new Camera(vec3.fromValues(-15, 10, -10), vec3.fromValues(0, 0, 0));

  const renderer = new OpenGLRenderer(canvas);
  renderer.setClearColor(164.0 / 255.0, 233.0 / 255.0, 1.0, 1);
  gl.enable(gl.DEPTH_TEST);

  const flat = new ShaderProgram([
    new Shader(gl.VERTEX_SHADER, require('./shaders/flat-vert.glsl')),
    new Shader(gl.FRAGMENT_SHADER, require('./shaders/flat-frag.glsl')),
  ]);

  function processKeyPresses() {
    // Use this if you wish
  }

  // This function will be called every frame
  function tick() {
    camera.update();
    stats.begin();
    gl.viewport(0, 0, window.innerWidth, window.innerHeight);
    renderer.clear();

    if(controls.HeadLRAngle != prevHeadLRAngle)
    {
      prevHeadLRAngle = controls.HeadLRAngle;
      flat.setHeadLRAngle(controls.HeadLRAngle);
    }
    if(controls.HeadUDAngle != prevHeadUDAngle)
    {
      prevHeadUDAngle = controls.HeadUDAngle;
      flat.setHeadUDAngle(controls.HeadUDAngle);
    }
    if(controls.NeckAngle != prevNeckAngle)
    {
      prevNeckAngle = controls.NeckAngle;
      flat.setNeckAngle(controls.NeckAngle);
    }
    if(controls.TorsoAngle != prevTorsoAngle)
    {
      prevTorsoAngle = controls.TorsoAngle;
      flat.setTorsoAngle(controls.TorsoAngle);
    }

    if(controls.FLTopLegAngle != prevFLTopLegAngle)
    {
      prevFLTopLegAngle = controls.FLTopLegAngle;
      flat.setFrontLeftLegTopAngle(controls.FLTopLegAngle);
    }
    if(controls.FRTopLegAngle != prevFRTopLegAngle)
    {
      prevFRTopLegAngle = controls.FRTopLegAngle;
      flat.setFrontRightLegTopAngle(controls.FRTopLegAngle);
    }
    if(controls.BLTopLegAngle != prevBLTopLegAngle)
    {
      prevBLTopLegAngle = controls.BLTopLegAngle;
      flat.setBackLeftLegTopAngle(controls.BLTopLegAngle);
    }
    if(controls.BRTopLegAngle != prevBRTopLegAngle)
    {
      prevBRTopLegAngle = controls.BRTopLegAngle;
      flat.setBackRightLegTopAngle(controls.BRTopLegAngle);
    }

    if(controls.FLBotLegAngle != prevFLBotLegAngle)
    {
      prevFLBotLegAngle = controls.FLBotLegAngle;
      flat.setFrontLeftLegAngle(controls.FLBotLegAngle);
    }
    if(controls.FRBotLegAngle != prevFRBotLegAngle)
    {
      prevFRBotLegAngle = controls.FRBotLegAngle;
      flat.setFrontRightLegAngle(controls.FRBotLegAngle);
    }
    if(controls.BLBotLegAngle != prevBLBotLegAngle)
    {
      prevBLBotLegAngle = controls.BLBotLegAngle;
      flat.setBackLeftLegAngle(controls.BLBotLegAngle);
    }
    if(controls.BRBotLegAngle != prevBRBotLegAngle)
    {
      prevBRBotLegAngle = controls.BRBotLegAngle;
      flat.setBackRightLegAngle(controls.BRBotLegAngle);
    }

    if(controls.BackgroundColor != prevBackgroundColor)
    {
      prevBackgroundColor = controls.BackgroundColor;
      flat.setBackgroundColor(controls.BackgroundColor);
    }

    if(controls.Shade1 != prevShade1)
    {
      prevShade1 = controls.Shade1;
      flat.setShade1(controls.Shade1);
    }
    if(controls.Shade2 != prevShade2)
    {
      prevShade2 = controls.Shade2;
      flat.setShade2(controls.Shade2);
    }
    if(controls.Shade3 != prevShade3)
    {
      prevShade3 = controls.Shade3;
      flat.setShade3(controls.Shade3);
    }
    if(controls.Shade4 != prevShade4)
    {
      prevShade4 = controls.Shade4;
      flat.setShade4(controls.Shade4);
    }
    if(controls.Shade5 != prevShade5)
    {
      prevShade5 = controls.Shade5;
      flat.setShade5(controls.Shade5);
    }
    
    if(controls.OutlineThickness != prevOutlineThickness)
    {
      prevOutlineThickness = controls.OutlineThickness;
      flat.setOutlineThickness(controls.OutlineThickness);
    }

    if(controls.NoiseIntensity != prevNoiseIntensity)
    {
      prevNoiseIntensity = controls.NoiseIntensity;
      flat.setNoiseIntensity(controls.NoiseIntensity);
    }

    if(controls.NoiseOctaves != prevNoiseOctaves)
    {
      prevNoiseOctaves = controls.NoiseOctaves;
      flat.setNoiseOctaves(controls.NoiseOctaves);
    }

    if(controls.LightXPos != prevLightXPos)
    {
      prevLightXPos = controls.LightXPos;
      flat.setLightXPos(controls.LightXPos);
    }
    if(controls.LightYPos != prevLightYPos)
    {
      prevLightYPos = controls.LightYPos;
      flat.setLightYPos(controls.LightYPos);
    }
    if(controls.LightZPos != prevLightZPos)
    {
      prevLightZPos = controls.LightZPos;
      flat.setLightZPos(controls.LightZPos);
    }


    processKeyPresses();
    renderer.render(camera, flat, [
      square,
    ], time);
    time++;
    stats.end();

    // Tell the browser to call `tick` again whenever it renders a new frame
    requestAnimationFrame(tick);
  }

  window.addEventListener('resize', function() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    camera.setAspectRatio(window.innerWidth / window.innerHeight);
    camera.updateProjectionMatrix();
    flat.setDimensions(window.innerWidth, window.innerHeight);
  }, false);

  renderer.setSize(window.innerWidth, window.innerHeight);
  camera.setAspectRatio(window.innerWidth / window.innerHeight);
  camera.updateProjectionMatrix();
  flat.setDimensions(window.innerWidth, window.innerHeight);

  // Start the render loop
  tick();
}

main();
