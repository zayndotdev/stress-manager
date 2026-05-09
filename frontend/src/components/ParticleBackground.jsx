import React, { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";

function Particles({ count = 120, phase }) {
  const mesh = useRef();

  const phaseColors = {
    EXPLORE: new THREE.Color("#5B9BF7"),
    UNDERSTAND: new THREE.Color("#B07EF5"),
    SUGGEST: new THREE.Color("#3ECFB4"),
  };

  const targetColor = phaseColors[phase] || phaseColors.EXPLORE;

  const data = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const speeds = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 24;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 18;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 8;
      speeds[i] = Math.random() * 0.2 + 0.05;
    }
    return { positions, speeds };
  }, [count]);

  useFrame((state) => {
    if (!mesh.current) return;
    const time = state.clock.elapsedTime;
    const arr = mesh.current.geometry.attributes.position.array;
    for (let i = 0; i < count; i++) {
      const i3 = i * 3;
      arr[i3 + 1] += Math.sin(time * data.speeds[i] + i * 0.5) * 0.002;
      arr[i3] += Math.cos(time * data.speeds[i] * 0.4 + i) * 0.001;
    }
    mesh.current.geometry.attributes.position.needsUpdate = true;
    if (mesh.current.material.color) {
      mesh.current.material.color.lerp(targetColor, 0.015);
    }
  });

  return (
    <points ref={mesh}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={data.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.04}
        color={targetColor}
        transparent
        opacity={0.4}
        sizeAttenuation
        depthWrite={false}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

const ParticleBackground = ({ phase = "EXPLORE" }) => {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.35,
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 10], fov: 50 }}
        dpr={[1, 1.5]}
        gl={{ antialias: false, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.1} />
        <Particles count={120} phase={phase} />
      </Canvas>
    </div>
  );
};

export default ParticleBackground;
