<script lang="ts">
    import { on_message } from "./message_handler";
    import Three from "./Three.svelte";
    import TrafoOverview from "./TrafoOverview.svelte";
    import { connect_websocket } from "./ws";

    function on_connect_button() {
        connect_websocket((data) => {
            on_message(data);
        });
    }
</script>

<main>
    Websocket server: <input
        type="text"
        id="address_input"
        value="ws://localhost:6789"
    />
    <button on:click={on_connect_button}>Connect WS</button>
    <Three></Three>

    <TrafoOverview></TrafoOverview>
</main>
