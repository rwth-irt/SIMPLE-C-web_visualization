<script lang="ts">
    import * as THREE from "three";
    import { OrbitControls } from "three/addons/controls/OrbitControls.js";
    import { Sensor } from "./sensor_data";
    import { onMount } from "svelte";
    import type { AbsolteTrafo } from "./msg_types";
    import { three_functions } from "./message_handler";

    let div: HTMLDivElement;

    onMount(() => {
        three_functions.set({
            on_pointcloud: on_pointcloud,
            on_sensor_metadata: on_sensor_metadata,
            reset: reset,
        });
        init_threejs();
    });

    // threejs variables
    let scene: THREE.Scene;
    let camera: THREE.Camera;
    let renderer: THREE.Renderer;
    let controls: OrbitControls;
    let marker: THREE.Mesh;

    function init_threejs() {
        // Basic Three.js setup
        THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 0, 1); // set z up, as in lidar data
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xfafafa);
        let height = window.innerHeight * 0.8;
        let width = height * 1.3;
        camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
        camera.position.set(0, 0, 20);

        renderer = new THREE.WebGLRenderer();
        renderer.setSize(width, height);
        div.appendChild(renderer.domElement);

        // OrbitControls for camera
        controls = new OrbitControls(camera, renderer.domElement);
        controls.target.set(20, 0, 0);
        controls.update();

        // Create a marker at the controls' target point
        marker = new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0x000000 }),
        );
        scene.add(marker);

        reset();
        animate();
    }

    let sensors: Map<string, Sensor>;
    function reset() {
        if (sensors) {
            Sensor.index_counter = 0;
            for (let sensor of sensors.values()) sensor.destruct();
        }
        sensors = new Map();
    }

    function on_pointcloud(topic: string, points: number[], colors: number[]) {
        if (!sensors.has(topic)) {
            sensors.set(topic, new Sensor(topic, scene));
        }
        sensors.get(topic)!.on_frame(points, colors);
    }

    function on_sensor_metadata(
        topic: string,
        reflector_locations: number[],
        transformation: AbsolteTrafo,
    ) {
        if (!sensors.has(topic)) {
            sensors.set(topic, new Sensor(topic, scene));
        }
        sensors.get(topic)!.on_metadata(reflector_locations, transformation);
    }

    // Render loop
    function animate() {
        requestAnimationFrame(animate);
        marker.position.copy(controls.target);
        controls.update();
        renderer.render(scene, camera);
    }
</script>

<div id="threediv" bind:this={div}></div>

<style>
    #threediv {
        border: 1px solid gray;
        margin-top: 1em;
    }
</style>
