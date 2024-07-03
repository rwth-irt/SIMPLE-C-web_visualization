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

    function on_connect_button() {
        // reset everything
        pair_metadata.set(new Map());
        get(three_functions).reset();
        // Try to save current URL to LocalStorage
        try {
            localStorage.setItem(LOCALSTORAGE_KEY, url);
        } catch (_) {
            console.log("Could not write URL to localstorage");
        }
        // connect
        connect_websocket(url, (data) => {
            on_message(data);
        });
    }
</script>

<main>
    <div id="maindiv">
        Websocket server: <input
            type="text"
            id="address_input"
            bind:value={url}
        />
        <button on:click={on_connect_button} class="btn btn-outline-primary"
            >Connect WS</button
        >
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
