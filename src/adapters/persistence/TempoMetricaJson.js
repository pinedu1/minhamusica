import { TempoMetrica } from "@domain/tempo/TempoMetrica.js";
import { tempoMetricaOutputSchema, tempoMetricaSchema } from "@schemas/tempoMetricaSchema.js";
import { AdapterUtils } from "@adapters/AdapterUtils.js";
import { ObjectFactory } from "@factory/ObjectFactory.js";

export class TempoMetricaJson extends AdapterUtils {
	/**
	 * Converte TempoMetrica para representação Json
	 * @param tempoMetrica
	 * @return {{metrica: string}}
	 * Ex: { numerador: 1, denominador 4 }
	 */
	static toJson( tempoMetrica ) {
		return tempoMetricaOutputSchema.parse( tempoMetrica );
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
		const { numerador, denominador} = resultado.data;

		// 5. Instanciação da Classe de Domínio Pura.
		return new TempoMetrica( numerador, denominador );
	}
}