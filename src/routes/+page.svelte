<script lang="ts">
  import AppLayout from '$lib/components/layout/AppLayout.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Card from '$lib/components/ui/Card.svelte';
  import Input from '$lib/components/forms/Input.svelte';
  
  // Event handlers
  function handleButtonClick() {
    alert('Button clicked!');
  }
  
  function handleInputChange(_event: CustomEvent) {
    // Handle input change
  }
</script>

<AppLayout>
  <div class="space-y-8">
    <section>
      <h1 class="text-3xl font-bold text-gray-900 mb-4">Welcome to PbDTool</h1>
      <p class="text-lg text-gray-600 mb-8">
        A Progressive Web Application for managing tabletop RPG characters, encounters, and game sessions.
      </p>
    </section>
    
    <section>
      <h2 class="text-2xl font-bold text-gray-900 mb-4">UI Components</h2>
      
      <div class="space-y-8">
        <div>
          <h3 class="text-xl font-semibold text-gray-800 mb-4">Buttons</h3>
          <div class="flex flex-wrap gap-2">
            <Button variant="primary" on:click={handleButtonClick}>Primary</Button>
            <Button variant="secondary" on:click={handleButtonClick}>Secondary</Button>
            <Button variant="danger" on:click={handleButtonClick}>Danger</Button>
            <Button variant="success" on:click={handleButtonClick}>Success</Button>
            <Button variant="warning" on:click={handleButtonClick}>Warning</Button>
          </div>
        </div>
        
        <div>
          <h3 class="text-xl font-semibold text-gray-800 mb-4">Form Inputs</h3>
          <div class="max-w-md space-y-4">
            <Input 
              label="Text Input" 
              placeholder="Enter text..." 
              on:input={handleInputChange} 
            />
            <Input 
              type="number" 
              label="Number Input" 
              placeholder="Enter number..." 
              on:input={handleInputChange} 
            />
          </div>
        </div>
        
        <div>
          <h3 class="text-xl font-semibold text-gray-800 mb-4">Cards</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card title="Character Card" subtitle="Sample Character">
              <p class="text-sm text-gray-600">A card for displaying character information.</p>
            </Card>
            <Card title="Game Instance Card" subtitle="Sample Game">
              <p class="text-sm text-gray-600">A card for displaying game instance information.</p>
            </Card>
            <Card title="Encounter Card" subtitle="Sample Encounter">
              <p class="text-sm text-gray-600">A card for displaying encounter information.</p>
            </Card>
          </div>
        </div>
      </div>
    </section>
  </div>
</AppLayout> 