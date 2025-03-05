class Entity {
	constructor(game) {
		this.game = game;
		this.position = new THREE.Vector3();
		this.rotation = new THREE.Euler();
		this.quaternion = new THREE.Quaternion();
		this.velocity = new THREE.Vector3();
		this.mesh = null;
	}

	update(deltaTime) {
		// Update position based on velocity
		this.position.add(this.velocity.clone().multiplyScalar(deltaTime));

		// Update mesh position and rotation
		if (this.mesh) {
			this.mesh.position.copy(this.position);
			this.mesh.quaternion.copy(this.quaternion);
		}
	}

	setPosition(x, y, z) {
		this.position.set(x, y, z);
		if (this.mesh) {
			this.mesh.position.copy(this.position);
		}
	}

	setRotation(x, y, z) {
		this.rotation.set(x, y, z);
		this.quaternion.setFromEuler(this.rotation);
		if (this.mesh) {
			this.mesh.quaternion.copy(this.quaternion);
		}
	}

	destroy() {
		if (this.mesh) {
			this.game.removeEntity(this);
		}
	}
}
