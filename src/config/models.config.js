import { CAMERAS as VANGUARD_CAMERAS }        from '../models/vanguard/vanguard.cameras.js';
import { FRESNEL_VARIANTS as VANGUARD_FRESNEL } from '../models/vanguard/vanguard.fresnelVariants.js';
import { CAMERAS as WAYFARER_CAMERAS }          from '../models/wayfarer/wayfarer.cameras.js';
import { CAMERAS as ADVENTURER_CAMERAS }          from '../models/adventurer/adventurer.cameras.js';

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
	'Lenses_Clear', 'Lenses_Clear_Amethyst', 'Lenses_Clear_Emerald', 'Lenses_Clear_Graphite_Green', 'Lenses_Clear_Grey', 'Lenses_Clear_Sapphire','Lenses_Charcoal_Black', 'Lenses_G15_Green',  
	'Lenses_Polar_Gradient', 'Lenses_Polar_Green', 'Lenses_Polar_Brown',  'Lenses_Polar_Dusty_Blue', 'Lenses_Polar_Dusty_Red', 'Lenses_Brown_Transitions' ],
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
	'Lenses_Clear', 'Lenses_Clear_Amethyst', 'Lenses_Clear_Emerald', 'Lenses_Clear_Graphite_Green', 'Lenses_Clear_Grey', 'Lenses_Clear_Sapphire','Lenses_Charcoal_Black', 'Lenses_G15_Green',  
	'Lenses_Polar_Gradient', 'Lenses_Polar_Green', 'Lenses_Polar_Brown',  'Lenses_Polar_Dusty_Blue', 'Lenses_Polar_Dusty_Red', 'Lenses_Brown_Transitions' ],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },

  ADVENTURER: {
    label:         'Adventurer',
    glb:           'models/Standard_Adventurer.glb',
    hdri:          'studio_adventurer_2k.hdr',
    hdriIntensity: 1.0,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       null,
    glass:         { animate: true },
	variantOrder: ['Frame_Classic_Black', 'Frame_Classic_Havana', 'Frame_Merlot', 'Frame_Linen', 
	'Lenses_Clear', 'Lenses_Brown','Lenses_Polar_Grey', 'Lenses_Transitions_Grey', 'Lenses_Transitions_Merlot', 'Lenses_Transitions_Sapphire'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },

  ADVENTURERL: {
    label:         'Adventurer Large',
    glb:           'models/Standard_Adventurer_Large.glb',
    hdri:          'studio_adventurer_2k.hdr',
    hdriIntensity: 1.0,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       null,
    glass:         { animate: true },
	variantOrder: ['Frame_Classic_Black', 'Frame_Classic_Havana', 'Frame_Merlot', 'Frame_Linen', 
	'Lenses_Clear', 'Lenses_Brown','Lenses_Polar_Grey', 'Lenses_Transitions_Grey', 'Lenses_Transitions_Merlot', 'Lenses_Transitions_Sapphire'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },

  FURY: {
    label:         'Fury',
    glb:           'models/Standard_Fury.glb',
    hdri:          'studio_fury_2k.hdr',
    hdriIntensity: 1.0,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       null,
    glass:         { animate: true },
	variantOrder: ['Frame_Classic_Black', 'Frame_Mahogany', 'Frame_Racing_Green', 'Frame_Sandstone', 
	'Lenses_Brown_Gradient', 'Lenses_Green_Herbal', 'Lenses_Light_Blue_Atlantic', 'Lenses_Polar_Dark_Amber',
	'Lenses_Polar_Grey', 'Lenses_Transitions_Grey'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },

  STARFIRE: {
    label:         'Starfire',
    glb:           'models/Standard_Starfire.glb',
    hdri:          'studio_starfire_2k.hdr',
    hdriIntensity: 1.0,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       null,
    glass:         { animate: true },
	variantOrder: ['Frame_Classic_Black', 'Frame_Dark_Havana', 'Lens_Black', 'Lens_Chocolate' , 'Lenses_Transitions_Grey'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  }

};

export const DEFAULT_MODEL = 'WAYFARER';
