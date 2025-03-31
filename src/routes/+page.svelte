<script lang="ts">
  import { gameStore, characters, loading, error } from '$lib/stores/gameStore';
  import type { Character } from '$lib/stores/types';

  // Initialize the store when the app loads
  gameStore.init();

  // Example function to add a character
  async function handleAddCharacter() {
    await gameStore.addCharacter({
      name: 'New Character',
      system: 'D&D 5e',
      notes: ''
    });
  }
</script>

{#if $loading}
  <p>Loading...</p>
{:else if $error}
  <p class="error">{$error}</p>
{:else}
  <div class="characters">
    {#each $characters as character}
      <div class="character-card">
        <h3>{character.name}</h3>
        <p>System: {character.system}</p>
        <p>Last updated: {character.lastUpdated.toLocaleDateString()}</p>
      </div>
    {/each}
  </div>

  <button on:click={handleAddCharacter}>Add Character</button>
{/if}

<style>
  .error {
    color: red;
  }

  .characters {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1rem;
    padding: 1rem;
  }

  .character-card {
    border: 1px solid #ccc;
    padding: 1rem;
    border-radius: 4px;
  }
</style> 