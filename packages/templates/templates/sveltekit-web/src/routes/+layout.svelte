<script lang="ts">
  import '../app.css';

  let { children } = $props();
</script>

<svelte:head>
  <title>Generated App</title>
  <meta name="description" content="An app built with Definitely Not AI" />
</svelte:head>

{@render children()}
