import * as THREE from 'three';
import testjson_url from "../testdata/test_messages.txt?url";

export interface CalibMessage {
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
            t: number[]
            R_quat: number[]
        }
    }[]
}


let connected = false;
function connect() {
    console.log("Connecting...")
    if (connected)
        return;

    let socket = new WebSocket((document.getElementById("address_input") as HTMLInputElement).value);
    socket.addEventListener("message", (event) => {
        let data: CalibMessage = JSON.parse(event.data);
        new_calib_message(data);
    });
    socket.addEventListener("open", () => {
        connected = true;
        console.log("Connected")
        alert("Connected")
    });
    socket.addEventListener("error", () => {
        connected = false;
        console.log("Connection error")
        alert("Connection error")
    });
    socket.addEventListener("close", () => {
        connected = false;
        console.log("Connection closed")
        alert("Connection closed")
    });
}
document.getElementById("connect_btn")!.addEventListener("click", connect);


let colors = {
    any: [0.5, 0.5, 0.5],  // GRAY
    bright: [1.0, 0.0, 0.0],  // RED
    cluster: [0.0, 1.0, 0.0],  // GREEN
    reflector: [0.0, 0.0, 1.0],  // BLUE
    marker: [1., 0.706, 0.],  // yellow-orange
    trace: [0.5, 0.706 / 2, 0.],  // Brown
    normal: [1., 1., 0.]  // yellow
}
let basic_colors = [
    [0.55, 0.53, 0.5], // orange-ish tint
    [0.5, 0.5, 0.55], // blue tint
    [0.5, 0.55, 0.5], // green tint
]

let callback: ((group: THREE.Group) => void) | undefined = undefined;
export function set_callback(c: (group: THREE.Group) => void) {
    callback = c;
}

// Buffers for pointcloud data
let buffers: Map<string, THREE.BufferGeometry> = new Map();

/**
 * Construct a new colored Points object from the message
 */
function new_calib_message(msg: CalibMessage) {
    let group = new THREE.Group();
    // construct Points objects
    let pointclouds: Map<string, THREE.Points> = new Map();
    let frame_index = -1;
    for (let f of msg.frames) {
        frame_index++;

        // create buffer if required
        let new_buffer = false;
        if (!buffers.has(f.topic)) {
            new_buffer = true;
        } else {
            // invalidate cache if length does not match
            new_buffer = f.points.length != buffers.get(f.topic)!.getAttribute("position").array.length;
            buffers.get(f.topic)!.dispose(); // dispose old buffer!
        }
        if (new_buffer) {
            let vertices = new Float32Array(f.points);
            let colors = new Float32Array(3 * f.colors.length);
            let geometry = new THREE.BufferGeometry(); // TODO use cached variant!!!!
            geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
            geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
            buffers.set(f.topic, geometry);
        }
        let bg = buffers.get(f.topic)!;
        let colors = bg.getAttribute("color").array;
        let positions = bg.getAttribute("position").array;
        let pts = f.points;

        // copy data to buffers, parsed json can then be gcollected.
        for (let i = 0; i < pts.length; i++) {
            positions[i] = pts[i];
        }
        for (let i = 0; i < f.colors.length; i++) {
            let c = get_color_from_index(f.colors[i], frame_index, f.marker_index);
            colors[3 * i + 0] = c[0];
            colors[3 * i + 1] = c[1];
            colors[3 * i + 2] = c[2];
        }
        bg.getAttribute("color").needsUpdate = true;
        bg.getAttribute("position").needsUpdate = true;

        // export new Three group
        let material = new THREE.PointsMaterial({ size: 0.15, vertexColors: true });
        let points = new THREE.Points(bg, material);
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

function get_color_from_index(i: number, frame_index: number, marker_index?: number): number[] {
    if (marker_index && i == marker_index)
        return colors.reflector;
    if (i == -1)
        return colors.bright;
    if (i >= 0)
        return colors.cluster;
    return basic_colors[frame_index % basic_colors.length];
}


// add test functionality
function scroll_test_data(data: CalibMessage[], i: number) {
    new_calib_message(data[i]);
    if (i < data.length - 1) {
        setTimeout(() => scroll_test_data(data, i + 1), 500);
    }
}
document.getElementById("test_btn")?.addEventListener("click", () => {
    // must be a file with a json containing a single list of CalibMessage
    fetch(testjson_url)
        .then(res => res.json())
        .then(out => scroll_test_data(out, 0))
        .catch(err => { console.log("Error:", err) });
});