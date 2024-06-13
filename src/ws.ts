import * as THREE from 'three';

interface CalibMessage {
    frames: {
        topic: string
        points: number[]
        colors: number[]
        marker_index?: number // TODO maybe adapt for also normal etc.
    }[]

    transformations: {
        from: string,
        to: string,
        trafo: {
            R: number[][]
            t: number[]
            R_quat: number[]
            R_sensitivity: number[][]
        }
    }[]
}


let connected = false;
function connect() {
    console.log("Connecting...")
    if (connected)
        return;

    let socket = new WebSocket("ws://localhost:6789");
    socket.addEventListener("message", (event) => {
        console.log("Got message");
        let data: CalibMessage = JSON.parse(event.data);
        new_calib_message(data);
    });
    socket.addEventListener("open", () => {
        connected = true;
        console.log("Connected")
    });
    socket.addEventListener("error", () => {
        connected = false;
        setTimeout(connect, 100);
    });
    socket.addEventListener("close", () => {
        connected = false;
        setTimeout(connect, 100);
    });
}
connect();


let colors = {
    any: [0.5, 0.5, 0.5],  // GRAY
    bright: [1.0, 0.0, 0.0],  // RED
    cluster: [0.0, 1.0, 0.0],  // GREEN
    reflector: [0.0, 0.0, 1.0],  // BLUE
    marker: [1., 0.706, 0.],  // yellow-orange
    trace: [0.5, 0.706 / 2, 0.],  // Brown
    normal: [1., 1., 0.]  // yellow
}

let callback: ((group: THREE.Group) => void) | undefined = undefined;
export function set_callback(c: (group: THREE.Group) => void) {
    callback = c;
}

/**
 * Construct a new colored Points object from the message
 */
function new_calib_message(msg: CalibMessage) {
    let group = new THREE.Group();
    // construct Points objects
    let pointclouds: Map<string, THREE.Points> = new Map();
    for (let f of msg.frames) {
        let vertices = new Float32Array(f.points);
        let colors = new Float32Array(3 * f.colors.length);
        for (let i = 0; i < f.colors.length; i++) {
            let c = get_color_from_index(f.colors[i], f.marker_index);
            colors[3 * i + 0] = c[0];
            colors[3 * i + 1] = c[1];
            colors[3 * i + 2] = c[2];
        }
        let geometry = new THREE.BufferGeometry();
        geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        let material = new THREE.PointsMaterial({ size: 0.3, vertexColors: true });
        let points = new THREE.Points(geometry, material);
        pointclouds.set(f.topic, points);
        group.add(points);
    }
    // apply transformations
    for (let t of msg.transformations) {
        // TODO support for successive transformations is missing, ignoring the "to" field!
        let target = pointclouds.get(t.from)!;
        let q = t.trafo.R_quat;
        target.applyQuaternion(new THREE.Quaternion(q[0], q[1], q[2], q[3]));
        target.translateX(t.trafo.t[0]);
        target.translateY(t.trafo.t[1]);
        target.translateZ(t.trafo.t[2]);
    }
    if (callback) {
        callback(group);
    }
}

function get_color_from_index(i: number, marker_index?: number): number[] {
    if (marker_index && i == marker_index)
        return colors.marker;
    if (i == -1)
        return colors.bright;
    if (i >= 0)
        return colors.cluster;
    return colors.any;
}
