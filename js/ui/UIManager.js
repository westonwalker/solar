class UIManager {
	constructor(game) {
		this.game = game;

		// Get UI elements
		this.speedElement = document.getElementById("speed");
		this.fuelElement = document.getElementById("fuel");
		this.objectivesElement = document.getElementById("objectives");
		this.minimapElement = document.getElementById("minimap");
		this.controlsElement = document.getElementById("controls");

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
