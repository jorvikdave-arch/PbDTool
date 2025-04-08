<script lang="ts">
  import { page } from '$app/stores';
  
  // Navigation items
  const navItems = [
    { href: '/', label: 'Home' },
    { href: '/characters', label: 'Characters' },
    { href: '/game-instances', label: 'Game Instances' },
    { href: '/encounters', label: 'Encounters' }
  ];
  
  // Check if a nav item is active
  function isActive(href: string): boolean {
    return $page.url.pathname === href;
  }
</script>

<div class="min-h-screen bg-gray-100">
  <!-- Header -->
  <header class="bg-white shadow">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <span class="text-xl font-bold text-blue-600">PbDTool</span>
          </div>
          <nav class="ml-6 flex space-x-8">
            {#each navItems as item}
              <a
                href={item.href}
                class="inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium {isActive(item.href) ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'}"
              >
                {item.label}
              </a>
            {/each}
          </nav>
        </div>
      </div>
    </div>
  </header>
  
  <!-- Main content -->
  <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
    <div class="px-4 py-6 sm:px-0">
      <slot />
    </div>
  </main>
  
  <!-- Footer -->
  <footer class="bg-white shadow mt-auto">
    <div class="max-w-7xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
      <p class="text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} PbDTool. All rights reserved.
      </p>
    </div>
  </footer>
</div>

<style>
  /* Add any component-specific styles here */
</style> 