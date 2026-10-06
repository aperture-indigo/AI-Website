# Indigo conservatory background study

Test page: `/background-study.html`. It is separate from the homepage and its navigation.

Source supplied by the user:
https://cdn.prod.website-files.com/67bc5c6a38f970469c8a04e9/67f75bcefcbf33fa8b6b62ef_Havfrue_06.webp

Edited asset: `public/assets/havfrue-indigo.webp`.
Method: built-in image generation, editing the supplied photograph. The edited PNG was compressed to WebP for the page.

## Image-edit prompt

Edit this exact architectural photograph. Use case: lighting-weather. Preserve the exact wide 2048:872 composition, camera position, architecture, glass panels, plants, furniture, overhead turquoise water skylight and central floor pool geometry. Change the warm yellow/orange illumination on the plants behind the left and right glass walls to refined luminous INDIGO blue-violet (around #7778ee, brighter pale indigo highlights). The light must look physically cast onto the existing foliage and lightly reflected on nearby surfaces, not a uniform purple filter. Add only very faint wisps of translucent humid mist rising from foliage BEHIND the glass on both sides, subtly catching indigo light; keep glass seams, leaves, furniture and room crisp. Preserve restrained cinematic darkness, realistic materials and original photographic detail. Keep the central floor pool and its reflective surface intact with fine natural ripples; it will be animated separately. Preserve the cool turquoise lighting around the floor pool and overhead pool. No other additions, no text, no reframing, no heavy fog, no neon sci-fi effects. Return the same panoramic aspect ratio.

## Motion

A WebGL layer gently displaces the floor pool's reflections within a feathered perspective mask. Slowly rising noise adds a faint indigo veil within the planted glass enclosures. The overhead pool and architecture stay still. The full photograph is fitted inside the viewport without cropping; narrow screens show letterboxing intentionally for review.

Animation is capped at approximately 30 fps with a 1.5 device-pixel-ratio cap, pauses when the tab is hidden, and starts paused for reduced-motion preferences. The small bottom-right control pauses or resumes it. The original edited still remains visible if WebGL is unavailable or the context is lost. No homepage integration has been performed.

## Revision 2 — clarity and visible motion

Asset: `public/assets/havfrue-indigo-hd.webp` (1923 × 818). AI enhanced via the built-in image editor; the requested 3840-pixel output was not returned, so this is an enhanced approximately 2K image, not a native 4K asset. Saved at WebP quality 97. The sharp base image stays in a normal image element; only localized water and mist are composited over it, at up to 2× device pixel ratio.

Both the floor pool and ceiling water now have independently masked rippling displacement. The mist is more apparent and rises faster around the planted glass walls. Canvas 2D provides water and fog animation if WebGL is unavailable. Reduced-motion preferences still start paused, with an explicit Play water & mist button.

AI enhancement prompt:
> Enhance this exact photograph to a crisp high-definition architectural image. Output 3840x1632 panoramic if possible. Preserve the framing, all geometry, camera, glass walls, foliage, furniture, both pools, and current indigo plant lighting and turquoise water lighting. Restore exceptionally clear fine leaf detail, sharp glass seams, finely textured concrete and stone, and clean detailed rippling reflections. Improve local contrast and realistic photographic clarity without sharpening halos, grain, painted textures, added objects, composition changes or aggressive HDR. Keep the rich dark mood but recover natural detail in shadows. Only faint localized mist behind the glass at the plants; keep the central room clear. The image will be animated separately; do not add motion blur. Precise photo enhancement, not a redesign.
