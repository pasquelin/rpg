import * as THREE from 'three'
import {MTLLoader} from 'three/examples/jsm/loaders/MTLLoader'
import {OBJLoader} from 'three/examples/jsm/loaders/OBJLoader'
import {GLTFLoader} from 'three/examples/jsm/loaders/GLTFLoader'
import {TGALoader} from 'three/examples/jsm/loaders/TGALoader'

export class Model {
  async addOBJ(url: string) {
    const manager = new THREE.LoadingManager()
    manager.addHandler(/\.tga$/i, new TGALoader())
    const materials = await new MTLLoader(manager).loadAsync(
      url.replace(`.obj`, `.mtl`),
    )
    materials.preload()

    return new OBJLoader().setMaterials(materials).loadAsync(url)
  }

  async addGLB(url: string) {
    const {scene} = await new GLTFLoader().loadAsync(url)
    scene.traverse((child: any) => {
      if (child.isMesh) {
        child.castShadow = true
        child.receiveShadow = true

        if (child.material.map) {
          child.material.map.anisotropy = 8
        }
      }
    })

    return scene
  }
}
