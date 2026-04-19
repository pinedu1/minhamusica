import { TempoAndamento } from "@domain/tempo/TempoAndamento.js";
import { tempoAndamentoOutputSchema, tempoAndamentoSchema } from "@schemas/tempoAndamentoSchema.js";
import { AdapterUtils } from "@adapters/AdapterUtils.js";
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";


export class TempoAndamentoJson extends AdapterUtils {
	/**
	 * Converte para Jso na representação do Andamento
	 * @param tempoAndamento { TempoAndamento }
	 * @return {{andamento: string}}
	 * Ex: { andamento: "1/4=90" }
	 */
	static toJson( tempoAndamento ) {
		return tempoAndamentoOutputSchema.parse( tempoAndamento );
	}
	/**
	 * USAGE: Helper para criação rápida de TempoAndamento a partir de um JSON.
	 * Aceita tanto o formato estruturado quanto o formato de string ABC.
	 * @param {object} jsonString - Propriedades { numerador, denominador, bpm } ou { andamento: "1/4=90" }.
	 * @returns {TempoAndamento} Uma nova instância da classe de domínio.
	 * @throws {TypeError} Se os dados forem inválidos ou a estrutura estiver incorreta.
	 * Ex: TempoAndamento.fromJson({ numerador: 1, denominador: 4, bpm: 90 })
	 * Ex: TempoAndamento.fromJson({ andamento: "1/4=90" })
	 * @see {@link TempoAndamento}
	 */
	static fromJson( jsonString ) {
		// 1. Se já for uma instância de domínio, não há o que processar.
		if ( jsonString instanceof TempoAndamento ) {
			return jsonString;
		}

		// 2. Validação via Zod Schema (O "Porteiro" da estrutura).
		const resultado = tempoAndamentoSchema.safeParse( jsonString );

		if ( !resultado.success ) {
			throw new TypeError( "TempoAndamento.fromJson: Erro na estrutura dos dados: " + resultado.error.message );
		}

		// 3. Extração dos dados validados.
		// Usamos 'let' para permitir a normalização caso 'duracao' esteja presente.
		let { numerador, denominador, bpm } = resultado.data;

		/**
		 * Validação de Integridade (Defensive Programming).
		 * Embora o Schema e o extrairNumerosAndamentoAbc já validem, garantimos que
		 * o numerador e denominador finais sejam compatíveis com o domínio.
		 */
		if ( ( Number.isInteger( numerador ) === false ) || ( numerador <= 0 ) ) {
			throw new TypeError( "TempoAndamento.fromJson: Numerador inválido. Deve ser inteiro positivo." );
		}
		if ( ( Number.isInteger( denominador ) === false ) || ( denominador <= 0 ) ) {
			throw new TypeError( "TempoAndamento.fromJson: Denominador inválido. Deve ser inteiro positivo." );
		}
		if ( bpm === null || bpm === undefined ) {
			throw new TypeError("Falha ao criar TempoAndamento: 'bpm' ser válido.");
		}
		if ( (Number.isInteger( bpm ) === false) || (bpm <= 0) ) {
			throw new TypeError("Falha ao criar TempoAndamento: 'bpm' ser Inteiro e maior que Zero.");
		}
		const tempoDuracao = new TempoDuracao( numerador, denominador );
		return new TempoAndamento( tempoDuracao, bpm );
	}
}