import { NotaJson } from "@persistence/NotaJson.js";
import { TempoDuracaoJson } from "@persistence/TempoDuracaoJson.js";
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";
import { Unissono } from "@domain/nota/Unissono.js";
import { unissonoSchema } from "@schemas/unissonoSchema.js";
import { Nota } from "@domain/nota/Nota.js";
export class UnissonoJson {
	/**
	 * @type {Array<NotaJson>}
	 * @param unissono @type {Unissono}
	 * @return {{notas: ['A', 'B'], duracao: '1/4'}}
	 */
	static toJson( unissono ) {
		const json = {
			notas: unissono.notas.map(n => NotaJson.toJson(n)),
			duracao: TempoDuracaoJson.toJson(unissono.duracao)
		};

		const defaultOptions = {
			acento: false,
			marcato: false,
			staccato: false,
			staccatissimo: false,
			tenuto: false,
			ligada: false,
			arpeggio: false,
			fermata: false,
			ghostNote: false,
			roll: false,
			trinado: false,
			mordente: false,
			upperMordent: false,
			graceNote: null,
			dedilhado: null,
		};

		const optionsToExport = {};
		const opt = unissono.options;

		for (const key in opt) {
			if (Object.hasOwnProperty.call(defaultOptions, key)) {
				const value = this._options[key];
				const defaultValue = defaultOptions[key];

				if (key === 'graceNote' && Array.isArray(value)) {
					if (value.length > 0) {
						optionsToExport[key] = value.map(gn => gn.toJSON());
					}
				} else if (value !== defaultValue) {
					optionsToExport[key] = value;
				}
			}
		}
		if (Object.keys(optionsToExport).length > 0) {
			json.options = optionsToExport;
		}
		return json;
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

		// 2. Validação da Regra de Negócio (Hierarquia de Tempo)
		if (!options.unidadeTempo && !options.compasso && !options.voz && !options.obra) {
			throw new TypeError("Unissono.create: A unidadeTempo Global deve ser definida em algum nível da hierarquia.");
		}

		// 3. Instanciação recursiva das Notas
		const instanciasNotas = notas.map(n => {
			// GARANTE que o objeto options exista no JSON cru da nota
			n.options = n.options || {};

			// Propaga o contexto do Unissono para a Nota, se a nota não tiver o seu próprio.
			if (!n.options.unidadeTempo && options.unidadeTempo) {
				n.options.unidadeTempo = options.unidadeTempo;
			}
			if (!n.options.compasso && options.compasso) {
				n.options.compasso = options.compasso;
			}
			if (!n.options.voz && options.voz) {
				n.options.voz = options.voz;
			}
			if (!n.options.obra && options.obra) {
				n.options.obra = options.obra;
			}
			return Nota.create(n);
		});

		// 4. Instanciação da Duração e Unidade de Tempo
		const instanciaDuracao = TempoDuracao.create(duracao);
		const optionsProcessado = { ...options };

		if (options.unidadeTempo) {
			optionsProcessado.unidadeTempo = TempoDuracao.create(options.unidadeTempo);
		}

		// Tratamento de GraceNotes se forem um array
		if (Array.isArray(options.graceNote)) {
			optionsProcessado.graceNote = options.graceNote.map(n => Nota.create(n));
		}

		// 5. Retorna a nova instância de Unissono
		return new Unissono(instanciasNotas, instanciaDuracao, optionsProcessado);
	}

}