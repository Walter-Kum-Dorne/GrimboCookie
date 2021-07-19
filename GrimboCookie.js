if(GrimboCookie === undefined) var GrimboCookie = {};
GrimboCookie.name = 'Grimoire Combo Cookies';
GrimboCookie.version = '1.0';
GrimboCookie.GameVersion = '2.031';

if(!Game.mods["CCSE"]) Game.LoadMod('https://klattmose.github.io/CookieClicker/CCSE.js');
if(!Game.mods["Fortune Cookie"]) Game.LoadMod('https://klattmose.github.io/CookieClicker/FortuneCookie.js');
if(!Game.mods["CookieMonster"]) Game.LoadMod('https://cookiemonsterteam.github.io/CookieMonster/dist/CookieMonster.js');

GrimboCookie.launch = function() {
	
	function Shimmers() {
		
		if (Game.shimmers[0]) {
			Game.shimmers[0].pop()
		}
	}
	
	function Combo() {
		
		var M = Game.Objects["Wizard tower"].minigame;
		var Gambler = FortuneCookie.spellForecast(M.spellsById[6]);
		var FTHoF = FortuneCookie.FateChecker(M.spellsCastTotal, (Game.season == "valentines" || Game.season == "easter") ? 1 : 0, M.getFailChance(M.spellsById[1]), false);
		
		if (Game.buffs['Frenzy'].time/Game.fps >= 30 && (Game.buffs['High-five'].time/Game.fps >= 30 || Game.buffs['Congregation'].time/Game.fps >= 30 || Game.buffs['Luxuriant harvest'].time/Game.fps >= 30 || Game.buffs['Ore vein'].time/Game.fps >= 30 || Game.buffs['Oiled-up'].time/Game.fps >= 30 || Game.buffs['Juicy profits'].time/Game.fps >= 30 || Game.buffs['Fervent adoration'].time/Game.fps >= 30)) {
			if Gambler.indexOf('Click Frenzy') == 119) {
				clearInterval(LoopCombo)
				M.castSpell(M.spellsById[6]);
				Game.shimmers[0].pop();
				Game.Earn(1500*Game.computedMouseCps);
				setTimeout("StartCombo()",30000);
			} else if (FTHoF == "<td><span style=\"color:#4BB8F0;\">Click Frenzy</span><br/></td>") {
				clearInterval(LoopCombo)
				M.castSpell(M.spellsById[1]);
				Game.shimmers[0].pop();
				Game.Earn(1500*Game.computedMouseCps);
				setTimeout("StartCombo()",30000);
			}
		}
	}
	
	function Refill() {
	
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
			} else if (Gambler.indexOf('Click Frenzy') != 119 && FTHoF != "<td><span style=\"color:#4BB8F0;\">Click Frenzy</span><br/></td>") {
				if (Gambler.indexOf('Spontaneous Edifice (Nothing)') == 95 || Gambler.indexOf('Resurrect Abomination') == 95 || Gambler.indexOf('Resurrect Abomination') == 93) {
					M.castSpell(M.spellsById[6]);
				} else if (Game.buffs == {} && (Gambler.indexOf('Stretch Time') == 95 || Gambler.indexOf('Stretch Time') == 93)) {
					M.castSpell(M.spellsById[6]);
				} else if (Gambler.indexOf('Haggler') == 95 || Gambler.indexOf('Haggler') == 93){
					M.castSpell(M.spellsById[6]);
				} else {
					M.castSpell(M.spellsById[4]);
				}
			}
		}
	}
	
	var LoopS = setInterval("Shimmers()", 500);
	var LoopR = setInterval("Refill()", 1000);
	
	function StartCombo() {
		
		var LoopCombo = setInterval("Combo()", 3000);
	}
	
	StartCombo()
}

if (Game.mods["Fortune Cookie"]) GrimboCookie.launch();
