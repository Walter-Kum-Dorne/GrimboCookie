if (typeof GrimboCookie !== 'undefined') {
	if (GrimboCookie === null) {
		delete GrimboCookie;
	} else throw new Error('GrimboCookie already loaded.');
}

var GrimboCookie = {
	name: 'Grimoire Combo Cookies',
	version: '2.0',
	GameVersion: '2.031',
	OG: {}, // Original Game Data
	Game: { // Our overrides
		UpdateMenu: () => {
			GrimboCookie.OG.UpdateMenu();
			if (Game.onMenu == 'prefs') {
				let fragment = document.createDocumentFragment();
				fragment.appendChild(GrimboCookie.Menu.heading('GrimboCookie'));
				fragment.appendChild(GrimboCookie.Menu.toggleButton('autoGolden','Auto Click Golden Cookies','Clicks any golden cookies'));
				fragment.appendChild(GrimboCookie.Menu.toggleButton('autoReindeer','Auto Click Reindeer','Clicks on reindeers'));
				fragment.appendChild(GrimboCookie.Menu.toggleButton('autoNews','Auto Click News','Clicks on the fortune news ticker'));
				fragment.appendChild(GrimboCookie.Menu.toggleButton('autoLump','Auto Click Lump','Harvests mature sugar lumps and max out output'));
				fragment.appendChild(GrimboCookie.Menu.toggleButton('rerollStorm','Reroll Cookie Storm','Cancels Cookie Storm and spawn a new golden cookie'));
				fragment.appendChild(GrimboCookie.Menu.toggleButton('grimoireCombo','Spell combo','If Frenzy and Building buffs have more than 30s left, cast Click Frenzy\'s spell (FTHoF) and earns 30s autoclick'));
				fragment.appendChild(GrimboCookie.Menu.slider('comboSlider', 'Combo', `${Game.ObjectsById[GrimboCookie.getConfig('comboSlider')].name}`, function(){GrimboCookie.setConfig('comboSlider', Math.round(l('GrimboCookie-comboSlider').value)); l('GrimboCookie-comboSliderRightText').textContent = Game.ObjectsById[GrimboCookie.getConfig('comboSlider')].name;}, 0, Game.ObjectsN - 1, 1, 'Buildings eligibility for Grimoire combo'));
				fragment.appendChild(GrimboCookie.Menu.toggleButton('grimoireRefill','Refill Click Frenzy','Casts spells until Click Frenzy is ready for combo'));
				fragment.appendChild(GrimboCookie.Menu.toggleButton('autoMarket','Auto Market','Buys low, sells high (needs at least 80% hired brokers)'));
				
				l('menu').childNodes[2].insertBefore(fragment, l('menu').childNodes[2].childNodes[l('menu').childNodes[2].childNodes.length - 1]);
			}
		},
	},
	ConfigDefaults: { // The default value for the configs
		'autoGolden': false,
		'autoReindeer': false,
		'autoNews': false,
		'autoLump': false,
		'rerollStorm': false,
		'grimoireCombo': false,
		'comboSlider': 5,
		'grimoireRefill': false,
		'autoMarket': false,
	},
	Config: {}, // User settings
	Init: () => { // Initialize the add-on.
		if (!Game || !Game.version || !Game.updateLog) {
			alert('The game isn\'t loaded yet or this isn\'t the game.');
			return;
		}
		if (!Game.mods["Fortune Cookie"]) {
			Game.LoadMod('https://klattmose.github.io/CookieClicker/FortuneCookie.js');
			console.log('Grimbo Cookie needs Fortune Cookie')
			setTimeout(GrimboCookie.Init, 1000);
			return;
		}
		if (!Game.Objects['Wizard tower'].minigameLoaded || !Game.Objects['Bank'].minigameLoaded) {
			console.log('Minigames must be loaded.');
			setTimeout(GrimboCookie.Init, 1000);
			return;
		}
		GrimboCookie.Hijack();
		GrimboCookie.loadConfig();
		GrimboCookie.initTicks();
		Game.registerMod(GrimboCookie.name, GrimboCookie);
	},
	Menu: {
		toggleButton: (configParam, text, description) => {
			let div = document.createElement('div'), a = document.createElement('a'), label = document.createElement('label');
			if (!GrimboCookie.getConfig(configParam)) {
				a.className = 'option off';
				a.textContent = text + ' OFF';
			} else {
				a.className = 'option';
				a.textContent = text + ' ON';
			}
			a.id = `GrimboCookie-${configParam}`;
			a.onclick = () => {
				GrimboCookie.toggleConfig(configParam);
				PlaySound('snd/tick.mp3');
			}
			label.textContent = description;
			div.className = 'listing';
			div.appendChild(a);
			div.appendChild(label);
			return div;
		},
		slider: (configParam, leftText, rightText, callback, min, max, step, description) => {
			let div = document.createElement('div'), box = document.createElement('div'), left = document.createElement('div'), right = document.createElement('div'), slider = document.createElement('input'), label = document.createElement('label');
			left.style = 'float:left';
			left.textContent = leftText;
			right.id = `GrimboCookie-${configParam}RightText`;
			right.style = 'float:right';
			right.textContent = rightText;
			slider.id = `GrimboCookie-${configParam}`;
			slider.class = 'slider';
			slider.type = 'range';
			slider.style = 'clear:both';
			slider.min = min;
			slider.max = max;
			slider.step = step;
			slider.value = GrimboCookie.getConfig(configParam);
			slider.onchange = callback;
			slider.oninput = callback;
			slider.onmouseup = () => PlaySound('snd/tick.mp3');
			label.textContent = description;
			box.className = 'sliderBox';
			box.appendChild(left);
			box.appendChild(right);
			box.appendChild(slider);
			div.className = 'listing';
			div.appendChild(box);
			div.appendChild(label);
			return div;
		},
		heading: (text) => {
			let heading = document.createElement('div');
			heading.className = 'title';
			heading.textContent = text;
			return heading;
		},
		subheading: (text) => {
			let subheading = GrimboCookie.Menu.heading(text);
			subheading.style.fontSize = '17px';
			return subheading;
		},
	},
	saveConfig: () => {
		localStorage.setItem('GrimboCookie', JSON.stringify(GrimboCookie.Config));
	},
	loadConfig: () => {
		let config = localStorage.getItem('GrimboCookie');
		if (config) {
			config = JSON.parse(config);
			Object.keys(config).forEach((key) => {
				GrimboCookie.setConfig(key, config[key]);
			});
		}
	},
	getConfig: (configParam) => {
		if (typeof GrimboCookie.Config[configParam] === 'undefined')
			return GrimboCookie.ConfigDefaults[configParam];
		else return GrimboCookie.Config[configParam];
	},
	setConfig: (configParam, configValue) => {
		if (configValue === GrimboCookie.ConfigDefaults[configParam])
			delete GrimboCookie.Config[configParam];
		else GrimboCookie.Config[configParam] = configValue;
		GrimboCookie.saveConfig();
		if (l(`GrimboCookie-${configParam}`) !== null && l(`GrimboCookie-${configParam}`).tagName == 'A') {
			GrimboCookie.updateMenuView(configParam);
			GrimboCookie.ticks[configParam].onTick();
		}
		return GrimboCookie.getConfig(configParam);
	},
	toggleConfig: (configParam) => {
		let val = GrimboCookie.setConfig(configParam, !GrimboCookie.getConfig(configParam));
		return val;
	},
	updateMenuView: (configParam) => {
		if (!GrimboCookie.getConfig(configParam)) {
			l(`GrimboCookie-${configParam}`).className = 'option off';
			if (l(`GrimboCookie-${configParam}`).textContent.slice(-2) == 'ON') {
				l(`GrimboCookie-${configParam}`).textContent = l(`GrimboCookie-${configParam}`).textContent.slice(0, -2) + 'OFF'
			}
		} else {
			l(`GrimboCookie-${configParam}`).className = 'option';
			if (l(`GrimboCookie-${configParam}`).textContent.slice(-3) == 'OFF') {
				l(`GrimboCookie-${configParam}`).textContent = l(`GrimboCookie-${configParam}`).textContent.slice(0, -3) + 'ON'
			}
		}
	},
	Hijack: () => {
		if (!GrimboCookie.OG.UpdateMenu) {
			GrimboCookie.OG.UpdateMenu = Game.UpdateMenu;
			Game.UpdateMenu = GrimboCookie.Game.UpdateMenu;
		}
	},
	initTicks: () => {
		Object.keys(GrimboCookie.ticks).forEach((tickThis) => {
			let tick = GrimboCookie.ticks[tickThis];
			if (!tick.intervalId) tick.intervalId = setInterval(tick.onTick, tick.rate);
		});
	},
	ticks: {
		'autoGolden': {
			'intervalId': null,
			'rate': 500,
			'onTick': ()=>{
				if (!GrimboCookie.getConfig('autoGolden')) return;
				Game.shimmers.forEach(function(shimmer) {
					if (shimmer.type == "golden") { shimmer.pop() }
				})
			},
		},
		'autoReindeer': {
			'intervalId': null,
			'rate': 500,
			'onTick': ()=>{
				if (!GrimboCookie.getConfig('autoReindeer')) return;
				Game.shimmers.forEach(function(shimmer) {
					if (shimmer.type == 'reindeer') { shimmer.pop() }
				})
			},
		},
		'autoNews': {
			'intervalId': null,
			'rate': 3000,
			'onTick': ()=>{
				if (!GrimboCookie.getConfig('autoNews')) return;
				if (Game.TickerEffect && Game.TickerEffect.type == 'fortune') Game.tickerL.click();
			},
		},
		'autoLump': {
			'intervalId': null,
			'rate': 10000,
			'onTick': ()=>{
				if (!GrimboCookie.getConfig('autoLump')) return;
				if (Date.now() - Game.lumpT > Game.lumpMatureAge) {
					let Lump = Game.lumps;
					let Type = Game.lumpCurrentType;
					Game.clickLump();
					switch (Type) {
						case 0:
							Game.gainLumps(1 - Game.lumps + Lump);
							break;
						case 1:
							Game.gainLumps(2 - Game.lumps + Lump);
							break;
						case 2:
							Game.gainLumps(7 - Game.lumps + Lump);
							break;
						case 3:
							Game.gainLumps(2 - Game.lumps + Lump);
							break;
						case 4:
							Game.gainLumps(3 - Game.lumps + Lump);
							break;
					}
					
				}
			},
		},
		'rerollStorm': {
			'intervalId': null,
			'rate': 500,
			'onTick': ()=>{
				if (!GrimboCookie.getConfig('rerollStorm')) return;
				if (Game.hasBuff('Cookie storm')) {
					Game.buffs['Cookie storm'].time = 1;
					Game.shimmerTypes['golden'].time = 0.95 * Game.shimmerTypes['golden'].maxTime;
				}
			},
		},
		'grimoireCombo': {
			'intervalId': null,
			'rate': 3000,
			'onTick': ()=>{
				if (!GrimboCookie.getConfig('grimoireCombo')) return;
				GrimboCookie.combo();
			},
		},
		'grimoireRefill': {
			'intervalId': null,
			'rate': 1000,
			'onTick': ()=>{
				if (!GrimboCookie.getConfig('grimoireRefill')) return;
				GrimboCookie.refill();
			},
		},
		'autoMarket': {
			'intervalId': null,
			'rate': 180000,
			'onTick': ()=>{
				if (!GrimboCookie.getConfig('autoMarket')) return;
				GrimboCookie.market();
			},
		},
	},
	combo: () => {
		let M = Game.Objects["Wizard tower"].minigame;
		let Gambler = FortuneCookie.spellForecast(M.spellsById[6]);
		let FTHoF = FortuneCookie.FateChecker(M.spellsCastTotal, (Game.season == "valentines" || Game.season == "easter") ? 1 : 0, M.getFailChance(M.spellsById[1]), false);
		let cast = 0;
		if (Game.hasBuff('Frenzy') && Game.buffs['Frenzy'].time/Game.fps >= 30) {
			for (let i=0; i < Game.ObjectsN - 1; i++) {
				let buff = Game.goldenCookieBuildingBuffs[Game.ObjectsById[i].name][0];
				if (Game.hasBuff(buff) && Game.buffs[buff].time/Game.fps >= 30 && GrimboCookie.getConfig('comboSlider') >= i) cast = 1;
			}
		}
		if (cast == 1) {
			if (Gambler.indexOf('Click Frenzy') == 119 && M.magic >= M.getSpellCost(M.spellsById[6])) {
				M.castSpell(M.spellsById[6]);
				cast = 2;
			} else if (FTHoF == "<td><span style=\"color:#4BB8F0;\">Click Frenzy</span><br/></td>" && M.magic >= M.getSpellCost(M.spellsById[1])) {
				M.castSpell(M.spellsById[1]);
				cast = 2;
			}
			if (cast == 2) {
				Game.shimmers.forEach(function(shimmer) {
					if (shimmer.type == "golden") { shimmer.pop() }
				})
				setTimeout(function() {Game.Earn(1500*Game.computedMouseCps);}, 3000);
				GrimboCookie.setConfig('grimoireCombo', false);
				setTimeout(function() {GrimboCookie.setConfig('grimoireCombo', true);}, 30000);
				GrimboCookie.setConfig('grimoireRefill', true);
				cast = 0;
			}
		}
	},
	refill: () => {
		let M = Game.Objects["Wizard tower"].minigame;
		let Gambler = FortuneCookie.spellForecast(M.spellsById[6]);
		let FTHoF = FortuneCookie.FateChecker(M.spellsCastTotal, (Game.season == "valentines" || Game.season == "easter") ? 1 : 0, M.getFailChance(M.spellsById[1]), false);
		if (M.magic >= 0.95 * M.magicM){
			if (Gambler.indexOf('Free Sugar Lump') == 119 || Gambler.indexOf('Free Sugar Lump') == 117) {
				M.castSpell(M.spellsById[6]);
				Game.shimmers.forEach(function(shimmer) {
					if (shimmer.type == "golden") { shimmer.pop() }
				})
			} else if (FTHoF == "<td><span style=\"color:#DAA560;\">Free Sugar Lump</span><br/></td>") {
				M.castSpell(M.spellsById[1]);
				Game.shimmers.forEach(function(shimmer) {
					if (shimmer.type == "golden") { shimmer.pop() }
				})
			} else if (Gambler.indexOf('Click Frenzy') == 119 || FTHoF == "<td><span style=\"color:#4BB8F0;\">Click Frenzy</span><br/></td>") {
				GrimboCookie.setConfig('grimoireRefill', false);
			} else if (Gambler.indexOf('Spontaneous Edifice (Nothing)') == 95 || Gambler.indexOf('Resurrect Abomination') == 95 || Gambler.indexOf('Resurrect Abomination') == 93) {
				M.castSpell(M.spellsById[6]);
			} else if (Object.keys(Game.buffs).length == 0 && (Gambler.indexOf('Stretch Time') == 95 || Gambler.indexOf('Stretch Time') == 93)) {
				M.castSpell(M.spellsById[6]);
			} else if (Gambler.indexOf('Haggler') == 95 || Gambler.indexOf('Haggler') == 93){
				M.castSpell(M.spellsById[6]);
			} else {
				M.castSpell(M.spellsById[4]);
			}
		}
	},
	market: () => {
		let M = Game.Objects['Bank'].minigame;
		if (M.brokers >= M.getMaxBrokers() * 0.8) {
			for (let i = 0; i < M.goodsById.length; i++) {
				let MaxStock = M.getGoodMaxStock(M.goodsById[i]);
				let RestVal = M.getRestingVal(i);
				if (M.goodsById[i].val < RestVal / 2 && M.goodsById[i].stock < MaxStock / 2) {
					M.buyGood(i,10000);
				}
				else if (M.goodsById[i].val > RestVal && M.goodsById[i].stock >= MaxStock / 2) {
					M.sellGood(i,10000);
				}
			}
		} else {
			GrimboCookie.setConfig('autoMarket', false);
			let missingBrokers = M.getMaxBrokers() * 0.8 - M.brokers;
			Game.Notify('Auto Market condition', 'Hire at least ' + missingBrokers + ' more Stockbrokers in order to activate Auto Market (hiring all of them is advised).', [1, 33]);
			PlaySound('snd/spellFail.mp3',0.75);
		}
	},
};
if (typeof GrimboCookieInit === 'undefined' || GrimboCookie) GrimboCookie.Init();
