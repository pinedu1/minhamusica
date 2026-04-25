import { notaFrequenciaOutputSchema, notaFrequenciaSchema } from "@schemas/notaFrequenciaSchema.js";
import { NotaFrequencia } from "@domain/nota/NotaFrequencia.js";
import { ObjectFactory } from "@factory/ObjectFactory.js";

export class NotaFrequenciaJson {
	/**
	 * Serialisa NotaFrequencia para JSON.
	 * @param notaFrequencia
	 * @return {{ key: 'C4', abc: "C", midi: 60}}
	 */
	static toJson( notaFrequencia ) {
		return notaFrequenciaSchema.parse( notaFrequencia );
	}

	/**
	 * Deserializa JSON para NotaFrequencia.
	 * @param {object} json Ex: { key: 'C4', abc: "C", midi: 60}
	 * @return {NotaFrequencia}
	 */
	static fromJson( json ) {
		if (json instanceof NotaFrequencia) return json;
		const frequencia = notaFrequenciaSchema.parse(json);
		return frequencia;
	}
}