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
  tesselations: 5,
  FrontLeftLegAngle: 0,
  FrontRightLegAngle: 0,
  BackLeftLegAngle: 0,
  BackRightLegAngle: 0,
};

let square: Square;
let time: number = 0;
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
