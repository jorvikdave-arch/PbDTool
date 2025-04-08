<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import Card from '../ui/Card.svelte';
  import Button from '../ui/Button.svelte';
  import type { Character } from '../../types';
  
  export let character: Character;
  export let showActions = true;
  
  const dispatch = createEventDispatcher();
  
  function handleEdit() {
    dispatch('edit', { character });
  }
  
  function handleDelete() {
    dispatch('delete', { character });
  }
  
  function handleViewDetails() {
    dispatch('viewDetails', { character });
  }
  
  // Calculate ability score modifier
  function getAbilityModifier(score: number): string {
    const modifier = Math.floor((score - 10) / 2);
    return modifier >= 0 ? `+${modifier}` : `${modifier}`;
  }
</script>

<Card title={character.name} subtitle={`Level ${character.level} ${character.race} ${character.class}`}>
  <div class="grid grid-cols-2 gap-4">
    <div>
      <h4 class="text-sm font-medium text-gray-500">Hit Points</h4>
      <p class="text-lg font-semibold">{character.hitPoints.current} / {character.hitPoints.maximum}</p>
    </div>
    
    <div>
      <h4 class="text-sm font-medium text-gray-500">Armor Class</h4>
      <p class="text-lg font-semibold">{character.armorClass}</p>
    </div>
    
    <div class="col-span-2">
      <h4 class="text-sm font-medium text-gray-500 mb-1">Ability Scores</h4>
      <div class="grid grid-cols-3 gap-2">
        <div>
          <span class="text-xs text-gray-500">STR</span>
          <p class="font-medium">{character.abilityScores.strength} ({getAbilityModifier(character.abilityScores.strength)})</p>
        </div>
        <div>
          <span class="text-xs text-gray-500">DEX</span>
          <p class="font-medium">{character.abilityScores.dexterity} ({getAbilityModifier(character.abilityScores.dexterity)})</p>
        </div>
        <div>
          <span class="text-xs text-gray-500">CON</span>
          <p class="font-medium">{character.abilityScores.constitution} ({getAbilityModifier(character.abilityScores.constitution)})</p>
        </div>
        <div>
          <span class="text-xs text-gray-500">INT</span>
          <p class="font-medium">{character.abilityScores.intelligence} ({getAbilityModifier(character.abilityScores.intelligence)})</p>
        </div>
        <div>
          <span class="text-xs text-gray-500">WIS</span>
          <p class="font-medium">{character.abilityScores.wisdom} ({getAbilityModifier(character.abilityScores.wisdom)})</p>
        </div>
        <div>
          <span class="text-xs text-gray-500">CHA</span>
          <p class="font-medium">{character.abilityScores.charisma} ({getAbilityModifier(character.abilityScores.charisma)})</p>
        </div>
      </div>
    </div>
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