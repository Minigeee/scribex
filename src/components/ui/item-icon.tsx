import React from 'react';

// Define the sprite sheet dimensions and icon size
const ICON_SIZE = 32; // Size of each icon in pixels
const ICONS_PER_ROW = 16; // Number of icons per row in the sprite sheet

// Map item IDs to their positions in the sprite sheet
// The position is represented as [row, column]
const ITEM_POSITIONS = {
  // ROW 0: STATUS EFFECTS (11 items)
  'skull_and_bones': [0, 0],
  'poison': [0, 1],
  'sleeping_eye': [0, 2],
  'silenced': [0, 3],
  'cursed': [0, 4],
  'dizzy': [0, 5],
  'charmed': [0, 6],
  'sleeping': [0, 7],
  'paralysis': [0, 8],
  'burned': [0, 9],
  'sweat_drop': [0, 10],
  
  // ROW 1: BODY ICONS (5 items)
  'heart': [1, 0],
  'lungs': [1, 1],
  'stomach': [1, 2],
  'brain': [1, 3],
  'strong_arm': [1, 4],
  
  // ROW 2: BUFFS & DEBUFFS (7 items)
  'buff_arrow_1': [2, 0],
  'buff_arrow_2': [2, 1],
  'buff_arrow_3': [2, 2],
  'debuff_arrow_1': [2, 3],
  'debuff_arrow_2': [2, 4],
  'debuff_arrow_3': [2, 5],
  'repeat_arrow': [2, 6],
  
  // ROW 3: SPECIAL MOVES (16 items)
  'dripping_blade': [3, 0],
  'saber_slash': [3, 1],
  'lightning_attack': [3, 2],
  'headshot': [3, 3],
  'raining_arrows': [3, 4],
  'healing': [3, 5],
  'heal_injury': [3, 6],
  'battle_gear': [3, 7],
  'guard': [3, 8],
  'ring_of_fire': [3, 9],
  'disintegrate': [3, 10],
  'fist_hit': [3, 11],
  'gust_of_air': [3, 12],
  'tremor': [3, 13],
  'psychic_waves': [3, 14],
  'sunrays': [3, 15],
  
  // ROW 4: NON COMBAT ACTIONS (9 items)
  'square_speech_bubble': [4, 0],
  'round_speech_bubble': [4, 1],
  'campfire': [4, 2],
  'camping_tent': [4, 3],
  'blacksmith': [4, 4],
  'mining': [4, 5],
  'woodcutting': [4, 6],
  'spellbook_action': [4, 7],
  'steal': [4, 8],
  
  // ROW 5-6: WEAPONS (28 items, spans 2 rows)
  'wooden_waster': [5, 0],
  'longsword': [5, 1],
  'enchanted_sword': [5, 2],
  'katana': [5, 3],
  'gladius': [5, 4],
  'saber': [5, 5],
  'dagger': [5, 6],
  'broad_dagger': [5, 7],
  'sai': [5, 8],
  'dual_swords': [5, 9],
  'war_axe': [5, 10],
  'battle_axe': [5, 11],
  'flail': [5, 12],
  'spiked_club': [5, 13],
  'whip': [5, 14],
  'fist': [5, 15],
  // Row 6 (Weapons continued)
  'buckler_shield': [6, 0],
  'wooden_shield': [6, 1],
  'checkered_shield': [6, 2],
  'bow_and_arrow': [6, 3],
  'crossbow': [6, 4],
  'slingshot': [6, 5],
  'boomerang': [6, 6],
  'wizard_staff': [6, 7],
  'magic_gem_staff_1': [6, 8],
  'magic_gem_staff_2': [6, 9],
  'magic_gem_staff_3': [6, 10],
  'magic_gem_staff_4': [6, 11],
  
  // ROW 7-8: CLOTHING & ARMOUR (26 items, spans 2 rows)
  'robin_hood_hat': [7, 0],
  'barbute_helm': [7, 1],
  'leather_helm': [7, 2],
  'cross_helm': [7, 3],
  'iron_armour': [7, 4],
  'steel_armour': [7, 5],
  'leather_armour': [7, 6],
  'layered_plate_armour': [7, 7],
  'blue_tunic': [7, 8],
  'green_tunic': [7, 9],
  'trousers': [7, 10],
  'shorts': [7, 11],
  'heart_boxers': [7, 12],
  'dress': [7, 13],
  'cloak': [7, 14],
  'belt': [7, 15],
  // Row 8 (Clothing continued)
  'leather_gauntlet': [8, 0],
  'metal_gauntlet': [8, 1],
  'leather_boots': [8, 2],
  'steeltoe_boots': [8, 3],
  'ring': [8, 4],
  'diamond_ring': [8, 5],
  'gold_necklace': [8, 6],
  'prayer_beads': [8, 7],
  'tribal_necklace': [8, 8],
  'leather_pouch': [8, 9],
  
  // ROW 9: HEALING ITEMS (16 items)
  'potion_normal_1': [9, 0],
  'potion_normal_2': [9, 1],
  'potion_normal_3': [9, 2],
  'potion_normal_4': [9, 3],
  'potion_upgraded_1': [9, 4],
  'potion_upgraded_2': [9, 5],
  'potion_upgraded_3': [9, 6],
  'potion_upgraded_4': [9, 7],
  'potion_rare_1': [9, 8],
  'potion_rare_2': [9, 9],
  'potion_rare_3': [9, 10],
  'potion_rare_4': [9, 11],
  'potion_special_1': [9, 12],
  'potion_special_2': [9, 13],
  'potion_special_3': [9, 14],
  'bandage': [9, 15],
  
  // ROW 10-13: GENERAL ITEMS (64 items, spans 4 rows)
  // Row 10 (General Items - First 16)
  'knapsack': [10, 0],
  'axe': [10, 1],
  'pickaxe': [10, 2],
  'shovel': [10, 3],
  'hammer': [10, 4],
  'grappling_hook': [10, 5],
  'hookshot': [10, 6],
  'telescope': [10, 7],
  'magnifying_glass': [10, 8],
  'lantern': [10, 9],
  'torch': [10, 10],
  'candle': [10, 11],
  'bomb': [10, 12],
  'rope': [10, 13],
  'bear_trap': [10, 14],
  'hourglass': [10, 15],
  // Row 11 (General Items - Next 16)
  'runestone': [11, 0],
  'mirror': [11, 1],
  'shackles': [11, 2],
  'lyre': [11, 3],
  'violin': [11, 4],
  'ocarina': [11, 5],
  'flute': [11, 6],
  'panpipes': [11, 7],
  'hunting_horn': [11, 8],
  'brass_key': [11, 9],
  'silver_keyring': [11, 10],
  'treasure_chest': [11, 11],
  'mortar_and_pestle': [11, 12],
  'herb_1': [11, 13],
  'herb_2': [11, 14],
  'herb': [11, 15],
  // Row 12 (General Items - Next 16)
  'mushrooms': [12, 0],
  'flower_bulb': [12, 1],
  'root_tip': [12, 2],
  'plant_pot_seedling': [12, 3],
  'plant_pot_growing': [12, 4],
  'plant_pot_fully_grown': [12, 5],
  'money_purse': [12, 6],
  'crown_coin': [12, 7],
  'bronze_coin_stack': [12, 8],
  'silver_coin_stack': [12, 9],
  'gold_coin_stack': [12, 10],
  'large_gold_coin_stack': [12, 11],
  'receive_money': [12, 12],
  'pay_money': [12, 13],
  'gems': [12, 14],
  'rupee': [12, 15],
  // Row 13 (General Items - Last 16)
  'book_1': [13, 0],
  'book_2': [13, 1],
  'book_3': [13, 2],
  'book_4': [13, 3],
  'book_5': [13, 4],
  'book_6': [13, 5],
  'book_7': [13, 6],
  'book_8': [13, 7],
  'open_book': [13, 8],
  'letter': [13, 9],
  'tied_scroll': [13, 10],
  'open_scroll': [13, 11],
  'old_map': [13, 12],
  'dice': [13, 13],
  'card': [13, 14],
  'bottle_of_wine': [13, 15],
  
  // ROW 14-15: FOOD (31 items, spans 2 rows)
  'apple': [14, 0],
  'banana': [14, 1],
  'pear': [14, 2],
  'lemon': [14, 3],
  'strawberry': [14, 4],
  'grapes': [14, 5],
  'carrot': [14, 6],
  'sweetcorn': [14, 7],
  'garlic': [14, 8],
  'tomato': [14, 9],
  'eggplant': [14, 10],
  'red_chili': [14, 11],
  'mushroom': [14, 12],
  'loaf_of_bread': [14, 13],
  'baguette': [14, 14],
  'whole_chicken': [14, 15],
  // Row 15 (Food continued)
  'chicken_leg': [15, 0],
  'sirloin_steak': [15, 1],
  'ham': [15, 2],
  'morsel': [15, 3],
  'cooked_fish': [15, 4],
  'eggs': [15, 5],
  'big_egg': [15, 6],
  'cheese': [15, 7],
  'milk': [15, 8],
  'honey': [15, 9],
  'salt': [15, 10],
  'spices': [15, 11],
  'candy': [15, 12],
  'cake': [15, 13],
  'drink': [15, 14],
  
  // ROW 16: FISHING ITEMS (15 items)
  'fishing_rod': [16, 0],
  'fishing_hook': [16, 1],
  'worm_bait': [16, 2],
  'lake_trout': [16, 3],
  'brown_trout': [16, 4],
  'eel': [16, 5],
  'tropical_fish': [16, 6],
  'clownfish': [16, 7],
  'jellyfish': [16, 8],
  'octopus': [16, 9],
  'turtle': [16, 10],
  'fish_bone': [16, 11],
  'old_boot': [16, 12],
  'fossil': [16, 13],
  'sunken_chest': [16, 14],
  
  // ROW 17: RESOURCES (11 items)
  'wood': [17, 0],
  'stone': [17, 1],
  'ore': [17, 2],
  'gold': [17, 3],
  'gems_resource': [17, 4],
  'cotton': [17, 5],
  'yarn': [17, 6],
  'cloth': [17, 7],
  'pelts': [17, 8],
  'monster_claw': [17, 9],
  'feathers': [17, 10],
  
  // ROW 18: ORBS (6 items)
  'orb_1': [18, 0],
  'orb_2': [18, 1],
  'orb_3': [18, 2],
  'orb_4': [18, 3],
  'orb_5': [18, 4],
  'orb_6': [18, 5],
  
  // ROW 19-21: NEW ICONS (39 items, spans 3 rows)
  'empty_flask_1': [19, 0],
  'empty_flask_2': [19, 1],
  'empty_flask_3': [19, 2],
  'empty_flask_4': [19, 3],
  'full_flask_1': [19, 4],
  'full_flask_2': [19, 5],
  'full_flask_3': [19, 6],
  'full_flask_4': [19, 7],
  'cauldron_on_fire': [19, 8],
  'cauldron': [19, 9],
  'horse': [19, 10],
  'wooden_beam': [19, 11],
  'wicker_basket': [20, 0],
  'powder_1': [20, 1],
  'powder_2': [20, 2],
  'powder_3': [20, 3],
  // Row 20 (New Icons continued)
  'powder_4': [20, 4],
  'powder_5': [20, 5],
  'powder_6': [20, 6],
  'powder_7': [20, 7],
  'powder_8': [20, 8],
  'powder_9': [20, 9],
  'powder_10': [20, 10],
  'powder_11': [20, 11],
  'powder_12': [20, 12],
  'hand_casting_magic': [21, 0],
  'magic_scroll_1': [21, 1],
  'magic_scroll_2': [21, 2],
  'magic_scroll_3': [21, 3],
  'magic_scroll_4': [21, 4],
  'magic_scroll_5': [21, 5],
  'magic_scroll_6': [21, 6],
  // Row 21 (New Icons continued)
  'sunrise': [21, 7],
  'sun': [21, 8],
  'sunset': [21, 9],
  'moon': [21, 10],
  'snowflake': [21, 11],
  'hot_temperature': [21, 12],
  'cold_temperature': [21, 13],  
  
  // Default fallback
  'unknown': [22, 0],
};

