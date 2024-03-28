import { ChanceToHit } from './chance-to-hit.js'

class ChanceToHitData {
	static getTokenBar() {
		return game.user.getFlag(ChanceToHit.ID, ChanceToHit.FLAGS.TOKENBAR);
	}
	
	static createTokenBar() {
		return game.user.setFlag(ChanceToHit.ID, ChanceToHit.FLAGS.TOKENBAR, 'testing if flags work');
	}
}