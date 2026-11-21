// Fixed read order after the full owner scan. New Release predecessors
// authenticate the same map-deck cohort whenever an earlier layer uses it.
const mapDeckOwners = ['card_skin', 'deck_ui', 'game_ui_view', 'map_ui'];

export const currentProductionRereads = Object.freeze([
  'ui', 'character_select_view', 'traveler_portraits', 'battle_render_hud',
  'map_ui', 'node_ui', 'game_ui', 'game_ui_input',
  'battle_card_gestures', 'battle_ui', 'game_ui', 'game_ui_view',
  'map_ui', 'node_ui_lifecycle', 'page_reveal', 'node_ui_events',
  'merchant', 'node_ui', 'node_ui_lifecycle', 'node_ui_shop',
  'battle_info_content', 'battle_render_hud', 'battle_render_hud', 'battle_render_hud',
  ...mapDeckOwners, 'card_skin', ...mapDeckOwners, ...mapDeckOwners,
  'feedback', ...mapDeckOwners, ...mapDeckOwners, 'monster_power_view',
  'battle_info_content', 'battle_render_hud', 'battle_render_hud', 'battle_render_hud',
  ...mapDeckOwners, 'card_skin', ...mapDeckOwners, ...mapDeckOwners,
  'feedback', ...mapDeckOwners, ...mapDeckOwners, 'monster_power_view',
  'deck_ui', ...mapDeckOwners, 'map_ui', ...mapDeckOwners,
  'battle_card_gestures', 'battle_render_actors', 'game_ui_input', 'game_ui_view',
  ...mapDeckOwners, 'battle_render_hud', 'battle_render_hud', 'battle_render_hud',
  'battle_render_hud', 'battle_ui', 'game_ui', 'ui',
  'game_ui_navigation', 'game_ui_navigation_view', 'game_ui_overlays', 'battle_reward_layout',
  'node_ui', 'node_ui_treasure', 'node_ui_treasure_list', 'relic_view_ui',
  'shop_ui', 'treasure_ui', 'controller', 'deck_ui',
  ...mapDeckOwners, 'match_event_ui', 'node_ui_lifecycle',
].map(name => 'src/lua/abyss_' + name + '.lua'));
