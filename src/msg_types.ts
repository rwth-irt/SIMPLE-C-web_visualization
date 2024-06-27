// Typescript type definitions for the JSON messages received from the python calibrator

export interface AbsolteTrafo {
    t: number[]
    R_quat: number[]
}

export interface SensorMetadataMsg {
    type: "metadata" // TODO rename this to sensor_metadata
    topic: string
    data: {
        reflector_locations: number[]
        transformation: AbsolteTrafo
    }
}

export interface PointcloudMsg {
    type: "pointcloud"
    topic: string
    data: {
        points: number[];
        colors: number[];
    }
}

export interface PairMetadataMsg {
    type: "pair_metadata"
    from_topic: string
    to_topic: string
    transformation: {
        t: number[],
        R_euler: number[],
        R_sensitivity: number[]
    }
    number_point_pairs: number,
    tracking_state: {
        from_state: string
        to_state: string
    }
}

export interface TrackingStateMsg {
    type: "tracking_state"
    topic: string
    state: string
    // Internally, there are separate tracking states for individual sensor pairs...
    // We may just ignore those fields.
    pair_from: string
    pair_to: string
}