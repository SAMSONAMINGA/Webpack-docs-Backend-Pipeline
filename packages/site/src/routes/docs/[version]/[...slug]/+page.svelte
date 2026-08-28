<script lang="ts">
  import { goto } from "$app/navigation";
  import DocViewer from "$lib/components/DocViewer.svelte";
  import type { PageData } from "./$types";

  export let data: PageData;

  $: crumbs = [
    { label: "Archive", href: "/" },
    { label: data.version.toUpperCase(), href: `/docs/${data.version}` },
    { label: data.category },
    { label: data.slug.replace(/-/g, " ") },
  ];

  function handleVersionChange(tag: string) {
    // Best-effort: try to land on the same category/slug in the new
    // version; the loader will 404 gracefully if that symbol doesn't
    // exist there, and the person can navigate from the version's index.
    goto(`/docs/${tag}/${data.category}/${data.slug}`).catch(() => goto(`/docs/${tag}`));
  }
</script>

<svelte:head>
  <title>{data.slug.replace(/-/g, " ")} · {data.version.toUpperCase()} · SHADOWFALL</title>
</svelte:head>

<DocViewer
  markdownSource={data.source}
  {crumbs}
  versions={data.versions}
  currentVersion={data.version}
  searchIndex={data.searchIndex}
  onVersionChange={handleVersionChange}
/>
