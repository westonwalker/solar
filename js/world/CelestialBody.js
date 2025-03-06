class CelestialBody extends Entity {
	constructor(game, options = {}) {
		super(game);

		this.radius = options.radius || 100;
		this.rotationSpeed = options.rotationSpeed || 0.01;
		this.orbitSpeed = options.orbitSpeed || 0;
		this.orbitDistance = options.orbitDistance || 0;

		// Ensure orbitCenter is a Vector3 object
		if (options.orbitCenter) {
			this.orbitCenter = options.orbitCenter.clone
				? options.orbitCenter.clone()
				: new THREE.Vector3(0, 0, 0);
		} else {
			this.orbitCenter = new THREE.Vector3(0, 0, 0);
		}

		this.isPlanetMoon = false;
		this.parentPlanet = null;

		// Add to game entities
		this.game.addEntity(this);
	}

	update(deltaTime) {
		super.update(deltaTime);

		// Rotate around own axis
		if (this.mesh && this.rotationSpeed) {
			this.mesh.rotation.y += this.rotationSpeed * deltaTime;
		}

		// Orbit around center if specified
		if (this.orbitCenter && this.orbitSpeed) {
			// For moons, we need to update their orbit center as the planet moves
			if (this.isPlanetMoon && this.parentPlanet) {
				this.orbitCenter.copy(this.parentPlanet.position);
			}

			const currentAngle = Math.atan2(
				this.position.z - this.orbitCenter.z,
				this.position.x - this.orbitCenter.x
			);

			const newAngle = currentAngle + this.orbitSpeed * deltaTime;

			// Calculate new position
			const newX =
				this.orbitCenter.x + Math.cos(newAngle) * this.orbitDistance;
			const newZ =
				this.orbitCenter.z + Math.sin(newAngle) * this.orbitDistance;

			// Update position
			this.position.x = newX;
			this.position.z = newZ;
		}
	}
}
