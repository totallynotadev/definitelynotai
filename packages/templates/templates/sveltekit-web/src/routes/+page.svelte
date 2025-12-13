<script lang="ts">
  import { Button, Card, CardHeader, CardTitle, CardDescription, CardContent } from '$lib/components/index.js';
  // @agent:inject:imports
</script>

<main class="container mx-auto p-8">
  <h1 class="text-3xl font-bold mb-8">
    <!-- @agent:inject:title -->
    Welcome
  </h1>

  <div class="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
    <Card>
      <CardHeader>
        <CardTitle>Getting Started</CardTitle>
        <CardDescription>Your app is ready to be customized</CardDescription>
      </CardHeader>
      <CardContent>
        <p class="text-muted-foreground mb-4">
          This template includes Tailwind CSS, shadcn-svelte components, and Drizzle ORM pre-configured.
        </p>
        <Button>Learn More</Button>
      </CardContent>
    </Card>
  </div>

  <!-- @agent:inject:components -->
</main>
