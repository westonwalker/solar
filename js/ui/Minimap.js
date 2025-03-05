class Minimap {
	constructor(game, element) {
		this.game = game;
		this.element = element;

		// Create canvas
		this.canvas = document.createElement("canvas");
		this.canvas.width = 200;
		this.canvas.height = 200;
		this.element.appendChild(this.canvas);

		this.ctx = this.canvas.getContext("2d");

		// Minimap settings
		this.scale = 0.01; // Scale factor for converting world coordinates to minimap
		this.centerX = this.canvas.width / 2;
		this.centerY = this.canvas.height / 2;
		this.maxRange = 5000; // Maximum range to show on minimap
	}

	update() {
		this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw background
		this.ctx.fillStyle = "rgba(0, 0, 0, 0.8)";
		this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

		// Draw grid
		this.drawGrid();

		// Draw entities
		this.drawEntities();

		// Draw player's view cone
		this.drawViewCone();

		// Draw border
		this.ctx.strokeStyle = "#0ff";
		this.ctx.lineWidth = 2;
		this.ctx.strokeRect(0, 0, this.canvas.width, this.canvas.height);
	}

	drawGrid() {
		const gridSize = 50;
		this.ctx.strokeStyle = "rgba(0, 255, 255, 0.2)";
		this.ctx.lineWidth = 1;

		// Vertical lines
		for (let x = 0; x <= this.canvas.width; x += gridSize) {
			this.ctx.beginPath();
			this.ctx.moveTo(x, 0);
			this.ctx.lineTo(x, this.canvas.height);
			this.ctx.stroke();
		}

		// Horizontal lines
		for (let y = 0; y <= this.canvas.height; y += gridSize) {
			this.ctx.beginPath();
			this.ctx.moveTo(0, y);
			this.ctx.lineTo(this.canvas.width, y);
			this.ctx.stroke();
		}
	}

	drawEntities() {
		if (!this.game.player) return;

		const playerPos = this.game.player.position;

		// Draw all entities
		for (const entity of this.game.entities) {
			// Calculate relative position to player
			const dx = entity.position.x - playerPos.x;
			const dz = entity.position.z - playerPos.z;

			// Skip if outside maximum range
			if (Math.sqrt(dx * dx + dz * dz) > this.maxRange) continue;

			// Convert to minimap coordinates
			const x = this.centerX + dx * this.scale;
			const y = this.centerY + dz * this.scale;

			// Draw different entities with different styles
			if (entity instanceof PlayerShip) {
				this.drawPlayer(x, y);
			} else if (entity instanceof EnemyShip) {
				this.drawEnemy(x, y);
			} else if (entity instanceof Planet) {
				this.drawPlanet(x, y, entity);
			}
		}
	}

	drawPlayer(x, y) {
		// Draw player triangle
		this.ctx.save();
		this.ctx.translate(x, y);
		this.ctx.rotate(this.game.player.rotation.y);

		this.ctx.beginPath();
		this.ctx.moveTo(0, -8);
		this.ctx.lineTo(-5, 8);
		this.ctx.lineTo(5, 8);
		this.ctx.closePath();

		this.ctx.fillStyle = "#0f0";
		this.ctx.fill();

		this.ctx.restore();
	}

	drawEnemy(x, y) {
		// Draw enemy as red dot with outline
		this.ctx.beginPath();
		this.ctx.arc(x, y, 4, 0, Math.PI * 2);
		this.ctx.fillStyle = "#f00";
		this.ctx.fill();
		this.ctx.strokeStyle = "#fff";
		this.ctx.stroke();
	}

	drawPlanet(x, y, planet) {
		// Draw planet as circle with size based on radius
		const size = Math.max(4, planet.radius * this.scale);

		this.ctx.beginPath();
		this.ctx.arc(x, y, size, 0, Math.PI * 2);

		// Color based on planet type
		switch (planet.type) {
			case "gas":
				this.ctx.fillStyle = "#44f";
				break;
			case "ice":
				this.ctx.fillStyle = "#8ff";
				break;
			case "rocky":
			default:
				this.ctx.fillStyle = "#888";
				break;
		}

		this.ctx.fill();
	}

	drawViewCone() {
		if (!this.game.player) return;

		// Draw view cone representing player's field of view
		this.ctx.save();
		this.ctx.translate(this.centerX, this.centerY);
		this.ctx.rotate(this.game.player.rotation.y);

		this.ctx.beginPath();
		this.ctx.moveTo(0, 0);
		this.ctx.arc(0, 0, this.canvas.width, -Math.PI / 4, Math.PI / 4);
		this.ctx.closePath();

		this.ctx.fillStyle = "rgba(0, 255, 0, 0.1)";
		this.ctx.fill();

		this.ctx.restore();
	}
}
