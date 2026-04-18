export class AdapterUtils {
	/**
	 * Valida a entrada de string ABC e lança erro se o formato for inválido.
	 * Aceita: "1/4", "/2", "/", "2", "1/", etc.
	 * * @param {string} entrada - A string vinda do código ABC.
	 * @throws {TypeError} Se a string não seguir o padrão musical esperado.
	 */
	static validarSintaxeDuracaoAbc( entradaString ) {
		// Higienização para evitar que espaços invalidem o Regex
		const stringLimpa = entradaString.replaceAll( " ", "" ).trim();
		/**
		 * Explicação do Regex:
		 * ^            -> Início da string
		 * (            -> Início do grupo de captura
		 * \d+\/\d+   -> Caso 1: "1/4" (num/den)
		 * |          -> OU
		 * \/\d+      -> Caso 2: "/2" (barra e den)
		 * |          -> OU
		 * \d+\/      -> Caso 3: "2/" (num e barra)
		 * |          -> OU
		 * \/         -> Caso 4: "/" (apenas barra)
		 * |          -> OU
		 * \d+        -> Caso 5: "2" (apenas numerador)
		 * )            -> Fim do grupo
		 * $            -> Fim da string
		 */
		const regexAbc = /^(\d+\/\d+|\/\d+|\d+\/|\/|\d+)$/;
		if ( ( regexAbc.test( stringLimpa ) === false ) || ( stringLimpa === "" ) ) {
			throw new TypeError( `Entrada ABC inválida: "${entradaString}". O formato deve ser N/D, /D, N/ ou N.` );
		}
		return stringLimpa;
	};
	/**
	* Traduz uma string no formato ABC para um objeto com numerador e denominador numéricos.
	* @static
	* @param {string} abcString - A string de duração (ex: "1/4", "/2", "/", "2").
	* @returns {{ numerador: number, denominador: number }} Objeto com os valores processados.
	* @throws {TypeError} Se a string for inválida ou nula.
	*/
	static extrairNumerosDuracaoAbc( abcString ) {
		if ( abcString === null || abcString === undefined ) {
			throw new TypeError( "TempoDuracao.parseAbc: O argumento 'abc' não pode ser nulo ou indefinido." );
		}

		let num;
		let den = 1;

		// Higienização e Validação via método estático já existente
		const limpo = this.validarSintaxeDuracaoAbc( abcString );

		if ( limpo.includes( "/" ) ) {
			const partes = limpo.split( "/" );

			// Regra ABC: Numerador vazio (ex: "/2") assume 1
			num = partes[ 0 ] === "" ? 1 : parseInt( partes[ 0 ], 10 );

			// Regra ABC: Denominador vazio (ex: "2/" ou "/") assume 2
			den = partes[ 1 ] === "" ? 2 : parseInt( partes[ 1 ], 10 );
		} else {
			// Sem barra (ex: "2"), numerador é o valor e denominador é 1
			num = parseInt( limpo, 10 );
		}

		return { numerador: num, denominador: den };
	}
}