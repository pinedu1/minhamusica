import { Compasso } from "@domain/compasso/Compasso.js";
import { Voz } from "@domain/voz/Voz.js";
import { ObjectFactory } from "@factory/ObjectFactory.js";

export class VozAbc {
	/**
	 * Exporta a string abcJs da voz.
	 * @param voz
	 * @return {string}
	 */
	static toAbc( voz ) {
		let abc = `V:${voz.id || 1}`;
		if (voz.options.nome) abc += ` name="${voz.options.nome}"`;
		if (voz.options.sinonimo) abc += ` nm="${voz.options.sinonimo}"`;
		if (voz.options.clave instanceof Clave) {
			const clave = voz.options.clave;
			if (clave) abc += ` ${clave.toVoz()}`;
		}
		if (voz.options.direcaoHaste !== 'auto') abc += ` stem=${voz.options.direcaoHaste}`;
		if (voz.options.stafflines) abc += ` stafflines=${voz.options.stafflines}`;
		if (voz.options.middle) abc += ` middle=${voz.options.middle}`;
		abc += "\n";
		abc += `V:${voz.id || 1}\n`;
		if (voz.options.metrica) abc += voz.options.metrica.toCompasso();

		let configQuebraLinha = this.getQuebraDeLinha() || 5;
		if (configQuebraLinha <= 0) configQuebraLinha = 5;

		let compassoCount = 0;
		const qtdeCompassos = voz.compassos.length;
		if (voz.compassos.length > 0) {
			let c = voz.compassos[0];
			if (c.options && !c.options.barraInicial) {
				c.options.barraInicial = TipoBarra.STANDARD;
			}
		}
		const compassosString = voz.compassos.map((compasso, index) => {
			let compassoStr = '';
			compassoStr += compasso.toAbc();

			compassoCount++;
			if ( (index < (qtdeCompassos - 1)) && (compassoCount % configQuebraLinha === 0)) {
				compassoStr += '\n|';
			}
			return compassoStr;
		}).join('').trim();

		abc += compassosString;

		if (!abc.endsWith('|') && !abc.endsWith(':') && !abc.endsWith(']') && !abc.endsWith('\n')) {
			abc += '|';
		}
		abc += "\n";

		const lyrics = voz.compassos
			.filter(compasso => compasso.letra && compasso.letra.length > 0)
			.map(compasso => compasso.letra.join('-'))
			.join(' - ');
		if (lyrics) abc += `w: ${lyrics}\n`;

		return abc;
	}
	static fromAbc(group, contextOptions) {
		const { declaration, lines } = group;
		const { voiceId, voiceOptions } = voz.collectVoiceHeaders(declaration, contextOptions);

		let musicString = lines.map(line => {
			const commentIndex = line.indexOf('%');
			return commentIndex !== -1 ? line.substring(0, commentIndex).trim() : line.trim();
		}).join(' ').trim();
		musicString = musicString.replaceAll('| |', '|').replaceAll('||', '|');
		const compassoTokens = voz.collectCompassos(musicString);

		const compassos = compassoTokens.map(token => {
			const compassoOptions = {
				...voiceOptions,
				barraInicial: token.barraInicial,
				barraFinal: token.barraFinal
			};
			return Compasso.parseAbc(token.content, compassoOptions);
		});

		return new Voz(voiceId, compassos, voiceOptions);
	}

}