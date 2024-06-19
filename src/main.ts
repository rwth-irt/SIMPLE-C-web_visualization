import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { set_callback } from './ws';

// Basic Three.js setup
THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0,0,1); // set z up, as in lidar data
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfafafa);
let width = 800;
let height = 600;
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.set(0, 0, 10);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

let current_group: THREE.Group | undefined = undefined;

function new_objects(group: THREE.Group) {
    if (current_group) {
        scene.remove(current_group);
    }
    scene.add(group);
    current_group = group;
}
set_callback(g => new_objects(g));


// OrbitControls for camera
const controls = new OrbitControls(camera, renderer.domElement);
controls.update();

// create origin marker
const origin_marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.2, 32, 32), 
    new THREE.MeshBasicMaterial({ color: 0x000000 })
);
scene.add(origin_marker);
// Create a marker at the controls' target point
const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 32, 32), 
    new THREE.MeshBasicMaterial({ color: 0x000000 })
);
scene.add(marker);

// Raycaster and mouse vector
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Event listener for click
renderer.domElement.addEventListener('dblclick', (event) => {
    if (!current_group)
        return;
    
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);

    // Calculate intersections
    const intersects = raycaster.intersectObject(current_group);

    if (intersects.length > 0) {
        // Get the intersected point
        const intersect = intersects[0];
        const point = intersect.point;

        // Focus camera on the clicked point
        camera.position.set(point.x, point.y, point.z + 10);
        controls.target.set(point.x, point.y, point.z);
        controls.update();
    }
});

// Render loop
function animate() {
    requestAnimationFrame(animate);
    marker.position.copy(controls.target);
    controls.update();
    renderer.render(scene, camera);
}
animate();
