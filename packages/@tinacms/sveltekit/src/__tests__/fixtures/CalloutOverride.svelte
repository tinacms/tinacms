<script lang="ts">
let { title, tone }: { title: string; tone: string } = $props();
</script>

<aside data-testid="callout-override" data-tone={tone}>{title}</aside>
