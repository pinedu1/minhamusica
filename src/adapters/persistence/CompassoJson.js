import { TipoBarra } from "@domain/compasso/TipoBarra.js";
import { Compasso } from "@domain/compasso/Compasso.js";
import { compassoOutputSchema, compassoSchema } from "@schemas/compassoSchema.js";
import { TempoMetricaJson } from "@persistence/TempoMetricaJson.js";
import { TempoDuracaoJson } from "@persistence/TempoDuracaoJson.js";
import { PausaJson } from "@persistence/PausaJson.js";
import { NotaJson } from "@persistence/NotaJson.js";
import { UnissonoJson } from "@persistence/UnissonoJson.js";
import { GrupoElemento } from "@domain/compasso/GrupoElemento.js";
import { GrupoElementoJson } from "@persistence/GrupoElementoJson.js";
import { Tonalidade } from '@domain/compasso/Tonalidade.js';

export class CompassoJson {
	/**
	 * Converte a instância do Compasso para um objeto JSON que pode ser usado para recriá-la.
	 * @param {Compasso} compasso
	 * @returns {Object}
	 */
	static toJson(compasso) {
		return compassoOutputSchema.parse(compasso);
	}
	/**
	 * USAGE: Helper estático para criação rápida de Compasso a partir de um JSON.
	 * Ex: Compasso.create({ elementos: [{ altura: "C" }, { notas: [{altura:"E"}] }, {}], options: { unidadeTempo: "1", duracao: "1/8" } })
	 */
	static fromJson(json = {}) {
		if (json instanceof Compasso) return json;

		const resultado = compassoSchema.safeParse(json);

		if (!resultado.success) {
			throw new TypeError("Compasso.create: Erro na estrutura dos dados: " +	JSON.stringify(resultado.error.format(), null, 2));
		}

		const { elementos, grupos , options } = resultado.data;

		// 1. Processamento de Options (Tempo e Métrica) PRIMEIRO
		const optionsProcessado = { };

		if (options.barraInicial) {
			optionsProcessado.barraInicial = TipoBarra.get(options.barraInicial);
		}
		if (options.barraFinal) {
			optionsProcessado.barraFinal = TipoBarra.get(options.barraFinal);
		}
		if (options.mudancaDeTom) {
			optionsProcessado.mudancaDeTom = Tonalidade.create(options.mudancaDeTom);
		}
		if (options.unidadeTempo) {
			optionsProcessado.unidadeTempo = TempoDuracaoJson.fromJson(options.unidadeTempo);
		}
		if (options.metrica) {
			optionsProcessado.metrica = TempoMetricaJson.fromJson(options.metrica);
		}
		if (options.anotacoes && Array.isArray(options.anotacoes) && options.anotacoes.length > 0) {
			optionsProcessado.anotacoes = anotacoes;
		}
		if (options.acordes && Array.isArray(options.acordes) && options.acordes.length > 0) {
			optionsProcessado.acordes = acordes;
		}

		// 2. CRIAÇÃO DA INSTÂNCIA PRIMEIRO (Ainda sem elementos para não engatilhar validação)
		const compasso = new Compasso([], optionsProcessado);
		// 3. Roteamento e Instanciação dos Elementos (Nota, Pausa, Unissono ou Quialtera)
		let instanciasElementos = [];
		let arrayGrupos = [];
		if (elementos && Array.isArray(elementos) && elementos.length > 0) {
			instanciasElementos = elementos.map(n => {
				if ( n.tipo === 'pausa' ) return PausaJson.fromJson(n);
				if ( n.tipo === 'nota' ) return NotaJson.fromJson(n);
				if ( n.tipo === 'unissono' ) return UnissonoJson.fromJson(n);
				if ( n.tipo === 'quialtera' ) return QuialteraJson.fromJson(n);
				throw new Error(`CompassoJson.elements: Tipo de elemento desconhecido: "${n.tipo}"`);
			});
		}
		if (grupos && Array.isArray(grupos) && grupos.length > 0) {
			arrayGrupos = grupos.map(grupo => {
				return GrupoElementoJson.fromJson(grupo);
			});
		}
		compasso.grupos = arrayGrupos;
		// 4. Atribuir os elementos já hidratados
		compasso.elements = instanciasElementos;

		return compasso;
	}
}