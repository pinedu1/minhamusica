import { TempoDuracaoJson } from "@persistence/TempoDuracaoJson.js";
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";
import { Unissono } from "@domain/nota/Unissono.js";
import { unissonoOutputSchema, unissonoSchema } from "@schemas/unissonoSchema.js";
import { NotaJson } from "@persistence/NotaJson.js";
import { PausaJson } from "@persistence/PausaJson.js";
import { QuialteraJson } from "@persistence/QuialteraJson.js";

export class UnissonoJson {
	/**
	 * @type {Array<NotaJson>}
	 * @param unissono @type {Unissono}
	 * @return {{notas: ['A', 'B'], duracao: '1/4'}}
	 */
	static toJson( unissono ) {
		return unissonoOutputSchema.parse( unissono );
	}

	/**
	 * Cria uma instancia de Unissono a partir de um JSON.
	 * @param dados {object} { notas: ['A', 'B'], duracao: '1/4'}
	 * @return {Unissono}
	 */
	static fromJson(dados) {
		if (dados instanceof Unissono) return dados;

		// 1. Validação via Zod
		const resultado = unissonoSchema.safeParse(dados);

		if (!resultado.success) {
			throw new TypeError("Unissono.create: Erro na estrutura dos dados: " + resultado.error.message);
		}

		const { notas, duracao, options } = resultado.data;


		// 3. Instanciação recursiva das Notas
		const instanciasNotas = notas.map(n => {
			if ( n.tipo === 'nota' ) return NotaJson.fromJson(n);
			if ( n.tipo === 'unissono' ) return UnissonoJson.fromJson(n);
			if ( n.tipo === 'pausa' ) return PausaJson.fromJson(n);
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
				if ( n.tipo === 'nota' ) return NotaJson.fromJson(n);
				if ( n.tipo === 'unissono' ) return UnissonoJson.fromJson(n);
				if ( n.tipo === 'pausa' ) return PausaJson.fromJson(n);
				if ( n.tipo === 'quialtera' ) return QuialteraJson.fromJson(n);
				return null;
			});
		}
		// 5. Retorna a nova instância de Unissono
		return new Unissono(instanciasNotas, instanciaDuracao, optionsProcessado);
	}

}