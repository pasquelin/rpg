import * as THREE from 'three'
import {Capsule} from 'three/examples/jsm/math/Capsule.js'
import {Camera} from './camera/camera'
import {Scene} from './scene'
import {Balls} from './balls'
import config from '../config'

export class Player {
  private readonly _collider = new Capsule()

  private _velocity = new THREE.Vector3()
  private _direction = new THREE.Vector3()
  private readonly _position = new THREE.Vector3()

  private readonly _keyStates: any = {}

  private _balls?: Balls
  private _onFloor = false

  private readonly _scene: Scene
  private readonly _camera: Camera

  constructor(scene: Scene, camera: Camera) {
    this._scene = scene
    this._camera = camera
    this.reset()
  }

  get collider() {
    return this._collider
  }

  get velocity() {
    return this._velocity
  }

  set velocity(value) {
    this._velocity = value
  }

  get center() {
    return this._position
      .addVectors(this.collider.start, this.collider.end)
      .multiplyScalar(0.5)
  }

  keyStates(key: string, value: boolean) {
    this._keyStates[key] = value
  }

  fire() {
    this._balls?.throwBall()
  }

  update(deltaTime: number) {
    this.controls(deltaTime)
    this._balls?.update(deltaTime)

    let damping = Math.exp(-4 * deltaTime) - 1

    if (!this._onFloor) {
      this.velocity.y -= config.player.gravity * 10 * deltaTime
      damping *= 0.1
    }

    this.velocity.addScaledVector(this.velocity, damping)

    const deltaPosition = this.velocity.clone().multiplyScalar(deltaTime)
    this.collider.translate(deltaPosition)

    this._collisions()

    this._camera.position.copy(this.collider.end)

    if (this._camera.position.y <= -50) {
      this.reset()
    }
  }

  reset() {
    const {position} = config.maps[config.map]
    this._collider.start.set(position.x, position.y - 0.75, position.z)
    this._collider.end.set(position.x, position.y, position.z)
    this._collider.radius = 0.35
    this._camera.position.copy(this._collider.end)
    this._balls = new Balls(
      this._scene,
      this._camera,
      this._collider,
      this._direction,
      this._velocity,
      this._position,
    )
  }

  private controls(deltaTime: number) {
    const speedDelta =
      deltaTime *
      (this._onFloor ? config.player.speed.onFloor : config.player.speed.onAir)

    if (this._keyStates.KeyW || this._keyStates.ArrowUp) {
      this.velocity.add(this._forwardVector().multiplyScalar(speedDelta))
    } else if (this._keyStates.KeyS || this._keyStates.ArrowDown) {
      this.velocity.add(this._forwardVector().multiplyScalar(-speedDelta))
    }

    if (this._keyStates.KeyA || this._keyStates.ArrowLeft) {
      this.velocity.add(this._sideVector().multiplyScalar(-speedDelta))
    } else if (this._keyStates.KeyD || this._keyStates.ArrowRight) {
      this.velocity.add(this._sideVector().multiplyScalar(speedDelta))
    }

    if (this._onFloor && this._keyStates.Space) {
      this.velocity.y = 15
    }
  }

  private _forwardVector() {
    this._camera.getWorldDirection(this._direction)
    this._direction.y = 0
    this._direction.normalize()

    return this._direction
  }

  private _sideVector() {
    this._camera.getWorldDirection(this._direction)
    this._direction.y = 0
    this._direction.normalize()
    this._direction.cross(this._camera.up)

    return this._direction
  }

  private _collisions() {
    const result = this._scene.intersect(this.collider)

    this._onFloor = false

    if (result) {
      this._onFloor = result.normal.y > 0

      if (!this._onFloor) {
        this.velocity.addScaledVector(
          result.normal,
          -result.normal.dot(this.velocity),
        )
      }

      this.collider.translate(result.normal.multiplyScalar(result.depth))
    }
  }
}
