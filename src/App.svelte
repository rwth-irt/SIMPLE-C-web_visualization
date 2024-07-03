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
    import { onMount } from "svelte";

    let url: string;
    onMount(() => {
        // Try to load last URL
        let from_storage = localStorage.getItem(LOCALSTORAGE_KEY);
        if (from_storage) {
            url = from_storage;
        } else {
            url = DEFAULT_URL;
        }
    });

    const LOCALSTORAGE_KEY = "lidar_align_monitor_last_url";
    const DEFAULT_URL = "ws://localhost:6789";

    let send_message: (msg: string) => void;

    function on_connect_button() {
        reset();
        // Try to save current URL to LocalStorage
        try {
            localStorage.setItem(LOCALSTORAGE_KEY, url);
        } catch (_) {
            console.log("Could not write URL to localstorage");
        }
        // connect
        send_message = connect_websocket(url, (data) => {
            on_message(data);
        });
    }

    function on_reset_button() {
        reset();
        send_message("reset");
    }

    function reset() {
        pair_metadata.set(new Map());
        get(three_functions).reset();
    }
</script>

<main>
    <div id="maindiv">
        Websocket server: <input
            type="text"
            id="address_input"
            bind:value={url}
        />
        <button on:click={on_connect_button}>Connect WS</button>
        <button on:click={on_reset_button}>Reset calibration</button>
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
