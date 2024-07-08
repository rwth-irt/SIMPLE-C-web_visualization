import { writable } from "svelte/store";

let socket: WebSocket | undefined = undefined;
export let state = writable("Not connected");

export function connect_websocket(url: string, msg_callback: (data: any) => void) {
    let error = false;
    state.set("Connecting...");
    if (socket) {
        socket.close();
    }
    socket = new WebSocket(url);
    socket.addEventListener("message", (event) => {
        let data = JSON.parse(event.data);
        msg_callback(data);
    });
    socket.addEventListener("open", () => {
        console.log("Connected");
        state.set("Connected");
    });
    socket.addEventListener("error", () => {
        error = true;
        socket = undefined;
        console.log("Error");
        state.set("Error");
    });
    socket.addEventListener("close", () => {
        socket = undefined;
        if (!error) {
            // on error, keep error message/state
            console.log("Closed");
            state.set("Closed");
        }
    });
}
