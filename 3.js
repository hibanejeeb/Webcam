// ==========================================
// ITEMS.JS - Health Potions & Surface Spawning
// ==========================================

let playerHealth = 100;

// Component to handle potion behavior and collection
AFRAME.registerComponent('health-potion', {
  init: function () {
    const el = this.el;

    // Listen for pinch gesture or touch interaction to drink potion
    el.addEventListener('click', function () {
      collectPotion(el);
    });

    el.addEventListener('pinchstarted', function () {
      collectPotion(el);
    });
  }
});

// Function when player drinks the potion
function collectPotion(potionEl) {
  // Increase health (max 100)
  playerHealth = Math.min(100, playerHealth + 25);
  
  // Update HUD text if it exists on screen
  const healthDisplay = document.querySelector('#health-display');
  if (healthDisplay) {
    healthDisplay.setAttribute('value', 'Health: ' + playerHealth);
  }

  // Play pickup animation (shrink and fade out)
  potionEl.setAttribute('animation__collect', 'property: scale; to: 0 0 0; dur: 250');
  setTimeout(() => {
    if (potionEl.parentNode) {
      potionEl.parentNode.removeChild(potionEl);
    }
  }, 250);
}

// Function to spawn health potions onto real surfaces or fallback coordinates
function spawnHealthPotion() {
  const container = document.querySelector('#item-container');
  if (!container) return;

  const potion = document.createElement('a-entity');
  
  // Create a glowing flask shape (Cylinder core + glowing sphere top)
  potion.setAttribute('geometry', 'primitive: cylinder; radius: 0.12; height: 0.25');
  potion.setAttribute('material', 'color: #00FF66; emissive: #00AA33; opacity: 0.85; transparent: true; roughness: 0.2');
  potion.setAttribute('class', 'clickable pinch-vulnerable');
  potion.setAttribute('health-potion', ''); // Attach our component

  // Add a floating particle aura animation
  potion.setAttribute('animation__float', 'property: position; to: 0 0.1 0; dir: alternate; dur: 1500; loop: true');
  potion.setAttribute('animation__rotate', 'property: rotation; to: 0 360 0; loop: true; dur: 4000');

  // Check if WebXR Session is active to try surface hit-testing
  const sceneEl = document.querySelector('a-scene');
  const xrSession = sceneEl && sceneEl.renderer && sceneEl.renderer.xr.getSession();

  if (xrSession) {
    // --- REAL XR PASSTHROUGH MODE ---
    // Place potion slightly in front of user's current gaze / room floor
    const cameraEl = document.querySelector('#camera');
    const camPos = cameraEl.getAttribute('position');
    
    const posX = camPos.x + (Math.random() * 0.8 - 0.4);
    const posZ = camPos.z - 1.5 - Math.random();
    const posY = 0.0; // Snapped to floor surface detected by headset

    potion.setAttribute('position', `${posX} ${posY} ${posZ}`);
  } else {
    // --- TABLET / EMULATOR FALLBACK MODE ---
    // Spawns at simulated desk height (Y = 0.8 meters) so you can test on your tablet screen
    const posX = (Math.random() * 1.5 - 0.75).toFixed(2);
    const posY = 0.8; 
    const posZ = (-Math.random() * 1 - 1).toFixed(2);

    potion.setAttribute('position', `${posX} ${posY} ${posZ}`);
  }

  container.appendChild(potion);
}

// Automatically spawn a new health potion every 15 seconds
setInterval(spawnHealthPotion, 15000);
