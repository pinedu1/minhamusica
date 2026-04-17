import { notaSchema } from "@schemas/notaSchema.js";
import { NotaFrequencia } from "@domain/nota/NotaFrequencia.js";
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";

export class TempoDuracaoJson {
	static toJson( tempoDuracao ) {
		return tempoDuracao.toString();
	}
	/**
	 * USAGE: Helper para criação rápida de Nota a partir de um JSON.
	 * Ex: Nota.create({ altura: "C", duracao: "1/4", options:{ sustenido: true })
	 */
	static fromJson(dados) {
		if (dados instanceof Nota) return dados;

		const resultado = notaSchema.safeParse(dados);

		// 1. Validação do Schema
		if (!resultado.success) {
			throw new TypeError("Nota.create: Erro na estrutura dos dados: " + resultado.error.message);
		}

		const { altura, duracao, options } = resultado.data;

		// 2. Validação da Regra de Negócio: Hierarquia de Tempo
		if (!options.unidadeTempo && !options.compasso && !options.voz && !options.obra) {
			throw new TypeError("Nota.create: A unidadeTempo Global deve ser definida em algum nível da hierarquia (Pausa/Compasso/Voz/Obra).");
		}

		// 3. Instanciação das dependências
		const instanciaFrequencia = NotaFrequencia.getByAbc(altura);
		const instanciaDuracao = TempoDuracao.create(duracao);

		// 4. Tratamento específico para unidadeTempo se ela existir no options
		const optionsProcessado = { ...options };
		if (options.unidadeTempo) {
			optionsProcessado.unidadeTempo = TempoDuracao.create(options.unidadeTempo);
		}

		// Retorno usando o spread para manter o DRY em todas as propriedades de options
		return new Nota(instanciaFrequencia, instanciaDuracao, optionsProcessado);
	}

}