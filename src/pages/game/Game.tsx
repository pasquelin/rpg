import React, {createRef, useCallback, useEffect, useRef} from 'react'
import * as THREE from 'three'
import Stats from 'three/examples/jsm/libs/stats.module'
import Config from '../../config'
import {
  Camera,
  Scene,
  Lights,
  Render,
  Player,
  Control,
  Cubes,
} from '../../class'

export default function Game() {
  const container = createRef<HTMLDivElement>()
  const info = createRef<HTMLDivElement>()

  // @ts-ignore
  const stats = useRef(new Stats())
  const pause = useRef(true)
  const clock = useRef(new THREE.Clock())
  const lights = useRef(new Lights())
  const renderer = useRef(new Render())
  const camera = useRef(new Camera(100))
  const scene = useRef(new Scene())
  const cubes = useRef(new Cubes(scene.current, camera.current))
  const player = useRef(new Player(scene.current, camera.current))

  const animateCallback = useCallback(function animate() {
    const deltaTime = clock.current?.getDelta() || 0

    if (!pause.current) {
      player.current?.update(deltaTime)
    }

    if (scene.current && camera.current && renderer.current) {
      renderer.current.render(scene.current, camera.current as THREE.Camera)
    }

    stats.current?.update()

    requestAnimationFrame(animateCallback)
  }, [])

  const keydownCallback = useCallback(function keydown(event) {
    if (event.code === 'Escape') {
      document.exitPointerLock()
    }
    player.current?.keyStates(event.code, true)
  }, [])

  const keyupCallback = useCallback(function keyup(event) {
    player.current?.keyStates(event.code, false)
  }, [])

  const pointerdownCallback = useCallback(function mousedown() {
    console.log('fire')
    if (pause.current) {
      document.body.requestPointerLock()
    } else {
      player.current?.fire()
      Config.player.mouseTime = performance.now()
    }
  }, [])

  const pointermoveCallback = useCallback(function pointermove(event) {
    if (document.pointerLockElement !== document.body || !camera.current) return

    camera.current.rotation.y -=
      event.movementX / (500 * Config.player.camera.y)
    camera.current.rotation.x -=
      event.movementY / (500 * Config.player.camera.x)
  }, [])

  const pointerlockchangeCallback = useCallback(function pointerlockchange() {
    pause.current = !document.pointerLockElement
  }, [])

  const resetCallback = useCallback(function reset() {
    lights.current?.dispose()
    renderer.current?.dispose()
    cubes.current?.dispose()
  }, [])

  const resizeCallback = useCallback(function resize() {
    camera.current.aspect = window.innerWidth / window.innerHeight
    camera.current.updateProjectionMatrix()

    renderer.current.setSize(window.innerWidth, window.innerHeight)
  }, [])

  useEffect(
    function eventListenerInit() {
      document.addEventListener('keydown', keydownCallback)
      document.addEventListener('keyup', keyupCallback)
      document.addEventListener('pointermove', pointermoveCallback)
      document.addEventListener('pointerdown', pointerdownCallback)
      document.addEventListener('pointerlockchange', pointerlockchangeCallback)
      window.addEventListener('resize', resizeCallback)

      return () => {
        document.removeEventListener('keydown', keydownCallback)
        document.removeEventListener('keyup', keyupCallback)
        document.removeEventListener('pointermove', pointermoveCallback)
        document.removeEventListener('pointerdown', pointerdownCallback)
        document.removeEventListener(
          'pointerlockchange',
          pointerlockchangeCallback,
        )
        window.removeEventListener('resize', resizeCallback)
      }
    },
    [
      keydownCallback,
      keyupCallback,
      pointermoveCallback,
      pointerdownCallback,
      pointerlockchangeCallback,
      resizeCallback,
    ],
  )

  useEffect(
    function initAnimate() {
      animateCallback()
      return () => {
        resetCallback()
      }
    },
    [resetCallback, animateCallback],
  )

  useEffect(function initScene() {
    lights.current.load()

    scene.current.add(lights.current.ambient)
    scene.current.add(lights.current.directional)

    const json = localStorage.getItem('map1')
    if (json) {
      scene.current.load(json)
    }
  }, [])

  useEffect(
    function init() {
      info.current?.appendChild(stats.current.domElement)

      container.current?.appendChild(renderer.current.domElement)
    },
    [container, info],
  )

  return (
    <div>
      <div ref={container} style={{width: '100%', height: '100%'}} />
      <div ref={info} />
    </div>
  )
}
