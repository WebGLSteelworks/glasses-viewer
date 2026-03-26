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
    glass:         { animate: true }
  },

  WAYFARER: {
    label:         'Wayfarer',
    glbLow:        'models/Standard_Wayfarer_loow.glb',
    glbHigh:       'models/Standard_Wayfarer_loow.glb',
    hdri:          'studio_wayfarer_2k.hdr',
    hdriIntensity: 1.2,
    startCamera:   'Cam_Front',
    cameras:       WAYFARER_CAMERAS,
    fresnel:       null,
    glass:         { animate: false }
  }

};

export const DEFAULT_MODEL = 'WAYFARER';
