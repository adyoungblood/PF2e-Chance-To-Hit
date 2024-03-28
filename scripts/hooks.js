// import { ChanceToHitData } from './data.js'

class ChanceToHit {
  static ID = 'pf2e-chance-to-hit';
  
  static FLAGS = {
    TOKENBAR: 'token-bar'
  }
  
  static TEMPLATES = {
    TOKENBAR: `modules/${this.ID}/templates/token-bar.hbs`
  }
}

function updateTokenBar(user, token, visible) {
	if (typeof(token.chanceToHitTokenBar) == "undefined")
		return
	
	let tokens = canvas.tokens.controlled;
	const userTokens = user.character.getActiveTokens(linked = true, document = false);
	if (userTokens.length > 0) {
		tokens.push(userTokens[0]);
	}

	if (tokens.length === 0) {
		return ui.notifications.error("PF2E.ErrorMessage.NoTokenSelected", { localize: true });
	}

	const targetingToken = tokens[0];
	const targetingActor = targetingToken?.actor;

	const targetToken = token;
	const targetActor = token?.actor;

	if (targetingToken == null || targetingActor == null || targetToken == null || targetActor == null) {
		return ui.notifications.error("PF2E.ErrorMessage.NoTokenSelected", { localize: true });
	}

	const attack = targetingActor.system.actions[0];
	const attackMod = attack.totalModifier;
	const AC = targetActor.armorClass.value - (targetingToken.isFlanking(targetToken) ? 2 : 0);
	const rollNeeded = AC - attackMod;
	
	let critHit = Math.min(Math.max(21 - (rollNeeded + 10), 0), 20);
	let hit = Math.min(Math.max(21 - rollNeeded, 0), 20) - critHit;
	let critMiss = Math.min(Math.max(rollNeeded - 10, 0), 20);
	let miss = Math.min(Math.max(rollNeeded - 1, 0), 20) - critMiss;
	
	if (rollNeeded > 30) { // nat 20 crit miss -> miss
		critMiss -= 1;
		miss += 1;
	} else if (rollNeeded > 20) { // nat 20 miss -> hit
		miss -= 1;
		hit += 1;
	} else if (rollNeeded > 10) { // nat 20 hit -> crit
		hit -= 1;
		critHit += 1;
	} else if (rollNeeded <= 10) { // nat 1 miss -> crit miss
		miss -= 1;
		critMiss += 1;
	} else if (rollNeeded <= 0) { // nat 1 hit -> miss
		hit -= 1;
		miss += 1;
	} else if (rollNeeded <= -10) { // nat 1 miss -> crit miss
		critHit -= 1;
		hit += 1;
	}
	
	let critHitPercent = critHit / 20.0 * 100.0;
	let hitPercent = hit / 20.0 * 100.0;
	let critMissPercent = critMiss / 20.0 * 100.0;
	let missPercent = miss / 20.0 * 100.0;
	
	// const message = ' crit hit: ' + critHitPercent + '% hit: ' + hitPercent + '% miss: ' + missPercent + '% crit miss: ' + critMissPercent + '%';
	
	// ui.notifications.info(message);

	// ui.notifications.info('need: ' + rollNeeded + ' crit hit: ' + critHit + ' hit: ' + hit + ' miss: ' + miss + ' crit miss: ' + critMiss);
	
	const display = hitPercent + '%/' + critHitPercent + '%';
	
	token.chanceToHitTokenBar.text = display;
	token.chanceToHitTokenBar.visible = visible;
}

Hooks.on("init", function() {
});

Hooks.on("ready", function() {
  console.log('chance-to-hit | Hello World!');
  // ChanceToHitData.createTokenBar();
});

//Hooks.on('refreshToken', (token, {refreshState, refreshVisibility, refreshBorder}) => {
//	updateTokenBar(game.user, token);
//});

Hooks.on('hoverToken', (token, hovered) => {
	updateTokenBar(game.user, token, hovered);
});

Hooks.on('targetToken', (user, token, targeted) => {
	try {
		if (user != game.user)
			return
		
		if (typeof(token.chanceToHitTokenBar) == "undefined") {
			const textStyle = {fontFamily : 'Signika', fontSize: 24, fill : 0x1010ff, align : 'center'}
		
			token.chanceToHitTokenBar = token.addChild(new PIXI.Text('', textStyle));
			token.chanceToHitTokenBar.scale.set(0.25);
			token.chanceToHitTokenBar.anchor.set(0.5, 1);
			//token.chanceToHitTokenBar.position.set(token.tooltip.x, (token.tooltip.x * position) + yPosition);
			token.chanceToHitTokenBar.position.set(token.tooltip.x, token.tooltip.y);
		}
			
		updateTokenBar(user, token, true);
		// token.chanceToHitTokenBar.visible = targeted;
		
		//console.log(this.height, this.position);
		//const yPosition = token.tooltip.y + this.height;
		//const position = { a: 0, b: 1, c: 2 }[this.position];
		//console.log(position);
		
	} catch(err) {
		console.error(
				`PF2e Chance To Hit | Error on hook targetToken. Token Name: "${token.name}". ID: "${token.id}". Type: "${token.document.actor.type}".`,
				err
			);
	}
});