import { ClaveTipo } from "@domain/obra/ClaveTipo.js";
import { Clave } from "@domain/obra/Clave.js";
import { ObjectFactory } from "@factory/ObjectFactory.js";

export class ClaveJson {
	/**
	 * @param clave {Clave}
	 * Gera a string de configuração para o abcjs.
	 * Ex: clef=treble-8 ou clef=bass
	 */
	static toJson(clave) {
		return {
			tipo: clave.key,
			oitava: this.oitava
		};
	}
	/**
	 * USAGE: Helper para criação rápida de Clave a partir de um JSON.
	 * Ex: Clave.create({ tipo: "TREBLE", oitava: 0 })
	 * @param {Object} json - Objeto com as propriedades tipo e oitava.
	 * @param {string} [json.tipo="TREBLE"] - Chave da Clave (TREBLE, BASS, ALTO, etc).
	 * @param {number} [json.oitava=0] - Oitava da Clave.
	 * @returns {Clave}
	 */
	static fromJson( json = {} ) {
		if (json instanceof Clave) return json;
		// 1. Desestrutura o objeto recebido por parâmetro
		let { tipo, oitava } = json;

		// 2. Se não enviou tipo, assume a CHAVE 'TREBLE' (como string)
		if ( !tipo ) {
			tipo = 'TREBLE';
		}

		// 3. Se não enviou oitava (checa undefined para não sobrescrever caso enviem oitava 0)
		if ( oitava === undefined ) {
			oitava = 0;
		}

		// 4. Busca o objeto correto dentro do Enum e instancia a Clave
		const instanciaTipo = ClaveTipo[tipo];

		// Segurança extra: se enviaram uma string que não existe no Enum (ex: tipo: "GUITARRA")
		if ( !instanciaTipo ) {
			throw new Error(`Tipo de Clave não encontrada. Deve ser uma destas chaves: ${Object.keys(ClaveTipo).join(', ')}`);
		}

		return new Clave( instanciaTipo, oitava );
	}

}