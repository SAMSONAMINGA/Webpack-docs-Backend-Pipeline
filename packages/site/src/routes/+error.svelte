<script lang="ts">
  import { page } from "$app/stores";
</script>

<section class="error-page">
  <p class="rune">✦</p>
  <h1>{$page.status}</h1>
  <p class="message">{$page.error?.message ?? "This passage of the archive is lost to shadow."}</p>
  <a href="/">Return to the Hall</a>
</section>

<style>
  .error-page {
    max-width: 500px;
    margin: 0 auto;
    padding: 8rem 1.5rem;
    text-align: center;
  }
  .rune {
    font-size: 1.5rem;
    color: theme("colors.ember.500");
    margin-bottom: 1rem;
  }
  h1 {
    font-family: theme("fontFamily.blackletter");
    font-size: 4rem;
    color: theme("colors.silver.100");
  }
  .message {
    color: theme("colors.silver.300");
    margin: 1rem 0 2rem;
  }
  a {
    font-family: theme("fontFamily.medieval");
    color: theme("colors.ember.400");
    text-decoration: underline;
  }
</style>
