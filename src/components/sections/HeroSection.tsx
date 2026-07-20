"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroSection() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!canvasRef.current || !containerRef.current) return;

    const container = containerRef.current;
    const scene = new THREE.Scene();
    scene.background = new THREE.Color("#050814");

    const camera = new THREE.PerspectiveCamera(60, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 0, 10);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({
      canvas: canvasRef.current,
      antialias: true,
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(container.clientWidth, container.clientHeight);

    const ambientLight = new THREE.AmbientLight("#050814", 0.8);
    scene.add(ambientLight);

    const lightsData = [
      { color: "#0ea5e9", intensity: 65, distance: 75, speedX: 0.4, speedY: 0.25, ampX: 12, ampY: 4.5, offset: 0 },  // Sky Blue
      { color: "#a855f7", intensity: 65, distance: 75, speedX: 0.3, speedY: 0.4, ampX: 11, ampY: 4, offset: 2 },   // Purple
      { color: "#06b6d4", intensity: 55, distance: 65, speedX: 0.5, speedY: 0.3, ampX: 10, ampY: 4.5, offset: 4 },  // Cyan
      { color: "#f43f5e", intensity: 55, distance: 65, speedX: 0.25, speedY: 0.35, ampX: 11, ampY: 3.5, offset: 6 }, // Rose/Pink
      { color: "#10b981", intensity: 50, distance: 60, speedX: 0.35, speedY: 0.2, ampX: 10, ampY: 4, offset: 8 },   // Emerald
      { color: "#eab308", intensity: 50, distance: 60, speedX: 0.28, speedY: 0.4, ampX: 11, ampY: 3.5, offset: 10 } // Amber
    ];

    const pointLights: THREE.PointLight[] = [];

    lightsData.forEach((data) => {
      const light = new THREE.PointLight(data.color, data.intensity, data.distance);
      
      light.position.set(0, 0, 4.5); 
      scene.add(light);
      pointLights.push(light);
    });

  
    const geometry = new THREE.PlaneGeometry(65, 50);
    const material = new THREE.MeshStandardMaterial({
      color: 0x050814,
      roughness: 0.95,       
      metalness: 0.0,        
    });

    const backdrop = new THREE.Mesh(geometry, material);
    backdrop.position.set(0, 0, 0);
    scene.add(backdrop);

    let animationFrameId: number;
    const clock = new THREE.Clock();

    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      
      const elapsedTime = clock.getElapsedTime();

      pointLights.forEach((light, index) => {
        const data = lightsData[index];
        const t = elapsedTime + data.offset;

        light.position.x = Math.sin(t * data.speedX) * data.ampX;
        light.position.y = Math.cos(t * data.speedY) * data.ampY;
      });

      renderer.render(scene, camera);
    };
    
    animate();

    // 6. 반응형 리사이즈
    const handleResize = () => {
      if (!canvasRef.current || !containerRef.current) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    };
    window.addEventListener("resize", handleResize);

    // 7. 클린업
    return () => {
      window.removeEventListener("resize", handleResize);
      cancelAnimationFrame(animationFrameId);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <section 
  ref={containerRef} 
  className="relative h-[260px] sm:h-[400px] md:h-[450px] w-full bg-[#050814] flex flex-col items-center justify-end pb-10 sm:pb-0 md:justify-center overflow-hidden mb-[25px] sm:mb-[50px]"
>
      <canvas ref={canvasRef} className="absolute inset-0 z-0 w-full h-full pointer-events-none" />
      <div className="relative z-10 flex flex-col items-center text-center px-4 sm:px-6 max-w-4xl select-none">
        <h1 className="text-white text-3xl sm:text-4xl md:text-6xl font-black mb-1 md:mb-3 tracking-tight drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] whitespace-nowrap">
          Not by assumption, 
        </h1>
        <h2 className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-blue-400 to-indigo-400 text-3xl sm:text-4xl md:text-7xl font-black mb-4 md:mb-8 tracking-tight pb-1 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)] whitespace-nowrap">
          but by solid proof 
        </h2>
        <p className="text-gray-300 max-w-2xl text-xs sm:text-sm md:text-base leading-relaxed mx-auto font-bold drop-shadow-sm break-keep">
          막연한 추측 대신 명확한 근거를 가지고,<br />
          문제를 깊이 이해하며 신뢰할 수 있는 시스템을 만들어갑니다.
        </p>
      </div>
    </section>
  );
}