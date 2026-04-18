import { Compasso } from "@domain/compasso/Compasso.js";
import { Obra } from "@domain/obra/Obra.js";
import { TempoMetrica } from "@domain/tempo/TempoMetrica.js";

/**
 * Representa uma camada musical independente (Voz) na obra.
 * Responsável por agrupar compassos e definir propriedades de exibição e playback.
 */
export class Voz {
    #id;
    #options = {};
    #compassos = [];

    constructor(id, compassos = [], options = {}) {
        this.compassos = compassos;
        this.id = id;
        this.#options = {
            obra: null,
            unidadeTempo: null,
            nome: null,
            sinonimo: null,
            direcaoHaste: 'auto',
            clave: null,
            stafflines: null,
            middle: null,
            quebraDeLinha: 4,
            metrica: null,
            ...options
        };
    }


    get obra() { return this.#options.obra; }
    set obra(val) {
        if (val != null && !(val instanceof Obra)) throw new TypeError("Voz: 'obra' deve ser uma instância de Obra.");
        this.#options.obra = val;
    }

    get id() { return this.#id; }
    set id(val) { this.#id = val; }

    get compassos() { return this.#compassos; }
    set compassos(arrayCompassos) {
        if (!Array.isArray(arrayCompassos)) throw new TypeError('Voz: Compassos devem ser fornecidos em um Array.');
        this.#compassos = [];
        arrayCompassos.forEach(c => this.addCompasso(c));
    }

    addCompasso(compasso) {
        if (!(compasso instanceof Compasso)) throw new TypeError('Voz: O objeto compasso adicionado deve ser uma instância de Compasso.');
        compasso.index = this.#compassos.length + 1;
        compasso.options.voz = this;
        this.#compassos.push(compasso);
    }

    getUnidadeTempo() {
        if (this.#options.unidadeTempo) return this.#options.unidadeTempo;
        if (this.#options.obra) {
            const obra = this.#options.obra;
            if (obra instanceof Obra) return obra.getUnidadeTempo();
            if (obra.options.unidadeTempo) return obra.options.unidadeTempo;
        }
        return null;
    }

    get unidadeTempo() { return this.#options.unidadeTempo; }
    set unidadeTempo(val) { this.#options.unidadeTempo = val; }
    getQuebraDeLinha() {
        if (this.#options.obra) {
            const obra = this.#options.obra;
            if (obra instanceof Obra) return obra.options.quebraDeLinha;
            if (obra.options.quebraDeLinha) return obra.options.quebraDeLinha;
        }
        return this.#options.quebraDeLinha;
    }
    getClave() {
        if (this.#options.clave) return this.#options.clave;
        if (this.#options.obra) {
            const obra = this.#options.obra;
            if (obra instanceof Obra) return obra.clave;
            if (obra.options.clave) return obra.options.clave;
        }
        return null;
    }

    get direcaoHaste() { return this.#options.direcaoHaste; }
    set direcaoHaste(val) {
        if (val == null) { this.#options.direcaoHaste = 'auto'; return; }
        if (!['auto', 'up', 'down'].includes(val)) throw new TypeError("Voz: Direção da haste deve ser 'auto', 'up' ou 'down'.");
        this.#options.direcaoHaste = val;
    }

    getMetrica() {
        if (this.#options.metrica) return this.#options.metrica;
        if (this.#options.obra) {
            const obra = this.#options.obra;
            if (obra instanceof Obra) return obra.getMetrica();
            if (obra.options.metrica) return obra.options.metrica;
        }
        return null;
    }

    get metrica() { return this.#options.metrica; }
    set metrica(val) {
        if (val == null) { this.#options.metrica = null; return; }
        if (!(val instanceof TempoMetrica)) throw new TypeError('Voz: TempoMetrica inválido.');
        this.#options.metrica = val;
    }

    get options() { return this.#options; }

}
