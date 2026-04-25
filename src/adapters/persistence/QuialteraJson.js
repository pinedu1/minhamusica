import { quialteraOutputSchema, quialteraSchema } from "@schemas/quialteraSchema.js";
import { Quialtera } from "@domain/nota/Quialtera.js";
import { NotaJson } from "@persistence/NotaJson.js";
import { PausaJson } from "@persistence/PausaJson.js";
import { UnissonoJson } from "@persistence/UnissonoJson.js";
import { TempoDuracaoJson } from "@persistence/TempoDuracaoJson.js";
import { ObjectFactory } from "@factory/ObjectFactory.js";

export class QuialteraJson {
	/**
	 * @type {Array<NotaJson>}
	 * @param quialtera @type {Quialtera}
	 * @return {{notas: ['A', 'B'], duracao: '1/4'}}
	 */
	static toJson( quialtera ) {
		return quialteraOutputSchema.parse( quialtera );
	}

	/**
	 * Cria uma instancia de Quialtera a partir de um JSON.
	 * @param dados {object} { notas: ['A', 'B'], duracao: '1/4'}
	 * @return {Quialtera}
	 */
	static fromJson(dados) {
		if (dados instanceof Quialtera) return dados;

		// 1. Validação via Zod
		const resultado = quialteraSchema.safeParse(dados);

		if (!resultado.success) {
			throw new TypeError("Quialtera.create: Erro na estrutura dos dados: " + resultado.error.message);
		}

		const { notas, duracao, options } = resultado.data;


		// 3. Instanciação recursiva das Notas
		const instanciasNotas = notas.map(n => {
			if ( n.tipo === 'pausa' ) return PausaJson.fromJson(n);
			if ( n.tipo === 'nota' ) return NotaJson.fromJson(n);
			if ( n.tipo === 'unissono' ) return UnissonoJson.fromJson(n);
			if ( n.tipo === 'quialtera' ) return QuialteraJson.fromJson(n);
			return NotaJson.fromJson(n);
		});

		// 4. Instanciação da Duração e Unidade de Tempo
		const instanciaDuracao = TempoDuracaoJson.fromJson(duracao);
		const optionsProcessado = { ...options };

		if (options.unidadeTempo) {
			optionsProcessado.unidadeTempo = TempoDuracaoJson.fromJson(options.unidadeTempo);
		}

		// Tratamento de GraceNotes se forem um array
		if (Array.isArray(options.graceNote)) {
			// Usando o .map() para construir o novo array!
			optionsProcessado.graceNote = options.graceNote.map(n => {
				if ( n.tipo === 'pausa' ) return PausaJson.fromJson(n);
				if ( n.tipo === 'nota' ) return NotaJson.fromJson(n);
				if ( n.tipo === 'unissono' ) return UnissonoJson.fromJson(n);
				if ( n.tipo === 'quialtera' ) return QuialteraJson.fromJson(n);
				return null;
			});
		}
		// 5. Retorna a nova instância de Quialtera
		return ObjectFactory.newQuialtera(instanciasNotas, instanciaDuracao, optionsProcessado);
	}
}