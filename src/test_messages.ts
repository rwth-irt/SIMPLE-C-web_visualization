import { CalibMessage } from "./ws";

// Debugging: Schedule some messages
function schedule_test_msgs(msg_callback: (msg: CalibMessage)=>void) {
    let test_message1: CalibMessage = {
        frames: [
            {
                topic: "a",
                points: [1, 2, 3, 1, 2, 4, 2, 3, 5, 4, 3, 5, 3, 2, 4, 4, 4, 4, 3, 2, 3, -1, -1, -1],
                colors: [-2, -1, 0, 1, -2, -1, 0, 1,],
                marker_index: 3
            }
        ],
        transformations: []
    }

    let test_message2: CalibMessage = {
        frames: [
            {
                topic: "a",
                points: [1.3, 2, 3.3, 1.3, 2.3, 4, 2.3, 3, 5.3, 4.3, 3, 6, 2, 2.3, 4, 5, 4.3, 4, 3, -2, -3, -1.3, 1, -1.3],
                colors: [-2, -1, 0, 1, -2, -1, 0, 1,],
                marker_index: 3 // TODO is not blue, implement!
            }
        ],
        transformations: []
    }

    let test_message3: CalibMessage = {
        frames: [
            {
                topic: "a",
                points: [1.3, 2, 3.3, 1.3, 2.3, 4, 2.3, 3, 5.3, 4.3, 3, 6, 2, 2.3, 4, 5, 4.3, 4, 3, -2, -3, -1.3, 1, -1.3],
                colors: [-1, -1, -1, -1, -1, -1, -1, -1],
                marker_index: 3
            },
            {
                topic: "b",
                points: [1, 2, 3.3, 1.3, 2, 4, 2.3, 3, 5, 4.3, 3, 6, 2, 2.3, 4, 5, 4, 4, 3, -2, -3, -1, 1, -1.2],
                colors: [1, 1, 1, 1, 1, 1, 1, 1],
            },
            {
                topic: "c",
                points: [1, 2, 3.3, 1.3, 2, 4, 2.3, 3, 5, 4.3, 3, 6, 2, 2.3, 4, 5, 4, 4, 3, 2, 3, 1, 1, 1.2],
                colors: [1, 1, 1, 1, 1, 1, 1, 1],
            }
        ],
        transformations: [
            {
                from: "a",
                to: "b",
                trafo: {
                    t: [0, 0, 0],
                    R_quat: [1, 0, 0, 0]
                }
            }
        ]
    }

    let test_message4: CalibMessage = {
        frames: [
            {
                topic: "a",
                points: [1.3, 2, 3.3, 1.3, 2.3, 4, 2.3, 3, 5.3, 4.3, 3, 6, 2, 2.3, 4, 5, 4.3, 4, 3, -2, -3, -1.3, 1, -1.3],
                colors: [-1, -1, -1, -1, -1, -1, -1, -1],
                marker_index: 3
            },
            {
                topic: "b",
                points: [1, 2, 3.3, 1.3, 2, 4, 2.3, 3, 5, 4.3, 3, 6, 2, 2.3, 4, 5, 4, 4, 3, -2, -3, -1, 1, -1.2],
                colors: [1, 1, 2, 1, 1, 1, 1, 1],
                marker_index: 2
            }
        ],
        transformations: [
            {
                from: "a",
                to: "b",
                trafo: {
                    t: [0, 0, 0],
                    R_quat: [1, 0, 0, 0]
                }
            }
        ]
    }
    setTimeout(() => { msg_callback(test_message1); }, 1000);
    setTimeout(() => { msg_callback(test_message2); }, 3000);
    setTimeout(() => { msg_callback(test_message3); }, 5000);
    setTimeout(() => { msg_callback(test_message4); }, 7000);
}