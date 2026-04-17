import { TipoBarra } from "@domain/compasso/TipoBarra.js";
import { Compasso } from "@domain/compasso/Compasso.js";
import { compassoSchema } from "@schemas/compassoSchema.js";

export class CompassoJson {
	/**
	 * Converte a instância do Compasso para um objeto JSON que pode ser usado para recriá-la.
	 * @param {Compasso} compasso
	 * @returns {Object}
	 */
	static toJSON(compasso) {
		const json = {
			elementos: this.#elements.map(el => el.toJSON())
		};

		const options = {};

		// Serializa apenas as opções que não são nulas, vazias ou padrão
		if (this.#options.unidadeTempo) {
			options.unidadeTempo = this.#options.unidadeTempo.toString();
		}
		if (this.#options.metrica) {
			options.metrica = this.#options.metrica.toString();
		}
		if (this.#options.mudancaDeTom) {
			options.mudancaDeTom = this.#options.mudancaDeTom.valor;
		}
		if (this.#options.anotacoes && this.#options.anotacoes.length > 0) {
			options.anotacoes = this.#options.anotacoes;
		}
		if (this.#options.cifras && this.#options.cifras.length > 0) {
			options.cifras = this.#options.cifras;
		}
		if (this.#options.letra && this.#options.letra.length > 0) {
			options.letra = this.#options.letra;
		}
		// barraInicial e barraFinal são omitidos intencionalmente, pois o método `create`
		// não possui a lógica para desserializá-los de uma string para uma instância de `TipoBarra`.
		// Adicionar isso ao JSON quebraria a reconstrução.

		if (Object.keys(options).length > 0) {
			json.options = options;
		}

		return json;
	}
	/**
	 * USAGE: Helper estático para criação rápida de Compasso a partir de um JSON.
	 * Ex: Compasso.create({ elementos: [{ altura: "C" }, { notas: [{altura:"E"}] }, {}], options: { unidadeTempo: "1", duracao: "1/8" } })
	 */
	static fromJson(json = {}) {
		if (json instanceof Compasso) return json;

		const resultado = compassoSchema.safeParse(json);

		if (!resultado.success) {
			throw new TypeError("Compasso.create: Erro na estrutura dos dados: " +
				JSON.stringify(resultado.error.format(), null, 2));
		}

		const { elementos, options } = resultado.data;

		// 1. Processamento de Options (Tempo e Métrica) PRIMEIRO
		const optionsProcessado = { ...options };

		if (options.barraInicial) {
			optionsProcessado.barraInicial = TipoBarra.getByAbc(options.barraInicial);
		}
		if (options.barraFinal) {
			optionsProcessado.barraFinal = TipoBarra.getByAbc(options.barraFinal);
		}
		if (options.mudancaDeTom) {
			optionsProcessado.mudancaDeTom = Tonalidade.create(options.mudancaDeTom);
		}
		if (options.unidadeTempo) {
			optionsProcessado.unidadeTempo = TempoDuracao.create(options.unidadeTempo);
		}
		if (options.metrica) {
			optionsProcessado.metrica = TempoMetrica.create(options.metrica);
		}

		// 2. CRIAÇÃO DA INSTÂNCIA PRIMEIRO (Ainda sem elementos para não engatilhar validação)
		const compasso = new Compasso([], optionsProcessado);

		// 3. Roteamento e Instanciação dos Elementos (Nota, Pausa ou Unissono)
		const instanciasElementos = elementos.map(el => {

			// Garante que o objeto options exista no JSON cru
			el.options = el.options || {};

			// A MÁGICA: Injeta o compasso no JSON ANTES de chamar o .create()
			el.options.compasso = compasso;

			// Agora, quando o Nota.create validar a unidadeTempo, ele achará o compasso pai!
			if (el.constructor.name === 'Nota' || el.altura) return Nota.create(el);
			if (el.constructor.name === 'Unissono' || el.notas) return Unissono.create(el);
			return Pausa.create(el);
		});

		// 4. Atribuir os elementos já hidratados
		// O seu setter 'elements' vai assumir daqui e fazer as verificações finais
		compasso.elements = instanciasElementos;

		return compasso;
	}

}