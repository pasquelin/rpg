import * as THREE from 'three'
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js'
import {Scene} from '../scene'
import {Render} from '../render'

export class Orbit extends OrbitControls {
  private readonly _scene: Scene
  private readonly _camera: THREE.Camera

  constructor(scene: Scene, camera: THREE.Camera, render: Render) {
    super(camera, render.domElement)

    this._scene = scene
    this._camera = camera

    // @ts-ignore
    this.listenToKeyEvents(window)

    this.enableKeys = true
    this.keys = {LEFT: 'KeyA', UP: 'KeyW', RIGHT: 'KeyD', BOTTOM: 'KeyS'}

    this.keyPanSpeed = 40

    this.minDistance = 100
    this.maxDistance = 6000
  }
}
