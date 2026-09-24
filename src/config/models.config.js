import { CAMERAS as VANGUARD_CAMERAS }        from '../models/vanguard/vanguard.cameras.js';
import { FRESNEL_VARIANTS as VANGUARD_FRESNEL } from '../models/vanguard/vanguard.fresnelVariants.js';
import { FRESNEL_VARIANTS as HSTN_FRESNEL } from '../models/hstn/hstn.fresnelVariants.js';
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
//
// UI grouping (left-side model selector):
//   group:    models sharing the same group are shown in ONE row.
//             The main button shows the group name and loads the first
//             member of the group (in the order they appear below).
//   subLabel: text of the small button for this member (S, L, LOW...).
//   A model without group gets its own row using its label.
// ─────────────────────────────────────────────────────────────────

export const MODELS = {

  WAYFARER: {
    label:         'Wayfarer',
    group:         'Wayfarer',
    subLabel:      'S',
    glb:           'models/Standard_Wayfarer_100k.glb',
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
    group:         'Wayfarer',
    subLabel:      'L',
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

    WAYFARER168: {
    label:         'Wayfarer 168k',
    group:         'Wayfarer',
    subLabel:      '168k',
    glb:           'models/Standard_Wayfarer_168k.glb',
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

  VANGUARD: {
    label:         'Vanguard',
    group:         'Vanguard',
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

  ADVENTURER: {
    label:         'Adventurer',
    group:         'Adventurer',
    subLabel:      'S',
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
    label:         'Adventurer L',
    group:         'Adventurer',
    subLabel:      'L',
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
    group:         'Fury',
    subLabel:      'S',
    glb:           'models/Standard_Fury.glb',
    hdri:          'studio_fury_8k.hdr',
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
    group:         'Starfire',
    glb:           'models/Standard_Starfire.glb',
    hdri:          'studio_starfire_4k.hdr',
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
  },
  
    SKYLER: {
    label:         'Skyler',
    group:         'Skyler',
    glb:           'models/Standard_Skyler.glb',
    hdri:          'studio_wayfarer_2k.hdr',
    hdriIntensity: 0.75,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       null,
    glass:         { animate: true },
	variantOrder: ['Frame_Shiny_Black', 'Frame_Shiny_Chalky_Gray', 'Frame_Shiny_Mystic_Violet', 'Frame_Shiny_Transparent_Peach', 
	'Lenses_Clear', 'Lenses_Green', 'Lenses_Polar_Brown', 'Lenses_Polar_Dusty_Blue','Lenses_Polar_Dusty_Red', 'Lenses_Polar_Green', 
	'Lenses_Charcoal_Black', 'Lenses_Polar_Gradient_Graphite', 'Lenses_Clear_Green', 'Lenses_Clear_Grey', 'Lenses_Clear_Sapphire',
	'Lenses_Clear_Amethyst', 'Lenses_Clear_Emerald', 'Lenses_Clear_Brown_Transitions', 'Lenses_Gradient_Graphite', 'Lenses_Clear_Graphite_Green'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },

    HEADLINER: {
    label:         'Headliner',
    group:         'Headliner',
    glb:           'models/Standard_Headliner.glb',
    hdri:          'studio_wayfarer_2k.hdr',
    hdriIntensity: 0.75,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       null,
    glass:         { animate: true },
	variantOrder: ['Frame_Shiny_Black', 'Frame_Matte_Black', 'Frame_Shiny_Asteroid_Grey', 'Frame_Matte_Transparent_Peach', 
	'Lenses_Clear', 'Lenses_Green', 'Lenses_Polar_Brown', 'Lenses_Polar_Dusty_Blue','Lenses_Polar_Dusty_Red', 'Lenses_Polar_Green', 
	'Lenses_Charcoal_Black', 'Lenses_Polar_Gradient_Graphite', 'Lenses_Clear_Green', 'Lenses_Clear_Grey', 'Lenses_Clear_Sapphire',
	'Lenses_Clear_Amethyst', 'Lenses_Clear_Emerald', 'Lenses_Clear_Brown_Transitions', 'Lenses_Gradient_Graphite', 'Lenses_Clear_Graphite_Green'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },

    HSTN: {
    label:         'HSTN',
    group:         'HSTN',
    // subLabel:      'S',
    glb:           'models/Standard_HSTN.glb',
    hdri:          'studio_HSTN_4k.hdr',
    hdriIntensity: 0.75,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       HSTN_FRESNEL,
    glass:         { animate: true },
	variantOrder: ['Frame_Black_Gunmetal', 'Frame_Black_Silver','Frame_Warm_Grey', 'Frame_Brown_Smoke', 'Frame_Light_Curry',
	'Lenses_Clear', 'Lenses_Clear_Grey', 'Lenses_Clear_Brown', 'Lenses_Clear_Amethyst','Lenses_Prizm_24K_Polar', 'Lenses_Prizm_Black_Polar', 
	'Lenses_Prizm_Dark_Golf_Polar', 'Lenses_Prizm_Deep_Water', 'Lenses_Prizm_Ruby'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },

    HSTNPLOW: {
    label:         'HSTN polycount LOW 100k',
    group:         'HSTN Polycount',
    subLabel:      'LOW',
	color:         'blue',
    glb:           'models/HSTN_polycount_low_01.glb',
    hdri:          'studio_HSTN_4k.hdr',
    hdriIntensity: 0.75,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       HSTN_FRESNEL,
    glass:         { animate: true },
	variantOrder: ['Frame_Black_Gunmetal', 'Lenses_Clear_Amethyst'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },

    HSTNPMID: {
    label:         'HSTN polycount MID 250k',
    group:         'HSTN Polycount',
    subLabel:      'MID',
	color:         'blue',
    glb:           'models/HSTN_polycount_mid_01.glb',
    hdri:          'studio_HSTN_4k.hdr',
    hdriIntensity: 0.75,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       HSTN_FRESNEL,
    glass:         { animate: true },
	variantOrder: ['Frame_Black_Gunmetal', 'Lenses_Clear_Amethyst'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },

    HSTNPHIGH: {
    label:         'HSTN polycount HIGH 500k',
    group:         'HSTN Polycount',
    subLabel:      'HIGH',
	color:         'blue',
    glb:           'models/HSTN_polycount_high_01.glb',
    hdri:          'studio_HSTN_4k.hdr',
    hdriIntensity: 0.75,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       HSTN_FRESNEL,
    glass:         { animate: true },
	variantOrder: ['Frame_Black_Gunmetal', 'Lenses_Clear_Amethyst'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },


    FURYPLOW: {
    label:         'Fury polycount LOW 100k',
    group:         'Fury Polycount',
    subLabel:      'LOW',
	color:         'blue',
    glb:           'models/Fury_polycount_low_01.glb',
    hdri:          'studio_fury_2k.hdr',
    hdriIntensity: 1,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       HSTN_FRESNEL,
    glass:         { animate: true },
	variantOrder: ['Frame_Black_Gunmetal', 'Lenses_Clear_Amethyst'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },

    FURYPMID: {
    label:         'Fury polycount MID 250k',
    group:         'Fury Polycount',
    subLabel:      'MID',
	color:         'blue',
    glb:           'models/Fury_polycount_mid_01.glb',
    hdri:          'studio_fury_2k.hdr',
    hdriIntensity: 1,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       HSTN_FRESNEL,
    glass:         { animate: true },
	variantOrder: ['Frame_Black_Gunmetal', 'Lenses_Clear_Amethyst'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },

    FURYPHIGH: {
    label:         'Fury polycount HIGH 500k',
    group:         'Fury Polycount',
    subLabel:      'HIGH',
	color:         'blue',
    glb:           'models/Fury_polycount_high_01.glb',
    hdri:          'studio_fury_2k.hdr',
    hdriIntensity: 1,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       HSTN_FRESNEL,
    glass:         { animate: true },
	variantOrder: ['Frame_Black_Gunmetal', 'Lenses_Clear_Amethyst'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  }


};

export const DEFAULT_MODEL = 'WAYFARER';
