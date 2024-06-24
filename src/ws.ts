
let connected = false;
export function connect(msg_callback: (data: any)=>void) {
    console.log("Connecting...")
    if (connected)
        return;

    let socket = new WebSocket((document.getElementById("address_input") as HTMLInputElement).value);
    socket.addEventListener("message", (event) => {
        console.log("New message")
        let data = JSON.parse(event.data);
        msg_callback(data);
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
