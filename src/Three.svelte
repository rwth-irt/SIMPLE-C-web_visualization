<script lang="ts">
    import * as THREE from "three";
    import { OrbitControls } from "three/addons/controls/OrbitControls.js";
    import { Sensor } from "./sensor_data";
    import { onMount } from "svelte";
    import type { AbsolteTrafo } from "./msg_types";
    import { three_functions } from "./message_handler";

    let canvas: HTMLCanvasElement;

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
    let camera: THREE.PerspectiveCamera;
    let renderer: THREE.Renderer;
    let controls: OrbitControls;
    let marker: THREE.Mesh;

    function update_render_size() {
        // https://threejs.org/manual/#en/responsive
        // TODO:
        // The CSS to set the canvas element's size is correct: If renderer.setSize is never called (commented out), it is set correctly.
        // However, when we do call renderer.setSize, the canvas' clientWidth is not 
        let canvas = renderer.domElement;
        let width = canvas.clientWidth;
        let height = canvas.clientHeight;
        if (canvas.width !== width || canvas.height !== height) {
            console.debug(`Setting renderer size to ${width}x${height}`);
            renderer.setSize(width, height, false);
            camera.aspect = width / height;
            camera.updateProjectionMatrix();
        }
    }

    function init_threejs() {
        // Basic Three.js setup
        THREE.Object3D.DEFAULT_UP = new THREE.Vector3(0, 0, 1); // set z up, as in lidar data
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xfafafa);

        camera = new THREE.PerspectiveCamera(75); // fov
        camera.position.set(0, 0, 20);

        renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: true,
        });

        update_render_size();

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
        requestAnimationFrame(animate);
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
        update_render_size();
        marker.position.copy(controls.target);
        controls.update();
        renderer.render(scene, camera);
        requestAnimationFrame(animate);
    }
</script>

<canvas id="c" bind:this={canvas}></canvas>

<style>
    #c {
        width: 100%;
        height: 100%;
        display: block;
    }
</style>
