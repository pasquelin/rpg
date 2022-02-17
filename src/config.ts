import * as THREE from 'three'

const Config = {
  user: {
    id: localStorage.getItem('id'),
    username: localStorage.getItem('username'),
    server: {
      id: localStorage.getItem('server') || '',
      root: localStorage.getItem('root') === 'true',
    },
  },
  system: {
    frame: 2,
    gravity: 6,
    fov: 75,
    near: 0.1,
    wireframe: false,
    balls: {
      totals: 100,
      size: 4,
    },
    cubes: {
      size: 40,
      asset: 'grass.png',
    },
  },
  player: {
    gravity: 6,
    camera: {
      x: 1,
      y: 1,
    },
    speed: {
      onFloor: 28,
      onAir: 8,
    },
    mouseTime: 0,
  },
  editor: 'select',
  map: 0,
  maps: [
    {
      file: `level1`,
      position: new THREE.Vector3(0, 1, 0),
      size: 6000,
    },
  ],
}

export default Config

export const setUsername = (username: string) => {
  Config.user.username = username
  localStorage.setItem('username', username)
}

export const setServer = (server: string, root = false) => {
  Config.user.server.id = server
  localStorage.setItem('server', server)

  Config.user.server.root = root
  localStorage.setItem('root', root ? 'true' : 'false')
}
