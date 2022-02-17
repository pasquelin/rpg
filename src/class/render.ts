import * as THREE from 'three'

export class Render extends THREE.WebGLRenderer {
  constructor() {
    super({antialias: true})
    this.setPixelRatio(window.devicePixelRatio)
    this.setSize(window.innerWidth, window.innerHeight)
    this.shadowMap.enabled = true
    this.shadowMap.type = THREE.VSMShadowMap
  }
}
