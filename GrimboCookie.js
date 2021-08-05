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
				fragment.appendChild(GrimboCookie.Menu.heading('GrimboCookie Toggleables'));
				fragment.appendChild(GrimboCookie.Menu.subheading('Auto Clickers'));
				fragment.appendChild(GrimboCookie.Menu.toggleButton('autoGolden','Auto Click Golden Cookies','Clicks any golden cookies for you.'));
				fragment.appendChild(GrimboCookie.Menu.toggleButton('autoReindeer','Auto Click Reindeer','Clicks on reindeer for you.'));
				fragment.appendChild(GrimboCookie.Menu.toggleButton('autoNews','Auto Click News','Clicks on the fortune news ticker for you.'));
				fragment.appendChild(GrimboCookie.Menu.toggleButton('autoLump','Auto Click Lump','Harvests mature sugar lumps for you.'));
				fragment.appendChild(GrimboCookie.Menu.subheading('Mini-game Enhancers'));
				fragment.appendChild(GrimboCookie.Menu.toggleButton('grimoireCombo','Spell combo','If Frenzy and Building buffs have more than 30s left, cast Click Frenzy\'s spell (ftHoF) and earns 30s autoclick.'));
				fragment.appendChild(GrimboCookie.Menu.slider('comboSlider', 'Combo', function(){GrimboCookie.setConfig('comboSlider', Math.round(l('GrimboCookie-comboSlider').value)); l('GrimboCookie-comboSliderRightText').innerHTML = Game.ObjectsById[GrimboCookie.getConfig('comboSlider')].name;}, 0, 17, 1, 'Buildings eligibility for Grimoire combo.'));
				fragment.appendChild(GrimboCookie.Menu.toggleButton('grimoireRefill','Refill Click Frenzy','Casts spells until Click Frenzy is ready for combo.'));
				fragment.appendChild(GrimboCookie.Menu.toggleButton('autoMarket','Auto Market','Buys low, sells high (needs >80%brokers).'));
				
				l('menu').childNodes[2].insertBefore(fragment, l('menu').childNodes[2].childNodes[l('menu').childNodes[2].childNodes.length - 1]);
			}
		},
	},
	ConfigDefaults: { // The default value for the configs
		'autoGolden': false,
		'autoReindeer': false,
		'autoNews': false,
		'autoLump': false,
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
			a.onclick = () => GrimboCookie.toggleConfig(configParam);
			label.textContent = description;
			div.className = 'listing';
			div.appendChild(a);
			div.appendChild(label);
			return div;
		},
		slider: (configParam, leftText, callback, min, max, step, description) => {
			let div = document.createElement('div'), active = document.createElement('div'), left = document.createElement('div'), right = document.createElement('div'), input = document.createElement('input'), label = document.createElement('label');
			left.style = 'float:left';
			left.textContent = leftText;
			right.id = `GrimboCookie-${configParam}RightText`;
			right.style = 'float:right';
			right.textContent = Game.ObjectsById[GrimboCookie.getConfig(configParam)].name;
			input.id = `GrimboCookie-${configParam}`;
			input.class = 'slider';
			input.type = 'range';
			input.style = 'clear:both';
			input.min = min;
			input.max = max;
			input.step = step;
			input.value = GrimboCookie.getConfig(configParam);
			input.onchange = callback;
			input.oninput = callback;
			label.textContent = description;
			active.className = 'sliderBox';
			active.appendChild(left);
			active.appendChild(right);
			active.appendChild(input);
			div.className = 'listing';
			div.appendChild(active);
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
		return GrimboCookie.getConfig(configParam);
	},
	toggleConfig: (configParam) => {
		let val = GrimboCookie.setConfig(configParam, !GrimboCookie.getConfig(configParam));
		GrimboCookie.updateMenuView(configParam);
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
				if (Date.now()-Game.lumpT > Game.lumpRipeAge) Game.clickLump();
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
		if (Game.hasBuff('Frenzy') && Game.buffs['Frenzy'].time/Game.fps >= 30 && (Game.hasBuff('High-five') && Game.buffs['High-five'].time/Game.fps >= 30 && GrimboCookie.getConfig('comboSlider') >= 0 || Game.hasBuff('Congregation') && Game.buffs['Congregation'].time/Game.fps >= 30 && GrimboCookie.getConfig('comboSlider') >= 1 || Game.hasBuff('Luxuriant harvest') && Game.buffs['Luxuriant harvest'].time/Game.fps >= 30 && GrimboCookie.getConfig('comboSlider') >= 2 || Game.hasBuff('Ore vein') && Game.buffs['Ore vein'].time/Game.fps >= 30 && GrimboCookie.getConfig('comboSlider') >= 3 || Game.hasBuff('Oiled-up') && Game.buffs['Oiled-up'].time/Game.fps >= 30 && GrimboCookie.getConfig('comboSlider') >= 4 || Game.hasBuff('Juicy profits') && Game.buffs['Juicy profits'].time/Game.fps >= 30 && GrimboCookie.getConfig('comboSlider') >= 5 || Game.hasBuff('Fervent adoration') && Game.buffs['Fervent adoration'].time/Game.fps >= 30 && GrimboCookie.getConfig('comboSlider') >= 6 || Game.hasBuff('Manabloom') && Game.buffs['Manabloom'].time/Game.fps >= 30 && GrimboCookie.getConfig('comboSlider') >= 7 || Game.hasBuff('Delicious lifeforms') && Game.buffs['Delicious lifeforms'].time/Game.fps >= 30 && GrimboCookie.getConfig('comboSlider') >= 8 || Game.hasBuff('Breakthrough') && Game.buffs['Breakthrough'].time/Game.fps >= 30 && GrimboCookie.getConfig('comboSlider') >= 9 || Game.hasBuff('Righteous cataclysm') && Game.buffs['Righteous cataclysm'].time/Game.fps >= 30 && GrimboCookie.getConfig('comboSlider') >= 10 || Game.hasBuff('Golden ages') && Game.buffs['Golden ages'].time/Game.fps >= 30 && GrimboCookie.getConfig('comboSlider') >= 11 || Game.hasBuff('Extra cycles') && Game.buffs['Extra cycles'].time/Game.fps >= 30 && GrimboCookie.getConfig('comboSlider') >= 12 || Game.hasBuff('Solar flare') && Game.buffs['Solar flare'].time/Game.fps >= 30 && GrimboCookie.getConfig('comboSlider') >= 13 || Game.hasBuff('Winning streak') && Game.buffs['Winning streak'].time/Game.fps >= 30 && GrimboCookie.getConfig('comboSlider') >= 14 || Game.hasBuff('Macrocosm') && Game.buffs['Macrocosm'].time/Game.fps >= 30 && GrimboCookie.getConfig('comboSlider') >= 15 || Game.hasBuff('Refactoring') && Game.buffs['Refactoring'].time/Game.fps >= 30 && GrimboCookie.getConfig('comboSlider') >= 16 || Game.hasBuff('Cosmic nursery') && Game.buffs['Cosmic nursery'].time/Game.fps >= 30 && GrimboCookie.getConfig('comboSlider') >= 17)) {
			if (Gambler.indexOf('Click Frenzy') == 119 && M.magic >= M.getSpellCost(M.spellsById[6])) {
				GrimboCookie.toggleConfig('grimoireCombo');
				M.castSpell(M.spellsById[6]);
				Game.shimmers.forEach(function(shimmer) {
					if (shimmer.type == "golden") { shimmer.pop() }
				})
				setTimeout(function() {Game.Earn(1500*Game.computedMouseCps);}, 3000);
				setTimeout(function() {GrimboCookie.toggleConfig('grimoireCombo');}, 30000);
				GrimboCookie.setConfig('grimoireRefill', true);
				GrimboCookie.updateMenuView('grimoireRefill');
			} else if (FTHoF == "<td><span style=\"color:#4BB8F0;\">Click Frenzy</span><br/></td>" && M.magic >= M.getSpellCost(M.spellsById[1])) {
				GrimboCookie.toggleConfig('grimoireCombo');
				M.castSpell(M.spellsById[1]);
				Game.shimmers.forEach(function(shimmer) {
					if (shimmer.type == "golden") { shimmer.pop() }
				})
				setTimeout(function() {Game.Earn(1500*Game.computedMouseCps);}, 3000);
				setTimeout(function() {GrimboCookie.toggleConfig('grimoireCombo');}, 30000);
				GrimboCookie.setConfig('grimoireRefill', true);
				GrimboCookie.updateMenuView('grimoireRefill');
			}
		}
	},
	refill: () => {
		let M = Game.Objects["Wizard tower"].minigame;
		let Gambler = FortuneCookie.spellForecast(M.spellsById[6]);
		let FTHoF = FortuneCookie.FateChecker(M.spellsCastTotal, (Game.season == "valentines" || Game.season == "easter") ? 1 : 0, M.getFailChance(M.spellsById[1]), false);
		if (M.magic == M.magicM){
			if (Gambler.indexOf('Free Sugar Lump') == 119 || Gambler.indexOf('Free Sugar Lump') == 117) {
				M.castSpell(M.spellsById[6]);
				Game.shimmers.forEach(function(shimmer) {
					if (shimmer.type == "golden") { shimmer.pop() }
				})
			} else if (FTHoF=="<td><span style=\"color:##DAA560;\">Free Sugar Lump</span><br/></td>") {
				M.castSpell(M.spellsById[1]);
				Game.shimmers.forEach(function(shimmer) {
					if (shimmer.type == "golden") { shimmer.pop() }
				})
			} else if (Gambler.indexOf('Click Frenzy') == 119 || FTHoF == "<td><span style=\"color:#4BB8F0;\">Click Frenzy</span><br/></td>") {
				GrimboCookie.toggleConfig('grimoireRefill');
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
		let Brokers = M.getMaxBrokers();
		if (M.brokers > Brokers * 0.8) {
			for (let i = 0; i < 16; i++) {
				let MaxStock = M.getGoodMaxStock(M.goodsById[i]);
				let RestVal = M.getRestingVal(i);
				if (M.goodsById[i].val < RestVal / 2 && M.goodsById[i].stock < MaxStock / 2) {
					M.buyGood(i,10000);
				}
				else if (M.goodsById[i].val > RestVal && M.goodsById[i].stock >= MaxStock / 2) {
					M.sellGood(i,10000);
				}
			}
		}
	},
};
if (typeof GrimboCookieInit === 'undefined' || GrimboCookie) GrimboCookie.Init();
