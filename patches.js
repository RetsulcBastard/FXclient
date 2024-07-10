import assets from './assets.js';
export default ({ replace, replaceOne, replaceRawCode, dictionary, matchOne, matchRawCode, escapeRegExp }) => {

    // Constants for easy usage of otherwise long variable access expressions
    const dict = dictionary;
    const playerId = `${dict.game}.${dict.playerId}`;
    const rawPlayerNames = `${dict.playerData}.${dict.rawPlayerNames}`;
    const gIsSingleplayer = `${dict.game}.${dict.gIsSingleplayer}`;

    // Replace assets
    replaceOne(/(\(4,"crown",4,")[^"]+"\),/g, "$1" + assets.crownIcon + "\"),");
    replaceOne(/(\(6,"territorial\.io",6,")[^"]+"\),/g, "$1" + assets.fxClientLogo + "\"),");
    replaceOne(/(\(22,"logo",8,")[^"]+"\)/g, "$1" + assets.smallLogo + "\")");

    // Add FX Client version info to the game version window
    replaceRawCode(`ar.oa(4,1,new s8("ℹ️ "+Translations.txt[84],gameVersion+"<br><a href='"+ah.aC5+"' target='_blank'>"+ah.aC5+"</a>",`,
        `ar.oa(4,1,new s8("ℹ️ "+Translations.txt[84],gameVersion+"<br><a href='"+ah.aC5+"' target='_blank'>"+ah.aC5+"</a>"
+ "<br><br><b>" + "FX Client v" + fx_version + " " + fx_update + "<br><a href='https://discord.gg/dyxcwdNKwK' target='_blank'>FX Client Discord server</a>"
+ "<br><a href='https://github.com/fxclient/FXclient' target='_blank'>Github repository</a></b>",`);

    // Max size for custom maps: from 4096x4096 to 8192x8192
    // TODO: test this; it might cause issues with new boat mechanics?

    { // Add Troop Density and Maximum Troops in side panel
        const { valuesArray } = replaceRawCode(`,labels[5]=aV.nU[76],labels[6]=aV.nU[77],labels[7]=aV.nU[78],a0Z=game.tn-eT(game.tn,100),(valuesArray=new Array(labels.length))[0]=game.io?`,
            `,labels[5]=aV.nU[76],labels[6]=aV.nU[77],labels[7]=aV.nU[78],
		labels.push("Max Troops", "Density"), // add labels
		a0Z=game.tn-eT(game.tn,100),(valuesArray=new Array(labels.length))[0]=game.io?`);
        replaceOne(new RegExp(/(:(?<valueIndex>\w+)<7\?\w+\.\w+\.\w+\(valuesArray\[\2\]\)):(\w+\.\w+\(valuesArray\[7\]\))}/
            .source.replace(/valuesArray/g, valuesArray), "g"),
            '$1 : $<valueIndex> === 7 ? $3 '
            + `: $<valueIndex> === 8 ? utils.getMaxTroops(${dict.playerData}.${dict.playerTerritories}, ${playerId}) `
            + `: utils.getDensity(${playerId}) }`);
        // increase the size of the side panel by 25% to make the text easier to read
        replaceOne(/(this\.\w+=Math\.floor\(\(\w+\.\w+\.\w+\(\)\?\.1646:\.126\))\*(\w+\.\w+\),)/g, "$1 * 1.25 * $2");
    }

    // Increment win counter on wins
    replaceRawCode(`=function(sE){o.ha(sE,2),b.h9<100?xD(0,aZ.tG(4,[a8.jx[sE]]),3,sE,ad.gN,ad.kl,-1,!0):xD(0,aZ.tG(12,[a8.jx[sE]]),3,sE,ad.gN,ad.kl,-1,!0),`,
        `=function(sE){
		if (${playerId} === sE && !${gIsSingleplayer})
			wins_counter++, window.localStorage.setItem("fx_winCount", wins_counter),
			xD(0,"Your Win Count is now " + wins_counter,3,sE,ad.gN,ad.kl,-1,!0);
		o.ha(sE,2),b.h9<100?xD(0,aZ.tG(4,[a8.jx[sE]]),3,sE,ad.gN,ad.kl,-1,!0):xD(0,aZ.tG(12,[a8.jx[sE]]),3,sE,ad.gN,ad.kl,-1,!0),`);


    { // Add settings button and win count
        // add settings button
        replaceRawCode(`,new nQ("⚙️<br>Menu",function(){aD6(3)},aa.ks),new nQ("",function(){at.d5(12)},aa.kg,!1)]`,
            `,new nQ("⚙️<br>Menu",function(){aD6(3)},aa.ks),new nQ("",function(){at.d5(12)},aa.kg,!1),
            new nQ("FX Client settings", function() { WindowManager.openWindow("settings"); }, "rgba(0, 0, 20, 0.5")]`)
        // set settings button position
        replaceRawCode(`aZ.g5.vO(aD3[3].button,x+a0S+gap,a3X+h+gap,a0S,h);`,
            `aZ.g5.vO(aD3[3].button,x+a0S+gap,a3X+h+gap,a0S,h); aZ.g5.vO(aD3[5].button, x, a3X + h * 2 + gap * 2, a0S * 2 + gap, h / 3);`);
        // render win count
        replaceRawCode(`if(_y.a4l(),_r.gI(),_m.gI(),aw.gI(),ay.gI(),a0.g8()){ctx.imageSmoothingEnabled=!1;var iQ=a0.a4o("territorial.io"),kL=.84*aD4.gA/iQ.width;`,
            `if(_y.a4l(),_r.gI(),_m.gI(),aw.gI(),ay.gI(),a0.g8()){
            if (settings.displayWinCounter) {
                const size = Math.floor(aD4.gA * 0.03);
                ctx.font = ${dict.fontGeneratorFunction}(1, size);
                ctx.fillStyle = "#ffffff";
                const text = "Win count: " + wins_counter;
                const textLength = ctx.measureText(text).width;
                ctx.textAlign = "left";
                ctx.textBaseline = "middle";
                ctx.fillText(text, ctx.canvas.width - textLength - size / 2, size);
            };
            ctx.imageSmoothingEnabled=!1;var iQ=a0.a4o("territorial.io"),kL=.84*aD4.gA/iQ.width;`)
        /*// render gear icon and win count
        replaceRawCode(`,fy=aV.nU[80],fontSize=.65*height,canvas.font=aY.g0.g1(1,fontSize),canvas.fillStyle="rgba("+gR+","+tD+","+hj+",0.6)",canvas.fillRect(x,y,width,height),`,
            `,fy=aV.nU[80],fontSize=.65*height,
canvas.imageSmoothingEnabled = true,
canvas.drawImage(settingsGearIcon, x - width / 2, y, height, height),
canvas.imageSmoothingEnabled = false,
(settings.displayWinCounter && (
	canvas.font = aY.g0.g1(1, Math.floor(height * 0.4)),
	canvas.fillStyle = "#ffffff",
	canvas.fillText("Win count: " + wins_counter, Math.floor(x + width / 2), Math.floor((y + height / 2) * 2))
)),
canvas.font=aY.g0.g1(1,fontSize),canvas.fillStyle="rgba("+gR+","+tD+","+hj+",0.6)",canvas.fillRect(x,y,width,height),`);

        // handle settings button click
        replaceRawCode(`(q6=Math.floor((b7.cv.fv()?.145:.09)*aK.fw),gap=Math.floor(.065*(b7.cv.fv()?.53:.36)*aK.fw),gap=aK.g5-q6-gap,jd=b0.gap,q6=Math.floor(.35*q6),gap<=mouseX&&mouseY<jd+q6&&ar.v2(1))`,
            `(q6=Math.floor((b7.cv.fv()?.145:.09)*aK.fw),gap=Math.floor(.065*(b7.cv.fv()?.53:.36)*aK.fw),gap=aK.g5-q6-gap,jd=b0.gap,q6=Math.floor(.35*q6),
(gap <= mouseX && mouseY < jd + q6 && (ar.v2(1), true)) || (mouseX >= gap - q6 / 0.7 && mouseY < jd + q6 && WindowManager.openWindow("settings"))
)`);*/
    }

    { // Keybinds
        // match required variables
        const { 0: match, groups: { attackBarObject, setRelative } } = matchOne(/:"."===(\w+\.key)\?(?<attackBarObject>\w+)\.(?<setRelative>\w+)\(31\/32\):"."===\1\?\2\.\3\(32\/31\):/g,);
        // create a setAbsolutePercentage function on the attack percentage bar object,
        // and also register the keybind handler functions
        replaceOne(/}(function \w+\((\w+)\){return!\(1<\2&&1===(?<attackPercentage>\w+)\|\|\(1<\2&&\2\*\3-\3<1\/1024\?\2=\(\3\+1\/1024\)\/\3:\2<1)/g,
            "} this.setAbsolutePercentage = function(newPercentage) { $<attackPercentage> = newPercentage; }; "
            + "keybindFunctions.setAbsolute = this.setAbsolutePercentage; "
            + `keybindFunctions.setRelative = (arg1) => ${attackBarObject}.${setRelative}(arg1); $1`);
        // insert keybind handling code into the keyDown handler function
        replaceOne(new RegExp(/(function \w+\((?<event>\w+)\){)([^}]+matched)/g.source.replace(/matched/g, escapeRegExp(match)), "g"),
            "$1 if (keybindHandler($<event>.key)) return; $3");
    }

    // Set the default font to Trebuchet MS
    replace(/sans-serif"/g, 'Trebuchet MS"');

    // Realistic bot names setting
    // matches c4[i] = c4[i].replace(a6U[dx], a6V[dx])
    replaceOne(/(((\w+)\[\w+\])=\2\.replace\(\w+(\[\w+\]),\w+\4\))/g, "$1; if (settings.realisticNames) $3 = realisticNames;")

    // Hide all links in main menu depending on settings
    //replaceOne(/(this\.\w+=function\(\){)((\w+\.\w+)\[2\]=\3\[3\]=\3\[4\]=(?<linksHidden>!this\.\w+\.\w+),)/g,
    //"$1 if (settings.hideAllLinks) $3[0] = $3[1] = $<linksHidden>; else $3[0] = $3[1] = true; $2")

    // Make the main canvas context have an alpha channel if a custom background is being used
    replaceOne(/(document\.getElementById\("canvasA"\),\(\w+=\w+\.getContext\("2d",){alpha:!1}/g, "$1 {alpha: makeMainMenuTransparent}")
    // Clear canvas background if a custom background is being used
    replaceRawCode(`,this.qk=function(){var a4n,a4m;aq.pd?(a4m=aL.gA/aq.eE,a4n=aL.gF/aq.eF,canvas.setTransform(a4m=a4n<a4m?a4m:a4n,0,0,a4m,`,
        `,this.qk=function(){var a4n,a4m;
        if (makeMainMenuTransparent) canvas.clearRect(0,0,aL.gA,aL.gF);
        else aq.pd?(a4m=aL.gA/aq.eE,a4n=aL.gF/aq.eF,canvas.setTransform(a4m=a4n<a4m?a4m:a4n,0,0,a4m,`);

    // Track donations
    replaceOne(/(this\.\w+=function\((\w+),(\w+)\)\{)(\2===\w+\.\w+&&\(\w+\.\w+\((\w+\.\w+)\[0\],\5\[1\],\3\),this\.(\w+)\[12\]\+=\5\[1\],this\.\6\[16\]\+=\5\[0\]\),\3===\w+\.\w+&&\()/g,
        "$1 donationsTracker.logDonation($2, $3, $5[0]); $4")

    // Display donations for a player when clicking on them in the leaderboard
    // and skip handling clicks when clicking on an empty space (see the isEmptySpace
    // variable in the modified leaderboard click handler from the leaderboard filter)
    // match , 0 !== dG[x]) && fq.hB(x, 800, false, 0),
    replaceOne(/,(0!==\w+\.\w+\[(\w+)\])(\)&&\w+\.\w+\(\2,800,!1,0\),)/g,
        `, ${dict.game}.${dict.gIsTeamGame} && donationsTracker.displayHistory($2, ${rawPlayerNames}, ${gIsSingleplayer}), $1 && !isEmptySpace $3`);

    // Reset donation history and leaderboard filter when a new game is started
    replaceOne(new RegExp(`,this\\.${dictionary.playerBalances}.fill\\(0\\),`, "g"), "$& donationsTracker.reset(), leaderboardFilter.reset(), ");

    { // Player list and leaderboard filter tabs
        // Draw player list button
        const uiOffset = dictionary.uiSizes + "." + dictionary.gap;
        const { groups: { drawFunction, topBarHeight } } = replaceOne(/(=1;function (?<drawFunction>\w+)\(\){[^}]+?(?<canvas>\w+)\.fillRect\(0,(?<topBarHeight>\w+),\w+,1\),(?:\3\.fillRect\([^()]+\),)+\3\.font=\w+,(\w+\.\w+)\.textBaseline\(\3,1\),\5\.textAlign\(\3,1\),\3\.fillText\(\w+\.\w+\[65\],Math\.floor\()(\w+)\/2\),(Math\.floor\(\w+\+\w+\/2\)\));/g,
            "$1($6 + $<topBarHeight> - 22) / 2), $7; playerList.drawButton($<canvas>, 12, 12, $<topBarHeight> - 22);");
        const buttonBoundsCheck = `utils.isPointInRectangle($<x>, $<y>, ${uiOffset} + 12, ${uiOffset} + 12, ${topBarHeight} - 22, ${topBarHeight} - 22)`
        // Handle player list button and leaderboard tabs mouseDown
        // and create a function for scrolling the leaderboard to the top
        replaceOne(/(this\.\w+=function\((?<x>\w+),(?<y>\w+)\){return!!\w+\(\2,\3\))&&(\(\w+=\w+\.\w+,[^}]+),!0\)/g,
            `leaderboardFilter.scrollToTop = function(){position = 0;}, $1 && ((${buttonBoundsCheck} && playerList.display(${rawPlayerNames}), true)
		&& !($<y> - ${uiOffset} > leaderboardFilter.verticalClickThreshold && leaderboardFilter.handleMouseDown($<x> - ${uiOffset})) && $4),!0)`);
        // Handle player list button and leaderboard tabs hover
        // and create a function for repainting the leaderboard
        replaceOne(/(this\.\w+=function\((?<x>\w+),(?<y>\w+)\){)(var \w+,\w+=\w+\(\3\);return \w+\?\(\w+=(\w+),\(\5=\w+\(0,\5\+=(?:[^}]+,(?<setRepaintNeeded>\w+\.\w+=!0)){2})/g,
            `leaderboardFilter.repaintLeaderboard = function() { ${drawFunction}(), $<setRepaintNeeded>; },
	$1 if (${buttonBoundsCheck}) { playerList.hoveringOverButton === false && (playerList.hoveringOverButton = true, ${drawFunction}(), $<setRepaintNeeded>); }
	else { playerList.hoveringOverButton === true && (playerList.hoveringOverButton = false, ${drawFunction}(), $<setRepaintNeeded>); }
	if (leaderboardFilter.setHovering(
		utils.isPointInRectangle($<x>, $<y>, ${uiOffset}, ${uiOffset} + leaderboardFilter.verticalClickThreshold, leaderboardFilter.windowWidth, leaderboardFilter.tabBarOffset), $<x> - ${uiOffset}
	)) return; $4`);
    }

    { // Display density of other players
        const r = matchRawCode(`bD.dO.data[7].value?a9W(i,jm,jk,jl,ctx):a9V(ctx,i,jm,jk,jl,a9S)))`);
        const settingsSwitchNameAndBalance = `${r.bD}.${r.dO}.${r.data}[7].${r.value}`;
        //console.log(settingsSwitchNameAndBalance);
        // Applies when the "Reverse Name/Balance" setting is off
        replaceRawCode("function a9V(ctx,i,fontSize,x,y,a9S){i=ac.jv.formatNumber(playerData.playerBalances[i]);a9S>>1&1?(ctx.lineWidth=.05*fontSize,ctx.strokeStyle=a9U(fontSize,a9S%2),ctx.strokeText(i,x,y)):(1<a9S&&(ctx.lineWidth=.12*fontSize,ctx.strokeStyle=a9U(fontSize,a9S),ctx.strokeText(i,x,y)),ctx.fillText(i,x,y))}",
            `function a9V(ctx,i,fontSize,x,y,a9S){
		var ___id = i;
		i=ac.jv.formatNumber(playerData.playerBalances[i]);a9S>>1&1?(ctx.lineWidth=.05*fontSize,ctx.strokeStyle=a9U(fontSize,a9S%2),ctx.strokeText(i,x,y)):(1<a9S&&(ctx.lineWidth=.12*fontSize,ctx.strokeStyle=a9U(fontSize,a9S),ctx.strokeText(i,x,y)),ctx.fillText(i,x,y));
		${settingsSwitchNameAndBalance} || settings.showPlayerDensity && (settings.coloredDensity && (ctx.fillStyle = utils.textStyleBasedOnDensity(___id)), ctx.fillText(utils.getDensity(___id), x, y + fontSize))}`)
        // Applies when the "Reverse Name/Balance" setting is on (default)
        replaceOne(/(function \w+\((\w+),(?<fontSize>\w+),(?<x>\w+),(?<y>\w+),(?<canvas>\w+)\){)(\6\.fillText\((?<playerData>\w+)\.(?<playerNames>\w+)\[\2\],\4,\5\)),(\2<(?<game>\w+)\.(?<gHumans>\w+)&&2!==\8\.(?<playerStates>\w+)\[[^}]+)}/g,
            `$1 var ___id = $2; $7, $10; ${settingsSwitchNameAndBalance} && settings.showPlayerDensity && (settings.coloredDensity && ($<canvas>.fillStyle = utils.textStyleBasedOnDensity(___id)), $<canvas>.fillText(utils.getDensity(___id), $<x>, $<y> + $<fontSize>)); }`);
    }

    { // Leaderboard filter
        // for the leaderboard draw function:
        replaceRawCode("function drawFunction(){a0A.clearRect(0,0,a04,y9),a0A.fillStyle=aZ.lE,a0A.fillRect(0,0,a04,a0F),a0A.fillStyle=aZ.kZ,a0A.fillRect(0,a0F,a04,y9-a0F),leaderboardPositionsById[game.playerId]>=position&&a0Z(leaderboardPositionsById[game.playerId]-position,aZ.kw),0!==leaderboardPositionsById[game.playerId]&&0===position&&a0Z(0,aZ.lJ),-1!==a0P&&a0Z(a0P,aZ.kd),a0A.fillStyle=aZ.gF,a0A.fillRect(0,a0F,a04,1),a0A.fillRect(0,0,a04,b0.ur),a0A.fillRect(0,0,b0.ur,y9),a0A.fillRect(a04-b0.ur,0,b0.ur,y9),a0A.fillRect(0,y9-b0.ur,a04,b0.ur),",

            `var leaderboardHasChanged = true;
		this.playerPos = game.playerId;
		leaderboardFilter.setUpdateFlag = () => leaderboardHasChanged = true;
		function updateFilteredLb() {
			if (!leaderboardHasChanged) return;
			leaderboardFilter.filteredLeaderboard = leaderboardFilter.playersToInclude
				.map(id => leaderboardPositionsById[id]).sort((a, b) => a - b);
			leaderboardHasChanged = false;
			this.playerPos = leaderboardFilter.filteredLeaderboard.indexOf(leaderboardPositionsById[game.playerId]);
		}
		function drawFunction() {
		a0A.clearRect(0, 0, a04, y9),
		a0A.fillStyle = aZ.lE,
		a0A.fillRect(0, 0, a04, a0F),
		a0A.fillStyle = aZ.kZ,
		a0A.fillRect(0, a0F, a04, y9 - a0F);
		if (leaderboardFilter.enabled) updateFilteredLb();
		var playerPos = (leaderboardFilter.enabled
			? this.playerPos
			: leaderboardPositionsById[game.playerId]
		);
		if (leaderboardFilter.hoveringOverTabs) a0P = -1;
		if (leaderboardFilter.enabled && a0P >= leaderboardFilter.filteredLeaderboard.length) a0P = -1;
		playerPos >= position && a0Z(playerPos - position, aZ.kw),
		0 !== leaderboardPositionsById[game.playerId] && 0 === position && a0Z(0, aZ.lJ),
		-1 !== a0P && a0Z(a0P, aZ.kd),
		a0A.fillStyle = aZ.kZ,
		//console.log("drawing", a0P),
		a0A.clearRect(0, y9 - leaderboardFilter.tabBarOffset, a04, leaderboardFilter.tabBarOffset);
		a0A.fillRect(0, y9 - leaderboardFilter.tabBarOffset, a04, leaderboardFilter.tabBarOffset);
		a0A.fillStyle = aZ.gF,
		a0A.fillRect(0, a0F, a04, 1),
		a0A.fillRect(0, y9 - leaderboardFilter.tabBarOffset, a04, 1),
		leaderboardFilter.drawTabs(a0A, a04, y9 - leaderboardFilter.tabBarOffset, aZ.kw),
		a0A.fillRect(0, 0, a04, b0.ur),
		a0A.fillRect(0, 0, b0.ur, y9),
		a0A.fillRect(a04 - b0.ur, 0, b0.ur, y9),
		a0A.fillRect(0, y9 - b0.ur, a04, b0.ur),`)
        replaceRawCode("var hZ,eh=leaderboardPositionsById[game.playerId]<position+windowHeight-1?1:2;for(a0A.font=a07,aY.g0.textAlign(a0A,0),hZ=windowHeight-eh;0<=hZ;hZ--)a0a(leaderboardArray[hZ+position]),a0b(hZ,hZ+position,leaderboardArray[hZ+position]);for(aY.g0.textAlign(a0A,2),hZ=windowHeight-eh;0<=hZ;hZ--)a0a(leaderboardArray[hZ+position]),a0c(hZ,leaderboardArray[hZ+position]);",
            `var hZ, eh = playerPos < position + windowHeight - 1 ? 1 : 2;
		
		if (leaderboardFilter.enabled) {
			let result = leaderboardFilter.filteredLeaderboard;
			if (position !== 0 && position >= result.length - windowHeight)
				position = (result.length > windowHeight ? result.length : windowHeight) - windowHeight;
			//if (position >= result.length) position = result.length - 1;
			for (a0A.font = a07, aY.g0.textAlign(a0A, 0), hZ = windowHeight - eh; 0 <= hZ; hZ--) {
				const pos = result[hZ + position];
				if (pos !== undefined)
					a0a(leaderboardArray[pos]), a0b(hZ, pos, leaderboardArray[pos]);
			}
			for (aY.g0.textAlign(a0A, 2), hZ = windowHeight - eh; 0 <= hZ; hZ--) {
				const pos = result[hZ + position];
				if (pos !== undefined)
					a0a(leaderboardArray[pos]), a0c(hZ, leaderboardArray[pos]);
			}
		} else {
			for (a0A.font = a07, aY.g0.textAlign(a0A, 0), hZ = windowHeight - eh; 0 <= hZ; hZ--)
				a0a(leaderboardArray[hZ + position]), a0b(hZ, hZ + position, leaderboardArray[hZ + position]);
			for (aY.g0.textAlign(a0A, 2), hZ = windowHeight - eh; 0 <= hZ; hZ--)
				a0a(leaderboardArray[hZ + position]), a0c(hZ, leaderboardArray[hZ + position]);
		}`)
        // in the leaderboard resize handler: make space for the tab buttons at the bottom of the leaderboard
        replaceRawCode(",a09.height=y9,a09_ctx=a09.getContext(\"2d\",{alpha:!0}),a0D=.025*a04,a06=.16*a04,a0E=0*a04,a0F=Math.floor(.45*a0D+a06),a0G=(y9-a06-2*a0D-a0E)/a08,a05=aY.g0.g1(1,Math.floor(.55*a06)),",
            `,a09.height=y9,a09_ctx=a09.getContext("2d",{alpha:!0}),a0D=.025*a04,a06=.16*a04,a0E=0*a04,a0F=Math.floor(.45*a0D+a06),a0G=(y9-a06-2*a0D-a0E)/a08,
		a09.height = y9 += a0G, leaderboardFilter.tabBarOffset = Math.floor(a0G * 1.3), leaderboardFilter.verticalClickThreshold = y9 - leaderboardFilter.tabBarOffset, leaderboardFilter.windowWidth = a04,
		a05=aY.g0.g1(1,Math.floor(.55*a06)),`)
        // Set the leaderboardHasChanged flag on leaderboard updates
        replaceRawCode("for(var eM=a0q-1;0<=eM;eM--)a14[eM]=jR[eM],a15[eM]=a8.f8[jR[eM]];a14[a0q]=a0l[b.ed],a15[a0q]=a8.f8[b.ed]",
            `for(var eM=a0q-1;0<=eM;eM--)a14[eM]=jR[eM],a15[eM]=a8.f8[jR[eM]];a14[a0q]=a0l[b.ed],a15[a0q]=a8.f8[b.ed]; leaderboardHasChanged = true;`);
        // handle clicking on a player in the leaderboard
        replaceRawCode("var a0p=a0q(fJ);return ag.tQ()&&-1!==a0P&&(a0P=-1,a0Y(),b3.d1=!0),b3.dY-a0Q<350&&a0T===a0p&&-1!==(a0p=(a0p=yr(-1,a0p,windowHeight))!==windowHeight&&vU(x,y)?a0p:-1)&&(x=leaderboardArray[a0p+position],a0p===windowHeight-1&&leaderboardPositionsById[game.playerId]>=position+windowHeight-1&&(x=game.playerId),",
            `var a0p = a0q(fJ);
		var isEmptySpace = false;
		return ag.tQ() && -1 !== a0P && (a0P = -1, a0Y(), b3.d1 = !0), b3.dY - a0Q < 350 && a0T === a0p && -1 !== (a0p = (a0p = yr(-1, a0p, windowHeight)) !== windowHeight && vU(x, y) ? a0p : -1) && (x = (leaderboardFilter.enabled ? (updateFilteredLb(), leaderboardArray[leaderboardFilter.filteredLeaderboard[a0p + position] ?? (isEmptySpace = true, leaderboardPositionsById[game.playerId])]) : leaderboardArray[a0p + position]), a0p === windowHeight - 1 && (leaderboardFilter.enabled ? this.playerPos : leaderboardPositionsById[game.playerId]) >=
			position + windowHeight - 1 && (x = game.playerId), !isEmptySpace && `);
        // Get clan parsing function
        replaceRawCode(`this.uI=function(username){var uK,uJ=username.indexOf("[");return!(uJ<0)&&1<(uK=username.indexOf("]"))-uJ&&uK-uJ<=8?username.substring(uJ+1,uK).toUpperCase().trim():null},`,
            `this.uI=function(username){var uK,uJ=username.indexOf("[");return!(uJ<0)&&1<(uK=username.indexOf("]"))-uJ&&uK-uJ<=8?username.substring(uJ+1,uK).toUpperCase().trim():null}, leaderboardFilter.parseClanFromPlayerName = this.uI;`);
    }

    { // Hovering tooltip
        replaceRawCode("this.click=function(gG,gH,uH){var fd=an.fe(gG),ff=an.fg(gH),fh=an.fi(fd,ff),fj=an.fk(fh);return!(!an.fl(fd,ff)||(fd=(bB.d3.isUIZoomEnabled()?.025:.0144)*aO.g4,ff=performance.now(),Math.abs(gG-wK)>fd)||Math.abs(gH-wL)>fd||dg+500<ff)&&(dg=ff,uH?(function(gG,gH,fj){a3.ek(fj)||-1===(gG=ao.fr.wq(gG,gH))?l.wp(fj):l.wr(gG)}(gG,gH,fj),",
            `hoveringTooltip.display = function(mouseX, mouseY) {
			var coordX = an.fe(mouseX), coordY = an.fg(mouseY),
				coord = an.fi(coordX, coordY), point = an.fk(coord);
			if (coordX < 0 || coordY < 0) return;
			(function(gG, gH, fj) {
				a3.ek(fj) || -1 === (gG = ao.fr.wq(gG, gH)) ? l.wp(fj) : l.wr(gG)
			}(mouseX, mouseY, point))
		}
		this.click = function(gG, gH, uH) {
			var fd = an.fe(gG),
				ff = an.fg(gH),
				fh = an.fi(fd, ff),
				fj = an.fk(fh);
			return !(!an.fl(fd, ff) || (fd = (bB.d3.isUIZoomEnabled() ? .025 : .0144) * aO.g4, ff = performance.now(), Math.abs(gG - wK) > fd) || Math.abs(gH - wL) > fd || dg + 500 < ff) && (dg = ff, uH ? (function(gG, gH, fj) {
				a3.ek(fj) || -1 === (gG = ao.fr.wq(gG, gH)) ? l.wp(fj) : l.wr(gG)
			}(gG, gH, fj),`)
        replaceRawCode("aK.nH=(window.devicePixelRatio||1)*aEr,",
            `aK.nH = (window.devicePixelRatio || 1) * aEr, hoveringTooltip.canvasPixelScale = aK.nH,`)
    }

    // Invalid hostname detection avoidance
    replaceRawCode(`,hostnameIsValid=0<=window.location.hostname.toLowerCase().indexOf("territorial.io"),`,
        `,hostnameIsValid=0<=window.location.hostname.toLowerCase().indexOf("territorial.io") || Math.random() >= 0.8,`)

    // Disable built-in Territorial.io error reporting
    replaceOne(/window\.addEventListener\("error",function (\w+)\((\w+)\){/g,
    '$& window.removeEventListener("error", $1); return alert("Error:\\n" + $2.filename + " " + $2.lineno + " " + $2.colno + " " + $2.message);');

    console.log('Removing ads...');
    // Remove ads
    replace('//api.adinplay.com/libs/aiptag/pub/TRT/territorial.io/tag.min.js', '');
}