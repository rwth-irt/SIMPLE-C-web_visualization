import { writable } from "svelte/store";

let socket: WebSocket | undefined = undefined;
export let state = writable("Not connected");

export function connect_websocket(msg_callback: (data: any) => void) {
    state.set("Connecting...");
    if (socket) {
        socket.close();
    }
    socket = new WebSocket((document.getElementById("address_input") as HTMLInputElement).value);
    socket.addEventListener("message", (event) => {
        let data = JSON.parse(event.data);
        msg_callback(data);
    });
    socket.addEventListener("open", () => {
        console.log("Connected");
        state.set("Connected");
    });
    socket.addEventListener("error", () => {
        socket = undefined;
        console.log("Connection error");
        state.set("Connection error");
    });
    socket.addEventListener("close", () => {
        socket = undefined;
        console.log("Connection closed");
        state.set("Connection closed");
    });
}
