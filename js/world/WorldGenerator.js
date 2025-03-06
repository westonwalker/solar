class WorldGenerator {
	constructor(game) {
		this.game = game;
		this.worldSize = 10000;
		this.numStars = 1000; // Background stars
		this.asteroidBeltCount = 200; // Number of asteroids in the belt
		this.numEnemies = 5;
	}

	generate() {
		this.createSkybox();
		this.createStarfield();
		this.createSolarSystem();
		this.createEnemies();
		this.addLighting();
	}

	createSkybox() {
		const loader = new THREE.CubeTextureLoader();
		const texture = loader.load([
			"assets/skybox/right.png",
			"assets/skybox/left.png",
			"assets/skybox/top.png",
			"assets/skybox/bottom.png",
			"assets/skybox/front.png",
			"assets/skybox/back.png",
		]);
		this.game.scene.background = texture;
	}

	createStarfield() {
		// Create distant stars as particles
		const starGeometry = new THREE.BufferGeometry();
		const starMaterial = new THREE.PointsMaterial({
			color: 0xffffff,
			size: 2,
			sizeAttenuation: false, // Stars don't get smaller with distance
		});

		const positions = new Float32Array(this.numStars * 3);

		// Far distance for stars - much larger than the solar system
		const starDistance = this.worldSize * 5; // 5x the world size

		for (let i = 0; i < this.numStars; i++) {
			const i3 = i * 3;

			// Generate random direction vector (normalized)
			const theta = Math.random() * Math.PI * 2; // Horizontal angle
			const phi = Math.acos(2 * Math.random() - 1); // Vertical angle

			// Convert spherical coordinates to Cartesian
			positions[i3] = starDistance * Math.sin(phi) * Math.cos(theta);
			positions[i3 + 1] = starDistance * Math.sin(phi) * Math.sin(theta);
			positions[i3 + 2] = starDistance * Math.cos(phi);
		}

		starGeometry.setAttribute(
			"position",
			new THREE.BufferAttribute(positions, 3)
		);

		const stars = new THREE.Points(starGeometry, starMaterial);
		this.game.scene.add(stars);
	}

	createSolarSystem() {
		// Create the Sun
		const sun = new Star(this.game, {
			radius: 500,
			color: 0xffdd00,
			intensity: 2.5,
			position: { x: 0, y: 0, z: 0 },
		});

		// Scale factor for distances (not to actual scale, but to maintain playability)
		// Real distances would make the game unplayable
		const distanceScale = 6000;
		const sizeScale = 60;

		// Create planets with real data (scaled)
		// Distances in AU, sizes in Earth radii (roughly)
		const planets = [
			// Mercury
			{
				name: "Mercury",
				type: "rocky",
				radius: 0.38 * sizeScale,
				distance: 0.4 * distanceScale,
				color: 0xaaaaaa,
				rings: false,
				atmosphere: false,
				orbitSpeed: 0.02,
				rotationSpeed: 0.005,
			},
			// Venus
			{
				name: "Venus",
				type: "rocky",
				radius: 0.95 * sizeScale,
				distance: 0.7 * distanceScale,
				color: 0xd6c385,
				rings: false,
				atmosphere: true,
				atmosphereColor: 0xffd700,
				orbitSpeed: 0.015,
				rotationSpeed: 0.002,
			},
			// Earth
			{
				name: "Earth",
				type: "rocky",
				radius: 1.0 * sizeScale,
				distance: 1.0 * distanceScale,
				color: 0x2233ff,
				rings: false,
				atmosphere: true,
				atmosphereColor: 0x6699ff,
				orbitSpeed: 0.01,
				rotationSpeed: 0.01,
				moons: [
					{
						name: "Moon",
						radius: 0.27 * sizeScale,
						distance: 90, // Increased from 30 to 90 to account for larger Earth
						color: 0xcccccc,
						orbitSpeed: 0.05,
						rotationSpeed: 0.005,
					},
				],
			},
			// Mars
			{
				name: "Mars",
				type: "rocky",
				radius: 0.53 * sizeScale,
				distance: 1.5 * distanceScale,
				color: 0xdd5500,
				rings: false,
				atmosphere: false,
				orbitSpeed: 0.008,
				rotationSpeed: 0.01,
			},
			// Jupiter
			{
				name: "Jupiter",
				type: "gas",
				radius: 11.2 * sizeScale,
				distance: 5.2 * distanceScale,
				color: 0xd8ca9d,
				rings: false,
				atmosphere: true,
				atmosphereColor: 0xd8ca9d,
				orbitSpeed: 0.004,
				rotationSpeed: 0.02,
			},
			// Saturn
			{
				name: "Saturn",
				type: "gas",
				radius: 9.45 * sizeScale,
				distance: 9.5 * distanceScale,
				color: 0xf0e5c9,
				rings: true,
				ringColor: 0xc6b290,
				atmosphere: true,
				atmosphereColor: 0xf0e5c9,
				orbitSpeed: 0.003,
				rotationSpeed: 0.018,
			},
			// Uranus
			{
				name: "Uranus",
				type: "ice",
				radius: 4.0 * sizeScale,
				distance: 19.2 * distanceScale,
				color: 0x99ccff,
				rings: true,
				ringColor: 0x99ccff,
				atmosphere: true,
				atmosphereColor: 0x99ccff,
				orbitSpeed: 0.002,
				rotationSpeed: 0.015,
			},
			// Neptune
			{
				name: "Neptune",
				type: "ice",
				radius: 3.88 * sizeScale,
				distance: 30.1 * distanceScale,
				color: 0x3355ff,
				rings: false,
				atmosphere: true,
				atmosphereColor: 0x3355ff,
				orbitSpeed: 0.001,
				rotationSpeed: 0.015,
			},
			// Pluto (yes, it's not technically a planet anymore, but it's iconic)
			{
				name: "Pluto",
				type: "ice",
				radius: 0.18 * sizeScale,
				distance: 39.5 * distanceScale,
				color: 0xccbbaa,
				rings: false,
				atmosphere: false,
				orbitSpeed: 0.0008,
				rotationSpeed: 0.004,
			},
		];

		// Store Earth's position for player spawn
		let earthPosition = null;
		let earthPlanet = null;

		// Create each planet
		planets.forEach((planetData) => {
			// Calculate position based on distance from sun
			// Random angle for initial position in orbit
			const angle = Math.random() * Math.PI * 2;
			const x = Math.cos(angle) * planetData.distance;
			const z = Math.sin(angle) * planetData.distance;

			const planet = new Planet(this.game, {
				name: planetData.name,
				radius: planetData.radius,
				type: planetData.type,
				color: planetData.color,
				rings: planetData.rings,
				ringColor: planetData.ringColor,
				atmosphere: planetData.atmosphere,
				atmosphereColor: planetData.atmosphereColor,
				rotationSpeed: planetData.rotationSpeed,
				orbitSpeed: planetData.orbitSpeed,
				orbitDistance: planetData.distance,
				orbitCenter: sun.position,
				distance: planetData.distance, // Pass distance from sun
			});

			planet.setPosition(x, 0, z);
			planet.name = planetData.name;

			// Store Earth's position for player spawn
			if (planetData.name === "Earth") {
				earthPosition = { x, y: 0, z };
				earthPlanet = planet;
				// Store Earth reference in the game object for easy access
				this.game.earthPosition = { x, y: 0, z };
			}

			// Create moons if the planet has any
			if (planetData.moons && planetData.moons.length > 0) {
				this.createMoons(planet, planetData.moons);
			}
		});

		// Create asteroid belt between Mars and Jupiter (around 2.7 AU)
		this.createAsteroidBelt(2.7 * distanceScale, 0.8 * distanceScale);
	}

	createMoons(planet, moonsData) {
		moonsData.forEach((moonData) => {
			// Calculate initial position
			const moonAngle = Math.random() * Math.PI * 2;
			const moonX = Math.cos(moonAngle) * moonData.distance;
			const moonZ = Math.sin(moonAngle) * moonData.distance;

			// Create the moon
			const moon = new Planet(this.game, {
				radius: moonData.radius,
				type: "rocky",
				color: moonData.color,
				rotationSpeed: moonData.rotationSpeed,
				orbitSpeed: moonData.orbitSpeed,
				orbitDistance: moonData.distance,
				orbitCenter: planet.position.clone(), // Clone the position to avoid reference issues
			});

			// Position relative to planet
			moon.setPosition(
				planet.position.x + moonX,
				planet.position.y,
				planet.position.z + moonZ
			);

			moon.name = moonData.name;
			moon.isPlanetMoon = true;
			moon.parentPlanet = planet;
		});
	}

	createAsteroidBelt(distance, width) {
		// Create a ring of asteroids
		for (let i = 0; i < this.asteroidBeltCount; i++) {
			// Random distance within the belt width
			const beltDistance = distance + (Math.random() - 0.5) * width;

			// Random position in a circle
			const angle = Math.random() * Math.PI * 2;
			const x = Math.cos(angle) * beltDistance;
			const z = Math.sin(angle) * beltDistance;

			// Random y offset for a 3D belt
			const y = (Math.random() - 0.5) * width * 0.2;

			// Create a small rocky "planet" for each asteroid
			const asteroid = new Planet(this.game, {
				radius: 1.5 + Math.random() * 9, // Increased by 3x (was 0.5 + Math.random() * 3)
				type: "rocky",
				color: 0x888888 + Math.random() * 0x222222, // Slight color variation
				rotationSpeed: (Math.random() - 0.5) * 0.02, // Random rotation
			});

			asteroid.setPosition(x, y, z);

			// Add some random rotation
			asteroid.mesh.rotation.x = Math.random() * Math.PI;
			asteroid.mesh.rotation.y = Math.random() * Math.PI;
			asteroid.mesh.rotation.z = Math.random() * Math.PI;
		}
	}

	createEnemies() {
		// Create enemy ships at various locations
		for (let i = 0; i < this.numEnemies; i++) {
			const enemy = new EnemyShip(this.game);

			// Position enemies at interesting locations
			// Some near planets, some in the asteroid belt, some in deep space
			if (i < 2) {
				// Near Earth or Mars
				const planetIndex = 2 + Math.floor(Math.random() * 2); // Earth (2) or Mars (3)
				const planetDistance = [1.0, 1.5][planetIndex - 2] * 400; // Get the planet's distance
				const angle = Math.random() * Math.PI * 2;
				const offset = 20 + Math.random() * 30; // Offset from planet

				const x = Math.cos(angle) * (planetDistance + offset);
				const z = Math.sin(angle) * (planetDistance + offset);
				enemy.setPosition(x, (Math.random() - 0.5) * 20, z);
			} else if (i < 4) {
				// In the asteroid belt
				const beltDistance =
					2.7 * 400 + (Math.random() - 0.5) * 0.8 * 400;
				const angle = Math.random() * Math.PI * 2;
				const x = Math.cos(angle) * beltDistance;
				const z = Math.sin(angle) * beltDistance;
				enemy.setPosition(x, (Math.random() - 0.5) * 30, z);
			} else {
				// Deep space
				const distance = 15 * 400 + Math.random() * 10 * 400;
				const angle = Math.random() * Math.PI * 2;
				const x = Math.cos(angle) * distance;
				const z = Math.sin(angle) * distance;
				enemy.setPosition(x, (Math.random() - 0.5) * 50, z);
			}
		}
	}

	addLighting() {
		// Ambient light for general illumination
		const ambientLight = new THREE.AmbientLight(0x333333);
		this.game.scene.add(ambientLight);
	}
}
