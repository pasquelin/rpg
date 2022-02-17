import * as THREE from 'three'
import {Octree} from 'three/examples/jsm/math/Octree'
import {Capsule} from 'three/examples/jsm/math/Capsule'
import Config from '../config'

export class Scene extends THREE.Scene {
  private _world = new Octree()

  private readonly _map: THREE.Mesh

  constructor(size = 1000) {
    super()

    const path = 'skybox/1/'
    const format = '.jpg'
    const urls = [
      path + 'px' + format,
      path + 'nx' + format,
      path + 'py' + format,
      path + 'ny' + format,
      path + 'pz' + format,
      path + 'nz' + format,
    ]

    this.background = new THREE.CubeTextureLoader().load(urls)

    const gt = new THREE.TextureLoader().load('textures/grass.png')
    const gg = new THREE.PlaneGeometry(6000, 6000)
    const gm = new THREE.MeshPhongMaterial({color: 0xffffff, map: gt})
    gt.magFilter = THREE.NearestFilter
    gt.wrapS = THREE.RepeatWrapping
    gt.wrapT = THREE.RepeatWrapping
    gt.repeat.set(size, size)

    this._map = new THREE.Mesh(gg, gm)
    this._map.rotateX(-Math.PI / 2)
    this._map.name = 'map'
    this._map.castShadow = true
    this._map.receiveShadow = true

    this.addWithCollision(this._map)
  }

  get worldOctree() {
    return this._world
  }

  get map() {
    return this._map
  }

  addWithCollision(object: THREE.Object3D) {
    this.add(object)
    this._world.fromGraphNode(object)
  }

  intersect(collider: Capsule) {
    return this._world.capsuleIntersect(collider)
  }

  grid() {
    const color = new THREE.Color('white')
    const gridHelper = new THREE.GridHelper(6000, 6000 / 20, color, color)
    this.add(gridHelper)
  }

  async load(json: string) {
    const group = await new THREE.ObjectLoader().parseAsync(JSON.parse(json))
    group.scale.divideScalar(100)
    this.addWithCollision(group)
  }
}
