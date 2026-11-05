import { useEffect, useMemo } from "react";
import {
  BufferGeometry,
  Float32BufferAttribute,
  Shape,
  SphereGeometry,
  CylinderGeometry,
  Vector2,
} from "three";
import type { ModelKind } from "../../domain/product-presentation";
import { RoundedBox } from "./runtime";
import { PrintedWaves, ReferenceLabel } from "./reference-label";

const chocolate = "#4C2718";
const ivory = "#F1E4CC";
type Profile = [number, number][];
function Finish({
  color = ivory,
  glass = false,
  polished = false,
  metal = false,
}: {
  color?: string;
  glass?: boolean;
  polished?: boolean;
  metal?: boolean;
}) {
  return (
    <meshPhysicalMaterial
      color={color}
      roughness={metal ? 0.18 : glass ? 0.09 : polished ? 0.16 : 0.39}
      metalness={metal ? 0.82 : 0}
      clearcoat={glass || polished ? 1 : 0.22}
      clearcoatRoughness={0.11}
      transparent={glass}
      opacity={glass ? 0.27 : 1}
      depthWrite={!glass}
      side={2}
    />
  );
}
function Lathe({
  profile,
  color,
  glass = false,
  polished = false,
  metal = false,
}: {
  profile: Profile;
  color: string;
  glass?: boolean;
  polished?: boolean;
  metal?: boolean;
}) {
  const points = useMemo(
    () => profile.map(([r, y]) => new Vector2(r, y)),
    [profile],
  );
  return (
    <mesh>
      <latheGeometry args={[points, 64]} />
      <Finish color={color} glass={glass} polished={polished} metal={metal} />
    </mesh>
  );
}
function Cylinder({
  r,
  h,
  y,
  color = chocolate,
  polished = false,
  metal = false,
}: {
  r: number;
  h: number;
  y: number;
  color?: string;
  polished?: boolean;
  metal?: boolean;
}) {
  return (
    <mesh position={[0, y, 0]}>
      <cylinderGeometry args={[r, r, h, 64]} />
      <Finish color={color} polished={polished} metal={metal} />
    </mesh>
  );
}
function SculpturalCap({
  kind,
  y = 1,
  color = chocolate,
}: {
  kind: "bean" | "pebble" | "sphere";
  y?: number;
  color?: string;
}) {
  const geometry = useMemo(() => {
    const shape = new SphereGeometry(1, 48, 32);
    if (kind === "bean") {
      const p = shape.attributes.position;
      for (let i = 0; i < p.count; i++) {
        const x = p.getX(i),
          sy = p.getY(i),
          z = p.getZ(i);
        const ny =
          sy < -0.65
            ? -0.65 + (sy + 0.65) * 0.2
            : sy + 0.24 * x - 0.26 * Math.exp(-5 * x * x) * Math.max(sy, 0);
        p.setXYZ(i, x * (1 + 0.07 * Math.sin(sy * 3)), ny, z * (1 + 0.07 * x));
      }
      shape.computeVertexNormals();
    }
    return shape;
  }, [kind]);
  useEffect(() => () => geometry.dispose(), [geometry]);
  const scale: [number, number, number] =
    kind === "sphere"
      ? [0.47, 0.47, 0.47]
      : kind === "bean"
        ? [0.66, 0.4, 0.42]
        : [0.65, 0.4, 0.45];
  return (
    <mesh position={[0, y, 0]} scale={scale} geometry={geometry}>
      <Finish color={color} polished />
    </mesh>
  );
}
function Pump({
  y,
  color = chocolate,
  small = false,
}: {
  y: number;
  color?: string;
  small?: boolean;
}) {
  const scale = small ? 0.87 : 1;
  return (
    <group position={[0, y, 0]} scale={scale}>
      <Cylinder
        r={small ? 0.28 : 0.235}
        h={small ? 0.4 : 0.28}
        y={0}
        color={color}
      />
      <Cylinder
        r={small ? 0.18 : 0.13}
        h={small ? 0.2 : 0.22}
        y={small ? 0.3 : 0.23}
        color={color}
      />
      <RoundedBox
        args={small ? [0.44, 0.22, 0.36] : [0.4, 0.13, 0.29]}
        radius={0.06}
        smoothness={3}
        position={[-0.025, small ? 0.43 : 0.37, 0]}
      >
        <Finish color={color} polished />
      </RoundedBox>
      <RoundedBox
        args={small ? [0.25, 0.11, 0.18] : [0.48, 0.095, 0.17]}
        radius={0.035}
        smoothness={3}
        position={[small ? -0.25 : -0.29, small ? 0.45 : 0.37, 0]}
        rotation={[0, 0, 0.06]}
      >
        <Finish color={color} polished />
      </RoundedBox>
      <mesh
        position={[small ? -0.38 : -0.535, small ? 0.45 : 0.355, 0]}
        rotation={[0, -Math.PI / 2, 0]}
      >
        <circleGeometry args={[0.035, 20]} />
        <meshBasicMaterial color="#28140B" />
      </mesh>
    </group>
  );
}
function TubeBody() {
  const geometry = useMemo(() => {
    const geo = new BufferGeometry(),
      positions: number[] = [],
      uvs: number[] = [],
      indices: number[] = [];
    const rings = 40,
      segments = 64;
    for (let i = 0; i <= rings; i++) {
      const t = i / rings,
        rx = 0.32 + 0.17 * t,
        rz = 0.19 * (1 - Math.pow(t, 4)) + 0.022;
      for (let j = 0; j <= segments; j++) {
        const u = j / segments,
          a = u * Math.PI * 2;
        positions.push(Math.sin(a) * rx, -0.68 + t * 1.8, Math.cos(a) * rz);
        uvs.push(u, t);
      }
    }
    for (let i = 0; i < rings; i++)
      for (let j = 0; j < segments; j++) {
        const a = i * (segments + 1) + j,
          b = a + segments + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    geo.setAttribute("position", new Float32BufferAttribute(positions, 3));
    geo.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
    geo.setIndex(indices);
    geo.computeVertexNormals();
    return geo;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry}>
      <Finish />
    </mesh>
  );
}
function LipBullet() {
  const geometry = useMemo(() => {
    const geo = new CylinderGeometry(0.175, 0.18, 0.32, 48, 1, false),
      p = geo.attributes.position;
    for (let i = 0; i < p.count; i++)
      if (p.getY(i) > 0) p.setY(i, p.getY(i) + p.getX(i) * 0.9);
    geo.computeVertexNormals();
    return geo;
  }, []);
  useEffect(() => () => geometry.dispose(), [geometry]);
  return (
    <mesh geometry={geometry} position={[0, 0.5, 0]}>
      <meshPhysicalMaterial color="#BE6C76" roughness={0.5} clearcoat={0.12} />
    </mesh>
  );
}
function FacetedFlask({ inner = false }: { inner?: boolean }) {
  const shape = useMemo(() => {
    const s = new Shape();
    s.moveTo(-0.55, -0.9);
    s.lineTo(-0.8, -0.66);
    s.lineTo(-0.8, 0.06);
    s.lineTo(-0.53, 0.41);
    s.lineTo(0.53, 0.41);
    s.lineTo(0.8, 0.06);
    s.lineTo(0.8, -0.66);
    s.lineTo(0.55, -0.9);
    s.closePath();
    return s;
  }, []);
  return (
    <mesh
      position={[0, inner ? -0.07 : 0, -0.27]}
      scale={inner ? [0.86, 0.88, 0.76] : [1, 1, 1]}
    >
      <extrudeGeometry
        args={[
          shape,
          {
            depth: 0.54,
            bevelEnabled: true,
            bevelSize: 0.09,
            bevelThickness: 0.08,
            bevelSegments: 2,
            steps: 1,
            curveSegments: 1,
          },
        ]}
      />
      {inner ? (
        <meshPhysicalMaterial
          color="#D99076"
          roughness={0.2}
          transparent
          opacity={0.63}
          depthWrite={false}
        />
      ) : (
        <Finish color="#F1C4AA" glass />
      )}
    </mesh>
  );
}

export function ProductModel({ kind }: { kind: ModelKind }) {
  if (kind === "petal-toner")
    return (
      <group>
        <Lathe
          profile={[
            [0, -1],
            [0.37, -1],
            [0.46, -0.96],
            [0.49, -0.84],
            [0.49, 0.48],
            [0.45, 0.63],
            [0.34, 0.69],
            [0, 0.69],
          ]}
          color="#F5CABC"
          glass
        />
        <mesh position={[0, -0.17, 0]}>
          <cylinderGeometry args={[0.438, 0.438, 1.49, 64]} />
          <meshPhysicalMaterial
            color="#EAB3A0"
            roughness={0.18}
            transparent
            opacity={0.7}
            depthWrite={false}
          />
        </mesh>
        <Lathe
          profile={[
            [0, 0.69],
            [0.35, 0.69],
            [0.35, 1.03],
            [0.31, 1.15],
            [0.2, 1.2],
            [0, 1.21],
          ]}
          color={chocolate}
          polished
        />
        <ReferenceLabel
          kind={kind}
          y={-0.22}
          width={0.7}
          height={0.94}
          radius={0.495}
        />
      </group>
    );
  if (kind === "silk-cleanser")
    return (
      <group>
        <Lathe
          profile={[
            [0, -1],
            [0.3, -1],
            [0.38, -0.96],
            [0.39, -0.88],
            [0.39, 0.68],
            [0.35, 0.74],
            [0.23, 0.76],
            [0, 0.76],
          ]}
          color={ivory}
        />
        <Pump y={0.9} />
        <PrintedWaves radius={0.393} height={1.65} y={-0.12} />
        <ReferenceLabel
          kind={kind}
          y={-0.13}
          width={0.57}
          height={0.68}
          radius={0.396}
        />
      </group>
    );
  if (kind === "cloud-cream")
    return (
      <group>
        <Lathe
          profile={[
            [0, -1],
            [0.57, -1],
            [0.7, -0.94],
            [0.73, -0.84],
            [0.73, -0.28],
            [0.69, -0.22],
            [0, -0.22],
          ]}
          color={ivory}
        />
        <Lathe
          profile={[
            [0, -0.23],
            [0.73, -0.23],
            [0.735, -0.04],
            [0.7, 0.01],
            [0, 0.02],
          ]}
          color={chocolate}
          polished
        />
        <PrintedWaves radius={0.735} height={0.76} y={-0.61} />
        <ReferenceLabel
          kind={kind}
          y={-0.53}
          width={1.05}
          height={0.47}
          radius={0.742}
        />
      </group>
    );
  if (kind === "dew-serum")
    return (
      <group>
        <Lathe
          profile={[
            [0, -1],
            [0.32, -1],
            [0.43, -0.94],
            [0.445, -0.85],
            [0.445, 0.22],
            [0.39, 0.3],
            [0.24, 0.34],
            [0, 0.34],
          ]}
          color="#EADBC1"
        />
        <Cylinder r={0.29} h={0.34} y={0.5} />
        <Lathe
          profile={[
            [0, 0.67],
            [0.18, 0.67],
            [0.15, 0.78],
            [0.13, 1.11],
            [0.1, 1.22],
            [0.07, 1.26],
            [0.04, 1.275],
            [0, 1.28],
          ]}
          color={chocolate}
        />
        <PrintedWaves radius={0.448} height={1.26} y={-0.35} />
        <ReferenceLabel
          kind={kind}
          y={-0.33}
          width={0.65}
          height={0.7}
          radius={0.453}
        />
      </group>
    );
  if (kind === "sun-veil")
    return (
      <group>
        <TubeBody />
        <Cylinder r={0.32} h={0.3} y={-0.84} />
        <Cylinder r={0.323} h={0.018} y={-0.835} color="#351B11" />
        <RoundedBox
          args={[0.98, 0.09, 0.058]}
          radius={0.015}
          smoothness={2}
          position={[0, 1.12, 0]}
        >
          <Finish />
        </RoundedBox>
        {Array.from({ length: 25 }, (_, i) => (
          <mesh key={i} position={[-0.46 + i * 0.038, 1.12, 0.033]}>
            <boxGeometry args={[0.012, 0.08, 0.012]} />
            <meshStandardMaterial color="#D9C9B0" />
          </mesh>
        ))}
        <PrintedWaves width={0.69} height={1.6} y={0.2} surface="tube" />
        <ReferenceLabel
          kind={kind}
          y={0.25}
          width={0.65}
          height={0.94}
          surface="tube"
        />
      </group>
    );
  if (kind === "velvet-lip")
    return (
      <group>
        <Lathe
          profile={[
            [0, -1],
            [0.25, -1],
            [0.31, -0.96],
            [0.31, -0.17],
            [0.26, -0.12],
            [0, -0.12],
          ]}
          color={chocolate}
        />
        <Cylinder r={0.235} h={0.48} y={0.1} />
        <Cylinder r={0.265} h={0.055} y={-0.12} />
        <LipBullet />
        <ReferenceLabel
          kind={kind}
          y={-0.54}
          width={0.48}
          height={0.53}
          radius={0.315}
        />
      </group>
    );
  if (kind === "rose-tint")
    return (
      <group>
        <Lathe
          profile={[
            [0, -1],
            [0.3, -1],
            [0.42, -0.93],
            [0.45, -0.79],
            [0.45, 0.3],
            [0.4, 0.41],
            [0, 0.42],
          ]}
          color="#D9958C"
        />
        <Lathe
          profile={[
            [0, 0.42],
            [0.42, 0.42],
            [0.42, 0.91],
            [0.38, 1.1],
            [0.25, 1.23],
            [0, 1.26],
          ]}
          color={chocolate}
        />
        <ReferenceLabel
          kind={kind}
          y={-0.28}
          width={0.67}
          height={0.77}
          radius={0.455}
        />
      </group>
    );
  if (kind === "lash-muse")
    return (
      <group>
        <Lathe
          profile={[
            [0, -1],
            [0.14, -1],
            [0.19, -0.96],
            [0.25, -0.42],
            [0.265, 0.38],
            [0, 0.38],
          ]}
          color={chocolate}
        />
        <Cylinder r={0.268} h={0.016} y={0.395} color="#2B170E" />
        <Lathe
          profile={[
            [0, 0.41],
            [0.265, 0.41],
            [0.22, 1.11],
            [0.17, 1.33],
            [0.14, 1.36],
            [0, 1.36],
          ]}
          color={chocolate}
        />
        <ReferenceLabel
          kind={kind}
          y={-0.3}
          width={0.4}
          height={0.88}
          radius={0.268}
        />
      </group>
    );
  if (kind === "honey-gloss")
    return (
      <group>
        <Lathe
          profile={[
            [0, -1],
            [0.24, -1],
            [0.32, -0.96],
            [0.33, -0.86],
            [0.33, 0.45],
            [0, 0.45],
          ]}
          color="#F8D8C1"
          glass
        />
        <mesh position={[0, -0.23, 0]}>
          <cylinderGeometry args={[0.285, 0.285, 1.4, 64]} />
          <meshPhysicalMaterial
            color="#D8997E"
            roughness={0.24}
            clearcoat={0.7}
          />
        </mesh>
        <Lathe
          profile={[
            [0, 0.46],
            [0.34, 0.46],
            [0.34, 1.28],
            [0.31, 1.33],
            [0, 1.33],
          ]}
          color={chocolate}
          polished
        />
        <ReferenceLabel
          kind={kind}
          y={-0.25}
          width={0.49}
          height={0.83}
          radius={0.336}
        />
      </group>
    );
  if (kind === "skin-silk")
    return (
      <group>
        <Lathe
          profile={[
            [0, -1],
            [0.31, -1],
            [0.43, -0.93],
            [0.48, -0.73],
            [0.48, 0.26],
            [0.41, 0.42],
            [0.25, 0.46],
            [0, 0.46],
          ]}
          color="#D9B28C"
        />
        <Pump y={0.6} color={ivory} small />
        <PrintedWaves radius={0.485} height={1.32} y={-0.28} />
        <ReferenceLabel
          kind={kind}
          y={-0.23}
          width={0.71}
          height={0.79}
          radius={0.489}
        />
      </group>
    );
  if (kind === "vanille-douce")
    return (
      <group>
        <Lathe
          profile={[
            [0, -1],
            [0.52, -1],
            [0.63, -0.95],
            [0.65, -0.83],
            [0.65, 0.36],
            [0.61, 0.46],
            [0.2, 0.49],
            [0, 0.49],
          ]}
          color="#E8BE78"
          glass
        />
        <mesh position={[0, -0.23, 0]}>
          <cylinderGeometry args={[0.57, 0.57, 1.31, 64]} />
          <meshPhysicalMaterial
            color="#D49B42"
            roughness={0.16}
            transparent
            opacity={0.62}
            depthWrite={false}
          />
        </mesh>
        <mesh position={[0, -0.21, 0]}>
          <cylinderGeometry
            args={[0.656, 0.656, 0.98, 64, 1, true, -1.06, 2.12]}
          />
          <meshStandardMaterial color="#EEDFC4" roughness={0.6} />
        </mesh>
        <Cylinder r={0.235} h={0.14} y={0.56} color="#C8A06B" metal />
        <SculpturalCap kind="pebble" y={1.02} />
        <PrintedWaves radius={0.659} height={0.98} y={-0.21} />
        <ReferenceLabel
          kind={kind}
          y={-0.13}
          width={1.02}
          height={0.65}
          radius={0.666}
        />
      </group>
    );
  if (kind === "bois-de-soie")
    return (
      <group>
        <RoundedBox
          args={[1.62, 1.53, 0.78]}
          radius={0.13}
          smoothness={3}
          position={[0, -0.225, 0]}
        >
          <Finish color="#A76C3B" glass />
        </RoundedBox>
        <RoundedBox
          args={[1.39, 1.29, 0.57]}
          radius={0.16}
          smoothness={3}
          position={[0, -0.19, 0]}
        >
          <meshPhysicalMaterial
            color="#B77F4B"
            roughness={0.17}
            transparent
            opacity={0.65}
            depthWrite={false}
          />
        </RoundedBox>
        <Cylinder r={0.28} h={0.14} y={0.61} color="#C8A06B" metal />
        <SculpturalCap kind="bean" y={0.96} color={ivory} />
        <ReferenceLabel
          kind={kind}
          y={-0.22}
          width={1.05}
          height={0.91}
          z={0.401}
        />
      </group>
    );
  if (kind === "fleur-de-lune")
    return (
      <group>
        <mesh position={[0, -0.22, 0]} scale={[0.94, 0.78, 0.4]}>
          <sphereGeometry args={[1, 64, 40]} />
          <Finish color="#F4DFC1" glass />
        </mesh>
        <mesh position={[0, -0.2, 0]} scale={[0.8, 0.66, 0.3]}>
          <sphereGeometry args={[1, 48, 32]} />
          <meshPhysicalMaterial
            color="#EBD4B5"
            roughness={0.22}
            transparent
            opacity={0.65}
            depthWrite={false}
          />
        </mesh>
        <Cylinder r={0.25} h={0.13} y={0.62} color="#C8A06B" metal />
        <SculpturalCap kind="pebble" y={1.08} />
        <ReferenceLabel
          kind={kind}
          y={-0.16}
          width={1.06}
          height={0.9}
          surface="oval"
        />
      </group>
    );
  if (kind === "eclat")
    return (
      <group>
        <group scale={[1.16, 1, 0.64]}>
          <Lathe
            profile={[
              [0, -1],
              [0.55, -1],
              [0.7, -0.91],
              [0.8, -0.59],
              [0.8, 0.1],
              [0.68, 0.42],
              [0.36, 0.53],
              [0, 0.54],
            ]}
            color="#F3D8A0"
            glass
          />
          <mesh position={[0, -0.22, 0]} scale={[0.71, 0.67, 0.71]}>
            <sphereGeometry args={[1, 48, 32]} />
            <meshPhysicalMaterial
              color="#E8C26F"
              roughness={0.15}
              transparent
              opacity={0.58}
              depthWrite={false}
            />
          </mesh>
          <ReferenceLabel
            kind={kind}
            y={-0.18}
            width={1.0}
            height={0.91}
            radius={0.807}
          />
        </group>
        <Cylinder r={0.28} h={0.14} y={0.61} color="#C8A06B" metal />
        <SculpturalCap kind="bean" y={0.96} />
      </group>
    );
  return (
    <group>
      <FacetedFlask />
      <FacetedFlask inner />
      <Cylinder r={0.25} h={0.13} y={0.5} color="#C8A06B" metal />
      <SculpturalCap kind="sphere" y={1.04} />
      <ReferenceLabel
        kind={kind}
        y={-0.2}
        width={1.1}
        height={0.88}
        z={0.365}
      />
    </group>
  );
}
