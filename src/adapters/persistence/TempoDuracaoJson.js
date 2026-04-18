import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";
import { tempoDuracaoSchema } from "@schemas/tempoDuracaoSchema.js";
import { AdapterUtils } from "@adapters/AdapterUtils.js";

export class TempoDuracaoJson extends AdapterUtils {
	/**
	 * Converte TempoDuracao para representação Json
	 * @param tempoDuracao
	 * @return {{duracao: string}}
	 * Ex: { duracao: "1/4" }
	 */
	static toJson( tempoDuracao ) {
		return {
			duracao: tempoDuracao.toString()
		}
	}
	/**
	 * USAGE: Helper para criação rápida de TempoDuracao a partir de um JSON.
	 * Aceita tanto o formato estruturado quanto o formato de string ABC.
	 * @param {object} dadosJson - Propriedades { numerador, denominador } ou { duracao: "1/4" }.
	 * @returns {TempoDuracao} Uma nova instância da classe de domínio.
	 * @throws {TypeError} Se os dados forem inválidos ou a estrutura estiver incorreta.
	 * Ex: TempoDuracao.fromJson({ numerador: 1, denominador: 4 })
	 */
	static fromJson( dadosJson ) {
		// 1. Se já for uma instância de domínio, não há o que processar.
		if ( dadosJson instanceof TempoDuracao ) {
			return dadosJson;
		}

		// 2. Validação via Zod Schema (O "Porteiro" da estrutura).
		const resultado = tempoDuracaoSchema.safeParse( dadosJson );

		if ( !resultado.success ) {
			throw new TypeError( "TempoDuracao.fromJson: Erro na estrutura dos dados: " + resultado.error.message );
		}

		// 3. Extração dos dados validados.
		// Usamos 'let' para permitir a normalização caso 'duracao' esteja presente.
		let { numerador, denominador, duracao } = resultado.data;
		if ( typeof resultado.data === 'string' ) {
			duracao = resultado.data;
		}

		// 4. Se o formato for via string ABC ({ duracao: "1/4" }), traduzimos para números.
		if ( duracao ) {
			const extraido = this.extrairNumerosDuracaoAbc( duracao );
			numerador = extraido.numerador;
			denominador = extraido.denominador;
		}

		/**
		 * Validação de Integridade (Defensive Programming).
		 * Embora o Schema e o extrairNumerosDuracaoAbc já validem, garantimos que
		 * o numerador e denominador finais sejam compatíveis com o domínio.
		 */
		if ( ( Number.isInteger( numerador ) === false ) || ( numerador <= 0 ) ) {
			throw new TypeError( "TempoDuracao.fromJson: Numerador inválido. Deve ser inteiro positivo." );
		}

		if ( ( Number.isInteger( denominador ) === false ) || ( denominador <= 0 ) ) {
			throw new TypeError( "TempoDuracao.fromJson: Denominador inválido. Deve ser inteiro positivo." );
		}

		// 5. Instanciação da Classe de Domínio Pura.
		return new TempoDuracao( numerador, denominador );
	}
}