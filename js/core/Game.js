class Game {
	constructor() {
		this.scene = null;
		this.camera = null;
		this.renderer = null;
		this.clock = new THREE.Clock();
		this.entities = [];
		this.player = null;
		this.worldGenerator = null;
		this.uiManager = null;
		this.earthPosition = null;

		this.init();
	}

	init() {
		// Create scene
		this.scene = new THREE.Scene();

		// Create camera
		this.camera = new THREE.PerspectiveCamera(
			75,
			window.innerWidth / window.innerHeight,
			0.1,
			100000
		);

		// Create renderer
		this.renderer = new THREE.WebGLRenderer({
			canvas: document.getElementById("game-canvas"),
			antialias: true,
		});
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.setPixelRatio(window.devicePixelRatio);

		// Handle window resize
		window.addEventListener("resize", () => this.onWindowResize());

		// Initialize UI
		this.uiManager = new UIManager(this);
		this.ui = this.uiManager;

		// Create world
		this.worldGenerator = new WorldGenerator(this);
		this.worldGenerator.generate();

		// Create player
		this.player = new PlayerShip(this);
		this.addEntity(this.player);

		// Position player near Earth if Earth position is available
		if (this.earthPosition) {
			// Position the player 150 units away from Earth (increased from 50 to account for larger Earth)
			const offsetDistance = 150;
			this.player.setPosition(
				this.earthPosition.x + offsetDistance,
				this.earthPosition.y + 20,
				this.earthPosition.z + offsetDistance
			);

			// Make the player face Earth
			this.player.lookAt(this.earthPosition);
		}

		// Start animation loop
		this.lastTime = performance.now();
		this.animate();
	}

	onWindowResize() {
		this.camera.aspect = window.innerWidth / window.innerHeight;
		this.camera.updateProjectionMatrix();
		this.renderer.setSize(window.innerWidth, window.innerHeight);
	}

	update() {
		const deltaTime = this.clock.getDelta();

		// Update all entities
		for (const entity of this.entities) {
			entity.update(deltaTime);
		}

		// Update camera to follow player
		if (this.player) {
			const playerPos = this.player.position;
			const cameraOffset = new THREE.Vector3(0, 10, 30);
			cameraOffset.applyQuaternion(this.player.quaternion);
			this.camera.position.copy(playerPos).add(cameraOffset);
			this.camera.lookAt(playerPos);
		}

		// Update UI
		this.uiManager.update();
	}

	animate() {
		requestAnimationFrame(() => this.animate());
		this.update();
		this.renderer.render(this.scene, this.camera);
	}

	addEntity(entity) {
		this.entities.push(entity);
		this.scene.add(entity.mesh);
	}

	removeEntity(entity) {
		const index = this.entities.indexOf(entity);
		if (index !== -1) {
			this.entities.splice(index, 1);
			this.scene.remove(entity.mesh);
		}
	}
}
