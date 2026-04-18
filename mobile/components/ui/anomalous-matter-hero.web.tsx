import '../../global.css';
import React, { Suspense, useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { AnomalousMatterHeroProps } from './anomalous-matter-hero.types';
import { NOISE_MESH_FRAGMENT_SHADER, NOISE_MESH_VERTEX_SHADER } from './noiseMeshShaders';

const MESH_COLOR = '#ffffff';
const BG_COLOR = '#000000';

function syncLandingCssVariables(): void {
  if (typeof document === 'undefined') return;
  const root = document.documentElement;
  root.style.setProperty('--background', '0, 0%, 0%');
  root.style.setProperty('--foreground', '0, 0%, 100%');
  root.style.setProperty('--muted', '0, 0%, 62%');
}

export function GenerativeArtScene() {
  const mountRef = useRef<HTMLDivElement | null>(null);
  const lightRef = useRef<THREE.PointLight | null>(null);

  useEffect(() => {
    syncLandingCssVariables();
    const currentMount = mountRef.current;
    if (!currentMount || currentMount.clientWidth === 0) {
      return;
    }

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(BG_COLOR);

    const camera = new THREE.PerspectiveCamera(
      75,
      currentMount.clientWidth / Math.max(currentMount.clientHeight, 1),
      0.1,
      1000,
    );
    camera.position.z = 3;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
    renderer.setClearColor(new THREE.Color(BG_COLOR), 1);
    renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    renderer.setPixelRatio(typeof window !== 'undefined' ? Math.min(window.devicePixelRatio, 2) : 1);
    currentMount.appendChild(renderer.domElement);

    const geometry = new THREE.IcosahedronGeometry(1.2, 64);
    const material = new THREE.ShaderMaterial({
      uniforms: {
        time: { value: 0 },
        pointLightPos: { value: new THREE.Vector3(0, 0, 5) },
        color: { value: new THREE.Color(MESH_COLOR) },
      },
      vertexShader: NOISE_MESH_VERTEX_SHADER,
      fragmentShader: NOISE_MESH_FRAGMENT_SHADER,
      wireframe: true,
    });
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const pointLight = new THREE.PointLight(0xffffff, 1, 100);
    pointLight.position.set(0, 0, 5);
    lightRef.current = pointLight;
    scene.add(pointLight);

    let frameId = 0;
    const animate = (t: number) => {
      material.uniforms.time.value = t * 0.0003;
      mesh.rotation.y += 0.0005;
      mesh.rotation.x += 0.0002;
      renderer.render(scene, camera);
      frameId = requestAnimationFrame(animate);
    };
    animate(0);

    const handleResize = () => {
      camera.aspect = currentMount.clientWidth / Math.max(currentMount.clientHeight, 1);
      camera.updateProjectionMatrix();
      renderer.setSize(currentMount.clientWidth, currentMount.clientHeight);
    };

    const handleMouseMove = (e: MouseEvent) => {
      if (!lightRef.current) return;
      const x = (e.clientX / window.innerWidth) * 2 - 1;
      const y = -(e.clientY / window.innerHeight) * 2 + 1;
      const vec = new THREE.Vector3(x, y, 0.5).unproject(camera);
      const dir = vec.sub(camera.position).normalize();
      const dist = -camera.position.z / dir.z;
      const pos = camera.position.clone().add(dir.multiplyScalar(dist));
      lightRef.current.position.copy(pos);
      material.uniforms.pointLightPos.value.copy(pos);
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      if (renderer.domElement.parentNode === currentMount) {
        currentMount.removeChild(renderer.domElement);
      }
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div
      ref={mountRef}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', zIndex: 0 }}
    />
  );
}

export function AnomalousMatterHero({
  title = 'Welcome',
  subtitle = '',
  description = '',
}: AnomalousMatterHeroProps) {
  return (
    <section
      role="banner"
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        width: '100%',
        minHeight: 0,
        height: '100%',
        backgroundColor: BG_COLOR,
        color: 'hsl(var(--foreground))',
        overflow: 'hidden',
      }}
    >
      <Suspense fallback={<div style={{ flex: 1, minHeight: 0, width: '100%', backgroundColor: BG_COLOR }} />}>
        <GenerativeArtScene />
      </Suspense>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: `linear-gradient(to top, ${BG_COLOR} 0%, transparent 62%)`,
          zIndex: 10,
          pointerEvents: 'none',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 20,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          flex: 1,
          minHeight: 0,
          width: '100%',
          padding: 'clamp(1.5rem, 5vw, 2.5rem)',
          textAlign: 'center',
          boxSizing: 'border-box',
        }}
      >
        <style>{`
          @keyframes heroFadeIn {
            from { opacity: 0; transform: translateY(10px); }
            to { opacity: 1; transform: translateY(0); }
          }
          .hero-copy {
            animation: heroFadeIn 0.55s ease-out both;
            width: 100%;
            max-width: 26rem;
            margin-left: auto;
            margin-right: auto;
          }
        `}</style>
        <div className="hero-copy">
          <h1
            style={{
              fontSize: '0.6875rem',
              fontWeight: 600,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'hsl(var(--muted))',
              margin: 0,
            }}
          >
            {title}
          </h1>
          <p
            style={{
              marginTop: '1.25rem',
              fontSize: 'clamp(1.375rem, 3.2vw, 1.75rem)',
              fontWeight: 600,
              lineHeight: 1.25,
              marginBottom: 0,
              color: 'hsl(var(--foreground))',
            }}
          >
            {subtitle}
          </p>
          {description ? (
            <p
              style={{
                marginTop: '1rem',
                fontSize: '0.9375rem',
                lineHeight: 1.55,
                color: 'hsl(var(--muted))',
                marginBottom: 0,
              }}
            >
              {description}
            </p>
          ) : null}
        </div>
      </div>
    </section>
  );
}
