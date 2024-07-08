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

<div class="container-fluid h-100 p-4">
    <div class="row h-100">
        <div class="col-9 d-flex flex-column">
            <div class="card mb-3">
                <!--use a bootstrap form for this!-->
                <div
                    class="fw-bold card-header {$state == 'Connected'
                        ? 'text-bg-success'
                        : 'text-bg-warning'}"
                >
                    Connection ({$state})
                </div>
                <div class="card-body">
                    Websocket server: <input
                        type="text"
                        id="address_input"
                        bind:value={url}
                    />
                    <button
                        on:click={on_connect_button}
                        class="btn btn-outline-primary">Connect WS</button
                    >
                </div>
            </div>
            <div class="card flex-grow-1">
                <div class="card-header fw-bold">3D viewer</div>
                <div class="card-body"> 
                    <Three></Three>
                </div>
            </div>
        </div>
        <div class="col">
            <div class="card">
                <div class="card-header fw-bold">Transformation info</div>
                <div class="card-body">
                    <TrafoOverview></TrafoOverview>
                </div>
            </div>
        </div>
    </div>
</div>
