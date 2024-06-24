
let socket: WebSocket | undefined = undefined;
let no_alerts = false;

export function connect(msg_callback: (data: any) => void) {
    console.log("Connecting...");
    if (socket) {
        socket.close();
    }
    no_alerts = false;
    socket = new WebSocket((document.getElementById("address_input") as HTMLInputElement).value);
    socket.addEventListener("message", (event) => {
        let data = JSON.parse(event.data);
        msg_callback(data);
    });
    socket.addEventListener("open", () => {
        console.log("Connected")
        alert("Connected")
    });
    socket.addEventListener("error", () => {
        socket = undefined;
        console.log("Connection error")
        alert("Connection error")
        no_alerts = true;
    });
    socket.addEventListener("close", () => {
        socket = undefined;
        console.log("Connection closed")
        if (!no_alerts)
            alert("Connection closed")
    });
}
