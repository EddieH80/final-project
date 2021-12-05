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
  TorsoAngle: 0,
  FrontLeftLegTopAngle: 0,
  FrontRightLegTopAngle: 0,
  BackLeftLegTopAngle: 0,
  BackRightLegTopAngle: 0,
  FrontLeftLegAngle: 0,
  FrontRightLegAngle: 0,
  BackLeftLegAngle: 0,
  BackRightLegAngle: 0,
};

let square: Square;
let time: number = 0;

let prevTorsoAngle: number = 0;

let prevFrontLeftLegTopAngle: number = 0;
let prevFrontRightLegTopAngle: number = 0;
let prevBackLeftLegTopAngle: number = 0;
let prevBackRightLegTopAngle: number = 0;

let prevFrontLeftLegAngle: number = 0;
let prevFrontRightLegAngle: number = 0;
let prevBackLeftLegAngle: number = 0;
let prevBackRightLegAngle: number = 0;

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
  gui.add(controls, 'TorsoAngle', -45, 45).step(1);
  gui.add(controls, 'FrontLeftLegTopAngle', -35, 35).step(1);
  gui.add(controls, 'FrontRightLegTopAngle', -35, 35).step(1);
  gui.add(controls, 'BackLeftLegTopAngle', -35, 35).step(1);
  gui.add(controls, 'BackRightLegTopAngle', -35, 35).step(1);
  gui.add(controls, 'FrontLeftLegAngle', 0, 120).step(1);
  gui.add(controls, 'FrontRightLegAngle', 0, 120).step(1);
  gui.add(controls, 'BackLeftLegAngle', 0, 120).step(1);
  gui.add(controls, 'BackRightLegAngle', 0, 120).step(1);

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

  const camera = new Camera(vec3.fromValues(0, 0, -10), vec3.fromValues(0, 0, 0));

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

    if(controls.TorsoAngle != prevTorsoAngle)
    {
      prevTorsoAngle = controls.TorsoAngle;
      flat.setTorsoAngle(controls.TorsoAngle);
    }

    if(controls.FrontLeftLegTopAngle != prevFrontLeftLegTopAngle)
    {
      prevFrontLeftLegTopAngle = controls.FrontLeftLegTopAngle;
      flat.setFrontLeftLegTopAngle(controls.FrontLeftLegTopAngle);
    }
    if(controls.FrontRightLegTopAngle != prevFrontRightLegTopAngle)
    {
      prevFrontRightLegTopAngle = controls.FrontRightLegTopAngle;
      flat.setFrontRightLegTopAngle(controls.FrontRightLegTopAngle);
    }
    if(controls.BackLeftLegTopAngle != prevBackLeftLegTopAngle)
    {
      prevBackLeftLegTopAngle = controls.BackLeftLegTopAngle;
      flat.setBackLeftLegTopAngle(controls.BackLeftLegTopAngle);
    }
    if(controls.BackRightLegTopAngle != prevBackRightLegTopAngle)
    {
      prevBackRightLegTopAngle = controls.BackRightLegTopAngle;
      flat.setBackRightLegTopAngle(controls.BackRightLegTopAngle);
    }

    if(controls.FrontLeftLegAngle != prevFrontLeftLegAngle)
    {
      prevFrontLeftLegAngle = controls.FrontLeftLegAngle;
      flat.setFrontLeftLegAngle(controls.FrontLeftLegAngle);
    }
    if(controls.FrontRightLegAngle != prevFrontRightLegAngle)
    {
      prevFrontRightLegAngle = controls.FrontRightLegAngle;
      flat.setFrontRightLegAngle(controls.FrontRightLegAngle);
    }
    if(controls.BackLeftLegAngle != prevBackLeftLegAngle)
    {
      prevBackLeftLegAngle = controls.BackLeftLegAngle;
      flat.setBackLeftLegAngle(controls.BackLeftLegAngle);
    }
    if(controls.BackRightLegAngle != prevBackRightLegAngle)
    {
      prevBackRightLegAngle = controls.BackRightLegAngle;
      flat.setBackRightLegAngle(controls.BackRightLegAngle);
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
