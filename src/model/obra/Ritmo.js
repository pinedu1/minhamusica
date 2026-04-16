export class Ritmo {
    #ritmo = null;
    #key = null;
    constructor( key = 'REEL' ) {
        // Garantindo que a chave não seja nula ou indefinida
        if ( key == null || key === undefined ) {
            key = 'REEL';
        }

        // Atribui o objeto com nome e métrica
        this.#ritmo = RitmoAbc[key];

        // Como 'key' já é a string da chave (ex: 'TOADA'), basta salvar diretamente!
        // Fazemos uma verificação simples: se This.#ritmo existe, a chave é válida.
        this.#key = this.#ritmo ? key : null;
    }
    get nome() {
        if ( !this.#ritmo ) return null;
        return this.#ritmo.nome
    }
    get metrica() {
        if ( !this.#ritmo ) return null;
        return this.#ritmo.metrica;
    }
    get key() {
        return this.#key;
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
    static getByNome( nome ) {
        const r = RitmoAbc.getByNome(nome);
        if ( !r ) return null;
        return new Ritmo(r.key);
    }
}

/**
 * Enum para os ritmos (R:) com sugestão de métrica (M:).
 * @readonly
 */
export const RitmoAbc = Object.freeze({
    ABOIO: { nome: "Aboio", metrica: "4/4", key: "ABOIO" },
    ARRASTA_PE: { nome: "Arrasta-pé", metrica: "2/4", key: "ARRASTA_PE" },
    BAIAO: { nome: "Baião", metrica: "2/4", key: "BAIAO" },
    BATUQUE: { nome: "Batuque", metrica: "2/4", key: "BATUQUE" },
    BOLERO: { nome: "Bolero", metrica: "4/4", key: "BOLERO" },
    BUGIO: { nome: "Bugio", metrica: "2/4", key: "BUGIO" },
    BUMBA_MEU_BOI: { nome: "Bumba-meu-boi", metrica: "2/4", key: "BUMBA_MEU_BOI" },
    CALANGO_MINEIRO: { nome: "Calango Mineiro", metrica: "2/4", key: "CALANGO_MINEIRO" },
    CANA_VERDE: { nome: "Cana Verde", metrica: "2/4", key: "CANA_VERDE" },
    CAPOEIRA: { nome: "Capoeira", metrica: "2/4", key: "CAPOEIRA" },
    CARIMBO: { nome: "Carimbó", metrica: "2/4", key: "CARIMBO" },
    CATERETE: { nome: "Cateretê", metrica: "2/4", key: "CATERETE" },
    CATIMBO: { nome: "Catimbó", metrica: "2/4", key: "CATIMBO" },
    CATIRA: { nome: "Catira", metrica: "2/4", key: "CATIRA" },
    CHA_CHA_CHA: { nome: "Cha-cha-cha", metrica: "4/4", key: "CHA_CHA_CHA" },
    CHAMAME: { nome: "Chamamé", metrica: "6/8", key: "CHAMAME" },
    CHIMARRITA: { nome: "Chimarrita", metrica: "2/4", key: "CHIMARRITA" },
    CHORO: { nome: "Choro", metrica: "2/4", key: "CHORO" },
    CHULA: { nome: "Chula", metrica: "2/4", key: "CHULA" },
    CIPO_PRETO: { nome: "Cipó Preto", metrica: "2/4", key: "CIPO_PRETO" },
    CIRANDA: { nome: "Ciranda", metrica: "4/4", key: "CIRANDA" },
    COCO_DE_RODA: { nome: "Coco de Roda", metrica: "2/4", key: "COCO_DE_RODA" },
    CONGADA: { nome: "Congada", metrica: "2/4", key: "CONGADA" },
    CORRIDO: { nome: "Corrido", metrica: "2/4", key: "CORRIDO" },
    CURURU: { nome: "Cururu", metrica: "2/4", key: "CURURU" },
    DOBRADO: { nome: "Dobrado", metrica: "2/2", key: "DOBRADO" },
    EMBOLADA: { nome: "Embolada", metrica: "2/4", key: "EMBOLADA" },
    FANDANGO: { nome: "Fandango", metrica: "3/4", key: "FANDANGO" },
    FLAMENCO: { nome: "Flamenco", metrica: "3/4", key: "FLAMENCO" },
    FORRO: { nome: "Forró", metrica: "2/4", key: "FORRO" },
    FOXTROTE: { nome: "Foxtrote", metrica: "4/4", key: "FOXTROTE" },
    FREVO: { nome: "Frevo", metrica: "2/4", key: "FREVO" },
    GUARANIA: { nome: "Guarânia", metrica: "6/8", key: "GUARANIA" },
    HUAPANGO: { nome: "Huapango", metrica: "6/8", key: "HUAPANGO" },
    JIG: { nome: "Jig", metrica: "6/8", key: "JIG" },
    JONGO: { nome: "Jongo", metrica: "4/4", key: "JONGO" },
    LAMBADA: { nome: "Lambada", metrica: "2/4", key: "LAMBADA" },
    LUNDU: { nome: "Lundu", metrica: "2/4", key: "LUNDU" },
    MAMBO: { nome: "Mambo", metrica: "4/4", key: "MAMBO" },
    MARACATU: { nome: "Maracatu", metrica: "2/4", key: "MARACATU" },
    MARCHA_MILITAR: { nome: "March", metrica: "2/4", key: "MARCHA_MILITAR" },
    MARCHINHA: { nome: "Marchinha", metrica: "2/4", key: "MARCHINHA" },
    MAXIXE: { nome: "Maxixe", metrica: "2/4", key: "MAXIXE" },
    MAZURKA: { nome: "Mazurka", metrica: "3/4", key: "MAZURKA" },
    MERENGUE: { nome: "Merengue", metrica: "2/4", key: "MERENGUE" },
    MILONGA: { nome: "Milonga", metrica: "2/4", key: "MILONGA" },
    MODA_CAMPEIRA: { nome: "Moda Campeira", metrica: "2/4", key: "MODA_CAMPEIRA" },
    MODA_DE_VIOLA: { nome: "Moda de Viola", metrica: "2/4", key: "MODA_DE_VIOLA" },
    MODINHA: { nome: "Modinha", metrica: "3/4", key: "MODINHA" },
    NATIVISMO: { nome: "Nativismo", metrica: "2/4", key: "NATIVISMO" },
    PAU_DE_FITA: { nome: "Pau de Fita", metrica: "2/4", key: "PAU_DE_FITA" },
    POLKA: { nome: "Polka", metrica: "2/4", key: "POLKA" },
    POLKA_PARAGUAIA: { nome: "Polka Paraguaia", metrica: "6/8", key: "POLKA_PARAGUAIA" },
    QUERUMANA: { nome: "Querumana", metrica: "6/8", key: "QUERUMANA" },
    RANCHEIRA: { nome: "Rancheira", metrica: "3/4", key: "RANCHEIRA" },
    RASQUEADO: { nome: "Rasqueado", metrica: "2/4", key: "RASQUEADO" },
    RECORDADO: { nome: "Recordado", metrica: "2/4", key: "RECORDADO" },
    REEL: { nome: "Reel", metrica: "4/4", key: "REEL" },
    REPENTE: { nome: "Repente", metrica: "2/4", key: "REPENTE" },
    RUMBA: { nome: "Rumba", metrica: "4/4", key: "RUMBA" },
    SALSA: { nome: "Salsa", metrica: "4/4", key: "SALSA" },
    SAMBA: { nome: "Samba", metrica: "2/4", key: "SAMBA" },
    SCHOTTISCHE: { nome: "Schottische", metrica: "4/4", key: "SCHOTTISCHE" },
    SERENATA: { nome: "Serenata", metrica: "3/4", key: "SERENATA" },
    TANGO: { nome: "Tango", metrica: "4/4", key: "TANGO" },
    TOADA: { nome: "Toada", metrica: "2/4", key: "TOADA" },
    VANERA: { nome: "Vanera", metrica: "2/4", key: "VANERA" },
    VALSA: { nome: "Valsa", metrica: "3/4", key: "VALSA" },
    VIRA: { nome: "Vira", metrica: "3/4", key: "VIRA" },
    WALTZ: { nome: "Waltz", metrica: "3/4", key: "WALTZ" },
    XAXADO: { nome: "Xaxado", metrica: "2/4", key: "XAXADO" },
    XOTE: { nome: "Xote", metrica: "4/4", key: "XOTE" },
    getByNome: function(nome) {
        return Object.values(this).find(tipo => tipo.nome === nome);
    }
});