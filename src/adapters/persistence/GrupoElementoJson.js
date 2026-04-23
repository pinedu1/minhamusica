import { grupoElementoOutputSchema, grupoElementoSchema } from "@schemas/grupoElemento.js";
import { GrupoElemento } from "@domain/compasso/GrupoElemento.js";

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
		return new GrupoElemento(elements, options);
	}
}