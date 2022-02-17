import * as THREE from 'three'
import {Scene} from './scene'
import {Camera} from './camera/camera'
import Config from '../config'

export class Cubes {
  private readonly _scene: Scene
  private readonly _camera: Camera
  private readonly _raycaster = new THREE.Raycaster()
  private readonly _pointer = new THREE.Vector2()
  private readonly _objects: THREE.Mesh[] = []

  private _cube = new THREE.BoxGeometry(
    Config.system.cubes.size,
    Config.system.cubes.size,
    Config.system.cubes.size,
  )
  private _rollOver?: THREE.Mesh
  private _intersected: any | null = null

  constructor(scene: Scene, camera: Camera) {
    this._scene = scene
    this._camera = camera
  }

  addRollOver() {
    if (this._rollOver) {
      this._scene.remove(this._rollOver)
      this._cube = new THREE.BoxGeometry(
        Config.system.cubes.size,
        Config.system.cubes.size,
        Config.system.cubes.size,
      )
    }

    const rollOverMaterial = new THREE.MeshBasicMaterial({
      color: 0xff0000,
      opacity: 0.5,
      transparent: true,
    })
    const middleSize = Config.system.cubes.size / 2
    this._rollOver = new THREE.Mesh(this._cube, rollOverMaterial)
    this._rollOver.position.set(middleSize, middleSize, middleSize)
    this._rollOver.name = 'rollOver'
    this._scene.add(this._rollOver)
  }

  onPointerMove(event: PointerEvent) {
    this._intersect(event, (intersect) => {
      if (!this._rollOver || !intersect.face?.normal) return

      this._rollOver.visible = false

      if (Config.editor === 'remove') {
        if (intersect.object.name !== 'map') {
          if (this._intersected)
            this._intersected.material.emissive.setHex(
              this._intersected.currentHex,
            )

          this._intersected = intersect.object
          this._intersected.currentHex =
            this._intersected.material.emissive.getHex()
          this._intersected.material.emissive.setHex(0xff0000)
        }
      } else if (Config.editor === 'add') {
        const middle = Config.system.cubes.size / 2

        this._rollOver.visible = true
        this._rollOver.position
          .copy(intersect.point)
          .add(intersect.face.normal)
          .divideScalar(Config.system.cubes.size)
          .floor()
          .multiplyScalar(Config.system.cubes.size)
          .addScalar(middle)

        if (this._rollOver.position.y < middle) {
          this._rollOver.position.setY(middle)
        }
      }
    })
  }

  onMouseDown(event: PointerEvent) {
    this._intersect(event, (intersect) => {
      if (!this._rollOver || !intersect.face?.normal) return

      if (Config.editor === 'remove') {
        if (
          intersect.object.name !== 'map' &&
          intersect.object instanceof THREE.Mesh
        ) {
          this._rollOver.visible = false
          this._objects.splice(this._objects.indexOf(intersect.object), 1)
          this._scene.remove(intersect.object)
        }
      } else if (Config.editor === 'add') {
        const middle = Config.system.cubes.size / 2
        const gt = new THREE.TextureLoader().load(
          `textures/${Config.system.cubes.asset}`,
        )

        const voxel = new THREE.Mesh(
          new THREE.BoxGeometry(
            Config.system.cubes.size,
            Config.system.cubes.size,
            Config.system.cubes.size,
          ),
          new THREE.MeshPhongMaterial({
            color: 0xffffff,
            map: gt,
            side: THREE.DoubleSide,
          }),
        )
        voxel.name = 'cube'
        voxel.castShadow = true
        voxel.receiveShadow = true
        voxel.position
          .copy(intersect.point)
          .add(intersect.face.normal)
          .divideScalar(Config.system.cubes.size)
          .floor()
          .multiplyScalar(Config.system.cubes.size)
          .addScalar(middle)

        if (voxel.position.y < middle) {
          voxel.position.setY(middle)
        }

        this._scene.add(voxel)
        this._objects.push(voxel)
      }
    })
  }

  dispose() {
    this._objects.forEach((object) => {
      object.geometry.dispose()
    })
    if (this._rollOver) {
      this._rollOver.geometry.dispose()
    }
  }

  private _intersect(
    event: PointerEvent,
    fn: (intersect: THREE.Intersection) => void,
  ) {
    this._pointer.x = (event.clientX / window.innerWidth) * 2 - 1
    this._pointer.y = -(event.clientY / window.innerHeight) * 2 + 1
    this._raycaster.setFromCamera(this._pointer, this._camera)

    const intersects = this._raycaster.intersectObjects(
      [...this._objects, this._scene.map],
      false,
    )

    if (intersects.length) {
      fn(intersects[0])
      if (intersects[0].object.name !== 'map') return
    }

    if (this._intersected)
      this._intersected.material.emissive.setHex(this._intersected.currentHex)

    this._intersected = null
  }
}
