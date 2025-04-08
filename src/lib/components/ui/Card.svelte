<script lang="ts">
  export let title: string | undefined = undefined;
  export let subtitle: string | undefined = undefined;
  export let padding: 'none' | 'small' | 'medium' | 'large' = 'medium';
  export let elevation: 'none' | 'low' | 'medium' | 'high' = 'medium';
  
  const paddingClasses = {
    none: '',
    small: 'p-2',
    medium: 'p-4',
    large: 'p-6'
  };
  
  const elevationClasses = {
    none: '',
    low: 'shadow-sm',
    medium: 'shadow',
    high: 'shadow-lg'
  };
</script>

<div class="bg-white rounded-lg {elevationClasses[elevation]} {paddingClasses[padding]}">
  {#if title || subtitle}
    <div class="mb-4">
      {#if title}
        <h3 class="text-lg font-medium text-gray-900">{title}</h3>
      {/if}
      {#if subtitle}
        <p class="mt-1 text-sm text-gray-500">{subtitle}</p>
      {/if}
    </div>
  {/if}
  <div class="card-content">
    <slot />
  </div>
  <div class="card-footer">
    <slot name="footer" />
  </div>
</div>

<style>
  .card-content {
    /* Add any content-specific styles here */
  }
  
  .card-footer {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid #e5e7eb;
  }
</style> 