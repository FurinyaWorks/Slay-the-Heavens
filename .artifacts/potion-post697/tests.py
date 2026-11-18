from pathlib import Path
import subprocess
source=subprocess.check_output(['git','show','4ace45fedbce5fb0507f793bca0e7b5c8992e061:tests/integrated-ci-source.cases.mjs']).decode('utf8')
names=['mobile hand historical CI reader','mobile hand public CI source','mobile hand current inventory','mobile hand integrated reader and source']
path=Path('tests/integrated-ci-source.cases.mjs');text=path.read_text(encoding='utf8')
for name in names:
 start=source.index("test('"+name);end=source.find('\ntest(',start+1);block=source[start:]if end<0 else source[start:end]
 block=block.replace('actualHandReadFileSync','actualPost697ReadFileSync').replace('actualHandDiscoverJs','actualPost697DiscoverJs').replace('mobileHand','potionPost697').replace('MobileHand','PotionPost697').replace('mobile hand','post697 union').replace('src/lua/abyss_battle_card_view.lua','src/lua/abyss_game_ui_input.lua').replace('potionPost697CiPacket.files[anchor].before.source','potionPost697CiPacket.files[anchor].views.potion.source').replace('potionPost697CiPacket.priorInventory','potionPost697CiPacket.viewInventories.potion')
 text=text.rstrip()+'\n\n'+block.lstrip()
imports="\nimport {potionPost697CiRead,potionPost697CiPacket,potionPost697CiSource,assertPotionPost697CiCurrent,assertPotionPost697RawInventory} from './helpers/potion-post697-ci-source.mjs';\n"
path.write_text(text+imports,encoding='utf8',newline='\n')
