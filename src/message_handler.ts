import { writable, get } from "svelte/store";
import type { Writable } from "svelte/store";
import type { AbsolteTrafo, PairMetadataMsg, PointcloudMsg, SensorMetadataMsg, TrackingStateMsg } from "./msg_types";

// svelte stores for interaction with GUI
export let three_functions = writable<{
    // holds callback methods of current Three instance
    on_pointcloud: (
        topic: string,
        points: number[],
        colors: number[]
    ) => void,
    on_sensor_metadata: (
        topic: string,
        reflector_locations: number[],
        transformation: AbsolteTrafo,
    ) => void,
    reset: () => void
}>();

export let pair_metadata = writable<Map<string, Writable<PairMetadataMsg>>>(new Map());


export function on_message(data: any) {
    let type: string = data.type;
    if (type == "pointcloud") {
        let msg = data as PointcloudMsg;
        get(three_functions).on_pointcloud(msg.topic, msg.data.points, msg.data.colors);
    }
    else if (type == "metadata") {
        let msg = data as SensorMetadataMsg;
        get(three_functions).on_sensor_metadata(msg.topic, msg.data.reflector_locations, msg.data.transformation);
    }
    else if (type == "pair_metadata") {
        let msg = data as PairMetadataMsg;
        let map = get(pair_metadata);
        let key = msg.from_topic + msg.to_topic;
        if (!map.has(key)) {
            map.set(key, writable(msg)); // Map's set(!)
            pair_metadata.set(map); // update UI: store's set!
        } else {
            map.get(key)!.set(msg); // update only existing store
        }
    }
    else if (type == "tracking_state") {
        let msg = data as TrackingStateMsg;
        // TODO
    }
    else {
        console.error(`UNKNOWN MESSAGE TYPE: ${type}`)
    }
}