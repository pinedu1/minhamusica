import { LinkedList } from './LinkedList.js';
import { Prefacio } from "./Prefacio.js";
import { EstruturaTempo } from './EstruturaTempo.js';
import { Duracao } from './Duracao.js';
import { Clave } from './Clave.js';
import { ArmaduraClave } from './ArmaduraClave.js';
import { Instrumento } from './Instrumento.js';
import { TempoBase } from './TempoBase.js';
import { ClaveTipo } from "@domain/obra/ClaveTipo.js";

/**
 * Classe Raiz que representa uma obra musical completa.
 */
export class Musica {
    #titulo;
    #autor;
    #ritmo; 
    #ano;
    #compassos;
    #prefacio = null;

    #configuracoesGlobais = {
        id: 1,
        formula: new EstruturaTempo(4, 4),
        unidadeBase: new EstruturaTempo(1, 8),
        clave: new Clave(ClaveTipo.TREBLE, 1),
        armadura: new ArmaduraClave('C'),
        instrumento: Instrumento.VIOLAO_NYLON,
        ritmoContexto: null,
        bpm: null
    };

    constructor(titulo = "Sem Título", autor = "Anônimo", ritmo = "Livre") {
        this.#titulo = titulo;
        this.#autor = autor;
        this.#ritmo = ritmo;
        this.#compassos = new LinkedList();
        this.#ano = new Date().getFullYear();
        this.#atualizarContextoRitmico();
    }

    #atualizarContextoRitmico() {
        const { formula, unidadeBase } = this.#configuracoesGlobais;
        this.#configuracoesGlobais.ritmoContexto = new Duracao(formula, unidadeBase);
        this.#configuracoesGlobais.bpm = new TempoBase(120, this.#configuracoesGlobais.ritmoContexto.SEMINIMA);
    }
    get formula() {
        this.#configuracoesGlobais.formula
    }
    get unidadeBase() {
        this.#configuracoesGlobais.unidadeBase
    }
    /**
     * USAGE: Gera o ABC completo. Passa a unidadeBase global como fallback para os compassos.
     * @returns {string}
     */
    toAbc() {
        const global = this.#configuracoesGlobais;

        let abc = `X:${global.id}\n`;
        if (this.#titulo) abc += `T:${this.#titulo}\n`;
        if (this.#autor) abc += `C:${this.#autor}\n`;
        
        if (this.#prefacio) abc += this.#prefacio.toAbc();

        // Cabeçalho Global
        abc += `M:${global.formula.quantidade}/${global.formula.unidadeTempo}\n`;
        abc += `L:${global.unidadeBase.quantidade}/${global.unidadeBase.unidadeTempo}\n`;
        abc += global.bpm.toAbc();

        abc += global.instrumento.toAbcVoice(global.clave);
        abc += global.instrumento.toAbcMidi();
        abc += global.armadura.toAbc();

        abc += `V:1\n`;
        
        // --- LOOP DE COMPASSOS COM INJEÇÃO DE CONTEXTO ---
        for (const compasso of this.#compassos) {
            // Passamos a unidadeBase global para que as notas saibam como se renderizar
            // caso o compasso local não tenha uma mudança de L: própria.
            abc += compasso.toAbc({
                formula: global.formula,
                unidadeBase: global.unidadeBase
            });
        }

        return abc;
    }

    // --- Getters & Setters ---
    get titulo() { return this.#titulo; }
    get autor() { return this.#autor; }
    get compassos() { return this.#compassos; }
    get ritmoContexto() { return this.#configuracoesGlobais.ritmoContexto; }

    setFormulaGlobal(n, d) {
        this.#configuracoesGlobais.formula = new EstruturaTempo(n, d);
        this.#atualizarContextoRitmico();
    }

    setUnidadeBaseGlobal(n, d) {
        this.#configuracoesGlobais.unidadeBase = new EstruturaTempo(n, d);
        this.#atualizarContextoRitmico();
    }

    compassoAppend(compasso) {
        compasso.indice = this.#compassos.length;
        this.#compassos.append(compasso);
        return compasso;
    }

    *[Symbol.iterator]() {
        yield* this.#compassos;
    }
}
