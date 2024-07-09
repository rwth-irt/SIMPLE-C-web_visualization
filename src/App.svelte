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

<div class="container-fluid h-100 p-4">
    <div class="row h-100">
        <div class="col d-flex flex-column">
            <div class="card mb-3">
                <h5
                    class="card-title fw-bold card-header {$state == 'Connected'
                        ? 'text-bg-success'
                        : 'text-bg-warning'}"
                >
                    Connection ({$state})
                </h5>
                <div class="card-body">
                    <div class="row">
                        <div class="col">
                            <!-- URL field -->
                            <div class="input-group">
                                <span class="input-group-text"
                                    >Websocket server URL:</span
                                >
                                <input
                                    type="text"
                                    id="address_input"
                                    class="form-control"
                                    bind:value={url}
                                />
                                <button
                                    on:click={on_connect_button}
                                    class="btn btn-outline-primary"
                                    >Connect WS</button
                                >
                            </div>
                        </div>
                        <div class="col-auto">
                            <button
                                on:click={on_reset_button}
                                class="btn btn-outline-danger"
                                disabled={$state != "Connected"}
                                >Reset calibration on server
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="card flex-grow-1">
                <h5 class="card-header card-title fw-bold">3D viewer</h5>
                <div class="card-body">
                    <Three></Three>
                </div>
            </div>
        </div>
        <div class="col-3 h-100">
            <div class="card h-100">
                <h5 class="card-header card-title fw-bold">
                    Transformation info
                </h5>
                <div class="card-body overflow-y-auto">
                    <TrafoOverview></TrafoOverview>
                </div>
            </div>
        </div>
    </div>
</div>
