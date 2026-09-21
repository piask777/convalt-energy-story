# Convalt Energy Story

A working 3D landing-page prototype that presents manufacturing, power generation, data centers, and recycling as one connected system.

The desktop experience uses original procedural WebGL geometry. Mobile devices, reduced-motion preferences, unavailable WebGL, and rendering failures receive a lightweight visual fallback with the same complete content.

## Run locally

Requires Node.js 20.19+ or 22.12+ and pnpm.

```sh
pnpm install
pnpm run dev
```

## Verify

```sh
pnpm run lint
pnpm test
pnpm run build
```

## Structure

- React and Vite provide the application shell and static production build.
- React Three Fiber and Three.js render one persistent, procedural scene.
- Native scroll position selects each chapter and drives scene transitions.
- The complete narrative remains available as semantic HTML.

No external models, textures, images, runtime services, or environment variables are required.

