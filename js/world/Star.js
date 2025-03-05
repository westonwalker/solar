class Star extends CelestialBody {
	constructor(game, options = {}) {
		super(game, options);

		this.color = options.color || 0xffdd00;
		this.intensity = options.intensity || 1.0;

		// Create the star mesh and light
		this.createStarMesh(options);

		// Set position if provided
		if (options.position) {
			this.setPosition(
				options.position.x || 0,
				options.position.y || 0,
				options.position.z || 0
			);
		}

		// Add to game entities
		this.game.addEntity(this);
	}

	createStarMesh(options) {
		// Create the main star sphere
		const geometry = new THREE.SphereGeometry(this.radius, 32, 32);

		// Create emissive material for the star
		const material = new THREE.MeshBasicMaterial({
			color: this.color,
			emissive: this.color,
			emissiveIntensity: 1.0,
		});

		this.mesh = new THREE.Mesh(geometry, material);
		this.game.scene.add(this.mesh);

		// Add a point light at the star's position
		this.light = new THREE.PointLight(
			this.color,
			this.intensity,
			this.radius * 50
		);
		this.mesh.add(this.light);

		// Add a subtle glow effect
		this.addGlow();
	}

	addGlow() {
		// Create a larger sphere for the glow effect
		const glowGeometry = new THREE.SphereGeometry(
			this.radius * 1.2,
			32,
			32
		);
		const glowMaterial = new THREE.MeshBasicMaterial({
			color: this.color,
			transparent: true,
			opacity: 0.3,
			side: THREE.BackSide,
		});

		this.glowMesh = new THREE.Mesh(glowGeometry, glowMaterial);
		this.mesh.add(this.glowMesh);
	}

	update(deltaTime) {
		super.update(deltaTime);

		// Add subtle pulsing effect to the star
		const time = performance.now() / 1000;
		const pulseFactor = 1.0 + Math.sin(time) * 0.05;

		// Pulse the glow
		if (this.glowMesh) {
			this.glowMesh.scale.set(pulseFactor, pulseFactor, pulseFactor);
		}

		// Adjust light intensity
		if (this.light) {
			this.light.intensity = this.intensity * pulseFactor;
		}
	}
}
