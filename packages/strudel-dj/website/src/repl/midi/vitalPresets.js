/**
 * vitalPresets.js — Vital preset catalog for browser-side MIDI import
 *
 * Categories are used for the UI preset picker.
 * The actual preset list comes from the vital-bridge server at runtime,
 * but these categories help organize the hardcoded suggestions.
 */

// Preset categories for the UI picker — grouped by sound type
export const PRESET_CATEGORIES = {
  bass: {
    label: '🎸 Bass',
    presets: [
      'jupiter_bass', 'big_stomp', 'banana_wob', 'honk_wub',
      'growl_bass_sidechain', 'boot_scre3n', 'oolacile_evil_dubstep_bass',
      'feeder', 'thunk', 'vlt_future_gun',
    ],
  },
  keys: {
    label: '🎹 Keys / Piano',
    presets: [
      'keystation', 'easy_mallet', 'chorusy_keys', 'piano_from_the_yard_sale',
      'touch_tone',
    ],
  },
  pad: {
    label: '🌊 Pad / Atmosphere',
    presets: [
      'space_station', 'strings_section', 'analog_pad', 'float_chords',
      'a_happy_ending_of_the_world', 'moving_harmonics', 'synthetic_quartet',
      'abbysun',
    ],
  },
  lead: {
    label: '✨ Lead / Pluck',
    presets: [
      'digital_roller', 'ceramic', 'moog_pluck', 'super_nice_pluck',
      'super_pluck', 'distant_majestic_lead', 'lorn_style_lead',
      'plucked_string',
    ],
  },
  bells: {
    label: '🔔 Bells / Metallic',
    presets: [
      'cinema_bells', 'crescendo_bells', 'e4_one_note_metallophone',
      'damped_horn', 'fm_mode',
    ],
  },
  fx: {
    label: '💥 FX / Experimental',
    presets: [
      'horror_of_melbourne_1', 'destruction', 'metal_head',
      'disrupt', 'snowcrash', 'railgun', 'dispersed_grit',
      'cursed_steps', 'digestive_trauma',
    ],
  },
  drums: {
    label: '🥁 Drums / Percussion',
    presets: [
      'fm_drum_circle', 'kick_drum_1', 'squish_clicker', 'thumpus',
    ],
  },
};

// All available preset slugs (for validation)
export const ALL_PRESETS = Object.values(PRESET_CATEGORIES)
  .flatMap((c) => c.presets)
  .filter((v, i, a) => a.indexOf(v) === i); // deduplicate

/**
 * Convert a preset slug to display name
 * @param {string} slug - e.g. "jupiter_bass"
 * @returns {string} - e.g. "Jupiter Bass"
 */
export function slugToDisplayName(slug) {
  return slug.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

/**
 * Convert a display name to slug
 * @param {string} name - e.g. "Jupiter Bass"
 * @returns {string} - e.g. "jupiter_bass"
 */
export function displayNameToSlug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
}
