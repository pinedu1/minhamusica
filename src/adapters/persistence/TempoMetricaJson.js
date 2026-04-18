import { TempoMetrica } from "@domain/tempo/TempoMetrica.js";
import { tempoMetricaSchema } from "@schemas/tempoMetricaSchema.js";
import { AdapterUtils } from "@adapters/AdapterUtils.js";

export class TempoMetricaJson extends AdapterUtils {
	/**
	 * Converte TempoMetrica para representação Json
	 * @param tempoMetrica
	 * @return {{metrica: string}}
	 * Ex: { metrica: "1/4" }
	 */
	static toJson( tempoMetrica ) {
		return {
			metrica: tempoMetrica.toString()
		}
	}
	/**
	 * USAGE: Helper para criação rápida de TempoMetrica a partir de um JSON.
	 * Aceita tanto o formato estruturado quanto o formato de string ABC.
	 * @param {object} dadosJson - Propriedades { numerador, denominador } ou { metrica: "1/4" }.
	 * @returns {TempoMetrica} Uma nova instância da classe de domínio.
	 * @throws {TypeError} Se os dados forem inválidos ou a estrutura estiver incorreta.
	 * Ex: TempoMetrica.fromJson({ numerador: 1, denominador: 4 })
	 */
	static fromJson( dadosJson ) {
		// 1. Se já for uma instância de domínio, não há o que processar.
		if ( dadosJson instanceof TempoMetrica ) {
			return dadosJson;
		}

		// 2. Validação via Zod Schema (O "Porteiro" da estrutura).
		const resultado = tempoMetricaSchema.safeParse( dadosJson );

		if ( !resultado.success ) {
			throw new TypeError( "TempoMetrica.fromJson: Erro na estrutura dos dados: " + resultado.error.message );
		}

		// 3. Extração dos dados validados.
		// Usamos 'let' para permitir a normalização caso 'metrica' esteja presente.
		let { numerador, denominador, metrica } = resultado.data;

		// 4. Se o formato for via string ABC ({ metrica: "1/4" }), traduzimos para números.
		if ( metrica ) {
			const extraido = this.extrairNumerosDuracaoAbc( metrica );
			numerador = extraido.numerador;
			denominador = extraido.denominador;
		}

		/**
		 * Validação de Integridade (Defensive Programming).
		 * Embora o Schema e o extrairNumerosMetricaAbc já validem, garantimos que
		 * o numerador e denominador finais sejam compatíveis com o domínio.
		 */
		if ( ( Number.isInteger( numerador ) === false ) || ( numerador <= 0 ) ) {
			throw new TypeError( "TempoMetrica.fromJson: Numerador inválido. Deve ser inteiro positivo." );
		}

		if ( ( Number.isInteger( denominador ) === false ) || ( denominador <= 0 ) ) {
			throw new TypeError( "TempoMetrica.fromJson: Denominador inválido. Deve ser inteiro positivo." );
		}

		// 5. Instanciação da Classe de Domínio Pura.
		return new TempoMetrica( numerador, denominador );
	}
}