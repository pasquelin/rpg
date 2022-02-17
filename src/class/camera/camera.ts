import * as THREE from 'three'
import Config from '../../config'
import {Orbit} from './orbit'
import {Render} from '../render'
import {Scene} from '../scene'

export class Camera extends THREE.PerspectiveCamera {
  private readonly _orbit?: Orbit

  constructor(far: number, scene?: Scene, render?: Render) {
    super(
      Config.system.fov,
      window.innerWidth / window.innerHeight,
      Config.system.near,
      far,
    )
    this.rotation.order = 'YXZ'

    if (scene && render) {
      this._orbit = new Orbit(scene, this, render)
    }
  }

  get orbit() {
    return this._orbit
  }
}
