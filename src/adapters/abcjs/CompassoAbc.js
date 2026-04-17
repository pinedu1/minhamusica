import { TipoBarra } from "@domain/compasso/TipoBarra.js";
import { Compasso } from "@domain/compasso/Compasso.js";

export class CompassoAbc {
	/**
	 * USAGE: Orquestra a geração da string ABC completa do compasso.
	 * Agrupa as notas visivelmente baseando-se no total de pulsos e na metade do compasso.
	 * @param {Compasso} compasso - O compasso a ser convertido.
	 * @returns {string}
	 */
	static toAbc(compasso) {
		let abc = "";
		// Resolvendo unidade de tempo local com fallback para 1/8 exclusivo deste método
		const ut = compasso.getUnidadeTempo();
		let pulsosTotais = compasso.getPulsos(ut);

		if (compasso.options.barraInicial && (compasso.options.barraInicial !== TipoBarra.NONE)) {
			abc += compasso.options.barraInicial.abc;
		}

		if (compasso.options.metrica) {
			abc += compasso.options.metrica.toCompasso();
		}

		if (compasso.mudancaDeTom) {
			abc += `[K:${compasso.options.mudancaDeTom.valor}]`;
		}


		// Arredonda para cima para dar prioridade à primeira metade em casos ímpares
		const pontoDeCorte = Math.ceil(pulsosTotais / 2);

		let pulsosAcumulados = 0;
		let meioAlcancado = false;

		compasso.elements.forEach((elemento, idx) => {
			const cifrasDaPosicao = compasso.options.cifras.filter(c => c.posicao === idx);
			cifrasDaPosicao.forEach(c => { abc += `"${c.texto}"`; });

			const anotacoesDaPosicao = compasso.options.anotacoes.filter(a => a.posicao === idx);
			anotacoesDaPosicao.forEach(a => {
				const local = a.local || "_";
				abc += `"${local}${a.texto}"`;
			});
			abc += elemento.toAbc();

			const pulsosElemento = elemento.duracao.razao / ut.razao;
			pulsosAcumulados += pulsosElemento;

			// Insere o espaço para quebrar o agrupamento (beam) na metade do compasso
			// Usa uma pequena margem (0.001) para contornar imprecisões de ponto flutuante
			if (!meioAlcancado && pulsosAcumulados >= pontoDeCorte - 0.001) {
				if (idx < compasso.elements.length - 1) {
					abc += " ";
				}
				meioAlcancado = true;
			}
		});
		// --- NOVO BLOCO: COMPLEMENTO DE PAUSA (CORRIGIDO) ---
		const pulsosFaltantes = pulsosTotais - pulsosAcumulados;

		if (pulsosFaltantes > 0.001 && pulsosAcumulados > 0) {
			const razaoPausa = pulsosFaltantes * ut.razao;

			// Busca o denominador musical perfeito (1, 2, 4, 8, 16, 32, 64)
			let num = 0, den = 1;
			for (let d of [1, 2, 4, 8, 16, 32, 64]) {
				// Se a multiplicação der um número inteiro (ex: 0.75 * 4 = 3.000)
				if (Math.abs((razaoPausa * d) - Math.round(razaoPausa * d)) < 0.001) {
					num = Math.round(razaoPausa * d);
					den = d;
					break;
				}
			}

			// Agora ele cria TempoDuracao(3, 4) em vez de (1, 1)!
			const duracaoFaltante = new TempoDuracao(num, den);

			const pausaPreenchimento = new Pausa(duracaoFaltante, {
				unidadeTempo: ut,
			});

			abc += " " + pausaPreenchimento.toAbc();
		}
		// --- FIM DO BLOCO NOVO ---
		if (compasso.options.barraFinal && (compasso.options.barraFinal !== TipoBarra.NONE)) {
			abc += compasso.options.barraFinal.abc;
		}

		return abc;
	}
	/**
	 * USAGE: Cria uma nova instância de Compasso a partir de uma string de notação ABC.
	 * @param {string} compassoString - A string contendo os elementos do compasso.
	 * @param {Object} contextOptions - Opções de contexto (L, M, K) herdadas da Voz/Obra.
	 * @returns {Compasso} Uma nova instância da classe Compasso.
	 */
	static fromAbc(compassoString, contextOptions) {
		// Regex para capturar notas, unissonos, pausas e cifras
		const elementRegex = /"([^"]+)"|(\[([^\]]+)\])|([zxyZXY])|([=^_]?[a-gA-G][,']*)([0-9]*\/*[0-9]*-?)/g;
		const elements = [];
		let match;

		// Remove espaços extras para simplificar a regex
		const cleanString = compassoString.replace(/\s+/g, ' ');

		// Itera sobre todos os elementos musicais na string do compasso
		while ((match = elementRegex.exec(cleanString)) !== null) {
			const token = match[0];

			if (token.startsWith('"')) {
				// TODO: Implementar parsing de cifras e anotações
				continue;
			}

			if (token.startsWith('[')) {
				// É um unissono
				elements.push(Unissono.parseAbc(token, contextOptions));
			} else if (/[zxyZXY]/.test(token[0])) {
				// É uma pausa
				elements.push(Pausa.parseAbc(token, contextOptions));
			} else {
				// É uma nota
				elements.push(Nota.parseAbc(token, contextOptions));
			}
		}

		return new Compasso(elements, contextOptions);
	}

}