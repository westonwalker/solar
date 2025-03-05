class Projectile extends Entity {
	static pool = [];
	static maxProjectiles = 40; // Maximum active projectiles
	static maxDistance = 1000; // Maximum distance before recycling

	static getProjectile(game, source, direction, options = {}) {
		// Try to get a projectile from the pool
		let projectile = this.pool.find((p) => !p.active);

		if (projectile) {
			projectile.reset(source, direction, options);
			return projectile;
		}

		// Create new if pool isn't full
		if (this.pool.length < this.maxProjectiles) {
			projectile = new Projectile(game, source, direction, options);
			this.pool.push(projectile);
			game.addEntity(projectile); // Add to game entities when created
			return projectile;
		}

		// If we reach here, we've hit the projectile limit
		return null;
	}

	constructor(game, source, direction, options = {}) {
		super(game);

		this.source = source;
		this.active = false;
		this.mesh = this.createProjectileMesh(options);
		this.game.scene.add(this.mesh);

		// Initialize with provided options
		this.reset(source, direction, options);
	}

	reset(source, direction, options = {}) {
		this.source = source;
		this.speed = options.speed || 200;
		this.damage = options.damage || 10;
		this.lifetime = options.lifetime || 2;
		this.creationTime = performance.now() / 1000;
		this.active = true;

		// Reset position and velocity
		if (options.position) {
			this.position.copy(options.position);
		} else {
			this.position.copy(source.position);
		}
		this.velocity.copy(direction).multiplyScalar(this.speed);

		// Show mesh
		this.mesh.visible = true;
	}

	createProjectileMesh(options) {
		// Create a simpler projectile shape for better performance
		const geometry = new THREE.CylinderGeometry(0.1, 0.1, 1, 6);
		geometry.rotateX(Math.PI / 2);

		const material = new THREE.MeshPhongMaterial({
			color: options.color || 0x00ff00,
			emissive: options.color || 0x00ff00,
			emissiveIntensity: 0.5,
			transparent: true,
			opacity: 0.8,
		});

		return new THREE.Mesh(geometry, material);
	}

	update(deltaTime) {
		if (!this.active) return;

		super.update(deltaTime);

		// Check lifetime and distance
		const currentTime = performance.now() / 1000;
		const distanceToSource = this.position.distanceTo(this.source.position);

		if (
			currentTime - this.creationTime > this.lifetime ||
			distanceToSource > Projectile.maxDistance
		) {
			this.deactivate();
			return;
		}

		// Check collisions
		this.checkCollisions();
	}

	checkCollisions() {
		// Simple sphere collision check with all entities
		for (const entity of this.game.entities) {
			// Skip if it's the source or another projectile or inactive
			if (
				entity === this.source ||
				entity instanceof Projectile ||
				!this.active
			) {
				continue;
			}

			// Skip if it's on the same team (player/enemy)
			if (
				(entity instanceof PlayerShip &&
					this.source instanceof PlayerShip) ||
				(entity instanceof EnemyShip &&
					this.source instanceof EnemyShip)
			) {
				continue;
			}

			// Check collision
			const distance = this.position.distanceTo(entity.position);
			const collisionRadius = 2; // Adjust based on entity sizes

			if (distance < collisionRadius) {
				this.onHit(entity);
				break;
			}
		}
	}

	onHit(entity) {
		// Deal damage
		if (typeof entity.takeDamage === "function") {
			entity.takeDamage(this.damage);
		}

		// Deactivate projectile
		this.deactivate();
	}

	deactivate() {
		this.active = false;
		this.mesh.visible = false;
		this.velocity.set(0, 0, 0);
	}

	destroy() {
		// Remove from scene and pool
		if (this.mesh) {
			this.game.scene.remove(this.mesh);
			this.game.removeEntity(this); // Remove from game entities
			const index = Projectile.pool.indexOf(this);
			if (index !== -1) {
				Projectile.pool.splice(index, 1);
			}
		}
		super.destroy();
	}
}
