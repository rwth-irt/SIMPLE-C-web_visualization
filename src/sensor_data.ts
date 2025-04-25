import * as THREE from 'three';

interface Trafo {
    t: number[]
    R_quat: number[]
}

export class Sensor {
    static index_counter = 0;

    static point_geometry = new THREE.SphereGeometry(0.05, 16, 16);
    static point_material = new THREE.MeshBasicMaterial({ color: 0xd8b343 });

    readonly topic: string
    reflector_locations?: number[]
    trafo?: Trafo
    readonly index: number

    // threejs specific
    three_points?: THREE.Points;
    three_scene: THREE.Scene;
    three_group?: THREE.Group;
    reflector_points: THREE.Mesh[] = [];


    constructor(topic: string, three_scene: THREE.Scene) {
        this.topic = topic;
        this.index = Sensor.index_counter++;
        this.three_scene = three_scene;
    }

    private init_threejs(point_number: number) {
        // create buffer arrays, make them bigger to have extra space if we receive more points later
        let vertices = new Float32Array(3 * point_number * 1.3);
        let colors = new Float32Array(3 * point_number * 1.3);
        let buffer_geometry = new THREE.BufferGeometry();
        buffer_geometry.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
        buffer_geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));
        let material = new THREE.PointsMaterial({ size: 0.15, vertexColors: true });
        this.three_points = new THREE.Points(buffer_geometry, material);

        this.three_group = new THREE.Group();
        this.three_group.add(this.three_points);

        // create origin marker
        const origin_marker = new THREE.Mesh(
            new THREE.SphereGeometry(0.2, 32, 32),
            new THREE.MeshBasicMaterial({ color: 0x000000 })
        );
        this.three_group.add(origin_marker);

        this.three_scene.add(this.three_group);
    }

    on_frame(points: number[], colors: number[]) {
        if (!this.three_points) {
            this.init_threejs(points.length / 3)
        }

        // get buffer arrays to update
        let bg = this.three_points!.geometry; // this is only called after init_threejs.
        let colors_buffer = bg.getAttribute("color").array;
        let points_buffer = bg.getAttribute("position").array;

        // ensure we do not write more points than our buffer size
        let values_to_copy = Math.min(points_buffer.length, points.length);
        if (values_to_copy != points.length) {
            console.log("WARNING: BUFFER IS TOO SMALL!")
        }
        // copy data to buffers, parsed json can then be garbage-collected.
        for (let i = 0; i < values_to_copy; i++) {
            points_buffer[i] = points[i];
        }
        for (let i = 0; i < values_to_copy / 3; i++) {
            let c = get_color_from_index(colors[i], this.index);
            colors_buffer[3 * i + 0] = c[0];
            colors_buffer[3 * i + 1] = c[1];
            colors_buffer[3 * i + 2] = c[2];
        }
        bg.setDrawRange(0, values_to_copy / 3);
        // TODO I sometimes get the error 
        //   THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN.
        //   The "position" attribute is likely to have NaN values.
        // Ignoring it for now, can not determine easily from docs if to set setDrawRange to values/3 or values.

        // set three's update flags
        bg.getAttribute("color").needsUpdate = true;
        bg.getAttribute("position").needsUpdate = true;

        this.update_group(); // transformation must be set before rendering
    }

    on_metadata(reflector_locations: number[], transformation: Trafo) {
        this.reflector_locations = reflector_locations;
        this.trafo = transformation;
        this.update_group();
    }

    /**
     * Updates this.three_group based on transformation and updates reflector_locations if present.
     */
    private update_group() {
        if (!this.three_group || !this.reflector_locations || !this.trafo)
            return;

        // update reflector points
        //   remove them
        for (let p of this.reflector_points) {
            this.three_group!.remove(p);
        }
        this.reflector_points = [];

        //   re-add them
        for (let i = 0; i < this.reflector_locations!.length; i++) {
            let pt = new THREE.Mesh(Sensor.point_geometry, Sensor.point_material);
            this.reflector_points.push(pt);
            let pos = this.reflector_locations!;
            pt.position.set(
                pos[i * 3 + 0],
                pos[i * 3 + 1],
                pos[i * 3 + 2]
            );
            this.three_group!.add(pt);
        }

        // set transformation of whole group
        let q = this.trafo!.R_quat;
        let t = this.trafo!.t;
        this.three_group!.quaternion.set(q[0], q[1], q[2], q[3]);
        this.three_group!.position.set(t[0], t[1], t[2]);
    }

    destruct() {
        if (this.three_points)
            this.three_points.geometry.dispose();
        if (this.three_group)
            this.three_scene.remove(this.three_group);
    }
}


// Color stuff

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
    [0.7, 0.6, 0.3], // orange-ish tint
    [0.3, 0.3, 0.6], // blue tint
    [0.3, 0.6, 0.3], // green tint
]

function get_color_from_index(i: number, frame_index: number): number[] {
    if (i == -1)
        return colors.bright;
    if (i == -3)
        return colors.reflector;
    if (i >= 0)
        return colors.cluster;
    return basic_colors[frame_index % basic_colors.length]; // -2
}