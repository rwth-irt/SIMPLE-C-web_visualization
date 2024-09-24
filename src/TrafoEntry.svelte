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

<div class="card mb-3">
    <h6 class="card-header card-title">
        {$data.from_topic} → {$data.to_topic}
    </h6>
    <div class="card-body p-0">
        <table class="table">
            <tbody>
                <tr>
                    <th scope="row"><b>Translation:</b></th>
                    <td>{digits($data.transformation.t[0])} m</td>
                    <td>{digits($data.transformation.t[1])} m</td>
                    <td>{digits($data.transformation.t[2])} m</td>
                </tr>
                <tr>
                    <th scope="row"><b>Rotation</b></th>
                    <td>
                        x: {digits(rad2deg($data.transformation.R_euler[0]))}°
                    </td>
                    <td>
                        y: {digits(rad2deg($data.transformation.R_euler[1]))}°
                    </td>
                    <td>
                        z: {digits(rad2deg($data.transformation.R_euler[2]))}°
                    </td>
                </tr>

                <tr>
                    <th scope="row"><b>Rotation sensitivity:</b></th>
                    <td colspan="3">
                        {digits($data.transformation.sensitivity_number, 8)}
                    </td>
                </tr>
                <tr>
                    <th scope="row"><b>Points used:</b></th>
                    <td colspan="3">
                        {digits($data.used_point_pairs)} /
                        {digits($data.total_point_pairs)}
                    </td>
                </tr>
                <tr>
                    <th scope="row"><b>Standard Deviation:</b></th>
                    <td>x: {digits($data.std_dimensions[0])} m</td>
                    <td>y: {digits($data.std_dimensions[1])} m</td>
                    <td>z: {digits($data.std_dimensions[2])} m</td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
