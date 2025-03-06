class Planet extends CelestialBody {
	constructor(game, options = {}) {
		super(game, options);

		this.type = options.type || "rocky";
		this.name = options.name || "Unknown Planet";
		this.isTargeted = false;
		this.reticule = null;

		// Store additional planet information
		this.distanceFromSun = options.distance || 0;
		this.hasAtmosphere = options.atmosphere || false;
		this.atmosphereType = options.atmosphereType || "None";
		this.hasRings = options.rings || false;

		// Generate planet description based on type
		this.description = this.generateDescription();

		this.createPlanetMesh(options);
	}

	createPlanetMesh(options) {
		// Create the main planet sphere
		const geometry = new THREE.SphereGeometry(this.radius, 32, 32);

		// Create material based on planet type
		let material;

		switch (this.type) {
			case "gas":
				material = this.createGasPlanetMaterial(options.color);
				break;
			case "ice":
				material = this.createIcePlanetMaterial(options.color);
				break;
			case "rocky":
			default:
				material = this.createRockyPlanetMaterial(options.color);
				break;
		}

		this.mesh = new THREE.Mesh(geometry, material);

		// Add atmosphere if specified
		if (options.atmosphere) {
			this.addAtmosphere(options.atmosphereColor);
		}

		// Add rings if specified
		if (options.rings) {
			this.addRings(options.ringColor);
		}

		// Create reticule (initially hidden)
		this.createReticule();

		this.game.scene.add(this.mesh);
	}

	// Generate a description based on planet type and characteristics
	generateDescription() {
		const descriptions = {
			rocky: [
				"A barren rocky world with a cratered surface.",
				"This terrestrial planet has a solid surface with various geological features.",
				"A rocky planet with mountains, valleys, and impact craters scattered across its surface.",
			],
			gas: [
				"A massive gas giant with swirling colorful clouds in its atmosphere.",
				"This gas giant has no solid surface, consisting primarily of hydrogen and helium.",
				"A huge planet with powerful storms raging through its thick atmosphere.",
			],
			ice: [
				"A frigid ice world with a frozen surface reflecting distant starlight.",
				"This icy planet has extremely low temperatures and a solid frozen surface.",
				"A cold world covered in various ices including water, methane, and ammonia.",
			],
		};

		// Select a random description based on planet type
		const typeDescriptions = descriptions[this.type] || descriptions.rocky;
		const baseDescription =
			typeDescriptions[
				Math.floor(Math.random() * typeDescriptions.length)
			];

		// Add atmosphere info if present
		let fullDescription = baseDescription;
		if (this.hasAtmosphere) {
			fullDescription += " It has a significant atmosphere.";
		}

		// Add rings info if present
		if (this.hasRings) {
			fullDescription +=
				" The planet is surrounded by a beautiful ring system.";
		}

		return fullDescription;
	}

	// Get formatted planet details for UI display
	getPlanetDetails() {
		return {
			name: this.name,
			type: this.type.charAt(0).toUpperCase() + this.type.slice(1),
			size: `${Math.round(this.radius)} km`,
			distanceFromSun: `${Math.round(
				this.distanceFromSun
			).toLocaleString()} km`,
			atmosphere: this.hasAtmosphere ? "Present" : "None",
			description: this.description,
		};
	}

	createReticule() {
		// Create a reticule group
		this.reticule = new THREE.Group();

		// Create four curved lines around the planet
		const segments = 32;
		const radius = this.radius * 1.5;
		const arcLength = Math.PI / 2; // 90 degrees

		// Create the four arcs positioned at 45, 135, 225, and 315 degrees
		for (let i = 0; i < 4; i++) {
			const startAngle = Math.PI / 4 + (i * Math.PI) / 2; // 45, 135, 225, 315 degrees
			const curve = new THREE.EllipseCurve(
				0,
				0, // Center x, y
				radius,
				radius, // x radius, y radius
				startAngle,
				startAngle + arcLength, // Start angle, end angle
				false, // Clockwise
				0 // Rotation
			);

			const points = curve.getPoints(segments);
			const geometry = new THREE.BufferGeometry().setFromPoints(points);
			const material = new THREE.LineBasicMaterial({
				color: 0xffffff,
				transparent: true,
				opacity: 0.8,
			});

			const arc = new THREE.Line(geometry, material);
			this.reticule.add(arc);
		}

		// Add the reticule to the mesh but hide it initially
		this.mesh.add(this.reticule);
		this.reticule.visible = false;
	}

	showReticule() {
		if (this.reticule && !this.isTargeted) {
			this.reticule.visible = true;
			this.isTargeted = true;

			// Notify UI manager about targeting
			if (this.game && this.game.ui) {
				console.log("Showing planet info for:", this.name);
				this.game.ui.showPlanetInfo(this);
			} else {
				console.error(
					"UI manager not available or game reference missing"
				);
			}
		}
	}

	hideReticule() {
		if (this.reticule && this.isTargeted) {
			this.reticule.visible = false;
			this.isTargeted = false;

			// Notify UI manager about untargeting
			if (this.game && this.game.ui) {
				this.game.ui.hidePlanetInfo();
			}
		}
	}

	createRockyPlanetMaterial(baseColor) {
		// Use a basic material without textures to avoid errors
		return new THREE.MeshPhongMaterial({
			color: baseColor || 0x887766,
			shininess: 10,
			// Add some random bumpiness
			bumpScale: 1,
		});
	}

	createGasPlanetMaterial(baseColor) {
		// Use a basic material without textures to avoid errors
		return new THREE.MeshPhongMaterial({
			color: baseColor || 0x4444ff,
			shininess: 30,
			transparent: true,
			opacity: 0.9,
		});
	}

	createIcePlanetMaterial(baseColor) {
		// Use a basic material without textures to avoid errors
		return new THREE.MeshPhongMaterial({
			color: baseColor || 0xccccff,
			shininess: 50,
			specular: 0xffffff,
		});
	}

	addAtmosphere(atmosphereColor) {
		const atmosphereGeometry = new THREE.SphereGeometry(
			this.radius * 1.2,
			32,
			32
		);
		const atmosphereMaterial = new THREE.MeshPhongMaterial({
			color:
				atmosphereColor || (this.type === "gas" ? 0x88aaff : 0xaaccff),
			transparent: true,
			opacity: 0.2,
			side: THREE.BackSide,
		});

		const atmosphere = new THREE.Mesh(
			atmosphereGeometry,
			atmosphereMaterial
		);
		this.mesh.add(atmosphere);
	}

	addRings(ringColor) {
		const innerRadius = this.radius * 1.5;
		const outerRadius = this.radius * 2.5;
		const segments = 64;

		const ringGeometry = new THREE.RingGeometry(
			innerRadius,
			outerRadius,
			segments
		);
		const ringMaterial = new THREE.MeshPhongMaterial({
			color: ringColor || 0xcccccc,
			side: THREE.DoubleSide,
			transparent: true,
			opacity: 0.5,
		});

		const rings = new THREE.Mesh(ringGeometry, ringMaterial);
		rings.rotation.x = Math.PI / 2;
		this.mesh.add(rings);
	}

	update(deltaTime) {
		super.update(deltaTime);

		// Rotate the planet
		if (this.mesh) {
			this.mesh.rotation.y += this.rotationSpeed * deltaTime;
		}

		// Make reticule face the camera if it's visible
		if (this.reticule && this.reticule.visible && this.game.camera) {
			// Get the direction from the planet to the camera
			const cameraDirection = new THREE.Vector3();
			cameraDirection
				.subVectors(this.game.camera.position, this.position)
				.normalize();

			// Make the reticule face the camera
			this.reticule.lookAt(
				this.position.x + cameraDirection.x,
				this.position.y + cameraDirection.y,
				this.position.z + cameraDirection.z
			);
		}
	}
}
