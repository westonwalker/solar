class EnemyShip extends Ship {
	constructor(game) {
		super(game);

		// Override base ship properties
		this.maxSpeed = 100;
		this.acceleration = 40;
		this.rotationSpeed = 1.5;
		this.health = 50;
		this.maxHealth = 50;

		// AI properties
		this.detectionRange = 500;
		this.attackRange = 200;
		this.state = "patrol";
		this.patrolPoint = null;
		this.patrolRadius = 100;
		this.lastStateChange = 0;
		this.stateTimeout = 5;

		this.createEnemyShipMesh();
	}

	createEnemyShipMesh() {
		// Create a distinctive enemy ship appearance
		const geometry = new THREE.Group();

		// Main body
		const body = new THREE.Mesh(
			new THREE.ConeGeometry(1, 3, 6),
			new THREE.MeshPhongMaterial({ color: 0xff3366, shininess: 30 })
		);
		body.rotateX(Math.PI / 2);
		geometry.add(body);

		// Wings
		const wingGeometry = new THREE.BoxGeometry(3, 0.2, 0.8);
		const wingMaterial = new THREE.MeshPhongMaterial({ color: 0xdd2255 });

		const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
		leftWing.position.set(-1.5, 0, -0.5);
		leftWing.rotation.z = Math.PI / 6;
		geometry.add(leftWing);

		const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
		rightWing.position.set(1.5, 0, -0.5);
		rightWing.rotation.z = -Math.PI / 6;
		geometry.add(rightWing);

		// Replace the basic mesh with our detailed one
		if (this.mesh) {
			this.game.scene.remove(this.mesh);
		}
		this.mesh = geometry;
		this.game.scene.add(this.mesh);
	}

	update(deltaTime) {
		const currentTime = performance.now() / 1000;

		// Get distance to player
		const distanceToPlayer = this.position.distanceTo(
			this.game.player.position
		);

		// State machine
		switch (this.state) {
			case "patrol":
				this.updatePatrol(deltaTime);

				// Transition to chase if player is detected
				if (distanceToPlayer < this.detectionRange) {
					this.state = "chase";
					this.lastStateChange = currentTime;
				}
				break;

			case "chase":
				this.updateChase(deltaTime);

				// Transition to attack if in range
				if (distanceToPlayer < this.attackRange) {
					this.state = "attack";
					this.lastStateChange = currentTime;
				}
				// Return to patrol if player is too far
				else if (distanceToPlayer > this.detectionRange * 1.5) {
					this.state = "patrol";
					this.lastStateChange = currentTime;
				}
				break;

			case "attack":
				this.updateAttack(deltaTime);

				// Return to chase if player is too far
				if (distanceToPlayer > this.attackRange * 1.2) {
					this.state = "chase";
					this.lastStateChange = currentTime;
				}
				break;
		}

		super.update(deltaTime);
	}

	updatePatrol(deltaTime) {
		// Generate new patrol point if needed
		if (
			!this.patrolPoint ||
			this.position.distanceTo(this.patrolPoint) < 5
		) {
			this.generatePatrolPoint();
		}

		// Move towards patrol point
		this.moveTowards(this.patrolPoint, deltaTime);
	}

	updateChase(deltaTime) {
		// Move towards player
		this.moveTowards(this.game.player.position, deltaTime);
	}

	updateAttack(deltaTime) {
		// Keep some distance while attacking
		const toPlayer = new THREE.Vector3().subVectors(
			this.game.player.position,
			this.position
		);
		const idealDistance = this.attackRange * 0.7;
		const currentDistance = toPlayer.length();

		if (currentDistance < idealDistance) {
			// Back away
			this.moveTowards(
				this.position.clone().sub(toPlayer.normalize()),
				deltaTime
			);
		} else {
			// Move closer
			this.moveTowards(this.game.player.position, deltaTime);
		}

		// Fire weapons
		this.fireWeapon(0);
	}

	moveTowards(target, deltaTime) {
		const direction = new THREE.Vector3()
			.subVectors(target, this.position)
			.normalize();

		// Calculate rotation to face target
		const targetQuaternion = new THREE.Quaternion();
		const up = new THREE.Vector3(0, 1, 0);
		targetQuaternion.setFromUnitVectors(
			new THREE.Vector3(0, 0, 1),
			direction
		);

		// Smoothly rotate towards target
		this.quaternion.slerp(targetQuaternion, this.rotationSpeed * deltaTime);

		// Move forward
		this.accelerate(direction, deltaTime);
	}

	generatePatrolPoint() {
		const angle = Math.random() * Math.PI * 2;
		const radius = Math.random() * this.patrolRadius;

		this.patrolPoint = new THREE.Vector3(
			this.position.x + Math.cos(angle) * radius,
			this.position.y + (Math.random() - 0.5) * this.patrolRadius * 0.5,
			this.position.z + Math.sin(angle) * radius
		);
	}
}
