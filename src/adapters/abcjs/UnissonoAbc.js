import { ElementoMusicalAbc } from "@abcjs/ElementoMusicalAbc.js";
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";
import { Nota } from "@domain/nota/Nota.js";
import { Unissono } from "@domain/nota/Unissono.js";
import { NotaAbc } from "@abcjs/NotaAbc.js";
import { PausaAbc } from "@abcjs/PausaAbc.js";
import { QuialteraAbc } from "@abcjs/QuialteraAbc.js";
import { TipoBarra } from "@domain/compasso/TipoBarra.js";
import { Compasso } from "@domain/compasso/Compasso.js";

export class UnissonoAbc extends ElementoMusicalAbc {
	/**
	 * Cria a string abcJs do unissono.
	 * @param unissono {Unissono}
	 * @return {string}
	 */
	static toAbc( unissono ) {
		let abc = "";
		const opt = unissono.options;

		// Em acordes, aplicamos apenas acidentes e altura individual (simplificação padrão ABC)
		// 0. ACORDES
		if (opt.acordes && opt.acordes.length > 0) {
			abc = opt.acordes.map( acorde => `"${acorde}"` ).join ( " " );
		}
		// 1. PREFIXOS (Decoradores e Ornamentos)
		if (opt.ghostNote) abc += "!style=x!";
		// Na exportação, usamos sempre a notação canônica primária
		if (opt.fermata) abc += "!fermata!";
		if (opt.fermataInvertida) abc += "!invertedfermata!";
		if (opt.arpeggio) abc += "!arpeggio!";
		if (opt.breath) abc += "!breath!";

		// Acentuação (Exclusiva)
		if (opt.marcato) abc += "!marcato!";
		else if (opt.acento) abc += "!accent!";

		// Articulações (Exclusiva)
		if (opt.staccatissimo) abc += "!staccatissimo!";
		else if (opt.staccato) abc += ".";
		else if (opt.tenuto) abc += "!tenuto!";

		// Ornamentos
		if (opt.trinado) abc += "!trill!";
		else if (opt.mordente) abc += "!lowermordent!"; // Padronizado para lowermordent
		else if (opt.upperMordent) abc += "!uppermordent!";

		if (opt.turn) abc += "!turn!";
		if (opt.roll) abc += "~";

		// Técnicas e Arcos
		if (opt.pizzicato) abc += "!+!";
		if (opt.snapPizzicato) abc += "!snap!";
		if (opt.downBow) abc += "!downbow!";
		if (opt.upBow) abc += "!upbow!";
		if (opt.openString) abc += "!open!";
		if (opt.thumb) abc += "!thumb!";

		// Dinâmicas
		if (opt.dinamicaSuave) {
			if ( opt.dinamicaSuave === 3 ) abc += "!ppp!";
			else if ( opt.dinamicaSuave === 2 ) abc += "!pp!";
			else if ( opt.dinamicaSuave === 1 ) abc += "!p!";
		}
		if (opt.dinamicaForte) {
			if ( opt.dinamicaForte === 3 ) abc += "!fff!";
			else if ( opt.dinamicaForte === 2 ) abc += "!ff!";
			else if ( opt.dinamicaForte === 1 ) abc += "!f!";
		}

		if (opt.dinamicaMeioForte) abc += "!mf!";

		// Expressão (Crescendo e Diminuendo)
		if (opt.crescendo) {
			if ( opt.crescendo === "inicio" ) abc += "!crescendo(!";
			else if ( opt.crescendo === "fim" ) abc += "!crescendo)!";
		}
		if (opt.diminuendo) {
			if ( opt.diminuendo === "inicio" ) abc += "!diminuendo(!";
			else if ( opt.diminuendo === "fim" ) abc += "!diminuendo)!";
		}

		// Grace Notes (Adornos)
		if (typeof this._toGraceNotes === "function") {
			abc += this._toGraceNotes( unissono );
		}

		abc += `[${unissono.notas.map(elemento => {
			if (elemento.constructor.name === "Pausa") { 
				return PausaAbc.toAbc( elemento );
			}
			if (elemento.constructor.name === "Nota") {
				return NotaAbc.toAbc( elemento );
			}
			if (elemento.constructor.name === "Unissono") {
				return UnissonoAbc.toAbc( elemento );
			}
			if (elemento.constructor.name === "Quialtera") {
				return QuialteraAbc.toAbc( elemento );
			}
		}).join('')}]`;


		// 3. SUFIXO DE DURAÇÃO
		if (typeof this.formatarDuracaoAbc === "function") {
			abc += this.formatarDuracaoAbc( unissono );
		}

		// Ligaduras (Prolongamento/Tie)
		if (opt.ligada || opt.hammerOn || opt.pullOff) {
			abc += "-";
		}
		return abc;
	}

