import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { GLView } from 'expo-gl';
import type { ExpoWebGLRenderingContext } from 'expo-gl';
import { Renderer } from 'expo-three';
import * as THREE from 'three';
import { NOISE_MESH_FRAGMENT_SHADER, NOISE_MESH_VERTEX_SHADER } from './noiseMeshShaders';

type Props = {
  /** Wireframe line color (default white). */
  meshColor?: THREE.ColorRepresentation;
  /** Clear / background color (default black). */
  backgroundColor?: THREE.ColorRepresentation;
  /** Icosahedron radius — lower = smaller orb on screen (default tuned for welcome). */
  meshRadius?: number;
  /** Camera distance — higher = smaller apparent size. */
  cameraZ?: number;
  /** Vertical field of view in degrees — lower = less peripheral fill. */
  fov?: number;
};

export function GenerativeMeshGl({
  meshColor = '#ffffff',
  backgroundColor = '#000000',
  meshRadius = 1.2,
  cameraZ = 3,
  fov = 75,
}: Props) {
  const teardownRef = useRef<(() => void) | null>(null);

  useEffect(() => {
    return () => {
      teardownRef.current?.();
      teardownRef.current = null;
    };
  }, []);

  const onContextCreate = useCallback(
    (gl: ExpoWebGLRenderingContext) => {
      teardownRef.current?.();
      teardownRef.current = null;

      const w = gl.drawingBufferWidth;
      const h = gl.drawingBufferHeight;
      gl.viewport(0, 0, w, h);

      const renderer = new Renderer({
        gl: gl as unknown as WebGLRenderingContext,
        antialias: true,
        alpha: false,
        pixelRatio: 1,
      });
      renderer.setSize(w, h);
      renderer.setClearColor(new THREE.Color(backgroundColor), 1);

      const scene = new THREE.Scene();
      scene.background = new THREE.Color(backgroundColor);

      const camera = new THREE.PerspectiveCamera(fov, w / Math.max(h, 1), 0.1, 1000);
      camera.position.z = cameraZ;

      const geometry = new THREE.IcosahedronGeometry(meshRadius, 64);
      const material = new THREE.ShaderMaterial({
        uniforms: {
          time: { value: 0 },
          pointLightPos: { value: new THREE.Vector3(0, 0, 5) },
          color: { value: new THREE.Color(meshColor) },
        },
        vertexShader: NOISE_MESH_VERTEX_SHADER,
        fragmentShader: NOISE_MESH_FRAGMENT_SHADER,
        wireframe: true,
      });
      const mesh = new THREE.Mesh(geometry, material);
      scene.add(mesh);

      const pointLight = new THREE.PointLight(0xffffff, 1, 100);
      pointLight.position.set(0, 0, 5);
      scene.add(pointLight);

      let raf = 0;
      const loop = (t: number) => {
        material.uniforms.time.value = t * 0.0003;
        mesh.rotation.y += 0.0005;
        mesh.rotation.x += 0.0002;
        renderer.render(scene, camera);
        gl.endFrameEXP();
        raf = requestAnimationFrame(loop);
      };
      raf = requestAnimationFrame(loop);

      teardownRef.current = () => {
        cancelAnimationFrame(raf);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
      };
    },
    [meshColor, backgroundColor, meshRadius, cameraZ, fov],
  );

  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <GLView style={StyleSheet.absoluteFill} onContextCreate={onContextCreate} />
    </View>
  );
}
