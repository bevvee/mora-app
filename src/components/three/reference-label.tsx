import {
  BufferGeometry,
  Color,
  DoubleSide,
  Float32BufferAttribute,
  LinearFilter,
  Vector4,
} from "three";
import { useEffect, useMemo } from "react";
import type { ModelKind } from "../../domain/product-presentation";
import { productImageUri } from "./reference-assets";
import { useTexture } from "./runtime";

// These are UV windows into the original, untouched user-supplied photographs.
// The shader isolates their printed ink so the real wordmark sits directly on
// the curved packaging, without a floating rectangular photograph or label.
const crops: Record<ModelKind, [number, number, number, number]> = {
  "petal-toner": [422, 548, 405, 439],
  "silk-cleanser": [490, 510, 300, 335],
  "cloud-cream": [365, 610, 530, 355],
  "dew-serum": [440, 635, 380, 325],
  "sun-veil": [420, 353, 438, 480],
  "velvet-lip": [470, 742, 315, 352],
  "rose-tint": [430, 643, 390, 398],
  "lash-muse": [531, 570, 212, 487],
  "honey-gloss": [498, 612, 254, 428],
  "skin-silk": [430, 585, 365, 430],
  "vanille-douce": [360, 615, 535, 312],
  "bois-de-soie": [420, 625, 400, 348],
  "fleur-de-lune": [420, 614, 395, 345],
  eclat: [406, 632, 430, 340],
  "rose-ambree": [403, 640, 419, 341],
};
const vertexShader = `varying vec2 vLabelUv; void main(){vLabelUv=uv; gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}`;
// Isolate ink before downsampling; photo mipmaps otherwise erase fine letters.
const fragmentShader = `uniform sampler2D uPhoto; uniform vec4 uCrop; uniform vec3 uInk; uniform float uLight; varying vec2 vLabelUv;
void main(){
  vec2 uv=uCrop.xy+vLabelUv*uCrop.zw;
  vec2 dx=dFdx(uv),dy=dFdy(uv);
  float a=0.0;
  for(int x=0;x<3;x++) for(int y=0;y<3;y++){
    vec3 source=texture2D(uPhoto,uv+(float(x)-1.0)*dx*.4+(float(y)-1.0)*dy*.4).rgb;
    float l=dot(source,vec3(.2126,.7152,.0722));
    a+=mix(1.0-smoothstep(.28,.50,l),smoothstep(.55,.76,l),uLight);
  }
  a/=9.0;
  if(a<.015) discard;
  gl_FragColor=vec4(uInk,a);
#include <colorspace_fragment>
}`;

type Surface = "tube" | "oval";
function usePrintedSurface(
  surface: Surface | undefined,
  width: number,
  height: number,
  y: number,
) {
  const geometry = useMemo(() => {
    if (!surface) return undefined;
    const g = new BufferGeometry(),
      p: number[] = [],
      uv: number[] = [],
      indices: number[] = [];
    const cols = 40,
      rows = 24;
    for (let i = 0; i <= rows; i++)
      for (let j = 0; j <= cols; j++) {
        const u = j / cols,
          v = i / rows,
          x = (u - 0.5) * width,
          localY = (v - 0.5) * height,
          globalY = localY + y;
        let z: number;
        if (surface === "tube") {
          const t = Math.max(0, Math.min(1, (globalY + 0.68) / 1.8)),
            rx = 0.32 + 0.17 * t,
            rz = 0.19 * (1 - Math.pow(t, 4)) + 0.022;
          z = rz * Math.sqrt(Math.max(0.015, 1 - (x * x) / (rx * rx))) + 0.008;
        } else
          z =
            0.4 *
              Math.sqrt(
                Math.max(
                  0.015,
                  1 -
                    (x * x) / (0.94 * 0.94) -
                    ((globalY + 0.22) * (globalY + 0.22)) / (0.78 * 0.78),
                ),
              ) +
            0.008;
        p.push(x, localY, z);
        uv.push(u, v);
      }
    for (let i = 0; i < rows; i++)
      for (let j = 0; j < cols; j++) {
        const a = i * (cols + 1) + j,
          b = a + cols + 1;
        indices.push(a, a + 1, b, b, a + 1, b + 1);
      }
    g.setAttribute("position", new Float32BufferAttribute(p, 3));
    g.setAttribute("uv", new Float32BufferAttribute(uv, 2));
    g.setIndex(indices);
    g.computeVertexNormals();
    return g;
  }, [surface, width, height, y]);
  useEffect(() => () => geometry?.dispose(), [geometry]);
  return geometry;
}

