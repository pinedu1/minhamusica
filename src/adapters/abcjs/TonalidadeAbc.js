import { Tonalidade } from "@domain/compasso/Tonalidade.js";

export class TonalidadeAbc {
	static toAbc(tonalidade) {
		if ( !tonalidade instanceof Tonalidade ) {
			throw new TypeError( "TonalidadeAbc.toAbc: deve ser uma instância de Tonalidade." );
		}
		return tonalidade.valor;
	}
	static fromAbc(abc) {
		return new Tonalidade(abc);
	}
}