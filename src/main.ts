import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { connect } from './ws';
import { Sensor } from './sensor_data';

// Basic Three.js setup
THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 0, 1); // set z up, as in lidar data
const scene = new THREE.Scene();
scene.background = new THREE.Color(0xfafafa);
let height = window.innerHeight * 0.8;
let width = height * 1.3;
const camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
camera.position.set(0, 0, 20);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(width, height);
document.getElementById("threedif")!.appendChild(renderer.domElement);

// OrbitControls for camera
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(20, 0, 0);
controls.update();

// Create a marker at the controls' target point
const marker = new THREE.Mesh(
    new THREE.SphereGeometry(0.1, 32, 32),
    new THREE.MeshBasicMaterial({ color: 0x000000 })
);
scene.add(marker);

// add ws handler
let sensors: Map<string, Sensor>;
function on_message(data: any) {
    // this is called on every Websocket message
    let type: "pointcloud" | "metadata" = data.type;
    let topic: string = data.topic;
    if (!sensors.has(topic)) {
        sensors.set(topic, new Sensor(topic, scene));
    }
    let sensor = sensors.get(topic)!;
    if (type == "metadata") {
        let payload = data.data as {
            reflector_locations: number[],
            transformation: {
                t: number[],
                R_quat: number[]
            }
        }
        sensor.on_metadata(payload.reflector_locations, payload.transformation);
    }
    if (type == "pointcloud") {
        let payload = data.data as {
            points: number[],
            colors: number[]
        }
        sensor.on_frame(payload.points, payload.colors);
    }
}

document.getElementById("connect_btn")!.addEventListener("click", () => {
    sensors = new Map();
    connect(data => on_message(data));
});


// Render loop
function animate() {
    requestAnimationFrame(animate);
    marker.position.copy(controls.target);
    controls.update();
    renderer.render(scene, camera);
}
animate();
