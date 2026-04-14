export class Ritmo {
    #ritmo = null;
    constructor( key = 'REEL' ) {
        if ( key == null || key === undefined ) {
            key = 'REEL';
        }
        this.#ritmo = RitmoAbc[ key ];
    }
    get nome() {
        if ( !this.#ritmo ) return null;
        return this.#ritmo.nome
    }
    get metrica() {
        if ( !this.#ritmo ) return null;
        return this.#ritmo.metrica;
    }
    static create( ritmo = 'REEL' ) {
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

/**
 * Enum para os ritmos (R:) com sugestão de métrica (M:).
 * @readonly
 */
export const RitmoAbc = Object.freeze({
    ABOIO: { nome: "Aboio", metrica: "4/4" },
    ARRASTA_PE: { nome: "Arrasta-pé", metrica: "2/4" },
    BAIAO: { nome: "Baião", metrica: "2/4" },
    BATUQUE: { nome: "Batuque", metrica: "2/4" },
    BOLERO: { nome: "Bolero", metrica: "4/4" },
    BUGIO: { nome: "Bugio", metrica: "2/4" },
    BUMBA_MEU_BOI: { nome: "Bumba-meu-boi", metrica: "2/4" },
    CALANGO_MINEIRO: { nome: "Calango Mineiro", metrica: "2/4" },
    CANA_VERDE: { nome: "Cana Verde", metrica: "2/4" },
    CAPOEIRA: { nome: "Capoeira", metrica: "2/4" },
    CARIMBO: { nome: "Carimbó", metrica: "2/4" },
    CATERETE: { nome: "Cateretê", metrica: "2/4" },
    CATIMBO: { nome: "Catimbó", metrica: "2/4" },
    CATIRA: { nome: "Catira", metrica: "2/4" },
    CHA_CHA_CHA: { nome: "Cha-cha-cha", metrica: "4/4" },
    CHAMAME: { nome: "Chamamé", metrica: "6/8" },
    CHIMARRITA: { nome: "Chimarrita", metrica: "2/4" },
    CHORO: { nome: "Choro", metrica: "2/4" },
    CHULA: { nome: "Chula", metrica: "2/4" },
    CIPO_PRETO: { nome: "Cipó Preto", metrica: "2/4" },
    CIRANDA: { nome: "Ciranda", metrica: "4/4" },
    COCO_DE_RODA: { nome: "Coco de Roda", metrica: "2/4" },
    CONGADA: { nome: "Congada", metrica: "2/4" },
    CORRIDO: { nome: "Corrido", metrica: "2/4" },
    CURURU: { nome: "Cururu", metrica: "2/4" },
    DOBRADO: { nome: "Dobrado", metrica: "2/2" },
    EMBOLADA: { nome: "Embolada", metrica: "2/4" },
    FANDANGO: { nome: "Fandango", metrica: "3/4" },
    FLAMENCO: { nome: "Flamenco", metrica: "3/4" },
    FORRO: { nome: "Forró", metrica: "2/4" },
    FOXTROTE: { nome: "Foxtrote", metrica: "4/4" },
    FREVO: { nome: "Frevo", metrica: "2/4" },
    GUARANIA: { nome: "Guarânia", metrica: "6/8" },
    HUAPANGO: { nome: "Huapango", metrica: "6/8" },
    JIG: { nome: "Jig", metrica: "6/8" },
    JONGO: { nome: "Jongo", metrica: "4/4" },
    LAMBADA: { nome: "Lambada", metrica: "2/4" },
    LUNDU: { nome: "Lundu", metrica: "2/4" },
    MAMBO: { nome: "Mambo", metrica: "4/4" },
    MARACATU: { nome: "Maracatu", metrica: "2/4" },
    MARCH: { nome: "March", metrica: "2/4" },
    MARCHINHA: { nome: "Marchinha", metrica: "2/4" },
    MAXIXE: { nome: "Maxixe", metrica: "2/4" },
    MAZURKA: { nome: "Mazurka", metrica: "3/4" },
    MERENGUE: { nome: "Merengue", metrica: "2/4" },
    MILONGA: { nome: "Milonga", metrica: "2/4" },
    MODA_CAMPEIRA: { nome: "Moda Campeira", metrica: "2/4" },
    MODA_DE_VIOLA: { nome: "Moda de Viola", metrica: "2/4" },
    MODINHA: { nome: "Modinha", metrica: "3/4" },
    NATIVISMO: { nome: "Nativismo", metrica: "2/4" },
    PAU_DE_FITA: { nome: "Pau de Fita", metrica: "2/4" },
    POLKA: { nome: "Polka", metrica: "2/4" },
    POLKA_PARAGUAIA: { nome: "Polka Paraguaia", metrica: "6/8" },
    QUERUMANA: { nome: "Querumana", metrica: "6/8" },
    RANCHEIRA: { nome: "Rancheira", metrica: "3/4" },
    RASQUEADO: { nome: "Rasqueado", metrica: "2/4" },
    RECORDADO: { nome: "Recordado", metrica: "2/4" },
    REEL: { nome: "Reel", metrica: "4/4" },
    REPENTE: { nome: "Repente", metrica: "2/4" },
    RUMBA: { nome: "Rumba", metrica: "4/4" },
    SALSA: { nome: "Salsa", metrica: "4/4" },
    SAMBA: { nome: "Samba", metrica: "2/4" },
    SCHOTTISCHE: { nome: "Schottische", metrica: "4/4" },
    SERENATA: { nome: "Serenata", metrica: "3/4" },
    TANGO: { nome: "Tango", metrica: "4/4" },
    TOADA: { nome: "Toada", metrica: "2/4" },
    VANERA: { nome: "Vanera", metrica: "2/4" },
    VIRA: { nome: "Vira", metrica: "3/4" },
    WALTZ: { nome: "Waltz", metrica: "3/4" },
    XAXADO: { nome: "Xaxado", metrica: "2/4" },
    XOTE: { nome: "Xote", metrica: "4/4" }
});