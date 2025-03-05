class Planet extends CelestialBody {
	constructor(game, options = {}) {
		super(game, options);

		this.type = options.type || "rocky";

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

		// Add atmosphere if not rocky
		if (this.type !== "rocky") {
			this.addAtmosphere();
		}

		// Add rings with small probability for gas giants
		if (this.type === "gas" && Math.random() < 0.3) {
			this.addRings();
		}

		this.game.scene.add(this.mesh);
	}

	createRockyPlanetMaterial(baseColor) {
		// Create a displacement map for terrain
		const displacementMap = new THREE.TextureLoader().load(
			"assets/textures/displacement.png"
		);

		return new THREE.MeshPhongMaterial({
			color: baseColor || 0x887766,
			shininess: 10,
			displacementMap: displacementMap,
			displacementScale: this.radius * 0.05,
			bumpMap: displacementMap,
			bumpScale: 10,
		});
	}

	createGasPlanetMaterial(baseColor) {
		// Create cloud-like texture
		const texture = new THREE.TextureLoader().load(
			"assets/textures/clouds.png"
		);
		texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

		return new THREE.MeshPhongMaterial({
			color: baseColor || 0x4444ff,
			shininess: 30,
			map: texture,
			transparent: true,
			opacity: 0.9,
		});
	}

	createIcePlanetMaterial(baseColor) {
		// Create ice texture
		const texture = new THREE.TextureLoader().load(
			"assets/textures/ice.png"
		);

		return new THREE.MeshPhongMaterial({
			color: baseColor || 0xccccff,
			shininess: 50,
			map: texture,
			specular: 0xffffff,
		});
	}

	addAtmosphere() {
		const atmosphereGeometry = new THREE.SphereGeometry(
			this.radius * 1.2,
			32,
			32
		);
		const atmosphereMaterial = new THREE.MeshPhongMaterial({
			color: this.type === "gas" ? 0x88aaff : 0xaaccff,
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

	addRings() {
		const innerRadius = this.radius * 1.5;
		const outerRadius = this.radius * 2.5;
		const segments = 64;

		const ringGeometry = new THREE.RingGeometry(
			innerRadius,
			outerRadius,
			segments
		);
		const ringMaterial = new THREE.MeshPhongMaterial({
			color: 0xcccccc,
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
	}
}
