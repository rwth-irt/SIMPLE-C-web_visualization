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


// add point cloud
function generatePointCloudGeometry(color: THREE.Color, width: number, length: number, scale: number) {
    const geometry = new THREE.BufferGeometry();
    const numPoints = width * length;
    const positions = new Float32Array(numPoints * 3);
    const colors = new Float32Array(numPoints * 3);
    let k = 0;
    for (let i = 0; i < width; i++) {
        for (let j = 0; j < length; j++) {
            const u = i / width;
            const v = j / length;
            const x = u - 0.5;
            const y = (Math.cos(u * Math.PI * 4) + Math.sin(v * Math.PI * 8)) / 20;
            const z = v - 0.5;

            positions[3 * k] = x * scale;
            positions[3 * k + 1] = y * scale;
            positions[3 * k + 2] = z * scale;

            const intensity = (y + 0.1) * 5;
            colors[3 * k] = color.r * intensity;
            colors[3 * k + 1] = color.g * intensity;
            colors[3 * k + 2] = color.b * intensity;

            k++;
        }
    }
    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
    geometry.computeBoundingBox();
    return geometry;
}
const geometry = generatePointCloudGeometry(new THREE.Color(1, 0, 0), 10, 10, 10);
const material = new THREE.PointsMaterial({ size: 0.1, vertexColors: true });
const points = new THREE.Points(geometry, material);
scene.add(points);

//controls.update() must be called after any manual changes to the camera's transform
camera.position.set(0, 10, 0);
controls.update();
