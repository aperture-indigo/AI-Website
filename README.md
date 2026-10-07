# Aperture Indigo

A dependency-free Node website for Aperture Indigo, with five distinct pages and an indigo terminal-inspired design system.

## Run

Requires Node 20 or later. No installation required.

```sh
npm start
```

Visit **http://localhost:3000**. Keep the terminal running; `Ctrl+C` stops the server. Use `PORT=3010 npm start` for a different port.

For access from another machine through Tailscale:

```sh
HOST=0.0.0.0 npm start
```

Open `http://<server-tailscale-ip>:3000` on the other machine. This also listens on LAN interfaces. Set `HOST` to the server's Tailscale IP to listen only on that interface. Use HTTP, not HTTPS, for this local server. If port 3000 is already in use, stop the existing server first.

## Pages and editing

- `scripts/build-pages.mjs`: content templates and shared navigation/footer. Run `npm run build` after changing this file to regenerate the five HTML pages.
- `public/styles.css`: typography, tokens, responsive layouts, hover and focus treatments.
- `public/app.js`: keyboard-accessible preview tabs, mobile menu, interactive workflow, local notes download.
- `public/fonts/`: self-hosted Geist and Geist Mono, with their open-source font licenses.
- `server.js`: static Node server, supporting configurable `HOST` and `PORT`.

Pages: `/`, `/services.html`, `/approach.html`, `/studio.html`, `/contact.html`.

The design uses large sans-serif headings, monospace notation, square components, hard borders, and restrained indigo illumination. Each page has its own layout. Background photography and pixel effects are absent. The previous lightwell image remains in assets for possible future use but is not loaded by any page.

The homepage's Websites / Systems / AI tabs change the illustration, explanation, and destination link. Arrow keys, Home, and End select tabs. Services have native disclosure controls. The approach page includes a reversible workflow diagram with a vertical mobile layout and reduced-motion support.

The Approach illustration is implemented in `public/animations/workflow.js`. Six illustrated tool cards start scattered among crossing handoffs, loose context, and duplicate-work labels. The “Find the structure” button dissolves those fragments and aligns the cards into a numbered workflow, with teal data signals and an amber human approval step. “See the complexity” reverses the transition. It starts scattered and waits for user input; motion pauses offscreen and in hidden tabs, and reduced motion switches states immediately. Desktop and mobile layouts, both button states, and reduced motion were checked in Chromium.

## Contact status

The contact email is still awaiting setup. The contact page allows visitors to download a plain-text project draft locally. It explicitly does not submit or store information. No external messages are sent. The example systems and interface previews are illustrative concepts, not client case studies.

## Checks

`npm run check` checks syntax; `npm run build` regenerates static HTML. All five pages were checked in Chromium at desktop and mobile sizes, including navigation, tabs, disclosures, reduced motion, and the diagram. No deployment has been performed.

## Display font

Large page/section headings and the miniature website headline use Ailerons Trial Version for the explicitly requested private, personal-use prototype. Smaller headings, body text, and controls retain Geist; technical labels retain Geist Mono. Font provenance is in `public/fonts/Ailerons-SOURCE.txt`. Obtain the appropriate web license before a commercial/public launch.

## Connected-card contour animation

`src/components/ContourField.svelte` is a self-contained Svelte 5 component. It uses only Svelte's built-in lifecycle and Canvas 2D; no additional packages are required. Place it inside a positioned container with a defined height:

```svelte
<script>
  import ContourField from './ContourField.svelte';
</script>
<div style="position: relative; height: 350px; overflow: hidden;">
  <ContourField />
</div>
```

Its parent receives pointer movement by default, so overlaid content can remain clickable. An optional `interactionTarget` prop accepts another DOM element. The component cleans up observers, listeners, and animation frames when unmounted.

The current plain-HTML site uses the exact same engine: `npm run build` extracts the component's module script into `public/animations/contour-field.js`. Edit the Svelte source, then rebuild; do not edit the generated engine. `public/app.js` mounts it behind the homepage's Get Connected card.

The scalar field is contoured using marching squares and rendered as dots in indigo/royal purple. A vertical scanline highlights contours, and a pointer-driven Gaussian term bends them. DPR is capped at 1.5; animation pauses offscreen and in hidden tabs. Reduced motion renders a static frame, redrawn only when the canvas size changes or the preference changes.

## Make Room Voronoi animation

`src/components/VoronoiField.svelte` is a self-contained Svelte 5 component with the same positioned-parent usage and optional `interactionTarget` as `ContourField`. There are no additional dependencies. Its module engine is extracted into `public/animations/voronoi-field.js` by `npm run build` and mounted behind the homepage's Make Room card.

The canvas samples a 4px grid, compares the nearest two toroidal seed distances, and batches border dots into two Path2D brightness buckets. Brighter dots identify the seeds. There are 18–36 seeds based on CSS-pixel canvas area. Seeds wander and wrap continuously; pointer entry selects the nearest seed, which eases toward the pointer until it leaves. DPR is capped at 1.5, motion pauses outside the viewport and in hidden tabs, and reduced-motion preferences produce a single static frame per layout size. Unmounting cleans up all listeners, observers, and animation frames.

