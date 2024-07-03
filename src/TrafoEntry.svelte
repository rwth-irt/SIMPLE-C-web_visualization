<script lang="ts">
    import type { Writable } from "svelte/store";
    import type { PairMetadataMsg } from "./msg_types";

    export let data: Writable<PairMetadataMsg>;

    function digits(f: number, digits: number = 3) {
        let factor = Math.pow(10, digits);
        return Math.round(f * factor) / factor;
    }

    function rad2deg(a: number) {
        return (a / 2 / Math.PI) * 360;
    }
</script>

<details open>
    <summary><b>{$data.from_topic} → {$data.to_topic}</b></summary>
    <div id="trafodiv">
        <b>Transformation</b>
        <table>
            <tr>
                <td>Translation:</td>
                <td>{digits($data.transformation.t[0])}</td>
                <td>{digits($data.transformation.t[1])}</td>
                <td>{digits($data.transformation.t[2])}</td>
            </tr>
            <tr>
                <td>Rotation</td>
                <td>x: {digits(rad2deg($data.transformation.R_euler[0]))}°</td>
                <td>y: {digits(rad2deg($data.transformation.R_euler[1]))}°</td>
                <td>z: {digits(rad2deg($data.transformation.R_euler[2]))}°</td>
            </tr>
        </table>
    </div>

    <b>Sensitivity:</b>
    {digits($data.transformation.sensitivity_number, 6)}
    <br />
    <b>Points used:</b>
    {digits($data.used_point_pairs)} / {digits($data.total_point_pairs)}
</details>

<style>
    table {
        border-collapse: collapse;
    }
    td {
        border: 1px solid;
    }
    details {
        margin: 1em;
    }
    #trafodiv {
        margin-top: 0.5em;
        margin-bottom: 0.5em;
    }
</style>
