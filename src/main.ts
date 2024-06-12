import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// Basic Three.js setup
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xcccccc);
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Points geometry
const geometry = new THREE.BufferGeometry();
const vertices = new Float32Array([
    // Example positions for points
    1, 2, 3,
    4, 5, 6,
    7, 8, 9,
]);
geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
const material = new THREE.PointsMaterial({ color: 0x333333, size: 0.3 });
const points = new THREE.Points(geometry, material);
scene.add(points);

// OrbitControls for camera
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 0, 10);
controls.update();

// Raycaster and mouse vector
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

// Event listener for click
renderer.domElement.addEventListener('dblclick', (event) => {
    // Calculate mouse position in normalized device coordinates
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Update the raycaster
    raycaster.setFromCamera(mouse, camera);

    // Calculate intersections
    const intersects = raycaster.intersectObject(points);

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
    renderer.render(scene, camera);
}
animate();