export function ReferenceLabel({
  kind,
  y,
  width,
  height,
  radius,
  z,
  surface,
}: {
  kind: ModelKind;
  y: number;
  width: number;
  height: number;
  radius?: number;
  z?: number;
  surface?: Surface;
}) {
  const texture = useTexture(
    productImageUri(`mora-asset:${kind}`),
    (loaded) => {
      loaded.generateMipmaps = false;
      loaded.minFilter = LinearFilter;
      loaded.magFilter = LinearFilter;
      loaded.needsUpdate = true;
    },
  );
  const uniforms = useMemo(() => {
    const [x, y, w, h] = crops[kind];
    const light = kind === "velvet-lip" || kind === "lash-muse";
    return {
      uPhoto: { value: texture },
      uCrop: {
        value: new Vector4(x / 1254, 1 - (y + h) / 1254, w / 1254, h / 1254),
      },
      uInk: { value: new Color(light ? "#F5E8D3" : "#49200F") },
      uLight: { value: light ? 1 : 0 },
    };
  }, [kind, texture]);
  const geometry = usePrintedSurface(surface, width, height, y);
  const arc = radius ? Math.min(width / radius, 1.7) : 0;
  return (
    <mesh position={[0, y, surface ? 0 : (z ?? 0)]} renderOrder={20}>
      {geometry ? (
        <primitive object={geometry} attach="geometry" />
      ) : radius ? (
        <cylinderGeometry
          args={[radius, radius, height, 64, 1, true, -arc / 2, arc]}
        />
      ) : (
        <planeGeometry args={[width, height]} />
      )}
      <shaderMaterial
        uniforms={uniforms}
        vertexShader={vertexShader}
        fragmentShader={fragmentShader}
        transparent
        depthWrite={false}
        side={DoubleSide}
        toneMapped={false}
        polygonOffset
        polygonOffsetFactor={-2}
      />
    </mesh>
  );
}
export function PrintedWaves({
  radius,
  height,
  y,
  width,
  depth,
  surface,
}: {
  radius?: number;
  height: number;
  y: number;
  width?: number;
  depth?: number;
  surface?: Surface;
}) {
  const geometry = usePrintedSurface(surface, width ?? 1, height, y);
  return (
    <mesh position={[0, y, surface ? 0 : (depth ?? 0)]} renderOrder={5}>
      {geometry ? (
        <primitive object={geometry} attach="geometry" />
      ) : radius ? (
        <cylinderGeometry args={[radius, radius, height, 64, 1, true]} />
      ) : (
        <planeGeometry args={[width ?? 1, height]} />
      )}
      <shaderMaterial
        transparent
        depthWrite={false}
        side={DoubleSide}
        toneMapped={false}
        vertexShader={vertexShader}
        fragmentShader={`varying vec2 vLabelUv; void main(){float top=.24+.16*sin(vLabelUv.x*5.7+.4); float lower=.12+.13*cos(vLabelUv.x*4.8); float alpha=(1.0-smoothstep(top,top+.018,vLabelUv.y))*.62; vec3 color=mix(vec3(.79,.57,.47),vec3(.83,.67,.46),1.0-smoothstep(lower,lower+.015,vLabelUv.y)); gl_FragColor=vec4(color,alpha);}`}
      />
    </mesh>
  );
}
