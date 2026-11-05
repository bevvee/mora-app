import { Suspense, useEffect, useRef } from "react";
import type { Group } from "three";
import type { ModelKind } from "../../domain/product-presentation";
import { ProductModel } from "./product-model";
import { Canvas, Environment, Lightformer, useFrame } from "./runtime";

function StudioLight() {
  return (
    <>
      <ambientLight intensity={0.7} />
      <directionalLight position={[3, 5, 5]} intensity={2.1} color="#FFF4E5" />
      <directionalLight position={[-4, 2, 1]} intensity={1.3} color="#FFFFFF" />
      <Environment resolution={64} frames={1}>
        <Lightformer
          position={[0, 0, -6]}
          scale={[14, 12, 1]}
          intensity={0.6}
          color="#E7D5BE"
        />
        <Lightformer
          position={[0, 5, 0]}
          rotation={[Math.PI / 2, 0, 0]}
          scale={[6, 6, 1]}
          intensity={1.8}
          color="#FFF5E9"
        />
        <Lightformer
          position={[3, 1, -1]}
          rotation={[0, -Math.PI / 2, 0]}
          scale={[2, 6, 1]}
          intensity={2.4}
        />
        <group position={[-3, 2, 3]} rotation={[0, Math.PI * 0.78, 0]}>
          {[-0.54, 0.54].flatMap((x) =>
            [-0.82, 0, 0.82].map((y) => (
              <Lightformer
                key={`${x}-${y}`}
                position={[x, y, 0]}
                scale={[0.94, 0.7, 1]}
                intensity={3.5}
              />
            )),
          )}
        </group>
      </Environment>
    </>
  );
}
function Arrangement({
  kind,
  companion,
  animated,
  angle,
  collection,
  onReady,
}: {
  kind: ModelKind;
  companion?: ModelKind;
  animated: boolean;
  angle: number;
  collection: boolean;
  onReady?: (ready: boolean) => void;
}) {
  const rotating = useRef<Group>(null);
  useEffect(() => {
    onReady?.(true);
    return () => onReady?.(false);
  }, [onReady]);
  useFrame((_, delta) => {
    if (animated && rotating.current)
      rotating.current.rotation.y += Math.min(delta, 0.05) * 0.22;
  });
  return (
    <>
      <StudioLight />
      <group rotation={[0, angle, 0]}>
        <group ref={rotating}>
          {collection && companion ? (
            <>
              <group
                position={[-0.62, -0.15, 0]}
                rotation={[0, 0.1, -0.035]}
                scale={0.85}
              >
                <ProductModel kind={kind} />
              </group>
              <group
                position={[0.68, -0.1, 0.25]}
                rotation={[0, -0.18, 0]}
                scale={0.9}
              >
                <ProductModel kind={companion} />
              </group>
            </>
          ) : (
            <ProductModel kind={kind} />
          )}
        </group>
      </group>
      <mesh position={[0, -1.09, 0]}>
        <cylinderGeometry
          args={[collection ? 1.7 : 1.14, collection ? 1.75 : 1.19, 0.15, 64]}
        />
        <meshStandardMaterial color="#E5D3BD" roughness={0.82} />
      </mesh>
      <mesh
        position={[0, -1.172, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        scale={[1.3, 1, 1]}
      >
        <circleGeometry args={[collection ? 1.73 : 1.25, 64]} />
        <meshBasicMaterial
          color="#8B6C53"
          transparent
          opacity={0.1}
          depthWrite={false}
        />
      </mesh>
    </>
  );
}
export default function ProductScene({
  kind,
  companion,
  animated,
  angle = 0,
  collection = false,
  onReady,
}: {
  kind: ModelKind;
  companion?: ModelKind;
  animated: boolean;
  angle?: number;
  collection?: boolean;
  onReady?: (ready: boolean) => void;
}) {
  return (
    <Canvas
      style={{ flex: 1 }}
      frameloop={animated ? "always" : "demand"}
      camera={{
        position: [
          0,
          0.8,
          collection ? 6.5 : kind === "cloud-cream" ? 4.3 : 4.9,
        ],
        fov: 35,
      }}
      gl={{ antialias: true, alpha: true, powerPreference: "low-power" }}
      onCreated={({ gl, camera }) => {
        gl.setClearColor("#000000", 0);
        camera.lookAt(
          0,
          !collection && kind === "cloud-cream" ? -0.45 : 0.1,
          0,
        );
      }}
    >
      <Suspense fallback={null}>
        <Arrangement
          kind={kind}
          companion={companion}
          animated={animated}
          angle={angle}
          collection={collection}
          onReady={onReady}
        />
      </Suspense>
    </Canvas>
  );
}
