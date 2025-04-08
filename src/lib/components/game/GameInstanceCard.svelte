<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Card from '../ui/Card.svelte';
  import Button from '../ui/Button.svelte';
  import type { GameInstance } from '../../types';
  
  export let gameInstance: GameInstance;
  export let showActions = true;
  
  const dispatch = createEventDispatcher();
  
  function handleEdit() {
    dispatch('edit', { gameInstance });
  }
  
  function handleDelete() {
    dispatch('delete', { gameInstance });
  }
  
  function handleViewDetails() {
    dispatch('viewDetails', { gameInstance });
  }
  
  function formatDate(date: Date): string {
    return new Date(date).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  }
</script>

<Card 
  title={gameInstance.name} 
  subtitle={formatDate(gameInstance.date)}
>
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <h4 class="text-sm font-medium text-gray-500">Characters</h4>
        <p class="text-lg font-semibold">{gameInstance.characters.length}</p>
      </div>
      
      <div>
        <h4 class="text-sm font-medium text-gray-500">Encounters</h4>
        <p class="text-lg font-semibold">{gameInstance.encounters.length}</p>
      </div>
    </div>
    
    {#if gameInstance.experiencePoints !== undefined}
      <div>
        <h4 class="text-sm font-medium text-gray-500">Experience Points</h4>
        <p class="text-lg font-semibold">{gameInstance.experiencePoints}</p>
      </div>
    {/if}
    
    {#if gameInstance.notes}
      <div>
        <h4 class="text-sm font-medium text-gray-500 mb-1">Notes</h4>
        <p class="text-sm text-gray-700">{gameInstance.notes}</p>
      </div>
    {/if}
  </div>
  
  {#if showActions}
    <div class="flex justify-between mt-4 pt-4 border-t border-gray-200">
      <Button variant="secondary" size="small" on:click={handleViewDetails}>View Details</Button>
      <div class="flex space-x-2">
        <Button variant="primary" size="small" on:click={handleEdit}>Edit</Button>
        <Button variant="danger" size="small" on:click={handleDelete}>Delete</Button>
      </div>
    </div>
  {/if}
</Card> 