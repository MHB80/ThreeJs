import * as THREE from "three";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min";
import { OrbitControls } from "three/examples/jsm/controls/orbitcontrols";

import "./style.css";


let camera, scene, renderer;
let plane;
let pointer, raycaster;

let rollOverMesh, rollOverMaterial;
let outLineMesh, outRingMesh;
let obj, controls;
const objects = [];

init();
render();
animate();

function init() {

  const canvas = document.querySelector('#canvas');
  renderer = new THREE.WebGLRenderer({ canvas });

  camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  camera.position.set(500, 800, 1300);

  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);

  // creat circle pointer
  const rollOverGeo = new THREE.CircleGeometry(50, 50);
  rollOverMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, opacity: 0.3, transparent: true });
  rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
  rollOverGeo.rotateX(- Math.PI / 2);

  // creat border for pointer
  const outLineGeo = new THREE.RingGeometry(55, 50, 50);
  const outLineMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide, opacity: 0.7, transparent: true });
  outLineMesh = new THREE.Mesh(outLineGeo, outLineMaterial);
  outLineGeo.rotateX(- Math.PI / 2);

  // creat a ring that shown when mousedown
  const outRingGeo = new THREE.RingGeometry(55, 50, 50);
  const outRingMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.BackSide, transparent: true, visible: false });
  outRingMesh = new THREE.Mesh(outRingGeo, outRingMaterial);
  outRingGeo.rotateX(- Math.PI / 2);

  // creat an object an add to scene
  obj = new THREE.Object3D();
  obj.add(rollOverMesh);
  obj.add(outLineMesh);
  obj.add(outRingMesh);
  obj.position.y = 5;
  scene.add(obj);

  controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();

  raycaster = new THREE.Raycaster();

  pointer = new THREE.Vector2();

  const geometry = new THREE.PlaneGeometry(1000, 1000);
  geometry.rotateX(- Math.PI / 2);
  plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: "pink" }));
  scene.add(plane);

  // add objects that pointer appears on 
  objects.push(plane);

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // events
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('mousedown', onMouseDown);
  window.addEventListener('resize', onWindowResize);

  render();
}

function onMouseDown(event) {

  pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(objects);

  if (intersects.length > 0) {

    const intersect = intersects[0];

    new TWEEN.Tween(pointer).to(pointer, 500)
      .easing(TWEEN.Easing.Cubic.Out)
      .onUpdate(function () {
        outRingMesh.material.visible = true;
        outRingMesh.scale.multiplyScalar(1.02);
        outRingMesh.material.opacity -= 0.04;
      })
      .start()
      .onComplete(function () {
        outRingMesh.material.visible = false;
        outRingMesh.material.opacity = 1;
        outRingMesh.scale.set(1, 1, 1);
      });
  }
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function onPointerMove(event) {

  pointer.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);

  raycaster.setFromCamera(pointer, camera);

  const intersects = raycaster.intersectObjects(objects);

  if (intersects.length > 0) {

    const intersect = intersects[0];

    obj.position.copy(intersect.point).add(intersect.face.normal);
    obj.position.divideScalar(10).floor().multiplyScalar(10).addScalar(15);

  }

  render();
}

function render() {

  renderer.render(scene, camera);
}



function animate() {
  requestAnimationFrame(animate)

  controls.update()

  TWEEN.update()

  render()
}