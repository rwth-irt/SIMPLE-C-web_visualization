import { writable } from "svelte/store";

let socket: WebSocket | undefined = undefined;
export let state = writable("Not connected");

/**
 * Connect to a websocket server.
 * @param url The URL of the websocket server to connect to
 * @param msg_callback A callback function to call with incoming messages
 * @returns A function which will send messages via this websocket
 */
export function connect_websocket(url: string, msg_callback: (data: any) => void): ((msg: string) => void) {
    let error = false;
    console.log("Connecting...");
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
        console.log("Websocket connected");
        state.set("Connected");
    });
    socket.addEventListener("error", () => {
        error = true;
        socket = undefined;
        console.log("Connection error");
        state.set("Error");
    });
    socket.addEventListener("close", () => {
        socket = undefined;
        if (!error) {
            // on error, keep error message/state
            console.log("Connection closed");
            state.set("Closed");
        }
    });
    return (msg: string) => {
        if (socket && socket.readyState == WebSocket.OPEN) {
            socket.send(msg);
        }
    }
}
