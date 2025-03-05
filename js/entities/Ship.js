class Ship extends Entity {
	constructor(game) {
		super(game);

		this.maxSpeed = 100;
		this.acceleration = 50;
		this.rotationSpeed = 2;
		this.health = 100;
		this.maxHealth = 100;
		this.fuel = 100;
		this.maxFuel = 100;
		this.fuelConsumption = 0.1;

		this.weapons = [];
		this.createShipMesh();
	}

	createShipMesh() {
		// Create a basic ship geometry
		const geometry = new THREE.ConeGeometry(1, 4, 8);
		geometry.rotateX(Math.PI / 2);

		const material = new THREE.MeshPhongMaterial({
			color: 0x888888,
			shininess: 30,
		});

		this.mesh = new THREE.Mesh(geometry, material);
		this.game.scene.add(this.mesh);
	}

	update(deltaTime) {
		super.update(deltaTime);

		// Update fuel based on velocity
		if (this.velocity.lengthSq() > 0) {
			this.fuel = Math.max(
				0,
				this.fuel - this.fuelConsumption * deltaTime
			);
		}

		// Update weapons
		for (const weapon of this.weapons) {
			weapon.update(deltaTime);
		}
	}

	accelerate(direction, deltaTime) {
		if (this.fuel <= 0) return;

		const acceleration = new THREE.Vector3();
		acceleration
			.copy(direction)
			.multiplyScalar(this.acceleration * deltaTime);

		this.velocity.add(acceleration);

		// Limit speed
		if (this.velocity.length() > this.maxSpeed) {
			this.velocity.normalize().multiplyScalar(this.maxSpeed);
		}
	}

	rotate(axis, angle) {
		const rotation = new THREE.Quaternion();
		rotation.setFromAxisAngle(axis, angle * this.rotationSpeed);
		this.quaternion.multiply(rotation);
	}

	lookAt(targetPosition) {
		// Create a direction vector from the ship to the target
		const direction = new THREE.Vector3();
		direction.subVectors(targetPosition, this.position).normalize();

		// Create a quaternion that rotates the ship's forward vector to face the target
		const forward = new THREE.Vector3(0, 0, -1); // Ship's forward direction
		this.quaternion.setFromUnitVectors(forward, direction);

		// Apply the same rotation to the mesh
		if (this.mesh) {
			this.mesh.quaternion.copy(this.quaternion);
		}
	}

	takeDamage(amount) {
		this.health = Math.max(0, this.health - amount);
		if (this.health <= 0) {
			this.destroy();
		}
	}

	addWeapon(weapon) {
		this.weapons.push(weapon);
	}

	fireWeapon(index) {
		if (index >= 0 && index < this.weapons.length) {
			this.weapons[index].fire();
		}
	}
}
