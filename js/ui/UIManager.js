class UIManager {
	constructor(game) {
		this.game = game;

		// Get UI elements
		this.speedElement = document.getElementById("speed");
		this.fuelElement = document.getElementById("fuel");
		this.objectivesElement = document.getElementById("objectives");
		this.minimapElement = document.getElementById("minimap");
		this.controlsElement = document.getElementById("controls");

		// Planet info panel elements
		this.planetInfoPanel = document.getElementById("planet-info-panel");
		this.planetNameElement = document.getElementById("planet-name");
		this.planetTypeElement = document.getElementById("planet-type");
		this.planetSizeElement = document.getElementById("planet-size");
		this.planetDistanceElement = document.getElementById("planet-distance");
		this.planetAtmosphereElement =
			document.getElementById("planet-atmosphere");
		this.planetDescriptionElement =
			document.getElementById("planet-description");

		// Currently targeted planet
		this.targetedPlanet = null;

		// Create minimap
		this.minimap = new Minimap(this.game, this.minimapElement);

		// Initialize objectives
		this.objectives = [
			"Explore the solar system",
			"Visit Earth's moon",
			"Navigate through the asteroid belt",
		];

		this.updateObjectives();
	}

	update() {
		this.updateSpeed();
		this.updateFuel();
		this.minimap.update();
	}

	updateSpeed() {
		if (!this.game.player) return;

		const speed = this.game.player.velocity.length();
		const speedKmh = Math.round(speed * 3.6); // Convert to km/h
		this.speedElement.textContent = `Speed: ${speedKmh} km/h`;
	}

	updateFuel() {
		if (!this.game.player) return;

		const fuelPercent = Math.round(
			(this.game.player.fuel / this.game.player.maxFuel) * 100
		);
		this.fuelElement.textContent = `Fuel: ${fuelPercent}%`;

		// Add warning class if fuel is low
		if (fuelPercent < 20) {
			this.fuelElement.classList.add("warning");
		} else {
			this.fuelElement.classList.remove("warning");
		}
	}

	updateObjectives() {
		this.objectivesElement.innerHTML =
			"Current Objectives:<br>" +
			this.objectives.map((obj) => `• ${obj}`).join("<br>");
	}

	addObjective(objective) {
		this.objectives.push(objective);
		this.updateObjectives();
	}

	removeObjective(objective) {
		const index = this.objectives.indexOf(objective);
		if (index !== -1) {
			this.objectives.splice(index, 1);
			this.updateObjectives();
		}
	}

	// Show planet information panel with details about the targeted planet
	showPlanetInfo(planet) {
		if (!planet) return;

		// If we're already showing info for this planet, don't update
		if (this.targetedPlanet === planet) return;

		console.log("UIManager: Showing info for planet", planet.name);

		this.targetedPlanet = planet;

		// Get planet details
		const details = planet.getPlanetDetails();

		// Update UI elements
		this.planetNameElement.textContent = details.name;
		this.planetTypeElement.textContent = `Type: ${details.type}`;
		this.planetSizeElement.textContent = `Size: ${details.size}`;
		this.planetDistanceElement.textContent = `Distance from Sun: ${details.distanceFromSun}`;
		this.planetAtmosphereElement.textContent = `Atmosphere: ${details.atmosphere}`;
		this.planetDescriptionElement.textContent = details.description;

		// Show the panel - make sure it's visible first, then fade in
		this.planetInfoPanel.style.display = "block";

		// Force a reflow to ensure the display change takes effect before changing opacity
		void this.planetInfoPanel.offsetWidth;

		// Add a small delay before fading in (for transition effect)
		setTimeout(() => {
			this.planetInfoPanel.style.opacity = "1";
		}, 10);
	}

	// Hide planet information panel
	hidePlanetInfo() {
		if (!this.planetInfoPanel) return;

		this.targetedPlanet = null;

		// Fade out
		this.planetInfoPanel.style.opacity = "0";

		// Hide after transition
		setTimeout(() => {
			this.planetInfoPanel.style.display = "none";
		}, 300);
	}

	showMessage(message, duration = 3000) {
		// Create message element
		const messageElement = document.createElement("div");
		messageElement.className = "game-message";
		messageElement.textContent = message;

		// Add to DOM
		document.body.appendChild(messageElement);

		// Animate in
		setTimeout(() => {
			messageElement.classList.add("visible");
		}, 10);

		// Remove after duration
		setTimeout(() => {
			messageElement.classList.remove("visible");
			setTimeout(() => {
				messageElement.remove();
			}, 500);
		}, duration);
	}

	// Show autopilot message below the ship instead of in the center
	showAutopilotMessage(message, duration = 3000) {
		// Create message element
		const messageElement = document.createElement("div");
		messageElement.className = "autopilot-message";
		messageElement.textContent = message;

		// Add to DOM
		document.body.appendChild(messageElement);

		// Animate in
		setTimeout(() => {
			messageElement.classList.add("visible");
		}, 10);

		// Remove after duration
		setTimeout(() => {
			messageElement.classList.remove("visible");
			setTimeout(() => {
				messageElement.remove();
			}, 500);
		}, duration);
	}

	showDamageIndicator(damage) {
		// Create damage indicator
		const indicator = document.createElement("div");
		indicator.className = "damage-indicator";
		indicator.textContent = `-${damage}`;

		// Position randomly around the center of the screen
		const angle = Math.random() * Math.PI * 2;
		const distance = 100;
		const x = Math.cos(angle) * distance;
		const y = Math.sin(angle) * distance;

		indicator.style.transform = `translate(${x}px, ${y}px)`;

		// Add to DOM
		document.body.appendChild(indicator);

		// Animate and remove
		setTimeout(() => {
			indicator.classList.add("fade-out");
			setTimeout(() => {
				indicator.remove();
			}, 1000);
		}, 10);
	}
}
