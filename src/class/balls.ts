import * as THREE from 'three'
import config from '../config'
import {Scene} from './scene'
import {Camera} from './camera/camera'
import {Capsule} from 'three/examples/jsm/math/Capsule'

export class Balls {
  private _spheres: any = []

  private _sphereIdx = 0

  private readonly _scene: Scene
  private readonly _camera: Camera
  private readonly _direction: THREE.Vector3
  private readonly _velocity: THREE.Vector3
  private readonly _collider: Capsule
  private readonly _position = new THREE.Vector3()

  private readonly _vector2 = new THREE.Vector3()
  private readonly _vector3 = new THREE.Vector3()

  constructor(
    scene: Scene,
    camera: Camera,
    playerCollider: Capsule,
    playerDirection: THREE.Vector3,
    playerVelocity: THREE.Vector3,
    playerPosition: THREE.Vector3,
  ) {
    this._scene = scene
    this._camera = camera
    this._collider = playerCollider
    this._direction = playerDirection
    this._velocity = playerVelocity
    this._position = playerPosition

    this.reset()
  }

  throwBall() {
    const sphere = this._spheres[this._sphereIdx]

    this._camera.getWorldDirection(this._direction)

    sphere.collider.center
      .copy(this._collider.end)
      .addScaledVector(this._direction, this._collider.radius * 1.5)

    // throw the ball with more force if we hold the button longer, and if we move forward

    const impulse =
      15 +
      30 * (1 - Math.exp((config.player.mouseTime - performance.now()) * 0.001))

    sphere.velocity.copy(this._direction).multiplyScalar(impulse)
    sphere.velocity.addScaledVector(this._velocity, 2)

    this._sphereIdx = (this._sphereIdx + 1) % this._spheres.length
  }

  update(deltaTime: number) {
    this._spheres.forEach((sphere: any) => {
      sphere.collider.center.addScaledVector(sphere.velocity, deltaTime)

      const result = this._scene.worldOctree.sphereIntersect(sphere.collider)

      if (result) {
        sphere.velocity.addScaledVector(
          result.normal,
          -result.normal.dot(sphere.velocity) * 1.5,
        )
        sphere.collider.center.add(result.normal.multiplyScalar(result.depth))
      } else {
        sphere.velocity.y -= config.system.gravity * deltaTime
      }

      const damping = Math.exp(-1.5 * deltaTime) - 1
      sphere.velocity.addScaledVector(sphere.velocity, damping)

      this._playerSphereCollision(sphere)
    })

    this._spheresCollisions()

    for (const sphere of this._spheres) {
      sphere.mesh.position.copy(sphere.collider.center)
    }
  }

  reset() {
    const sphereGeometry = new THREE.SphereGeometry(
      config.system.balls.size / 100,
      32,
      32,
    )
    const sphereMaterial = new THREE.MeshStandardMaterial({
      color: 0x888855,
      roughness: 0.8,
      metalness: 0.5,
    })

    for (let i = 0; i < config.system.balls.totals; i++) {
      const sphere = new THREE.Mesh(sphereGeometry, sphereMaterial)
      sphere.castShadow = true
      sphere.receiveShadow = true

      this._scene.add(sphere)

      this._spheres.push({
        mesh: sphere,
        collider: new THREE.Sphere(
          new THREE.Vector3(0, -100, 0),
          config.system.balls.size / 100,
        ),
        velocity: new THREE.Vector3(),
      })
    }
  }

  private _playerSphereCollision(sphere: any) {
    const center = this._position
      .addVectors(this._collider.start, this._collider.end)
      .multiplyScalar(0.5)

    const sphereCenter = sphere.collider.center

    const r = this._collider.radius + sphere.collider.radius
    const r2 = r * r

    // approximation: player = 3 spheres

    for (const point of [this._collider.start, this._collider.end, center]) {
      const d2 = point.distanceToSquared(sphereCenter)

      if (d2 < r2) {
        const normal = this._position
          .subVectors(point, sphereCenter)
          .normalize()
        const v1 = this._vector2
          .copy(normal)
          .multiplyScalar(normal.dot(this._velocity))
        const v2 = this._vector3
          .copy(normal)
          .multiplyScalar(normal.dot(sphere.velocity))

        this._velocity.add(v2).sub(v1)
        sphere.velocity.add(v1).sub(v2)

        const d = (r - Math.sqrt(d2)) / 2
        sphereCenter.addScaledVector(normal, -d)
      }
    }
  }

  private _spheresCollisions() {
    for (let i = 0, length = this._spheres.length; i < length; i++) {
      const s1 = this._spheres[i]

      for (let j = i + 1; j < length; j++) {
        const s2 = this._spheres[j]

        const d2 = s1.collider.center.distanceToSquared(s2.collider.center)
        const r = s1.collider.radius + s2.collider.radius
        const r2 = r * r

        if (d2 < r2) {
          const normal = this._position
            .subVectors(s1.collider.center, s2.collider.center)
            .normalize()
          const v1 = this._vector2
            .copy(normal)
            .multiplyScalar(normal.dot(s1.velocity))
          const v2 = this._vector3
            .copy(normal)
            .multiplyScalar(normal.dot(s2.velocity))

          s1.velocity.add(v2).sub(v1)
          s2.velocity.add(v1).sub(v2)

          const d = (r - Math.sqrt(d2)) / 2

          s1.collider.center.addScaledVector(normal, d)
          s2.collider.center.addScaledVector(normal, -d)
        }
      }
    }
  }
}
