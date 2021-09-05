import * as THREE from "three";
import { TWEEN } from "three/examples/jsm/libs/tween.module.min";
import { OrbitControls } from "three/examples/jsm/controls/orbitcontrols";

import "./style.css";
import { Camera, MOUSE } from "three";

let camera, scene, renderer;
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

  const pointer = creatPointer(50, 5, 0xffffff, 0xffffff, 0.3, 0.7);
  scene.add(pointer);

  const controls = new OrbitControls(camera, canvas);
  controls.target.set(0, 5, 0);
  controls.update();

  const raycaster = new THREE.Raycaster();

  const pointerPosition = new THREE.Vector2();

  const geometry = new THREE.PlaneGeometry(1000, 1000);
  geometry.rotateX(- Math.PI / 2);
  const plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({ color: "pink" }));
  scene.add(plane);

  // add objects that pointer appears on 
  objects.push(plane);

  renderer.setPixelRatio(window.devicePixelRatio);
  renderer.setSize(window.innerWidth, window.innerHeight);

  // events
  document.addEventListener('pointermove', onPointerMove);
  document.addEventListener('mousedown', onMouseDown);
  window.addEventListener('resize', onWindowResize);

  function onPointerMove(event) {

    pointerPosition.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);

    raycaster.setFromCamera(pointerPosition, camera);

    const intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {

      const intersect = intersects[0];

      pointer.position.copy(intersect.point).add(intersect.face.normal);
      pointer.position.divideScalar(5).floor().multiplyScalar(5).addScalar(3);
    }
  }
  //cameraposition 
  
  function onMouseDown(event) {

    pointerPosition.set((event.clientX / window.innerWidth) * 2 - 1, - (event.clientY / window.innerHeight) * 2 + 1);
    
    raycaster.setFromCamera(pointerPosition, camera);

    const intersects = raycaster.intersectObjects(objects);

    if (intersects.length > 0) {

      poniterAnimation(pointer, 1, 2, 0, 1, 500);

    }
    
    //moving the camera to the clicked location 
    let second_camera_X = pointer.position.x
    let second_camera_Y = pointer.position.y
  
    cameraanimation(second_camera_X,second_camera_Y)
    
  }
  
}

function onWindowResize() {

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);
}

function render() {

  renderer.render(scene, camera);
}

function creatPointer(radius, boderWidth, backgroundColor, borderColor, backgroundOpacity, borderOpacity) {
  // creat circle pointer
  const rollOverGeo = new THREE.CircleGeometry(radius, radius);
  const rollOverMaterial = new THREE.MeshBasicMaterial({ color: backgroundColor, opacity: backgroundOpacity, transparent: true });
  const rollOverMesh = new THREE.Mesh(rollOverGeo, rollOverMaterial);
  rollOverGeo.rotateX(- Math.PI / 2);

  // creat border for pointer
  const outLineGeo = new THREE.RingGeometry((radius + boderWidth), radius, radius);
  const outLineMaterial = new THREE.MeshBasicMaterial({ color: borderColor, side: THREE.BackSide, opacity: borderOpacity, transparent: true });
  const outLineMesh = new THREE.Mesh(outLineGeo, outLineMaterial);
  outLineGeo.rotateX(- Math.PI / 2);

  // creat a ring that shown when mousedown
  const outRingGeo = new THREE.RingGeometry((radius + boderWidth), radius, radius);
  const outRingMaterial = new THREE.MeshBasicMaterial({ color: borderColor, side: THREE.BackSide, transparent: true });
  const outRingMesh = new THREE.Mesh(outRingGeo, outRingMaterial);
  outRingGeo.rotateX(- Math.PI / 2);

  const obj = new THREE.Object3D();
  obj.add(rollOverMesh);
  obj.add(outLineMesh);
  obj.add(outRingMesh);
  obj.position.y = 5;
  return obj;
}

function poniterAnimation(pointer, minScale, maxScale, minOpacity, maxOpacity, duration) {

  new TWEEN.Tween({ op: maxOpacity, sc: minScale }).to({ op: minOpacity, sc: maxScale }, duration)
    .easing(TWEEN.Easing.Cubic.Out)
    .onUpdate(function (currentState) {
      pointer.children[2].scale.set(currentState.sc, currentState.sc, currentState.sc);
      pointer.children[2].material.opacity = currentState.op;
    })
    .start()
}

//animation for moving the camera

function cameraanimation(second_camera_X,second_camera_Y)
{
  new TWEEN.Tween({x:camera.position.x ,y:camera.position.y }).to({x:second_camera_X ,y:second_camera_Y } ,10000 ).onUpdate((movingstate)=>{
    
    camera.position.set(- movingstate.x, -movingstate.y,5)
  
  }).easing(TWEEN.Easing.Cubic.Out).start()
 
}

function animate() {
  requestAnimationFrame(animate)

  TWEEN.update()

  render()
}