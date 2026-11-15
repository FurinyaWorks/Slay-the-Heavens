// Exact independent product owners; the private validation tree is not a producer.
export const mobileUiBase='1a62b5e517e138b825b8b663a973065c62ad89ec';
export const mobileUiProducers=Object.freeze([
 {name:'selectionReadout',commit:'0b5a2c4005fed0eb3bf03dea11dda9fa0f112b57',parent:'e1886723b9fdffeb17de767a6fcb57efb99599eb',paths:['src/lua/abyss_character_select_view.lua']},
 {name:'cardInteractions',commit:'54dfd71315ae1e1bdfa3b9f27a8dd80d3d46a8e7',parent:mobileUiBase,paths:['src/lua/abyss_choice_ui.lua','src/lua/abyss_deck_ui.lua','src/lua/abyss_game_ui_navigation_view.lua']},
 {name:'battleLifecycle',commit:'f31760409d46b2514bc56c29ae201a684104179c',parent:'53df3fc35ced3349088025402183f5d906383272',paths:['src/lua/abyss_battle_card_view.lua','src/lua/abyss_feedback_actor_painter.lua']},
 {name:'transitionPacing',commit:'84060d48a4a257852561cd94f3aabd8b53a102bd',parent:mobileUiBase,paths:['src/lua/abyss_prologue.lua']},
]);
