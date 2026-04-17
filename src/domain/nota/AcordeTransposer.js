export class AcordeTransposer {
    constructor() {
        this.cromaticaSustenidos = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
        this.cromaticaBemois  = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'];

        this.qualidades = {
            '':      { nome: 'Maior', intervalos: [0, 4, 7] },
            'm':     { nome: 'Menor', intervalos: [0, 3, 7] },
            'dim':   { nome: 'Diminuto', intervalos: [0, 3, 6] },
            'aug':   { nome: 'Aumentado', intervalos: [0, 4, 8] },
            '7':     { nome: 'Dominante 7', intervalos: [0, 4, 7, 10] },
            'm7':    { nome: 'Menor 7', intervalos: [0, 3, 7, 10] },
            'maj7':  { nome: 'Maior 7', intervalos: [0, 4, 7, 11] },
            'm7b5':  { nome: 'Meio Diminuto', intervalos: [0, 3, 6, 10] },
            'add9':  { nome: 'Adiciona 9', intervalos: [0, 4, 7, 14] }
            // Pode expandir infinitamente.
            // Nota: Para "C#m7dim" retornar notas, você precisaria adicionar 'm7dim' aqui.
        };
    }

    /**
     * Valida estritamente se a string possui a anatomia de um acorde real
     */
    ehAcordeValido(stringAcorde) {
        if (typeof stringAcorde !== 'string') return false;

        // ^([A-G][#b]?): Raiz de A até G, maiúscula, com opcional # ou b
        // (m|dim|aug|maj|add|sus|b|#|[0-9]|\+|-|°)* : Apenas qualidades musicais conhecidas permitidas
        // (\/[A-G][#b]?)?$ : Baixo invertido opcional
        const regexValidador = /^([A-G][#b]?)(m|dim|aug|maj|add|sus|b|#|[0-9]|\+|-|°)*(\/[A-G][#b]?)?$/;

        return regexValidador.test(stringAcorde);
    }

    /**
     * Divide a String do ABCJS em { raiz: "C#", qualidade: "m7", baixo: "E" }
     */
    analisarAcorde(stringAcorde) {
        // Bloqueia strings inválidas como "Desconhecido", "cm" ou "H" antes do parse
        if (!this.ehAcordeValido(stringAcorde)) return null;

        const partesRegex = stringAcorde.match(/^([A-G][#b]?)(.*?)(\/[A-G][#b]?)?$/);
        if (!partesRegex) return null;

        return {
            raiz: partesRegex[1],
            qualidade: partesRegex[2] || '',
            baixo: partesRegex[3] ? partesRegex[3].replace('/', '') : null
        };
    }

    obterPassosEntre(notaOrigem, notaDestino) {
        const obterIndice = (nota) => Math.max(this.cromaticaSustenidos.indexOf(nota), this.cromaticaBemois.indexOf(nota));
        const indiceOrigem = obterIndice(notaOrigem);
        const indiceDestino = obterIndice(notaDestino);

        return indiceDestino - indiceOrigem;
    }

    transporAcorde(stringAcorde, semitons, preferirBemois = false) {
        const acordeAnalisado = this.analisarAcorde(stringAcorde);
        // Retorna a string intacta caso o ehAcordeValido() tenha rejeitado
        if (!acordeAnalisado) return stringAcorde;

        const escala = preferirBemois ? this.cromaticaBemois : this.cromaticaSustenidos;

        const transporNota = (nota) => {
            let indice = Math.max(this.cromaticaSustenidos.indexOf(nota), this.cromaticaBemois.indexOf(nota));
            let novoIndice = (indice + semitons) % 12;
            if (novoIndice < 0) novoIndice += 12;
            return escala[novoIndice];
        };

        let novoAcorde = transporNota(acordeAnalisado.raiz) + acordeAnalisado.qualidade;
        if (acordeAnalisado.baixo) {
            novoAcorde += '/' + transporNota(acordeAnalisado.baixo);
        }

        return novoAcorde;
    }

    obterNotasAcorde(stringAcorde, preferirBemois = false) {
        const acordeAnalisado = this.analisarAcorde(stringAcorde);
        if (!acordeAnalisado || !this.qualidades[acordeAnalisado.qualidade]) return [];

        const escala = preferirBemois ? this.cromaticaBemois : this.cromaticaSustenidos;
        let indiceRaiz = Math.max(this.cromaticaSustenidos.indexOf(acordeAnalisado.raiz), this.cromaticaBemois.indexOf(acordeAnalisado.raiz));

        return this.qualidades[acordeAnalisado.qualidade].intervalos.map(intervalo => {
            let indiceNota = (indiceRaiz + intervalo) % 12;
            return escala[indiceNota];
        });
    }
}