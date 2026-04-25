import { Pausa } from "@domain/nota/Pausa.js";
import { IdFactory } from "@factory/IdFactory.js";
import { Nota } from "@domain/nota/Nota.js";
import { Unissono } from "@domain/nota/Unissono.js";
import { NotaFrequencia } from "@domain/nota/NotaFrequencia.js";
import { Quialtera } from "@domain/nota/Quialtera.js";
import { GrupoElemento } from "@domain/compasso/GrupoElemento.js";
import { Compasso } from "@domain/compasso/Compasso.js";

/**
 * Service: ObjectFactory
 * Centraliza a criação de instâncias de domínio, garantindo ID único e
 * integridade inicial dos objetos.
 */
export class ObjectFactory {
	static set contextoTestes( contexto ) {
		IdFactory.contextoTestes = contexto;
	}
	static get contextoTestes() {
		IdFactory.contextoTestes;
	}
	// ElementoMusical
	/**
	 * @param {number} id - O identificador da instância
	 * @param {import('@domain/tempo/TempoDuracao').TempoDuracao} duracao - Duração da pausa.
	 * @param {Object} [options={}] - Configurações opcionais.
	 */
	static newPausa( duracao, options = {} ) {
		const idPausa = IdFactory.proximoId();
		return new Pausa( idPausa, duracao, options );
	}
	/**
	 * Unidade fundamental da partitura musical.
	 * @param {NotaFrequencia} altura
	 * @param {TempoDuracao} duracao
	 * @param {Object} [options={}] - Propriedades opcionais e ornamentos. Veja: Clase Nota.
	 */
	static newNota(altura, duracao, options = {}) {
		const idNota = IdFactory.proximoId();
		return new Nota( idNota, altura, duracao, options );
	}
	/**
	 * @param {Array<Nota>} notas - Notas que compõem o unissono.
	 * @param {TempoDuracao} duracao - Duração do conjunto.
	 * @param {Object} [options={}] - Atributos e contexto.
	 */
	static newUnissono(notas = [], duracao, options = {}) {
		const idUnissono = IdFactory.proximoId();
		return new Unissono(idUnissono, notas, duracao, options);
	}
	/**
	 * @param {Array<ElementoMusical>} notas - Notas, pausas ou uníssonos que compõem a quiáltera.
	 * @param {TempoDuracao} duracaoOcupada - A duração real que o grupo ocupa no compasso.
	 * @param {Object} [options={}] - Atributos de expressão que afetam o grupo todo.
	 */
	static newQuialtera(notas = [], duracao, options = {}) {
		const idQuialtera = IdFactory.proximoId();
		return new Quialtera(idQuialtera, notas, duracao, options);
	}
	// Compasso
	/**
	 * Construtor do GrupoElemento.
	 * @param {Array<ElementoMusical>} [elements=[]] - Array inicial de elementos musicais.
	 * @param {Object} [options={}] - Configurações para o grupo.
	 * @param {Compasso|null} [options.compasso=null] - Referência ao compasso pai.
	 */
	static newGrupoElemento( elements = [], options = {} ) {
		const idGrupoElemento = IdFactory.proximoId();
		return new GrupoElemento(idGrupoElemento, elements, options);
	}
	/**
	 * USAGE: Construtor do Compasso. Inicializa o conteúdo e valida metadados.
	 * @param {Array<GrupoElemento>} grupos - Matriz de grupos de elementos musicais.
	 * @param {Object} [options={}] - Configurações detalhadas.
	 */
	static newCompasso(grupos = [], options = {}) {
		const idCompasso = IdFactory.proximoId();
		return new Compasso(idCompasso, grupos, options);
	}
}