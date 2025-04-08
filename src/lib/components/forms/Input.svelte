<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  
  export let type: 'text' | 'password' | 'email' | 'number' | 'tel' | 'url' | 'search' = 'text';
  export let label: string | undefined = undefined;
  export let placeholder: string | undefined = undefined;
  export let value: string | number = '';
  export let name: string | undefined = undefined;
  export let id: string | undefined = undefined;
  export let required = false;
  export let disabled = false;
  export let error: string | undefined = undefined;
  export let helper: string | undefined = undefined;
  export let size: 'small' | 'medium' | 'large' = 'medium';
  
  const dispatch = createEventDispatcher();
  
  function handleInput(event: Event) {
    const target = event.target as HTMLInputElement;
    value = type === 'number' ? Number(target.value) : target.value;
    dispatch('input', { value });
  }
  
  function handleChange(event: Event) {
    const target = event.target as HTMLInputElement;
    value = type === 'number' ? Number(target.value) : target.value;
    dispatch('change', { value });
  }
  
  function handleBlur(event: Event) {
    dispatch('blur', event);
  }
  
  function handleFocus(event: Event) {
    dispatch('focus', event);
  }
  
  const sizeClasses = {
    small: 'px-2 py-1 text-sm',
    medium: 'px-3 py-2 text-base',
    large: 'px-4 py-3 text-lg'
  };

  const baseClasses = "block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed";
  const classes = `${baseClasses} ${sizeClasses[size]} ${error ? 'border-red-500' : ''}`;
</script>

<div class="form-group">
  {#if label}
    <label for={id || name} class="block text-sm font-medium text-gray-700 mb-1">
      {label}
      {#if required}
        <span class="text-red-500">*</span>
      {/if}
    </label>
  {/if}
  
  {#if type === 'number'}
    <input
      type="number"
      {name}
      {id}
      {placeholder}
      {required}
      {disabled}
      value={value.toString()}
      class={classes}
      on:input={handleInput}
      on:change={handleChange}
      on:blur={handleBlur}
      on:focus={handleFocus}
    />
  {:else}
    <input
      {type}
      {name}
      {id}
      {placeholder}
      {required}
      {disabled}
      value={value.toString()}
      class={classes}
      on:input={handleInput}
      on:change={handleChange}
      on:blur={handleBlur}
      on:focus={handleFocus}
    />
  {/if}
  
  {#if error}
    <p class="mt-1 text-sm text-red-600">{error}</p>
  {:else if helper}
    <p class="mt-1 text-sm text-gray-500">{helper}</p>
  {/if}
</div>

<style>
  .form-group {
    margin-bottom: 1rem;
  }
</style> 