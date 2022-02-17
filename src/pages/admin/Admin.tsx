import React, {createRef, useCallback, useEffect, useRef} from 'react'
import {Camera, Scene, Lights, Render, Cubes} from '../../class'
// @ts-ignore
import Stats from 'three/examples/jsm/libs/stats.module'
import Control from '../../components/control'

export default function Admin() {
  const container = createRef<HTMLDivElement>()
  const info = createRef<HTMLDivElement>()

  // @ts-ignore
  const stats = useRef(new Stats())
  const pause = useRef(true)
  const lights = useRef(new Lights())
  const renderer = useRef(new Render())
  const scene = useRef(new Scene(100))
  const camera = useRef(new Camera(10000, scene.current, renderer.current))
  const cubes = useRef(new Cubes(scene.current, camera.current))

  const animateCallback = useCallback(function animate() {
    if (scene.current && camera.current && renderer.current) {
      renderer.current.render(scene.current, camera.current)
    }

    stats.current?.update()

    requestAnimationFrame(animateCallback)
  }, [])

  const resizeCallback = useCallback(
    function resize() {
      camera.current.aspect = window.innerWidth / window.innerHeight
      camera.current.updateProjectionMatrix()

      renderer.current.setSize(window.innerWidth, window.innerHeight)
    },
    [camera, renderer],
  )

  const keydownCallback = useCallback(function keydown(event) {
    if (event.code === 'Escape') {
      document.exitPointerLock()
    }
  }, [])

  const pointerMoveCallback = useCallback(
    function pointerMove(event) {
      if (cubes.current) cubes.current?.onPointerMove(event)
    },
    [cubes],
  )

  const mouseDownCallback = useCallback(
    function mouseDown(event) {
      if (cubes.current) cubes.current?.onMouseDown(event)
    },
    [cubes],
  )

  const pointerlockchangeCallback = useCallback(function pointerlockchange() {
    pause.current = !document.pointerLockElement
  }, [])

  const resetCallback = useCallback(function reset() {
    lights.current.dispose()
    renderer.current.dispose()
    cubes.current.dispose()
  }, [])

  useEffect(
    function eventListenerInit() {
      const {current} = container
      window.addEventListener('resize', resizeCallback)
      document.addEventListener('keydown', keydownCallback)
      document.addEventListener('pointermove', pointerMoveCallback)
      current?.addEventListener('mousedown', mouseDownCallback)
      document.addEventListener('pointerlockchange', pointerlockchangeCallback)
      return () => {
        window.removeEventListener('resize', resizeCallback)
        document.removeEventListener('keydown', keydownCallback)
        document.removeEventListener('pointermove', pointerMoveCallback)
        document.removeEventListener('pointerdown', mouseDownCallback)
        document.removeEventListener(
          'pointerlockchange',
          pointerlockchangeCallback,
        )
      }
    },
    [
      pointerMoveCallback,
      mouseDownCallback,
      resizeCallback,
      pointerlockchangeCallback,
      keydownCallback,
    ],
  )

  useEffect(
    function init() {
      info.current?.appendChild(stats.current.domElement)

      container.current?.appendChild(renderer.current.domElement)

      lights.current.load()

      scene.current.grid()

      scene.current.add(lights.current.ambient)
      scene.current.add(lights.current.directional)

      camera.current.position.set(0, 500, 500)

      cubes.current.addRollOver()

      animateCallback()

      return () => {
        resetCallback()
      }
    },
    [resetCallback, container, info, animateCallback],
  )

  return (
    <>
      <div
        ref={container}
        style={{position: 'absolute', top: 0, right: 0, bottom: 0, width: 240}}>
        <Control />
      </div>
      <div
        ref={container}
        style={{position: 'absolute', top: 0, right: 0, bottom: 0, left: 240}}
      />
      <div ref={info} />
    </>
  )
}
