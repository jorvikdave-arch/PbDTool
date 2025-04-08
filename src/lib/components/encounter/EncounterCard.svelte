<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Card from '../ui/Card.svelte';
  import Button from '../ui/Button.svelte';
  import type { Encounter } from '../../types';
  
  export let encounter: Encounter;
  export let showActions = true;
  
  const dispatch = createEventDispatcher();
  
  function handleEdit() {
    dispatch('edit', { encounter });
  }
  
  function handleDelete() {
    dispatch('delete', { encounter });
  }
  
  function handleViewDetails() {
    dispatch('viewDetails', { encounter });
  }
  
  function handleStartEncounter() {
    dispatch('start', { encounter });
  }
  
  function handleEndEncounter() {
    dispatch('end', { encounter });
  }
  
  function handleNextRound() {
    dispatch('nextRound', { encounter });
  }
  
  // Sort participants by initiative (highest first)
  $: sortedParticipants = [...encounter.participants].sort((a, b) => b.initiative - a.initiative);
</script>

<Card 
  title={encounter.name} 
  subtitle={encounter.isActive ? `Round ${encounter.round} - Active` : 'Inactive'}
>
  <div class="space-y-4">
    <div>
      <h4 class="text-sm font-medium text-gray-500 mb-2">Participants</h4>
      <div class="space-y-2">
        {#each sortedParticipants as participant}
          <div class="flex justify-between items-center p-2 bg-gray-50 rounded">
            <span class="font-medium">{participant.characterId}</span>
            <div class="flex items-center space-x-4">
              <span class="text-sm text-gray-500">Initiative: {participant.initiative}</span>
              {#if participant.hitPoints !== undefined}
                <span class="text-sm text-gray-500">HP: {participant.hitPoints}</span>
              {/if}
              {#if participant.conditions && participant.conditions.length > 0}
                <div class="flex space-x-1">
                  {#each participant.conditions as condition}
                    <span class="px-1 py-0.5 text-xs bg-yellow-100 text-yellow-800 rounded">{condition}</span>
                  {/each}
                </div>
              {/if}
            </div>
          </div>
        {/each}
      </div>
    </div>
    
    {#if encounter.notes}
      <div>
        <h4 class="text-sm font-medium text-gray-500 mb-1">Notes</h4>
        <p class="text-sm text-gray-700">{encounter.notes}</p>
      </div>
    {/if}
  </div>
  
  {#if showActions}
    <div class="flex justify-between mt-4 pt-4 border-t border-gray-200">
      <Button variant="secondary" size="small" on:click={handleViewDetails}>View Details</Button>
      <div class="flex space-x-2">
        {#if encounter.isActive}
          <Button variant="warning" size="small" on:click={handleEndEncounter}>End Encounter</Button>
          <Button variant="primary" size="small" on:click={handleNextRound}>Next Round</Button>
        {:else}
          <Button variant="success" size="small" on:click={handleStartEncounter}>Start Encounter</Button>
        {/if}
        <Button variant="primary" size="small" on:click={handleEdit}>Edit</Button>
        <Button variant="danger" size="small" on:click={handleDelete}>Delete</Button>
      </div>
    </div>
  {/if}
</Card> 