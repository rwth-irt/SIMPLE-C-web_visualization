<script lang="ts">
    import { get } from "svelte/store";
    import {
        on_message,
        pair_metadata,
        three_functions,
    } from "./message_handler";
    import Three from "./Three.svelte";
    import TrafoOverview from "./TrafoOverview.svelte";
    import { connect_websocket, state } from "./ws";

    function on_connect_button() {
        // reset everything
        pair_metadata.set(new Map());
        get(three_functions).reset();
        // connect
        connect_websocket((data) => {
            on_message(data);
        });
    }
</script>

<main>
    <div id="maindiv">
        Websocket server: <input
            type="text"
            id="address_input"
            value="ws://localhost:6789"
        />
        <button on:click={on_connect_button}>Connect WS</button>
        Connection state: <b>{$state}</b>
        <div id="flexdiv">
            <Three></Three>
            <TrafoOverview></TrafoOverview>
        </div>
    </div>
</main>

<style>
    #flexdiv {
        display: flex;
        flex-direction: row;
        flex-wrap: wrap;
    }
    #maindiv {
        margin: 1em;
    }
</style>
