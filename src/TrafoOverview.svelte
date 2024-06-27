<script lang="ts">
    import { pair_metadata } from "./message_handler";
    import TrafoEntry from "./TrafoEntry.svelte";
</script>

{#each Array.from($pair_metadata.entries()) as [key, value] (key)}
    <TrafoEntry data={value}></TrafoEntry>
{/each}
