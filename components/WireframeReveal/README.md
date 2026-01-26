# WireframeReveal Component

Componente reutilizable que aplica un efecto de revelación desde wireframe hasta el material sólido en modelos 3D.

## Características

- Transición animada desde wireframe a material sólido
- Control manual o automático del progreso
- Personalizable (color, duración, timing)
- Usa shaders GLSL para efectos suaves
- Compatible con cualquier modelo GLTF/GLB

## Uso Básico

```tsx
import { WireframeReveal } from "@/components/WireframeReveal";

function MyComponent() {
  return (
    <WireframeReveal
      modelPath="/glb/ship_spline.glb"
      getTargetObject={(model) => model.nodes.core}
      wireframeColor="#FFBE18"
      duration={2}
      autoPlay={true}
    />
  );
}
```

## Props

| Prop | Tipo | Default | Descripción |
|------|------|---------|-------------|
| `modelPath` | `string` | **requerido** | Ruta al modelo GLTF/GLB |
| `getTargetObject` | `(model) => Object3D` | **requerido** | Función que retorna el objeto 3D a animar |
| `wireframeColor` | `string` | `"#FFBE18"` | Color del wireframe en formato hex |
| `duration` | `number` | `2` | Duración de la animación en segundos |
| `delay` | `number` | `0.2` | Delay antes de iniciar la animación |
| `progress` | `number` | `undefined` | Progreso manual (0-1). Desactiva animación automática |
| `alphaNear` | `number` | `0` | Distancia near para el fade |
| `alphaFar` | `number` | `1.5` | Distancia far para el fade |
| `autoPlay` | `boolean` | `true` | Si reproduce automáticamente |
| `groupProps` | `object` | `{}` | Props adicionales para el grupo contenedor |
| `onComplete` | `() => void` | `undefined` | Callback cuando termina la animación |

## Ejemplos

### Modo Automático

```tsx
<WireframeReveal
  modelPath="/models/spaceship.glb"
  getTargetObject={(model) => model.scene.children[0]}
  duration={3}
  delay={0.5}
  onComplete={() => console.log("Animation complete!")}
/>
```

### Modo Manual (con control externo)

```tsx
const [progress, setProgress] = useState(0);

return (
  <>
    <input
      type="range"
      min={0}
      max={1}
      step={0.01}
      value={progress}
      onChange={(e) => setProgress(parseFloat(e.target.value))}
    />

    <WireframeReveal
      modelPath="/models/spaceship.glb"
      getTargetObject={(model) => model.scene.children[0]}
      progress={progress}
      autoPlay={false}
    />
  </>
);
```

### Con transformaciones

```tsx
<WireframeReveal
  modelPath="/models/spaceship.glb"
  getTargetObject={(model) => model.scene.children[0]}
  wireframeColor="#00ff00"
  groupProps={{
    scale: [2, 2, 2],
    rotation: [0, Math.PI / 2, 0],
    position: [0, 1, 0],
  }}
/>
```

## Página de Prueba

Para probar el componente, visita `/test` en tu navegador mientras el servidor de desarrollo está corriendo:

```bash
npm run dev
```

Luego abre `http://localhost:3000/test` (o el puerto que esté disponible).

La página de prueba incluye:
- Controles de Leva para ajustar todos los parámetros en tiempo real
- Modo manual y automático
- Visualización del modelo de la nave con el efecto
- Controles de órbita para rotar la cámara

## Cómo Funciona

El efecto utiliza dos técnicas:

1. **Wireframe Shader**: Un shader personalizado que renderiza las líneas del wireframe con un alpha que se desvanece basado en el progreso de la animación.

2. **Material Modification**: El material original del modelo se modifica usando `onBeforeCompile` para inyectar código shader que:
   - Controla la opacidad basada en el progreso
   - Mezcla sutilmente con el color del wireframe durante la transición
   - Usa el bounding box del modelo para calcular la dirección de la revelación

El efecto se anima desde un lado del modelo hacia el otro (eje X) con una transición suave controlada por `smoothstep`.

## Personalización Avanzada

Para ajustar el ancho de la zona de transición entre wireframe y sólido, modifica los parámetros `alphaNear` y `alphaFar`:

- `alphaNear`: Inicio de la transición
- `alphaFar`: Fin de la transición

Un rango más amplio (`alphaFar - alphaNear` mayor) crea una transición más gradual.

## Notas

- El modelo debe ser un mesh válido con geometría
- El componente clona internamente el material para no afectar otras instancias
- Compatible con GSAP para animaciones suaves
- Requiere `@react-three/fiber` y `@react-three/drei`
