import { RitmoAbc } from "@domain/obra/Ritmo.js";
import { ObjectFactory } from "@factory/ObjectFactory.js";

export class RitmoJson {
	static fromJson( ritmo = 'REEL' ) {
		// 2. Verifica se a chave informada existe no array de chaves
		const chavesValidas = Object.keys(RitmoAbc);
		if (!chavesValidas.includes(ritmo)) {
			throw new TypeError(
				`Ritmo.create: Chave de ritmo inválida "${ritmo}". Deve ser um destes: [${chavesValidas.join(', ')}].`
			);
		}
		return new Ritmo(ritmo);
	}

}