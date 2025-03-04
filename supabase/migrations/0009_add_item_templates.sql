-- Add item templates based on sprite sheet icons

-- Insert item templates with string IDs matching the sprite sheet icons
INSERT INTO public.item_templates (id, name, description, item_type, rarity, stat_bonuses)
VALUES
  -- Weapons
  ('longsword', 'Longsword', 'A standard longsword with good reach and damage.', 'weapon', 'common', '{"strength": 5, "attack": 10}'),
  ('enchanted_sword', 'Enchanted Sword', 'A sword imbued with magical energy.', 'weapon', 'rare', '{"strength": 8, "magic": 15, "attack": 12}'),
  ('katana', 'Katana', 'A curved blade known for its sharpness and precision.', 'weapon', 'uncommon', '{"dexterity": 10, "attack": 8, "speed": 5}'),
  ('bow_and_arrow', 'Bow and Arrow', 'A reliable ranged weapon for hunting and combat.', 'weapon', 'common', '{"dexterity": 8, "range": 15}'),
  ('wizard_staff', 'Wizard Staff', 'A staff that channels magical energy.', 'weapon', 'uncommon', '{"magic": 20, "wisdom": 10}'),
  
  -- Armor
  ('leather_armour', 'Leather Armor', 'Light armor offering basic protection without restricting movement.', 'armor', 'common', '{"defense": 5, "speed": 2}'),
  ('steel_armour', 'Steel Armor', 'Heavy armor providing excellent protection at the cost of mobility.', 'armor', 'uncommon', '{"defense": 15, "speed": -3}'),
  ('leather_boots', 'Leather Boots', 'Comfortable footwear for long journeys.', 'armor', 'common', '{"speed": 5, "stamina": 3}'),
  ('cross_helm', 'Cross Helm', 'A sturdy helmet with good visibility.', 'armor', 'uncommon', '{"defense": 8, "perception": 2}'),
  
  -- Accessories
  ('ring', 'Ring', 'A simple metal ring.', 'accessory', 'common', '{"luck": 2}'),
  ('diamond_ring', 'Diamond Ring', 'A valuable ring with a sparkling diamond.', 'accessory', 'rare', '{"charisma": 10, "luck": 5}'),
  ('gold_necklace', 'Gold Necklace', 'A beautiful necklace made of pure gold.', 'accessory', 'uncommon', '{"charisma": 8}'),
  
  -- Potions
  ('potion_normal_1', 'Health Potion', 'Restores health when consumed.', 'consumable', 'common', '{"healing": 50}'),
  ('potion_normal_2', 'Mana Potion', 'Restores magical energy when consumed.', 'consumable', 'common', '{"mana": 50}'),
  ('potion_upgraded_1', 'Strength Potion', 'Temporarily increases strength when consumed.', 'consumable', 'uncommon', '{"strength": 15, "duration": 300}'),
  ('potion_upgraded_2', 'Speed Potion', 'Temporarily increases speed when consumed.', 'consumable', 'uncommon', '{"speed": 20, "duration": 180}'),
  
  -- Tools
  ('pickaxe', 'Pickaxe', 'Used for mining ore and stone.', 'tool', 'common', '{"mining": 10}'),
  ('fishing_rod', 'Fishing Rod', 'Used to catch fish from bodies of water.', 'tool', 'common', '{"fishing": 10}'),
  ('axe', 'Axe', 'Used for chopping wood.', 'tool', 'common', '{"woodcutting": 10}'),
  
  -- Resources
  ('wood', 'Wood', 'A common building material.', 'resource', 'common', '{}'),
  ('stone', 'Stone', 'A sturdy building material.', 'resource', 'common', '{}'),
  ('gold', 'Gold', 'A valuable metal used for currency and crafting.', 'resource', 'uncommon', '{}'),
  ('gems', 'Gems', 'Precious stones with various magical properties.', 'resource', 'rare', '{}'),
  
  -- Food
  ('apple', 'Apple', 'A fresh, juicy fruit that restores a small amount of health.', 'food', 'common', '{"healing": 10}'),
  ('loaf_of_bread', 'Bread', 'A staple food that provides sustenance.', 'food', 'common', '{"stamina": 15}'),
  ('cheese', 'Cheese', 'A tasty dairy product that restores health and stamina.', 'food', 'common', '{"healing": 8, "stamina": 12}'),
  
  -- Quest Items
  ('old_map', 'Old Map', 'A weathered map showing the location of hidden treasure.', 'quest', 'rare', '{}'),
  ('tied_scroll', 'Ancient Scroll', 'A scroll containing forgotten knowledge.', 'quest', 'rare', '{}'),
  ('treasure_chest', 'Treasure Chest', 'A locked chest containing valuable items.', 'container', 'uncommon', '{}'),
  
  -- Special Items
  ('orb_1', 'Orb of Power', 'A mysterious orb pulsing with magical energy.', 'artifact', 'epic', '{"magic": 25, "wisdom": 15, "charisma": 10}'),
  ('cauldron', 'Cauldron', 'Used for brewing potions and magical concoctions.', 'crafting', 'uncommon', '{"alchemy": 15}');

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_item_templates_name ON public.item_templates(name); 