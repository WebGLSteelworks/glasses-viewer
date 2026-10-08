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

  // WAYFARERGEN1: {
    // label:         'Wayfarergen1',
    // group:         'Wayfarer gen1',
    // subLabel:      'LOW',
    // glb:           'models/Standard_Wayfarer_100k.glb',
    // hdri:          'studio_wayfarer_2k.hdr',
    // hdriIntensity: 1.0,
    // startCamera:   'Cam_Front',
    // cameras:       WAYFARER_CAMERAS,
    // fresnel:       null,
    // glass:         { animate: true },
	// variantOrder: ['Frame_Matte_Black', 'Frame_Shiny_Black', 'Frame_Shiny_Cosmic_Blue', 'Frame_Shiny_Transparent_Grey', 
	// 'Lenses_Clear', 'Lenses_Clear_Amethyst', 'Lenses_Clear_Emerald', 'Lenses_Clear_Graphite_Green', 'Lenses_Clear_Grey', 'Lenses_Clear_Sapphire','Lenses_Charcoal_Black', 'Lenses_G15_Green',  
	// 'Lenses_Polar_Gradient', 'Lenses_Polar_Green', 'Lenses_Polar_Brown',  'Lenses_Polar_Dusty_Blue', 'Lenses_Polar_Dusty_Red', 'Lenses_Brown_Transitions' ],
	// shadow: {
	  // enabled:   true,
	  // intensity: 1.0,
	  // softness:  1.0,
	// },
  // },
  

  // WAYFARERGEN1_L: {
    // label:         'Wayfarergen1 L',
    // group:         'Wayfarer L gen1',
    // subLabel:      'LOW',
    // glb:           'models/Standard_Wayfarer_Large.glb',
    // hdri:          'studio_wayfarer_2k.hdr',
    // hdriIntensity: 1.0,
    // startCamera:   'Cam_Front',
    // cameras:       WAYFARER_CAMERAS,
    // fresnel:       null,
    // glass:         { animate: true },
	// variantOrder: ['Frame_Matte_Black', 'Frame_Shiny_Black', 'Frame_Shiny_Cosmic_Blue', 'Frame_Shiny_Transparent_Grey', 
	// 'Lenses_Clear', 'Lenses_Clear_Amethyst', 'Lenses_Clear_Emerald', 'Lenses_Clear_Graphite_Green', 'Lenses_Clear_Grey', 'Lenses_Clear_Sapphire','Lenses_Charcoal_Black', 'Lenses_G15_Green',  
	// 'Lenses_Polar_Gradient', 'Lenses_Polar_Green', 'Lenses_Polar_Brown',  'Lenses_Polar_Dusty_Blue', 'Lenses_Polar_Dusty_Red', 'Lenses_Brown_Transitions' ],
	// shadow: {
	  // enabled:   true,
	  // intensity: 1.0,
	  // softness:  1.0,
	// },
  // },


  WAYFARERGEN2LOW: {
    label:         'Wayfarer_gen2_low',
    group:         'Wayfarer gen2',
    subLabel:      'LOW',
    glb:           'models/Standard_Wayfarer_gen2_low.glb',
    hdri:          'studio_wayfarer_2k.hdr',
    hdriIntensity: 1.0,
    startCamera:   'Cam_Front',
    cameras:       WAYFARER_CAMERAS,
    fresnel:       null,
    glass:         { animate: true },
	variantOrder: ['Frame_Matte_Black', 'Frame_Shiny_Black', 'Frame_Havana', 'Frame_Transparent_Matte_Ocean_Blue', 'Frame_Transparent_Black', 
	'Lenses_Clear', 'Lenses_Green', 'Lenses_Grey', 'Lenses_Grey_Transitions', 'Lenses_Clear_to_Graphite_Green_Transitions',  'Lenses_Clear_to_Amethyst_Transitions', 'Lenses_Clear_to_Aquamarine_Transitions', 
	'Lenses_Clear_to_Brown_Transitions','Lenses_Clear_to_Emerald_Transitions', 'Lenses_Clear_to_Green_Transitions', 'Lenses_Clear_to_Grey_Transitions', 'Lenses_Clear_to_Sapphire_Transitions', 'Lenses_Charcoal_Black',
	'Lenses_Polarized_Brown', 'Lenses_Polarized_Dusty_Blue', 'Lenses_Polarized_Dusty_Red',  'Lenses_Polarized_Gradient_Graphite', 'Lenses_Polarized_Green' ],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },  

  WAYFARERGEN2HIGH: {
    label:         'Wayfarer_gen2_high',
    group:         'Wayfarer gen2',
    subLabel:      'HIGH',
    glb:           'models/Standard_Wayfarer_gen2_high.glb',
    hdri:          'studio_wayfarer_2k.hdr',
    hdriIntensity: 1.0,
    startCamera:   'Cam_Front',
    cameras:       WAYFARER_CAMERAS,
    fresnel:       null,
    glass:         { animate: true },
	variantOrder: ['Frame_Matte_Black', 'Frame_Shiny_Black', 'Frame_Havana', 'Frame_Transparent_Matte_Ocean_Blue', 'Frame_Transparent_Black', 
	'Lenses_Clear', 'Lenses_Green', 'Lenses_Grey', 'Lenses_Grey_Transitions', 'Lenses_Clear_to_Graphite_Green_Transitions',  'Lenses_Clear_to_Amethyst_Transitions', 'Lenses_Clear_to_Aquamarine_Transitions', 
	'Lenses_Clear_to_Brown_Transitions','Lenses_Clear_to_Emerald_Transitions', 'Lenses_Clear_to_Green_Transitions', 'Lenses_Clear_to_Grey_Transitions', 'Lenses_Clear_to_Sapphire_Transitions', 'Lenses_Charcoal_Black',
	'Lenses_Polarized_Brown', 'Lenses_Polarized_Dusty_Blue', 'Lenses_Polarized_Dusty_Red',  'Lenses_Polarized_Gradient_Graphite', 'Lenses_Polarized_Green' ],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },  


  WAYFARERGEN2LLOW: {
    label:         'Wayfarer_gen2_large_low',
    group:         'Wayfarer gen2 L',
    subLabel:      'LOW',
    glb:           'models/Standard_Wayfarer_gen2_large_low.glb',
    hdri:          'studio_wayfarer_2k.hdr',
    hdriIntensity: 1.0,
    startCamera:   'Cam_Front',
    cameras:       WAYFARER_CAMERAS,
    fresnel:       null,
    glass:         { animate: true },
	variantOrder: ['Frame_Matte_Black', 'Frame_Shiny_Black', 'Frame_Havana', 'Frame_Transparent_Matte_Ocean_Blue', 'Frame_Transparent_Black', 
	'Lenses_Clear', 'Lenses_Green', 'Lenses_Grey', 'Lenses_Grey_Transitions', 'Lenses_Clear_to_Graphite_Green_Transitions',  'Lenses_Clear_to_Amethyst_Transitions', 'Lenses_Clear_to_Aquamarine_Transitions', 
	'Lenses_Clear_to_Brown_Transitions','Lenses_Clear_to_Emerald_Transitions', 'Lenses_Clear_to_Green_Transitions', 'Lenses_Clear_to_Grey_Transitions', 'Lenses_Clear_to_Sapphire_Transitions', 'Lenses_Charcoal_Black',
	'Lenses_Polarized_Brown', 'Lenses_Polarized_Dusty_Blue', 'Lenses_Polarized_Dusty_Red',  'Lenses_Polarized_Gradient_Graphite', 'Lenses_Polarized_Green' ],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },  

  WAYFARERGEN2LHIGH: {
    label:         'Wayfarer_gen2_large_high',
    group:         'Wayfarer gen2 L',
    subLabel:      'HIGH',
    glb:           'models/Standard_Wayfarer_gen2_large_high.glb',
    hdri:          'studio_wayfarer_2k.hdr',
    hdriIntensity: 1.0,
    startCamera:   'Cam_Front',
    cameras:       WAYFARER_CAMERAS,
    fresnel:       null,
    glass:         { animate: true },
	variantOrder: ['Frame_Matte_Black', 'Frame_Shiny_Black', 'Frame_Havana', 'Frame_Transparent_Matte_Ocean_Blue', 'Frame_Transparent_Black', 
	'Lenses_Clear', 'Lenses_Green', 'Lenses_Grey', 'Lenses_Grey_Transitions', 'Lenses_Clear_to_Graphite_Green_Transitions',  'Lenses_Clear_to_Amethyst_Transitions', 'Lenses_Clear_to_Aquamarine_Transitions', 
	'Lenses_Clear_to_Brown_Transitions','Lenses_Clear_to_Emerald_Transitions', 'Lenses_Clear_to_Green_Transitions', 'Lenses_Clear_to_Grey_Transitions', 'Lenses_Clear_to_Sapphire_Transitions', 'Lenses_Charcoal_Black',
	'Lenses_Polarized_Brown', 'Lenses_Polarized_Dusty_Blue', 'Lenses_Polarized_Dusty_Red',  'Lenses_Polarized_Gradient_Graphite', 'Lenses_Polarized_Green' ],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },  



  ADVENTURERLOW: {
    label:         'Adventurer',
    group:         'Adventurer',
    subLabel:      'LOW',
    glb:           'models/Standard_Adventurer_low.glb',
    hdri:          'studio_adventurer_2k.hdr',
    hdriIntensity: 1.0,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       null,
    glass:         { animate: true },
	// variantOrder: ['Frame_Classic_Black', 'Frame_Classic_Havana', 'Frame_Merlot', 'Frame_Linen', 
	// 'Lenses_Clear', 'Lenses_Brown','Lenses_Polar_Grey', 'Lenses_Transitions_Grey', 'Lenses_Transitions_Merlot', 'Lenses_Transitions_Sapphire'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },


  ADVENTURERHIGH: {
    label:         'Adventurer',
    group:         'Adventurer',
    subLabel:      'HIGH',
    glb:           'models/Standard_Adventurer_high.glb',
    hdri:          'studio_adventurer_2k.hdr',
    hdriIntensity: 1.0,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       null,
    glass:         { animate: true },
	// variantOrder: ['Frame_Classic_Black', 'Frame_Classic_Havana', 'Frame_Merlot', 'Frame_Linen', 
	// 'Lenses_Clear', 'Lenses_Brown','Lenses_Polar_Grey', 'Lenses_Transitions_Grey', 'Lenses_Transitions_Merlot', 'Lenses_Transitions_Sapphire'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },


  ADVENTURERLLOW: {
    label:         'Adventurer L LOW',
    group:         'Adventurer L',
    subLabel:      'LOW',
    glb:           'models/Standard_Adventurer_Large_low.glb',
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
  
 
  ADVENTURERLHIGH: {
    label:         'Adventurer L HIGH',
    group:         'Adventurer L',
    subLabel:      'HIGH',
    glb:           'models/Standard_Adventurer_Large_high.glb',
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
 

  ADVENTURERCREATORLOW: {
    label:         'Adventurer Creator LOW',
    group:         'Adventurer C',
    subLabel:      'LOW',
    glb:           'models/Standard_Adventurer_Creator_low.glb',
    hdri:          'studio_adventurer_2k.hdr',
    hdriIntensity: 1.0,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       null,
    glass:         { animate: true },
	variantOrder: ['Frame_Moonlit_Sky', 'Lenses_Blush'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },
  
 
  ADVENTURERCREATORHIGH: {
    label:         'Adventurer Creator HIGH',
    group:         'Adventurer C',
    subLabel:      'HIGH',
    glb:           'models/Standard_Adventurer_Creator_high.glb',
    hdri:          'studio_adventurer_2k.hdr',
    hdriIntensity: 1.0,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       null,
    glass:         { animate: true },
	variantOrder: ['Frame_Moonlit_Sky', 'Lenses_Blush'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  }, 
 

 
    AVIATORLOW: {
    label:         'RBM Aviator L',
    group:         'RBM Aviator',
    subLabel:      'LOW',
    glb:           'models/Standard_Aviator_low.glb',
    hdri:          'studio_wayfarer_2k.hdr',
    hdriIntensity: 0.75,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       HSTN_FRESNEL,
    glass:         { animate: true },
	variantOrder: ['Frame_Classic_Havana'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	  floorMesh: 'RBM_Zena_frame_LOW',
	},
  },

    AVIATORHIGH: {
    label:         'RBM Aviator H',
    group:         'RBM Aviator',
    subLabel:      'HIGH',
    glb:           'models/Standard_Aviator_high.glb',
    hdri:          'studio_wayfarer_2k.hdr',
    hdriIntensity: 0.75,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       HSTN_FRESNEL,
    glass:         { animate: true },
	variantOrder: ['Frame_Classic_Havana'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	  floorMesh: 'RBM_Zena_frame_LOW',
	},
  },

 

  FURYLOW: {
    label:         'Fury L',
    group:         'Fury',
    subLabel:      'LOW',
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

    // FURYHIGH: {
    // label:         'Fury H',
    // group:         'Fury',
    // subLabel:      'HIGH',
    // glb:           'models/Fury_polycount_high_01.glb',
    // hdri:          'studio_fury_8k.hdr',
    // hdriIntensity: 0.75,
    // startCamera:   'Cam_Front',
    // cameras:       ADVENTURER_CAMERAS,
    // fresnel:       HSTN_FRESNEL,
    // glass:         { animate: true },
	// variantOrder: ['Frame_Black_Gunmetal', 'Lenses_Clear_Amethyst'],
	// shadow: {
	  // enabled:   true,
	  // intensity: 1.0,
	  // softness:  1.0,
	// },
  // },

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
  
    SKYLERGEN1: {
    label:         'Skyler',
    group:         'Skyler',
	subLabel:      'Gen 1',
    glb:           'models/Standard_Skyler_gen1.glb',
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

    SKYLERGEN2: {
    label:         'Skyler',
    group:         'Skyler',
	subLabel:      'Gen 2',
    glb:           'models/Standard_Skyler_gen2.glb',
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

    HSTNLOW: {
    label:         'HSTN L',
    group:         'HSTN',
    subLabel:      'LOW',
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

    // HSTNHIGH: {
    // label:         'HSTN H',
    // group:         'HSTN',
    // subLabel:      'HIGH',
    // glb:           'models/HSTN_polycount_high_01.glb',
    // hdri:          'studio_HSTN_4k.hdr',
    // hdriIntensity: 0.75,
    // startCamera:   'Cam_Front',
    // cameras:       ADVENTURER_CAMERAS,
    // fresnel:       HSTN_FRESNEL,
    // glass:         { animate: true },
	// variantOrder: ['Frame_Black_Gunmetal', 'Lenses_Clear_Amethyst'],
	// shadow: {
	  // enabled:   true,
	  // intensity: 1.0,
	  // softness:  1.0,
	// },
  // },


    ZENALOW: {
    label:         'RBM Zena L',
    group:         'RBM Zena',
    subLabel:      'LOW',
    glb:           'models/Standard_Zena.glb',
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
	  floorMesh: 'RBM_Zena_frame_LOW',
	},
  },

  // ZENAHIGH: {
    // label:         'RBM Zena H',
    // group:         'RBM Zena',
    // subLabel:      'HIGH',
    // glb:           'models/ZENA_polycount_high_01.glb',
    // hdri:          'studio_wayfarer_2k.hdr',
    // hdriIntensity: 0.75,
    // startCamera:   'Cam_Front',
    // cameras:       WAYFARER_CAMERAS,
    // fresnel:       null,
    // glass:         { animate: true },
	// variantOrder: [ 'Frame_Shiny_Black',  'Lenses_Clear_Graphite_Green' ],
	// shadow: {
	  // enabled:   true,
	  // intensity: 1.0,
	  // softness:  1.0,
	  // floorMesh: 'RBM_Zena_frame_HIGH',   // floor from frame, not drooping temples
	// },
  // },




  VANGUARDLOW: {
    label:         'Vanguard',
    group:         'Vanguard',
	subLabel:      'LOW',
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

  // VANGUARDHIGH: {
    // label:         'Vanguard',
    // group:         'Vanguard',
	// subLabel:      'HIGH',
    // glb:           'models/Vanguard_polycount_high_01.glb',
    // hdri:          'studio_vanguard_2k.hdr',
    // hdriIntensity: 1.0,
    // startCamera:   'Cam_Front',
    // cameras:       VANGUARD_CAMERAS,
    // fresnel:       VANGUARD_FRESNEL,
    // glass:         { animate: true },
	// variantOrder: ['White_Prizm_Black', 'Black_Prizm_Transitions_Ember', 'White_Prizm_Rose_Gold', 'Black_Prizm_24k',
						// 'Black_Prizm_Road', 'White_Prizm_Black', 'White_Prizm_Sapphire'],
	// shadow: {
	  // enabled:   true,
	  // intensity: 1.0,
	  // softness:  1.0,
	// },				
  // },


    AVIATORPLOW: {
    label:         'Aviator polycount LOW 100k',
    group:         'Aviator Polycount',
    subLabel:      'LOW',
	color:         'blue',
    glb:           'models/Aviator_polycount_low_01.glb',
    hdri:          'studio_wayfarer_2k.hdr',
    hdriIntensity: 0.75,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       HSTN_FRESNEL,
    glass:         { animate: true },
	variantOrder: ['Frame_Shiny_Black', 'Lenses_Clear'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },

    AVIATORPMID: {
    label:         'Aviator polycount  MID 250k',
    group:         'Aviator Polycount',
    subLabel:      'MID',
	color:         'blue',
    glb:           'models/Aviator_polycount_mid_01.glb',
    hdri:          'studio_wayfarer_2k.hdr',
    hdriIntensity: 0.75,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       HSTN_FRESNEL,
    glass:         { animate: true },
	variantOrder: ['Frame_Shiny_Black', 'Lenses_Clear'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },

    AVIATORPHIGH: {
    label:         'Aviator polycount HIGH 500k',
    group:         'Aviator Polycount',
    subLabel:      'HIGH',
	color:         'blue',
    glb:           'models/Aviator_polycount_high_01.glb',
    hdri:          'studio_wayfarer_2k.hdr',
    hdriIntensity: 0.75,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       HSTN_FRESNEL,
    glass:         { animate: true },
	variantOrder: ['Frame_Shiny_Black', 'Lenses_Clear'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },
  
      CLUBMASTERPLOW: {
    label:         'Clubmaster polycount LOW 100k',
    group:         'Clubmaster Polyc',
    subLabel:      'LOW',
	color:         'blue',
    glb:           'models/Clubmaster_polycount_low_01.glb',
    hdri:          'studio_wayfarer_2k.hdr',
    hdriIntensity: 0.75,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       HSTN_FRESNEL,
    glass:         { animate: true },
	variantOrder: ['Frame_Shiny_Black', 'Lenses_Clear'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },

    CLUBMASTERPMID: {
    label:         'Clubmaster polycount MID 250k',
    group:         'Clubmaster Polyc',
    subLabel:      'MID',
	color:         'blue',
    glb:           'models/Clubmaster_polycount_mid_01.glb',
    hdri:          'studio_wayfarer_2k.hdr',
    hdriIntensity: 0.75,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       HSTN_FRESNEL,
    glass:         { animate: true },
	variantOrder: ['Frame_Shiny_Black', 'Lenses_Clear'],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	},
  },


    CLUBMASTERPHIGH: {
    label:         'Clubmaster polycount HIGH 500k',
    group:         'Clubmaster Polyc',
    subLabel:      'HIGH',
	color:         'blue',
    glb:           'models/Clubmaster_polycount_high_01.glb',
    hdri:          'studio_wayfarer_2k.hdr',
    hdriIntensity: 0.75,
    startCamera:   'Cam_Front',
    cameras:       ADVENTURER_CAMERAS,
    fresnel:       HSTN_FRESNEL,
    glass:         { animate: true },
	variantOrder: ['Frame_Shiny_Black', 'Lenses_Clear'],
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
    hdri:          'studio_fury_8k.hdr',
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

    FURYPMID: {
    label:         'Fury polycount MID 250k',
    group:         'Fury Polycount',
    subLabel:      'MID',
	color:         'blue',
    glb:           'models/Fury_polycount_mid_01.glb',
    hdri:          'studio_fury_8k.hdr',
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


    FURYPHIGH: {
    label:         'Fury polycount HIGH 500k',
    group:         'Fury Polycount',
    subLabel:      'HIGH',
	color:         'blue',
    glb:           'models/Fury_polycount_high_01.glb',
    hdri:          'studio_fury_8k.hdr',
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

  ZENAPLOW: {
    label:         'Zena polycount LOW 100k',
    group:         'Zena Polycount',
    subLabel:      'LOW',
	color:         'blue',
    glb:           'models/ZENA_polycount_low_01.glb',
    hdri:          'studio_wayfarer_2k.hdr',
    hdriIntensity: 0.75,
    startCamera:   'Cam_Front',
    cameras:       WAYFARER_CAMERAS,
    fresnel:       null,
    glass:         { animate: true },
	variantOrder: [ 'Frame_Shiny_Black',  'Lenses_Clear_Graphite_Green' ],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	  floorMesh: 'RBM_Zena_frame_LOW',   // floor from frame, not drooping temples
	},
  },

  ZENAPMID: {
    label:         'Zena polycount MID 250k',
    group:         'Zena Polycount',
    subLabel:      'MID',
	color:         'blue',
    glb:           'models/ZENA_polycount_mid_01.glb',
    hdri:          'studio_wayfarer_2k.hdr',
    hdriIntensity: 0.75,
    startCamera:   'Cam_Front',
    cameras:       WAYFARER_CAMERAS,
    fresnel:       null,
    glass:         { animate: true },
	variantOrder: [ 'Frame_Shiny_Black',  'Lenses_Clear_Graphite_Green' ],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	  floorMesh: 'RBM_Zena_frame_MID',   // floor from frame, not drooping temples
	},
  },


  ZENAPHIGH: {
    label:         'Zena polycount HIGH 500k',
    group:         'Zena Polycount',
    subLabel:      'HIGH',
	color:         'blue',
    glb:           'models/ZENA_polycount_high_01.glb',
    hdri:          'studio_wayfarer_2k.hdr',
    hdriIntensity: 0.75,
    startCamera:   'Cam_Front',
    cameras:       WAYFARER_CAMERAS,
    fresnel:       null,
    glass:         { animate: true },
	variantOrder: [ 'Frame_Shiny_Black',  'Lenses_Clear_Graphite_Green' ],
	shadow: {
	  enabled:   true,
	  intensity: 1.0,
	  softness:  1.0,
	  floorMesh: 'RBM_Zena_frame_HIGH',   // floor from frame, not drooping temples
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



  VANGUARDPLOW: {
    label:         'Vanguard polycount LOW 100k',
    group:         'Vanguard Polyc',
	subLabel:      'LOW',
	color:         'blue',
    glb:           'models/Vanguard_polycount_low_01.glb',
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

  VANGUARDPMID: {
    label:         'Vanguard polycount MID 250k',
    group:         'Vanguard Polyc',
	subLabel:      'MID',
	color:         'blue',
    glb:           'models/Vanguard_polycount_mid_01.glb',
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
  
  VANGUARDPHIGH: {
    label:         'Vanguard polycount HIGH 500k',
    group:         'Vanguard Polyc',
	subLabel:      'HIGH',
	color:         'blue',
    glb:           'models/Vanguard_polycount_high_01.glb',
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
  }
  

};

export const DEFAULT_MODEL = 'WAYFARERGEN2LOW';
