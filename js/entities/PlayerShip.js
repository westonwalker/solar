class PlayerShip extends Ship {
	constructor(game) {
		super(game);

		// Override base ship properties with faster speeds
		this.maxSpeed = 250;
		this.acceleration = 150;
		this.rotationSpeed = 2.5;

		// Add turbo properties
		this.turboMultiplier = 2.0;
		this.isTurboActive = false;

		// Braking properties
		this.deceleration = 300; // Units per second
		this.isBreaking = false;

		// Engine visual properties
		this.engineLight = null;
		this.engineExhaust = null;
		this.engineNozzle = null;
		this.isEngineActive = false;

		// Weapon properties
		this.weaponCooldown = 0.2; // Time between shots in seconds
		this.lastFireTime = 0;

		// Autopilot properties
		this.isAutopilotActive = false;
		this.autopilotTarget = null;
		this.autopilotCloseDistance = 150; // Distance to consider "close" to planet
		this.autopilotFollowDistance = 200; // Distance to maintain when following

		// Player-specific properties
		this.input = {
			forward: false,
			backward: false,
			left: false,
			right: false,
			up: false,
			down: false,
			rollLeft: false,
			rollRight: false,
			turbo: false,
			fire: false,
			brake: false,
		};

		this.createPlayerShipMesh();
		this.setupControls();
	}

	createPlayerShipMesh() {
		// Create a more detailed player ship
		const geometry = new THREE.Group();

		// Main body
		const body = new THREE.Mesh(
			new THREE.ConeGeometry(1, 4, 8),
			new THREE.MeshPhongMaterial({ color: 0x3366ff, shininess: 30 })
		);
		body.rotateX(Math.PI / 2);
		geometry.add(body);

		// Wings
		const wingGeometry = new THREE.BoxGeometry(4, 0.2, 1);
		const wingMaterial = new THREE.MeshPhongMaterial({ color: 0x2255dd });

		const leftWing = new THREE.Mesh(wingGeometry, wingMaterial);
		leftWing.position.set(-2, 0, -1);
		geometry.add(leftWing);

		const rightWing = new THREE.Mesh(wingGeometry, wingMaterial);
		rightWing.position.set(2, 0, -1);
		geometry.add(rightWing);

		// Add engine nozzle
		const nozzleGeometry = new THREE.CylinderGeometry(0.3, 0.5, 0.5, 16);
		const nozzleMaterial = new THREE.MeshPhongMaterial({
			color: 0x444444,
			shininess: 50,
			emissive: 0x444444,
		});
		this.engineNozzle = new THREE.Mesh(nozzleGeometry, nozzleMaterial);
		this.engineNozzle.position.set(0, 0, 2); // Position at back of ship
		this.engineNozzle.rotation.x = Math.PI / 2;
		geometry.add(this.engineNozzle);

		// Add engine exhaust
		const exhaustGeometry = new THREE.ConeGeometry(0.4, 2, 16);
		const exhaustMaterial = new THREE.MeshPhongMaterial({
			color: 0x00ffff,
			transparent: true,
			opacity: 0.7,
			emissive: 0x00ffff,
			emissiveIntensity: 0.5,
		});
		this.engineExhaust = new THREE.Mesh(exhaustGeometry, exhaustMaterial);
		this.engineExhaust.position.set(0, 0, 2.5); // Position behind nozzle
		this.engineExhaust.rotation.x = Math.PI / 2;
		this.engineExhaust.scale.set(0, 0, 0); // Start hidden
		geometry.add(this.engineExhaust);

		// Add engine light
		this.engineLight = new THREE.PointLight(0x00ffff, 0, 5);
		this.engineLight.position.copy(this.engineExhaust.position);
		geometry.add(this.engineLight);

		// Replace the basic mesh with our detailed one
		if (this.mesh) {
			this.game.scene.remove(this.mesh);
		}
		this.mesh = geometry;
		this.game.scene.add(this.mesh);
	}

	setupControls() {
		document.addEventListener("keydown", (e) => this.handleKeyDown(e));
		document.addEventListener("keyup", (e) => this.handleKeyUp(e));
	}

	handleKeyDown(event) {
		switch (event.code) {
			case "KeyW":
				this.input.forward = true;
				break;
			case "KeyS":
				this.input.backward = true;
				break;
			case "KeyA":
				this.input.left = true;
				break;
			case "KeyD":
				this.input.right = true;
				break;
			case "ArrowUp":
				this.input.up = true;
				break;
			case "ArrowDown":
				this.input.down = true;
				break;
			case "KeyQ":
				this.input.rollLeft = true;
				break;
			case "KeyE":
				this.input.rollRight = true;
				break;
			case "ShiftLeft":
				this.input.turbo = true;
				break;
			case "KeyV":
				this.isBreaking = true;
				break;
			case "KeyR":
				this.toggleAutopilot();
				break;
			case "Mouse1":
			case "Space":
				this.input.fire = true;
				break;
		}
	}

	handleKeyUp(event) {
		switch (event.code) {
			case "KeyW":
				this.input.forward = false;
				break;
			case "KeyS":
				this.input.backward = false;
				break;
			case "KeyA":
				this.input.left = false;
				break;
			case "KeyD":
				this.input.right = false;
				break;
			case "ArrowUp":
				this.input.up = false;
				break;
			case "ArrowDown":
				this.input.down = false;
				break;
			case "KeyQ":
				this.input.rollLeft = false;
				break;
			case "KeyE":
				this.input.rollRight = false;
				break;
			case "ShiftLeft":
				this.input.turbo = false;
				break;
			case "KeyV":
				this.isBreaking = false;
				break;
			case "Mouse1":
			case "Space":
				this.input.fire = false;
				break;
		}
	}

	update(deltaTime) {
		// Handle autopilot if active
		if (this.isAutopilotActive && this.autopilotTarget) {
			this.updateAutopilot(deltaTime);
		} else {
			// Update turbo status
			this.isTurboActive = this.input.turbo;
			const currentMaxSpeed = this.isTurboActive
				? this.maxSpeed * this.turboMultiplier
				: this.maxSpeed;
			const currentAcceleration = this.isTurboActive
				? this.acceleration * this.turboMultiplier
				: this.acceleration;

			// Update engine visuals
			this.isEngineActive = this.input.forward;
			if (this.isEngineActive) {
				const scale = this.isTurboActive ? 1.5 : 1.0;
				this.engineExhaust.scale.set(scale, scale, scale * 1.5);
				this.engineLight.intensity = this.isTurboActive ? 2 : 1;

				// Animate exhaust
				this.engineExhaust.material.emissiveIntensity =
					0.5 + Math.random() * 0.5;
				this.engineNozzle.material.emissiveIntensity =
					0.2 + Math.random() * 0.3;
			} else {
				this.engineExhaust.scale.set(0, 0, 0);
				this.engineLight.intensity = 0;
				this.engineNozzle.material.emissiveIntensity = 0;
			}

			// Handle braking
			if (this.isBreaking && this.velocity.length() > 0) {
				const brakingForce = Math.min(
					this.deceleration * deltaTime,
					this.velocity.length()
				);
				this.velocity.multiplyScalar(
					1 - brakingForce / this.velocity.length()
				);
			}

			// Handle movement
			const direction = new THREE.Vector3();

			// Forward/backward movement in local space
			if (this.input.forward) {
				direction.z -= 1;
			}
			if (this.input.backward) {
				direction.z += 1;
			}

			// Handle all rotations
			if (this.input.left) {
				this.rotate(new THREE.Vector3(0, 1, 0), deltaTime);
			}
			if (this.input.right) {
				this.rotate(new THREE.Vector3(0, -1, 0), deltaTime);
			}
			if (this.input.up) {
				this.rotate(new THREE.Vector3(1, 0, 0), deltaTime);
			}
			if (this.input.down) {
				this.rotate(new THREE.Vector3(-1, 0, 0), deltaTime);
			}
			if (this.input.rollLeft) {
				this.rotate(new THREE.Vector3(0, 0, 1), deltaTime);
			}
			if (this.input.rollRight) {
				this.rotate(new THREE.Vector3(0, 0, -1), deltaTime);
			}

			// Transform direction to world space
			direction.applyQuaternion(this.quaternion);

			if (direction.lengthSq() > 0) {
				direction.normalize();

				// Create a temporary acceleration vector
				const acceleration = direction.multiplyScalar(
					currentAcceleration * deltaTime
				);
				this.velocity.add(acceleration);

				// Limit speed
				if (this.velocity.length() > currentMaxSpeed) {
					this.velocity.normalize().multiplyScalar(currentMaxSpeed);
				}
			}

			// Handle weapons
			if (this.input.fire) {
				this.fireWeapon(0);
			}
		}

		// Update planet targeting
		this.updateTargeting();

		super.update(deltaTime);
	}

	fireWeapon(index) {
		const currentTime = performance.now() / 1000;
		if (currentTime - this.lastFireTime < this.weaponCooldown) {
			return; // Still in cooldown
		}

		// Get the ship's forward direction vector
		const forward = new THREE.Vector3(0, 0, -1);
		forward.applyQuaternion(this.mesh.quaternion);

		// Get the ship's right vector for wing offsets
		const right = new THREE.Vector3(1, 0, 0);
		right.applyQuaternion(this.mesh.quaternion);

		// Calculate gun positions relative to ship's current orientation
		const wingOffset = 2; // Match the wing position from createPlayerShipMesh

		// Left gun position = ship position - (right * wingOffset)
		const leftGunPos = this.position
			.clone()
			.sub(right.clone().multiplyScalar(wingOffset));

		// Right gun position = ship position + (right * wingOffset)
		const rightGunPos = this.position
			.clone()
			.add(right.clone().multiplyScalar(wingOffset));

		// Move gun positions slightly forward
		const forwardOffset = 1;
		leftGunPos.add(forward.clone().multiplyScalar(forwardOffset));
		rightGunPos.add(forward.clone().multiplyScalar(forwardOffset));

		// Create projectiles using the pool, using ship's forward direction
		const leftProjectile = Projectile.getProjectile(
			this.game,
			this,
			forward.clone(),
			{
				speed: 400,
				damage: 20,
				color: 0x00ff00,
				position: leftGunPos,
			}
		);

		const rightProjectile = Projectile.getProjectile(
			this.game,
			this,
			forward.clone(),
			{
				speed: 400,
				damage: 20,
				color: 0x00ff00,
				position: rightGunPos,
			}
		);

		// Only update cooldown if at least one projectile was created
		if (leftProjectile || rightProjectile) {
			this.lastFireTime = currentTime;
		}
	}

	stopShip() {
		this.isBreaking = true;
	}

	updateTargeting() {
		// Ensure Planet class is defined
		if (typeof Planet === "undefined") {
			console.error("Planet class is not defined");
			return;
		}

		// Get the forward direction of the ship
		const forward = new THREE.Vector3(0, 0, -1);
		forward.applyQuaternion(this.quaternion);

		// Maximum targeting distance
		const maxDistance = 5000;

		// Find all planets in the game
		const planets = this.game.entities.filter(
			(entity) => entity instanceof Planet
		);

		if (planets.length === 0) {
			console.warn("No planets found in game entities");
		}

		// Track which planets should be targeted
		const planetsToTarget = [];

		// Check for planets in the forward direction
		planets.forEach((planet) => {
			// Calculate distance to planet
			const distance = this.position.distanceTo(planet.position);

			// Skip if too far away
			if (distance > maxDistance) return;

			// Calculate direction to planet
			const directionToTarget = new THREE.Vector3();
			directionToTarget
				.subVectors(planet.position, this.position)
				.normalize();

			// Calculate the overall angle between forward vector and direction to planet
			const angle = forward.angleTo(directionToTarget);

			// Calculate horizontal angle by projecting vectors onto the XZ plane
			const forwardXZ = new THREE.Vector3(
				forward.x,
				0,
				forward.z
			).normalize();
			const directionXZ = new THREE.Vector3(
				directionToTarget.x,
				0,
				directionToTarget.z
			).normalize();
			const horizontalAngle = forwardXZ.angleTo(directionXZ);

			// Calculate vertical angle by comparing Y components
			const verticalAngle = Math.abs(
				Math.asin(forward.y) - Math.asin(directionToTarget.y)
			);

			// More forgiving targeting conditions:
			// - Horizontal angle must be within 10 degrees (same as before)
			// - Vertical angle can be within 20 degrees (more forgiving)
			// - OR overall angle is very small (5 degrees)
			const horizontalThreshold = Math.PI / 18; // 10 degrees
			const verticalThreshold = Math.PI / 9; // 20 degrees
			const overallThreshold = Math.PI / 36; // 5 degrees

			const isTargeted =
				(horizontalAngle < horizontalThreshold &&
					verticalAngle < verticalThreshold) ||
				angle < overallThreshold;

			if (isTargeted) {
				// Add to the list of planets to target
				planetsToTarget.push(planet);
			}
		});

		// Update targeting status for all planets
		planets.forEach((planet) => {
			const shouldBeTargeted = planetsToTarget.includes(planet);

			// Only show/hide if the targeting status has changed
			if (shouldBeTargeted && !planet.isTargeted) {
				console.log(`Targeting planet: ${planet.name}`);
				planet.showReticule();
			} else if (!shouldBeTargeted && planet.isTargeted) {
				planet.hideReticule();
			}
		});

		// If autopilot is active but target is no longer targeted, deactivate autopilot
		if (
			this.isAutopilotActive &&
			this.autopilotTarget &&
			!this.autopilotTarget.isTargeted
		) {
			this.deactivateAutopilot();
		}
	}

	// Toggle autopilot for the currently targeted planet
	toggleAutopilot() {
		if (this.isAutopilotActive) {
			this.deactivateAutopilot();
		} else {
			this.activateAutopilot();
		}
	}

	// Activate autopilot for the currently targeted planet
	activateAutopilot() {
		// Find the currently targeted planet
		const targetedPlanet = this.game.entities.find(
			(entity) => entity instanceof Planet && entity.isTargeted
		);

		if (targetedPlanet) {
			this.autopilotTarget = targetedPlanet;
			this.isAutopilotActive = true;

			// Show message to user
			if (this.game.ui) {
				this.game.ui.showAutopilotMessage(
					`Autopilot engaged: ${targetedPlanet.name}`,
					3000
				);
			}

			console.log(`Autopilot engaged: ${targetedPlanet.name}`);
		} else {
			console.log("No planet targeted for autopilot");
			if (this.game.ui) {
				this.game.ui.showAutopilotMessage(
					"No planet targeted for autopilot",
					3000
				);
			}
		}
	}

	// Deactivate autopilot
	deactivateAutopilot() {
		if (this.isAutopilotActive) {
			this.isAutopilotActive = false;
			this.autopilotTarget = null;

			// Show message to user
			if (this.game.ui) {
				this.game.ui.showAutopilotMessage("Autopilot disengaged", 3000);
			}

			console.log("Autopilot disengaged");
		}
	}

	// Update autopilot logic
	updateAutopilot(deltaTime) {
		if (!this.autopilotTarget) return;

		// Calculate distance to target
		const distanceToTarget = this.position.distanceTo(
			this.autopilotTarget.position
		);

		// Calculate direction to target
		const directionToTarget = new THREE.Vector3();
		directionToTarget
			.subVectors(this.autopilotTarget.position, this.position)
			.normalize();

		// Always face the target
		this.lookAt(this.autopilotTarget.position);

		// Determine if we're close enough to the planet
		const isClose =
			distanceToTarget <=
			this.autopilotCloseDistance + this.autopilotTarget.radius;

		if (isClose) {
			// We're close to the planet, so follow it at a fixed distance
			// Calculate the desired position (at a fixed distance from the planet)
			const desiredDistance =
				this.autopilotFollowDistance + this.autopilotTarget.radius;

			// Calculate the desired velocity to match the planet's orbital velocity
			const planetVelocity = new THREE.Vector3();

			// If the planet has an orbit speed, calculate its tangential velocity
			if (
				this.autopilotTarget.orbitSpeed &&
				this.autopilotTarget.orbitCenter
			) {
				// Get the direction from orbit center to planet
				const orbitDirection = new THREE.Vector3();
				orbitDirection
					.subVectors(
						this.autopilotTarget.position,
						this.autopilotTarget.orbitCenter
					)
					.normalize();

				// Calculate the perpendicular vector (tangent to orbit)
				const tangent = new THREE.Vector3(
					-orbitDirection.z,
					0,
					orbitDirection.x
				).normalize();

				// Calculate the orbital velocity magnitude (speed = distance * angular velocity)
				const orbitSpeed =
					this.autopilotTarget.orbitDistance *
					this.autopilotTarget.orbitSpeed;

				// Set the planet velocity to the tangential velocity
				planetVelocity.copy(tangent).multiplyScalar(orbitSpeed);
			}

			// Calculate the desired position (at a fixed distance from the planet in the direction from planet to ship)
			const fromPlanetToShip = new THREE.Vector3();
			fromPlanetToShip
				.subVectors(this.position, this.autopilotTarget.position)
				.normalize();

			const desiredPosition = new THREE.Vector3();
			desiredPosition
				.copy(this.autopilotTarget.position)
				.add(fromPlanetToShip.multiplyScalar(desiredDistance));

			// Calculate the direction to the desired position
			const directionToDesired = new THREE.Vector3();
			directionToDesired
				.subVectors(desiredPosition, this.position)
				.normalize();

			// Calculate the desired velocity (to reach the desired position + match planet velocity)
			const desiredVelocity = new THREE.Vector3();
			desiredVelocity.copy(directionToDesired).multiplyScalar(50); // Base velocity towards desired position
			desiredVelocity.add(planetVelocity); // Add planet's orbital velocity

			// Gradually adjust our velocity to match the desired velocity
			const adjustment = new THREE.Vector3();
			adjustment
				.subVectors(desiredVelocity, this.velocity)
				.multiplyScalar(2 * deltaTime);
			this.velocity.add(adjustment);

			// Limit speed to avoid overshooting
			const maxFollowSpeed = 100;
			if (this.velocity.length() > maxFollowSpeed) {
				this.velocity.normalize().multiplyScalar(maxFollowSpeed);
			}
		} else {
			// We're still traveling to the planet
			// Accelerate towards the target
			const acceleration = directionToTarget.multiplyScalar(
				this.acceleration * deltaTime
			);
			this.velocity.add(acceleration);

			// Limit speed based on distance (slow down as we approach)
			const distanceFactor = Math.min(1, distanceToTarget / 1000);
			const approachSpeed = this.maxSpeed * (0.5 + 0.5 * distanceFactor);

			if (this.velocity.length() > approachSpeed) {
				this.velocity.normalize().multiplyScalar(approachSpeed);
			}
		}

		// Update engine visuals based on autopilot status
		this.isEngineActive = true;
		const scale = isClose ? 0.8 : 1.2;
		this.engineExhaust.scale.set(scale, scale, scale * 1.5);
		this.engineLight.intensity = isClose ? 0.8 : 1.5;

		// Animate exhaust
		this.engineExhaust.material.emissiveIntensity =
			0.5 + Math.random() * 0.5;
		this.engineNozzle.material.emissiveIntensity =
			0.2 + Math.random() * 0.3;
	}
}
