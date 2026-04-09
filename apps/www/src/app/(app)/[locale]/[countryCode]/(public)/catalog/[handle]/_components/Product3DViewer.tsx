"use client"

import { useEffect, useRef } from "react"
import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js"

type Product3DViewerProps = {
  modelUrl?: string
}

export function Product3DViewer({ modelUrl }: Product3DViewerProps) {
  const mountRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const mount = mountRef.current
    if (!mount) return

    const scene = new THREE.Scene()
    scene.background = new THREE.Color("#f8f7f6")

    const camera = new THREE.PerspectiveCamera(35, 1, 0.1, 100)
    camera.position.set(2.2, 2.2, 2.2)

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false })
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2))
    renderer.shadowMap.enabled = true
    mount.appendChild(renderer.domElement)

    const ambient = new THREE.AmbientLight(0xffffff, 0.7)
    scene.add(ambient)

    const keyLight = new THREE.DirectionalLight(0xffffff, 1.0)
    keyLight.position.set(4, 6, 3)
    keyLight.castShadow = true
    scene.add(keyLight)

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.35)
    fillLight.position.set(-3, 2, -2)
    scene.add(fillLight)

    const ground = new THREE.Mesh(
      new THREE.CircleGeometry(2, 64),
      new THREE.MeshStandardMaterial({ color: "#eceae8", roughness: 0.9, metalness: 0.0 })
    )
    ground.rotation.x = -Math.PI / 2
    ground.position.y = -0.35
    ground.receiveShadow = true
    scene.add(ground)

    const controls = new OrbitControls(camera, renderer.domElement)
    controls.enablePan = false
    controls.minDistance = 1.2
    controls.maxDistance = 5.5
    controls.enableDamping = true

    let rootObject: THREE.Object3D | null = null

    const addFallback = () => {
      const group = new THREE.Group()

      const body = new THREE.Mesh(
        new THREE.CylinderGeometry(0.85, 0.95, 0.5, 64),
        new THREE.MeshStandardMaterial({ color: "#f5f5f4", roughness: 0.45, metalness: 0.05 })
      )
      body.position.set(0, 0.2, 0)
      body.castShadow = true
      group.add(body)

      const ring = new THREE.Mesh(
        new THREE.TorusGeometry(0.55, 0.1, 32, 96),
        new THREE.MeshStandardMaterial({ color: "#d6d3d1", roughness: 0.55, metalness: 0.05 })
      )
      ring.position.set(0, 0.55, 0)
      ring.castShadow = true
      group.add(ring)

      const sole = new THREE.Mesh(
        new THREE.BoxGeometry(1.35, 0.15, 1.35),
        new THREE.MeshStandardMaterial({ color: "#78716c", roughness: 0.6, metalness: 0.05 })
      )
      sole.position.set(0, -0.15, 0)
      sole.castShadow = true
      group.add(sole)

      rootObject = group
      scene.add(group)
    }

    if (modelUrl) {
      new GLTFLoader().load(
        modelUrl,
        (gltf) => {
          rootObject = gltf.scene
          gltf.scene.traverse((child) => {
            const mesh = child as THREE.Mesh
            if (mesh.isMesh) mesh.castShadow = true
          })
          scene.add(gltf.scene)
        },
        undefined,
        () => addFallback()
      )
    } else {
      addFallback()
    }

    const resize = () => {
      const { clientWidth, clientHeight } = mount
      if (!clientWidth || !clientHeight) return
      renderer.setSize(clientWidth, clientHeight, false)
      camera.aspect = clientWidth / clientHeight
      camera.updateProjectionMatrix()
    }

    resize()
    const resizeObserver = new ResizeObserver(resize)
    resizeObserver.observe(mount)

    let rafId = 0
    const animate = () => {
      rafId = requestAnimationFrame(animate)
      if (rootObject && !modelUrl) rootObject.rotation.y += 0.005
      controls.update()
      renderer.render(scene, camera)
    }
    animate()

    return () => {
      cancelAnimationFrame(rafId)
      resizeObserver.disconnect()
      controls.dispose()
      renderer.dispose()
      if (renderer.domElement.parentElement === mount) mount.removeChild(renderer.domElement)
      scene.clear()
    }
  }, [modelUrl])

  return (
    <div className="pdp-gallery__viewer3d">
      <div ref={mountRef} className="pdp-gallery__viewer3d-mount" />
      <p className="pdp-gallery__viewer-hint">Drag to rotate • Scroll to zoom</p>
    </div>
  )
}
