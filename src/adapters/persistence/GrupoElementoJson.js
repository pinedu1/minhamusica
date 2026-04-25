import { grupoElementoOutputSchema, grupoElementoSchema } from "@schemas/grupoElementoSchema.js";
import { GrupoElemento } from "@domain/compasso/GrupoElemento.js";
import { PausaJson } from "@persistence/PausaJson.js";
import { NotaJson } from "@persistence/NotaJson.js";
import { UnissonoJson } from "@persistence/UnissonoJson.js";
import { QuialteraJson } from "@persistence/QuialteraJson.js";
import { ObjectFactory } from "@factory/ObjectFactory.js";

export class GrupoElementoJson {
	static toJson(grupoElemento) {
		return grupoElementoOutputSchema.parse(grupoElemento);
	}
	static fromJson(json) {
		if (json instanceof GrupoElemento) return json;
		const resultado = grupoElementoSchema.safeParse(json);
		if (!resultado.success) {
			throw new TypeError("GrupoElemento.fromJson: Erro na estrutura dos dados: " +	JSON.stringify(resultado.error.format(), null, 2));
		}
		const { elements, options } = resultado.data;
		let e = [];
		if (elements && Array.isArray(elements) && elements.length > 0) {
			e = elements.map(n => {
				if ( n.tipo === 'pausa' ) return PausaJson.fromJson(n);
				if ( n.tipo === 'nota' ) return NotaJson.fromJson(n);
				if ( n.tipo === 'unissono' ) return UnissonoJson.fromJson(n);
				if ( n.tipo === 'quialtera' ) return QuialteraJson.fromJson(n);
				throw new Error(`CompassoJson.elements: Tipo de elemento desconhecido: "${n.tipo}"`);
			});
		}

		return ObjectFactory.newGrupoElemento(e, options);
	}
}