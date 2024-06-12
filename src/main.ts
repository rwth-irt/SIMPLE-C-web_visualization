import * as THREE from 'three';
import { ArcballControls } from 'three/addons/controls/ArcballControls.js';

const renderer = new THREE.WebGLRenderer({
    antialias: true
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcccccc);


const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
const controls = new ArcballControls(camera, renderer.domElement, scene);
controls.addEventListener('change', function () {
    renderer.render(scene, camera);
});


// world
const geometry = new THREE.ConeGeometry(10, 30, 4, 1);
const material = new THREE.MeshPhongMaterial({ color: 0xffffff, flatShading: true });
for (let i = 0; i < 500; i++) {
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.x = Math.random() * 1600 - 800;
    mesh.position.y = 0;
    mesh.position.z = Math.random() * 1600 - 800;
    mesh.updateMatrix();
    mesh.matrixAutoUpdate = false;
    scene.add(mesh);
}

//controls.update() must be called after any manual changes to the camera's transform
camera.position.set(0, 10, 0);
controls.update();
