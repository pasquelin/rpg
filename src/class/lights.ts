import * as THREE from 'three'

export class Lights {
  private readonly _ambient = new THREE.AmbientLight(0xffffff)
  private readonly _directional = new THREE.DirectionalLight(0xffffaa, 0.5)

  load() {
    this._directional.position.set(-5, 25, -1)
    this._directional.castShadow = true
    this._directional.shadow.camera.near = 0.01
    this._directional.shadow.camera.far = 500
    this._directional.shadow.camera.right = 30
    this._directional.shadow.camera.left = -30
    this._directional.shadow.camera.top = 30
    this._directional.shadow.camera.bottom = -30
    this._directional.shadow.mapSize.width = 1024
    this._directional.shadow.mapSize.height = 1024
    this._directional.shadow.radius = 4
    this._directional.shadow.bias = -0.00006
    this._directional.name = 'directional'

    this._ambient.name = 'ambient'
  }

  get ambient() {
    return this._ambient
  }

  get directional() {
    return this._directional
  }

  dispose() {
    this._ambient.dispose()
    this._directional.dispose()
  }
}