export type ItemId = keyof typeof ITEM_POSITIONS | (string & {});

interface ItemIconProps {
  itemId: ItemId;
  size?: number;
  className?: string;
}

export function ItemIcon({ itemId, size = ICON_SIZE, className = '' }: ItemIconProps) {
  // Get the position of the item in the sprite sheet
  const position = ITEM_POSITIONS[itemId as keyof typeof ITEM_POSITIONS] || ITEM_POSITIONS['unknown'];
  const [row, col] = position;
  
  // Calculate the background position
  const backgroundPositionX = -(col * ICON_SIZE);
  const backgroundPositionY = -(row * ICON_SIZE);
  
  // Calculate the scale ratio
  const scale = size / ICON_SIZE;
  
  return (
    <div
      className={`inline-block ${className}`}
      style={{
        width: size,
        height: size,
        backgroundImage: `url(/shikashi-fantasy-icon-pack-v2/transparent.png)`,
        backgroundPosition: `${backgroundPositionX * scale}px ${backgroundPositionY * scale}px`,
        backgroundSize: `${ICONS_PER_ROW * ICON_SIZE * scale}px auto`,
        backgroundRepeat: 'no-repeat',
      }}
      title={itemId.replace(/_/g, ' ')}
      role="img"
      aria-label={`${itemId.replace(/_/g, ' ')} icon`}
    />
  );
} 