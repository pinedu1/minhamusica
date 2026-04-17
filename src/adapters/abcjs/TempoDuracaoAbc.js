import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";

export class TempoDuracaoAbc {
	static toAbc( tempoDuracao ) {
		return tempoDuracao.toString();
	}
	static fromAbc( abc ) {
		return new TempoDuracaoAbc( abc );
	}
}