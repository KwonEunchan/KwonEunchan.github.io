"use client";

import { Canvas } from "@react-three/fiber";
import { OrbitControls } from "@react-three/drei";
import Scene from "./Scene";

export default function BlogCanvas() {
  return (
    <div className="w-full h-full absolute inset-0 -z-10">
      <Canvas
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ antialias: true }}
      >
        <ambientLight intensity={0.5} />
        <directionalLight position={[10, 10, 5]} intensity={1} />
        <Scene />
        <OrbitControls enableZoom={false} />
      </Canvas>
    </div>
  );
}