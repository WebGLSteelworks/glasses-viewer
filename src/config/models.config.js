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
	variantOrder: ['Black Prizm Black', 'Black Prizm Transitions Ember', 'Whiite Prizm Rose Gold', 'Black Prizm 24k',
						'Black Prizm Road', 'White Prizm Black', 'White Prizm Sapphire'],
	shadow: {
	  enabled:         true,
	  planeSize:       0.5,
	  opacity:         0.6,
	  blur:      	   15,     
	  blurWebGL: 	   1.5, 
	  darkness:        5.0,   
	  offsetY:         -0.028,
	  cameraHeight:    0.5,
	  updateEveryFrame: true,   
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
	variantOrder: ['Frame Matte Black', 'Frame Shiny Black', 'Frame Shiny Cosmic Blue', 'Frame Transparent Grey', 
	'Lenses Clear', 'Lenses Green', 'Lenses Polar Gradient', 'Lenses Clear to Graphite Green', 'Lenses Clear to Grey',
	'Lenses Clear to Sapphire', 'Lenses Clear to Emerald', 'Lenses Clear to Amethyst'],
	shadow: {
	  enabled:         true,
	  planeSize:       0.5,
	  opacity:         0.6,
	  blur:      	   15,     
	  blurWebGL: 	   1.5,     
	  darkness:        5.0,   
	  offsetY:         -0.022,
	  cameraHeight:    0.5,
	  updateEveryFrame: true, 
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
	variantOrder: ['Frame Matte Black', 'Frame Shiny Black', 'Frame Shiny Cosmic Blue', 'Frame Transparent Grey', 
	'Lenses Clear', 'Lenses Green', 'Lenses Polar Gradient', 'Lenses Clear to Graphite Green', 'Lenses Clear to Grey',
	'Lenses Clear to Sapphire', 'Lenses Clear to Emerald', 'Lenses Clear to Amethyst'],
	shadow: {
	  enabled:         true,
	  planeSize:       0.5,
	  opacity:         0.6,
	  blur:      	   15,     
	  blurWebGL: 	   1.5,     
	  darkness:        5.0,   
	  offsetY:         -0.022,
	  cameraHeight:    0.5,
	  updateEveryFrame: true, 
	},
  }


};

export const DEFAULT_MODEL = 'WAYFARER';
