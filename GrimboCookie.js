if (GrimboCookie === undefined) {var GrimboCookie = {};}
GrimboCookie.name = 'Grimoire Combo Cookies';
GrimboCookie.version = '1.0';
GrimboCookie.GameVersion = '2.031';
Game.registerMod(GrimboCookie.name, GrimboCookie);

if (!Game.mods["Fortune Cookie"]) Game.LoadMod('https://klattmose.github.io/CookieClicker/FortuneCookie.js');

var LoopShimmers;
var LoopCombo;
var LoopRefill;

GrimboCookie.Shimmers = function() {
	
	if (Game.shimmers[0]) {
		Game.shimmers[0].pop()
	}
}

GrimboCookie.Combo = function() {
	
	var M = Game.Objects["Wizard tower"].minigame;
	var Gambler = FortuneCookie.spellForecast(M.spellsById[6]);
	var FTHoF = FortuneCookie.FateChecker(M.spellsCastTotal, (Game.season == "valentines" || Game.season == "easter") ? 1 : 0, M.getFailChance(M.spellsById[1]), false);
	
	if (Game.hasBuff('Frenzy') && Game.buffs['Frenzy'].time/Game.fps >= 30 && (Game.hasBuff('High-five') && Game.buffs['High-five'].time/Game.fps >= 30 || Game.hasBuff('Congregation') && Game.buffs['Congregation'].time/Game.fps >= 30 || Game.hasBuff('Luxuriant harvest') && Game.buffs['Luxuriant harvest'].time/Game.fps >= 30 || Game.hasBuff('Ore vein') && Game.buffs['Ore vein'].time/Game.fps >= 30 || Game.hasBuff('Oiled-up') && Game.buffs['Oiled-up'].time/Game.fps >= 30 || Game.hasBuff('Juicy profits') && Game.buffs['Juicy profits'].time/Game.fps >= 30 || Game.hasBuff('Fervent adoration') && Game.buffs['Fervent adoration'].time/Game.fps >= 30)) {
		if (Gambler.indexOf('Click Frenzy') == 119) {
			clearInterval(LoopCombo);
			M.castSpell(M.spellsById[6]);
			Game.shimmers[0].pop();
			setTimeout(GrimboCookie.Gain, 3000);
			setTimeout(GrimboCookie.StartCombo, 30000);
			var LoopRefill = setInterval(GrimboCookie.Refill, 1000);
		} else if (FTHoF == "<td><span style=\"color:#4BB8F0;\">Click Frenzy</span><br/></td>") {
			clearInterval(LoopCombo);
			M.castSpell(M.spellsById[1]);
			Game.shimmers[0].pop();
			setTimeout(GrimboCookie.Gain, 3000);
			setTimeout(GrimboCookie.StartCombo, 30000);
			var LoopRefill = setInterval(GrimboCookie.Refill, 1000);
		}
	}
}

GrimboCookie.Gain = function() {
	
	Game.Earn(1500*Game.computedMouseCps);
}

GrimboCookie.Refill = function() {

	var M = Game.Objects["Wizard tower"].minigame;
	var Gambler = FortuneCookie.spellForecast(M.spellsById[6]);
	var FTHoF = FortuneCookie.FateChecker(M.spellsCastTotal, (Game.season == "valentines" || Game.season == "easter") ? 1 : 0, M.getFailChance(M.spellsById[1]), false);

	if (M.magic == M.magicM){
		if (Gambler.indexOf('Free Sugar Lump') == 119 || Gambler.indexOf('Free Sugar Lump') == 117) {
			M.castSpell(M.spellsById[6]);
			Game.shimmers[0].pop();
		} else if (FTHoF=="<td><span style=\"color:##DAA560;\">Free Sugar Lump</span><br/></td>") {
			M.castSpell(M.spellsById[1]);
			Game.shimmers[0].pop();
		} else if (Gambler.indexOf('Click Frenzy') == 119 || FTHoF == "<td><span style=\"color:#4BB8F0;\">Click Frenzy</span><br/></td>") {
			clearInterval(LoopRefill);
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
}

GrimboCookie.StartCombo = function() {
	
	var LoopCombo = setInterval(GrimboCookie.Combo, 3000);
}

var LoopShimmers = setInterval(GrimboCookie.Shimmers, 500);
var LoopRefill = setInterval(GrimboCookie.Refill, 1000);
var LoopCombo = setInterval(GrimboCookie.Combo, 3000);