	/**
	 * USAGE: Cria uma nova instância de Unissono a partir de uma string de notação ABC.
	 * @param {string} unissonoString - A string do unissono (ex: "Gm"![a' !ppp!A,]2-).
	 * @param {Object} contextOptions - Opções de contexto (L, M, K).
	 * @returns {Unissono} Uma nova instância da classe Unissono.
	 */
	static fromAbc(unissonoString, contextOptions) {
		let str = unissonoString.trim();

		// 1. SEPARAÇÃO DO PAYLOAD GLOBAL (O que vem antes do '[')
		const matchInicioColchete = str.match(/\[/);
		if (!matchInicioColchete) return null;

		const indiceCorte = matchInicioColchete.index;
		const payloadGlobalStr = str.substring(0, indiceCorte).trim();
		let restoUnissono = str.substring(indiceCorte);

		// Chamada para o novo formato do trataPayLoad (desestruturação)
		const { payloadString, optionsGerado } = this._trataPayLoad(payloadGlobalStr);

		let finalOptions = {
			...optionsGerado
		};

		// 2. EXTRAÇÃO DO CORPO E DURAÇÃO EXTERNA
		const regexEstrutura = /^\[([\s\S]+)\]([\d/]*)?(-)?$/;
		const matchEstrutura = restoUnissono.match(regexEstrutura);

		if (!matchEstrutura) return null;

		let conteudoInterno = matchEstrutura[1];
		const duracaoStr = matchEstrutura[2] || "";
		if (matchEstrutura[3]) finalOptions.ligada = true;

		const duracaoComum = this._calcularDuracaoAbcString(contextOptions, duracaoStr);
		const elements = [];

		// --- 3. LOOP DE ELEMENTOS (NOTAS INTERNAS) ---
		let strLoop = conteudoInterno;
		let payloadAcumulado = "";

		// Regexes de busca
		const reUnissono  = /^\[[^\]]+\][\d/]*\-?/;
		// 1. Quialtera com proporção (p:q:r)
		const reQuialteraComplexa = /^\([0-9]+:[0-9]+:[0-9]+[a-gA-GzxyZXY[=^_]\-?/;
		// 2. Quialtera simples (n ou apenas ()
		const reQuialteraSimples  = /^\([0-9]*[a-gA-GzxyZXY[=^_]\-?/;

		const rePausa     = /^[zxyZXY][\d/]*\-?/;
		const reNota      = /^[=^_]?[a-gA-G][,']*\-?/;

		while (strLoop.length > 0) {
			let matchElemento = null;
			let tipoEncontrado = null;

			if ((matchElemento = strLoop.match(reUnissono))) {
				tipoEncontrado = 'unissono';
			}
			// Testamos a quialtera complexa antes da simples
			else if ((matchElemento = strLoop.match(reQuialteraComplexa))) {
				tipoEncontrado = 'quialtera';
			}
			else if ((matchElemento = strLoop.match(reQuialteraSimples))) {
				tipoEncontrado = 'quialtera';
			}
			else if ((matchElemento = strLoop.match(rePausa))) {
				tipoEncontrado = 'pausa';
			} else if ((matchElemento = strLoop.match(reNota))) {
				tipoEncontrado = 'nota';
			}

			if (matchElemento) {
				const textoCorpo = matchElemento[0];
				const fullToken = payloadAcumulado + textoCorpo;

				switch (tipoEncontrado) {
					case 'unissono':
						elements.push(UnissonoAbc.fromAbc(fullToken, finalOptions));
						break;
					case 'quialtera':
						elements.push(QuialteraAbc.fromAbc(fullToken, finalOptions));
						break;
					case 'pausa':
						elements.push(PausaAbc.fromAbc(fullToken, finalOptions));
						break;
					case 'nota':
						elements.push(NotaAbc.fromAbc(fullToken, finalOptions));
						break;
				}

				payloadAcumulado = "";
				strLoop = strLoop.substring(textoCorpo.length);
			} else {
				payloadAcumulado += strLoop[0];
				strLoop = strLoop.substring(1);
			}
		}

		// 4. RETORNO DO OBJETO
		const unissono = new Unissono(elements, duracaoComum, finalOptions);
		unissono.notas.forEach(n => n.duracao = duracaoComum);

		return unissono;
	}

}