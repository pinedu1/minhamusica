import { GrupoElemento } from "@domain/compasso/GrupoElemento.js";
import { Compasso } from "@domain/compasso/Compasso.js";
import { PausaAbc } from "@abcjs/PausaAbc.js";
import { NotaAbc } from "@abcjs/NotaAbc.js";
import { QuialteraAbc } from "@abcjs/QuialteraAbc.js";
import { UnissonoAbc } from "@adapters/abcjs/UnissonoAbc.js";
import { ElementoMusicalAbc } from "@abcjs/ElementoMusicalAbc.js";


export class GrupoElementoAbc {
	/**
	 * USAGE: Orquestra a geração da string ABC completa do compasso.
	 * Agrupa as notas visivelmente baseando-se no total de pulsosOcupados e na metade do compasso.
	 * @param {Compasso} grupoElemento - O compasso a ser convertido.
	 * @returns {string}
	 */
	static toAbc(grupoElemento) {
		let abc = "";
		grupoElemento.elements.forEach((elemento, idx) => {
			const cifrasDaPosicao = grupoElemento.options.cifras.filter(c => c.posicao === idx);
			cifrasDaPosicao.forEach(c => { abc += `"${c.texto}"`; });

			const anotacoesDaPosicao = grupoElemento.options.anotacoes.filter(a => a.posicao === idx);
			anotacoesDaPosicao.forEach(a => {
				const local = a.local || "_";
				abc += `"${local}${a.texto}"`;
			});
			abc += `${((el) => {
				if (el.constructor.name === "Pausa") {
					return PausaAbc.toAbc( el );
				}
				if (el.constructor.name === "Nota") {
					return NotaAbc.toAbc( el );
				}
				if (el.constructor.name === "Unissono") {
					return UnissonoAbc.toAbc( el );
				}
				if (el.constructor.name === "Quialtera") {
					return QuialteraAbc.toAbc( el );
				}
				return ''; // Fallback de segurança
			})(elemento)}`;
		});

		return abc;
	}
	static _consomePayloadInicioSentenca( strIn ) {
		let conteudoRestante = strIn.trim();
		let conteudoEncontrado = "";

		// REGEXES LIMPOS (Sem o /g no final)
		const regexAcordes = /^"(.*?)"/;
		const regexPulaLinha = /^\$(?!\()/;     // Blindado para ignorar o dedilhado
		while (conteudoRestante.length > 0) {
			let achei = false; // Declarar no início do loop é o mais correto

			const matchAcordes = conteudoRestante.match(regexAcordes);
			if (matchAcordes) {
				conteudoEncontrado += matchAcordes[0];
				conteudoRestante = conteudoRestante.substring(matchAcordes[0].length).trimStart();
				achei = true;
			}

			const matchPulaLinha = conteudoRestante.match(regexPulaLinha);
			if (matchPulaLinha) {
				conteudoEncontrado += matchPulaLinha[0];
				conteudoRestante = conteudoRestante.substring(matchPulaLinha[0].length).trimStart();
				achei = true;
			}

			conteudoRestante = conteudoRestante.trim();
			// Se passou por todas as verificações e não achou nada,
			// significa que bateu na nota musical. Hora de parar o loop!
			if (!achei) {
				break;
			}
		}
		// Dá um trim() final no payload caso ele tenha um espaço sobrando no fim
		return { conteudoEncontrado, conteudoRestante };
	}

	/**
	 * USAGE: Cria uma nova instância de Compasso a partir de uma string de notação ABC.
	 * Segue a lógica de: Cabeçalhos Iniciais -> Loop de Elementos -> Metadados Finais.
	 */
	static fromAbc(grupoElementoString, contextOptions) {
		let str = grupoElementoString.trim();
		const elements = [];
		// --- 2. DEFINIÇÃO DOS REGEX DE BUSCA (Individuais) ---
		// A Nota tem uma regra especial: captura a letra apenas se NÃO for seguida por " (cifra)
		const reUnissono  = /^\[[^\]]+\][\d/]*\-?/;
		const reQuialtera = /^\([0-9]+(?::[0-9]+:[0-9]+)?\-?/;
		const rePausa     = /^[zxyZXY][\d/]*\-?/;
		const reNota      = /^[=^_]?[a-gA-G][,']*[\d/]*\-?/; // A nota pura

		// Regex para identificar se o início da string é um Payload
		//const rePayload   = /^("[^"]+"|![^!]+!)+/;
		// Captura qualquer coisa (incluindo espaços e pontos)
		// desde que a posição atual NÃO seja o início de um elemento musical.
		//const rePayload = /^((?!"|!|\[|\(|[zxyZXY]|[=^_]?[a-gA-G]).)+/;
		// Captura 1 ou mais ocorrências de: Cifras ("...") OU Dinâmicas (!...!) OU qualquer caractere
		// que NÃO seja início de Nota, Pausa, Uníssono, Quialtera ou Barras/Ligaduras
		const rePayload = /^(?:"[^"]*"|![^!]*!|[^\[\(=^_a-gA-GzxyZXY\-\|:])+/;
		let { conteudoEncontrado, conteudoRestante} = this._consomePayloadInicioSentenca( str );
		let { payloadString, optionsGerado} = ElementoMusicalAbc._trataPayLoad( conteudoEncontrado );
		str = conteudoRestante

		// --- 3. LOOP DE ELEMENTOS ---
		while (str.length > 0) {
			str = str.trimStart();
			let payloadAcumulado = "";

			// Sub-loop para extrair todos os payloads que precedem o elemento
			let matchPayload;
			while ((matchPayload = str.match(rePayload))) {
				payloadAcumulado += matchPayload[0];
				str = str.substring(matchPayload[0].length).trimStart(); // CORTA payload
			}

			// Agora testamos os elementos musicais na ordem de prioridade
			let matchElemento = null;
			let tipoEncontrado = null;

			if ((matchElemento = str.match(reUnissono))) {
				tipoEncontrado = 'unissono';
			} else if ((matchElemento = str.match(reQuialtera))) {
				tipoEncontrado = 'quialtera';
			} else if ((matchElemento = str.match(rePausa))) {
				tipoEncontrado = 'pausa';
			} else if ((matchElemento = str.match(reNota))) {
				tipoEncontrado = 'nota';
			}
			if (matchElemento) {
				let textoCorpo = matchElemento[0]; // Transformado em 'let' para ser atualizado pela quiáltera
				let fullToken = payloadAcumulado + textoCorpo;

				// Instancia de acordo com o tipo
				switch (tipoEncontrado) {
					case 'unissono':
						elements.push(UnissonoAbc.fromAbc(fullToken, contextOptions));
						break;
					case 'quialtera': {
						// 1. Extrai 'p' e 'r' do cabeçalho da quiáltera para saber quantas notas caçar
						const matchHeader = textoCorpo.match(/^\(([0-9]+)(?::([0-9]+))?(?::([0-9]+))?/);
						const p = parseInt(matchHeader[1], 10);
						const r = matchHeader[3] ? parseInt(matchHeader[3], 10) : null;
						const limiteNotas = r || p;

						let subStr = str.substring(textoCorpo.length); // O resto da string, logo após o "(p:q:r"
						let notasConsumidas = "";
						let contador = 0;

						// 2. Caça e recorta exatamente 'limiteNotas' elementos musicais
						while (subStr.length > 0 && contador < limiteNotas) {
							let matchSubPayload;
							// Consome payloads perdidos no meio (ex: "C" ou espaços)
							while ((matchSubPayload = subStr.match(rePayload))) {
								notasConsumidas += matchSubPayload[0];
								subStr = subStr.substring(matchSubPayload[0].length);
							}

							// Verifica se o próximo item é Nota, Pausa ou Uníssono
							let subElem = subStr.match(reUnissono) || subStr.match(rePausa) || subStr.match(reNota);
							if (subElem) {
								notasConsumidas += subElem[0];
								subStr = subStr.substring(subElem[0].length);
								contador++;
							} else {
								break; // Evita loop infinito se a sintaxe estiver quebrada
							}
						}

						// 3. Captura traço de ligadura se estiver grudado após a última nota da quiáltera
						if (subStr.startsWith('-')) {
							notasConsumidas += '-';
						}

						// 4. "Engorda" as strings originais com o que foi consumido
						fullToken += notasConsumidas;
						textoCorpo += notasConsumidas; // ISSO garante que o 'str.substring' lá embaixo corte tudo!

						elements.push(QuialteraAbc.fromAbc(fullToken, contextOptions));
						break;
					}
					case 'pausa':
						elements.push(PausaAbc.fromAbc(fullToken, contextOptions));
						break;
					case 'nota':
						elements.push(NotaAbc.fromAbc(fullToken, contextOptions));
						break;
				}

				// Graças ao 'textoCorpo += notasConsumidas', isso agora corta a quiáltera inteira!
				str = str.substring(textoCorpo.length).trimStart();
			} else {
				console.warn("Caractere ignorado pelo Lexer:", str);
				str = str.substring(1).trimStart();
			}
		}
		return new GrupoElemento(elements, {
			...contextOptions,
			...optionsGerado,
		});
	}
}