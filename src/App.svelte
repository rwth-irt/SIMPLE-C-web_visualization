<script lang="ts">
    import Three from "./Three.svelte";
    import { connect_websocket } from "./ws";

    let three_on_msg: (data: any) => void;
    let three_reset: () => void;

    function on_connect_button() {
        three_reset();
        connect_websocket((data) => three_on_msg(data));
    }
</script>

<main>
    Websocket server: <input
        type="text"
        id="address_input"
        value="ws://localhost:6789"
    />
    <button on:click={on_connect_button}>Connect WS</button>
    <Three bind:reset={three_reset} bind:on_message={three_on_msg}></Three>
</main>