## Be Seen starfield animation

`src/components/StarfieldWarp.svelte` is the self-contained Svelte 5 component for the first card. The build extracts its engine to `public/animations/starfield-warp.js`, using the same positioned-parent setup and optional `interactionTarget` as the other components. No additional dependencies are required.

The area-scaled field has 320–750 stars with x/y in [-1, 1] and z in (0, 1]. Perspective projection creates depth-based speed lines in two indigo/purple brightness buckets. Depth decreases faster near the viewer; stars respawn below z = 0.06. The vanishing point eases toward the pointer and returns to center on leave. Frame-rate-independent background fading produces trails. DPR is capped at 1.5, hidden/offscreen animation pauses, and reduced motion renders twelve synchronous steps once to create a static streak image. Unmounting cleans up listeners, observers, and animation frames.

## Graph grid and particle brain

The shared stylesheet adds a fine 80px graph-paper grid with stronger 400px structural lines (40px/200px on mobile). It uses CSS backgrounds without an animation loop.

`src/components/ParticleBrain.svelte` contains a dependency-free Canvas 2D particle model with two corrugated hemispheres, a cerebellum, and a brainstem. The build extracts its renderer to `public/animations/particle-brain.js`. It is placed beneath `03 / CAPABILITY` beside Applied Intelligence on the Services page. Particles rotate continuously around a folded cortex, cerebellum, and tapered brainstem, with a subtle teal pineal glow in the center. Hover or keyboard focus gently expands and brightens the model with a soft pulse, matching the living network interaction. It pauses offscreen/in hidden tabs and renders a static model for reduced motion. The earlier image-only background study retains its own styling.

Visual inspiration: https://vanlent.dev/ — fine square grid and a dense floating particle object. The model and implementation here are original.

## Living network

`src/components/OrbitalNetwork.svelte` provides the Connected Systems illustration beneath `02 / CAPABILITY`. The build extracts its Canvas 2D engine into `public/animations/orbital-network.js`. Seven teal pixel nodes orbit an indigo particle core, with fine connecting lines and traveling data packets. Hover or keyboard focus gradually expands the constellation and brightens the pulsing connections; leaving or blurring eases it back. Animation pauses offscreen and in hidden tabs, and reduced-motion preferences show a static constellation. It shares the brain's responsive illustration sizing and requires no dependencies.

## Pixel website

`src/components/PixelWebsite.svelte` provides the stationary pixel monitor in Digital Experience. Its generated Canvas 2D engine cycles through four layouts: hero, cards, image with text, and contact form. Each view holds for 2.9 seconds before a 1.1-second eased scroll brings in the next, including a seamless return to the first layout. The monitor is scaled to 86% of the illustration area with a constant ambient indigo halo. Hover or keyboard focus smoothly enlarges the monitor by 7.5% and brightens and adds glow only to the clipped screen content. The monitor and browser frame remain still. Animation pauses offscreen and in hidden tabs; reduced motion displays the first view. No dependencies are required.

## Tree and roots

`src/components/PixelTree.svelte` supplies the Solid Foundations illustration, extracted to `public/animations/pixel-tree.js` by the build. Deterministic branching and overlapping leaf volumes form an indigo pixel tree with perspective, depth shading, and visible roots. Three staggered teal pulses slowly follow selected root paths into the trunk, on independent 19–27 second cycles. Hover or keyboard focus smoothly enlarges the tree by 7.5%, using the same easing as the other service visuals. The silhouette pauses offscreen and in hidden tabs, and displays without the pulse for reduced motion.

## Studio butterfly

`src/components/PixelButterfly.svelte` supplies the showcase illustration beneath the Studio Philosophy label, to the left of the heading and copy. Its generated Canvas 2D engine uses cached, finely stippled wing textures with branching veins, pale marginal markings, teal eyespots, a segmented body, and clubbed antennae. Wingbeats vary between fluttering bursts and brief glides. Smooth, irregular gusts produce gentle lateral drift, rises, dips, and banking, with spring easing and slightly asymmetric wing angles. Hover or keyboard focus illuminates the eyespots, adds a faint indigo wing glow, and gently enlarges the butterfly by 7.5%. Animation pauses offscreen and in hidden tabs; reduced motion displays an open-wing pose. The illustration scales to the available width without dependencies.

## Studio caterpillar

`src/components/PixelCaterpillar.svelte` provides the pixel caterpillar above the Studio hero logo panel. Its segmented violet body, dark indigo bands, and teal spots interpret the pattern of the black swallowtail photograph in [Naturally North Idaho's caterpillar article](https://www.naturallynorthidaho.com/2019/07/10-fun-facts-about-caterpillars.htm). Hover or keyboard focus gently enlarges it by 7.5% and illuminates the bands and teal spots. The original photograph is not bundled. The generated Canvas 2D illustration slowly nibbles a veined leaf atop a supporting branch, with subtle head and body motion and tiny leaf crumbs. It pauses offscreen and in hidden tabs and displays a still pose with reduced motion.
