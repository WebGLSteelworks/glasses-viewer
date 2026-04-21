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
    glb:           'models/Standard_Vanguard.glb',
    hdri:          'studio_vanguard_2k.hdr',
    hdriIntensity: 1.0,
    startCamera:   'Cam_Front',
    cameras:       VANGUARD_CAMERAS,
    fresnel:       VANGUARD_FRESNEL,
    glass:         { animate: true },
	variantOrder: ['White_Prizm_Black', 'Black_Prizm_Transitions_Ember', 'White_Prizm_Rose_Gold', 'Black_Prizm_24k',
						'Black_Prizm_Road', 'White_Prizm_Black', 'White_Prizm_Sapphire'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},				
  },

  WAYFARER: {
    label:         'Wayfarer',
    glb:           'models/Standard_Wayfarer.glb',
    hdri:          'studio_wayfarer_2k.hdr',
    hdriIntensity: 1.0,
    startCamera:   'Cam_Front',
    cameras:       WAYFARER_CAMERAS,
    fresnel:       null,
    glass:         { animate: true },
	variantOrder: ['Frame_Matte_Black', 'Frame_Shiny_Black', 'Frame_Shiny_Cosmic_Blue', 'Frame_Shiny_Transparent_Grey', 
	'Lenses_Clear', 'Lenses_G15_Green', 'Lenses_Polar_Gradient', 'Lenses_Clear_Graphite_Green', 'Lenses_Clear_Grey',
	'Lenses_Clear_Sapphire', 'Lenses_Clear_Emerald', 'Lenses_Clear_Amethyst'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },

  WAYFARER_L: {
    label:         'Wayfarer L',
    glb:           'models/Standard_Wayfarer_Large.glb',
    hdri:          'studio_wayfarer_2k.hdr',
    hdriIntensity: 1.0,
    startCamera:   'Cam_Front',
    cameras:       WAYFARER_CAMERAS,
    fresnel:       null,
    glass:         { animate: true },
	variantOrder: ['Frame_Matte_Black', 'Frame_Shiny_Black', 'Frame_Shiny_Cosmic_Blue', 'Frame_Shiny_Transparent_Grey', 
	'Lenses_Clear', 'Lenses_G15_Green', 'Lenses_Polar_Gradient', 'Lenses_Clear_Graphite_Green', 'Lenses_Clear_Grey',
	'Lenses_Clear_Sapphire', 'Lenses_Clear_Emerald', 'Lenses_Clear_Amethyst'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  }


};

export const DEFAULT_MODEL = 'WAYFARER';
