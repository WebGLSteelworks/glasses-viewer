import { CAMERAS as VANGUARD_CAMERAS }        from '../models/vanguard/vanguard.cameras.js';
import { FRESNEL_VARIANTS as VANGUARD_FRESNEL } from '../models/vanguard/vanguard.fresnelVariants.js';
import { CAMERAS as WAYFARER_CAMERAS }          from '../models/wayfarer/wayfarer.cameras.js';

// ─────────────────────────────────────────────────────────────────
// MODELS REGISTRY
//
// To add a new model:
//   1. Create src/models/<name>/cameras.js
//   2. Optionally create src/models/<name>/fresnelVariants.js
//   3. Import both above and add an entry below
//
// fresnel: null → no Fresnel effect on this model
// ─────────────────────────────────────────────────────────────────

export const MODELS = {

  VANGUARD: {
    label:         'Vanguard',
    glbLow:        'models/Standard_Vanguard_low.glb',
    glbHigh:       'models/Standard_Vanguard_high.glb',
    hdri:          'studio_vanguard_2k.hdr',
    hdriIntensity: 1.0,
    startCamera:   'Cam_Front',
    cameras:       VANGUARD_CAMERAS,
    fresnel:       VANGUARD_FRESNEL,
    glass:         { animate: false },
	variantOrder: ['Black Prizm 24k', 'White Prizm Black', 'Black Prizm Road', 'White Prizm Sapphire'],
  },

  WAYFARER: {
    label:         'Wayfarer',
    glbLow:        'models/Standard_Wayfarer_low.glb',
    glbHigh:       'models/Standard_Wayfarer_low.glb',
    hdri:          'studio_wayfarer_2k.hdr',
    hdriIntensity: 1.4,
    startCamera:   'Cam_Front',
    cameras:       WAYFARER_CAMERAS,
    fresnel:       null,
    glass:         { animate: true },
	variantOrder: ['Frame Matte Black', 'Frame Shiny Black', 'Frame Shiny Cosmic Blue', 'Frame Blue Jeans',
	'Frame Clear Sapphire', 'Lenses Clear', 'Lenses Green', 'Lenses Clear to Green', 'Lenses Clear to Grey',
	'Lenses Dark Blue', 'Lenses Dark Blue', 'Lenses Gradient Graphite'],
  }

};

export const DEFAULT_MODEL = 'WAYFARER';
