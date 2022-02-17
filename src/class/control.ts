// @ts-ignore
import {GUI} from 'three/examples/jsm/libs/lil-gui.module.min'
import {Camera, Cubes, Scene} from './index'
import Config from '../config'
import * as THREE from 'three'

const {ipcRenderer} = window.require('electron')

export class Control {
  private _gui: GUI
  private readonly _scene: Scene
  private readonly _camera: Camera

  constructor(camera: Camera, scene: Scene, cubes: Cubes) {
    this._gui = new GUI()
    this._scene = scene
    this._camera = camera

    const systemFolder = this._gui.addFolder('System')
    systemFolder.add(Config.system, 'wireframe').onChange((v: boolean) => {
      scene.traverse((child: any) => {
        if (child.isMesh) {
          child.material.wireframe = v
        }
      })
    })
    systemFolder.add(Config, 'editor', ['select', 'add', 'remove'])

    const options = {
      save: () => {
        const group = new THREE.Group()
        scene.children.forEach((child) => {
          if (child.name === 'cube' && child instanceof THREE.Mesh) {
            group.add(child)
          }
        })
        localStorage.setItem('map1', JSON.stringify(group.toJSON()))
      },
    }
    systemFolder
      .add(Config.system.cubes, 'size', 20, 100)
      .step(20)
      .name('Taille de cube')
      .onChange(() => {
        cubes.addRollOver()
      })

    ipcRenderer.invoke('assets').then((value) => {
      systemFolder
        .add(Config.system.cubes, 'asset', value.textures)
        .name('Texture du cube')
    })

    systemFolder.add(options, 'save')
  }

  remove() {
    this._gui.destroy()
  }

  private async _getAssets() {
    const result = await ipcRenderer.invoke('assets')
    console.log(result)
  }
}
