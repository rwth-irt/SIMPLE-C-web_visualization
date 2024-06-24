import * as THREE from 'three';

interface Trafo {
    t: number[]
    R_quat: number[]
}

export class Sensor {
    static index_counter = 0;

    readonly topic: string
    reflector_locations?: number[]
    trafo?: Trafo
    readonly index: number

    // threejs specific
    point_pool: PointPool = new PointPool();
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
        let vertices = new Float32Array(3 * point_number);
        let colors = new Float32Array(3 * point_number);
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

        // copy data to buffers, parsed json can then be gcollected.
        for (let i = 0; i < points.length; i++) {
            points_buffer[i] = points[i];
        }
        for (let i = 0; i < colors.length; i++) {
            let c = get_color_from_index(colors[i], this.index);
            colors_buffer[3 * i + 0] = c[0];
            colors_buffer[3 * i + 1] = c[1];
            colors_buffer[3 * i + 2] = c[2];
        }
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
            this.point_pool.recycle(p);
        }
        //   re-add them
        for (let i = 0; i < this.reflector_locations!.length; i++) {
            let p = this.point_pool.get_new();
            // TODO do we have to reset anything? Does this *add* translation?
            p.translateX(this.reflector_locations![i*3]);
            p.translateY(this.reflector_locations![i*3+1]);
            p.translateZ(this.reflector_locations![i*3+2]);
        }

        // set transformation of whole group
        let q = this.trafo!.R_quat;
        this.three_group!.applyQuaternion(new THREE.Quaternion(q[0], q[1], q[2], q[3]));
        this.three_group!.translateX(this.trafo!.t[0]);
        this.three_group!.translateY(this.trafo!.t[1]);
        this.three_group!.translateZ(this.trafo!.t[2]);
    }
}

class PointPool {
    available: THREE.Mesh[] = [];
    private material = new THREE.MeshBasicMaterial({ color: 0xd8b343 });

    get_new() {
        if (this.available) {
            return this.available.pop()!;
        }
        return new THREE.Mesh(
            new THREE.SphereGeometry(0.1, 16, 16),
            this.material
        );
    }

    recycle(sphere: THREE.Mesh) {
        this.available.push(sphere);
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
    [0.55, 0.53, 0.5], // orange-ish tint
    [0.5, 0.5, 0.55], // blue tint
    [0.5, 0.55, 0.5], // green tint
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