import { TipoBarra } from "@domain/compasso/TipoBarra.js";
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";
import { TempoMetrica } from "@domain/tempo/TempoMetrica.js";
import { Voz } from "@domain/voz/Voz.js";
import { Clave} from "@domain/obra/Clave.js";
import { Compasso } from "@domain/compasso/Compasso.js";
import { vozSchema } from "@schemas/vozSchema.js";

export class VozJson {

	static fromJson(json = {}) {
		if (json instanceof Voz) return json;
		if (json?.id === undefined || json?.id === null) {
			throw new TypeError("Voz.fromJson: Erro na estrutura dos dados: O ID da voz é obrigatório.");
		}
		const resultado = vozSchema.safeParse(json);
		if (!resultado.success) {
			throw new TypeError("Voz.fromJson: Erro na estrutura dos dados: " + JSON.stringify(resultado.error.format(), null, 2));
		}
		const { id, compassos, options } = resultado.data;
		const optionsProcessado = { ...options };
		if (options.unidadeTempo) optionsProcessado.unidadeTempo = TempoDuracao.fromJson(options.unidadeTempo);
		if (options.metrica) optionsProcessado.metrica = TempoMetrica.fromJson(options.metrica);
		if (options.clave) optionsProcessado.clave = Clave.fromJson(options.clave);
		const voz = new Voz(id, [], optionsProcessado);
		const instanciasCompassos = compassos.map(c => {
			if (c.constructor.name === 'Compasso') {
				c.options = c.options || {};
				c.options.voz = voz;
				return c;
			}
			c.options = c.options || {};
			c.options.voz = voz;
			return Compasso.fromJson(c);
		});
		voz.compassos = instanciasCompassos;
		return voz;
	}

	static #collectVoiceHeaders(declaration, contextOptions) {
		const voiceOptions = { ...contextOptions };
		const declarationParts = declaration.split(/\s+/);
		const voiceId = declarationParts[0].substring(2);

		const nameMatch = declaration.match(/name="([^"]+)"/);
		if (nameMatch) voiceOptions.nome = nameMatch[1];

		const synonymMatch = declaration.match(/nm="([^"]+)"/);
		if (synonymMatch) voiceOptions.sinonimo = synonymMatch[1];

		const clefMatch = declaration.match(/clef=([^\s]+)/);
		if (clefMatch) voiceOptions.clave = Clave.fromJson(clefMatch[1]);

		return { voiceId, voiceOptions };
	}

	static #collectCompassos(musicString) {
		const tokens = [':|:', '|:', ':|', '||', '|]', '|'];
		const tokensSetInicio = new Set(['|:']);
		const tokensSetFim = new Set([':|', '|]']);
		const tokenizer = new RegExp(`(${tokens.map(t => t.replace(/\|/g, '\\|')).join('|')})`);

		let parts = musicString.split(tokenizer).filter(p => p);
		const compassos = [];
		let i = 0;

		while (parts.length > 0) {
			let content = '';
			let options = {};
			let barraInicio = null;
			let barraFim = null;
			if (tokenizer.test( parts[0]) ) {
				const part = parts[0];
				barraInicio = getBarType( part );
				content = parts[1];
				parts = parts.slice(2);
			} else {
				content = parts[0];
				parts = parts.slice(1);
			}
			if (tokenizer.test( parts[0]) ) {
				barraFim = getBarType( parts[0] );
				parts = parts.slice(1);
			}
			if (content && content.length > 0) {
				if ( barraInicio === TipoBarra.REPEAT_OPEN ) {
					options.barraInicial = barraInicio;
				}
				if ( barraFim ) {
					options.barraFinal = barraFim;
				}
				options.content = content;
				compassos.push( options );
			}
			if ( parts.length <= 0 ) {
				break;
			}
		}
		const lastCompasso = compassos[compassos.length - 1];
		if ( lastCompasso ) {
			const opt = lastCompasso;
			if ( !opt.barraFinal || (opt.barraFinal === TipoBarra.NONE) || (opt.barraFinal === TipoBarra.STANDARD)) {
				lastCompasso.barraFinal = TipoBarra.FINAL;
			}
		}

		function getBarType(barString) {
			for (const key in TipoBarra) {
				if (TipoBarra[key].abc === barString) return TipoBarra[key];
			}
			return TipoBarra.NONE;
		}

		return compassos.filter(c => c.content.length > 0);
	}

	/**
	 * Exporta a string json da voz.
	 * @param voz
	 * @return {{id: VozJson.#id, compassos: *}}
	 */
	static toJson(voz) {
		const json = {
			id: this.#id,
			compassos: this.#compassos.map(c => c.toJSON())
		};
		const options = {};
		const opt = this.#options;
		if (opt.nome) options.nome = opt.nome;
		if (opt.sinonimo) options.sinonimo = opt.sinonimo;
		if (opt.direcaoHaste && opt.direcaoHaste !== 'auto') options.direcaoHaste = opt.direcaoHaste;
		if (opt.clave) options.clave = opt.clave.toJSON();
		if (opt.stafflines) options.stafflines = opt.stafflines;
		if (opt.middle) options.middle = opt.middle;
		if (opt.quebraDeLinha && opt.quebraDeLinha !== 5) options.quebraDeLinha = opt.quebraDeLinha;
		if (opt.metrica) options.metrica = opt.metrica.toString();
		if (opt.unidadeTempo) options.unidadeTempo = opt.unidadeTempo.toString();
		if (Object.keys(options).length > 0) json.options = options;
		return json;
	}
}