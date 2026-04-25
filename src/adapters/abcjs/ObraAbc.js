import { Obra } from '@domain/obra/Obra.js';
import { Voz } from "@domain/voz/Voz.js";
import { TempoMetrica } from "@domain/tempo/TempoMetrica.js";
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";
import { TempoAndamento } from "@domain/tempo/TempoAndamento.js";
import { Tonalidade } from "@domain/compasso/Tonalidade.js";
import { Clave } from "@domain/obra/Clave.js";
import { Ritmo } from "@domain/obra/Ritmo.js";
import { GrupoInstrumento } from "@domain/obra/GrupoInstrumento.js";
import { ObjectFactory } from "@factory/ObjectFactory.js";

export class ObraAbc {
	/**
	 * USAGE: Gera a notação ABC completa representando a Obra.
	 * @param obra {Obra}
	 * Converte o cabeçalho (Header ABC) com as chaves padrão seguidas do corpo musical das Vozes.
	 * @returns {string} String com formato ABC.
	 */
	static toAbc(obra) {
		let abc = "";

		// Chave X: Reference Number (Obrigatório e deve ser o primeiro)
		abc += `X:${obra.index}\n`;

		// Chave T: Title (Obrigatório, deve ser o segundo)
		const tituloOpt = obra.options.titulo;
		if (tituloOpt) {
			if (Array.isArray(tituloOpt)) {
				tituloOpt.forEach(t => abc += `T:${t}\n`);
			} else {
				abc += `T:${tituloOpt}\n`;
			}
		} else {
			abc += `T:Untitled\n`;
		}

		// --- Ordem sugerida/opcional das outras chaves do cabeçalho ---
		const opt = obra.options;

		// C: Composer
		if (opt.compositor && opt.compositor.length > 0) {
			opt.compositor.forEach(c => abc += `C:${c}\n`);
		}

		// O: Origin
		if (opt.origemGeografica) abc += `O:${opt.origemGeografica}\n`;

		// A: Area
		if (opt.areaGeografica) abc += `A:${opt.areaGeografica}\n`;

		// Diretivas do cabeçalho (Ex: %%textfont)
		if (opt.diretivas && opt.diretivas.length > 0) {
			opt.diretivas.forEach(d => abc += `%%${d}\n`);
		}

		// M: Meter (Time Signature)
		if (opt.metrica) {
			abc += `${opt.metrica.toAbc()}\n`;
		}

		// L: Default note length
		if (opt.unidadeTempo) {
			abc += `${opt.unidadeTempo.toAbc()}\n`;
		}

		// Q: Tempo
		if (opt.tempoAndamento) {
			abc += `${opt.tempoAndamento.toAbc()}\n`;
		}

		// P: Parts
		if (opt.partes) abc += `P:${opt.partes}\n`;

		// R: Rhythm
		if (opt.ritmo) {
			abc += `R:${opt.ritmo.nome}\n`;
		}

		// B: Book
		if (opt.livro && opt.livro.length > 0) {
			opt.livro.forEach(b => abc += `B:${b}\n`);
		}

		// D: Discography
		if (opt.discografia && opt.discografia.length > 0) {
			opt.discografia.forEach(d => abc += `D:${d}\n`);
		}

		// F: File Name
		if (opt.nomeArquivo) abc += `F:${opt.nomeArquivo}\n`;

		// G: Group Instrument
		if (opt.grupoInstrumento) {
			abc += `G:${opt.grupoInstrumento.valor}\n`;
		}

		// H: History
		if (opt.historia && opt.historia.length > 0) {
			opt.historia.forEach(h => abc += `H:${h}\n`);
		}

		// I: Information
		if (opt.informacoes && opt.informacoes.length > 0) {
			opt.informacoes.forEach(i => abc += `I:${i}\n`);
		}

		// S: Source
		if (opt.fonte && opt.fonte.length > 0) {
			opt.fonte.forEach(s => abc += `S:${s}\n`);
		}

		// Z: Transcription note
		if (opt.notaTranscricao) {
			if (Array.isArray(opt.notaTranscricao)) {
				opt.notaTranscricao.forEach(z => abc += `Z:${z}\n`);
			} else {
				abc += `Z:${opt.notaTranscricao}\n`;
			}
		}

		// N: Notes
		if (opt.notas && opt.notas.length > 0) {
			opt.notas.forEach(n => abc += `N:${n}\n`);
		}

		// K: Key (Obrigatório e deve ser o ÚLTIMO campo do cabeçalho)
		// Adiciona a clave na mesma linha da tonalidade se ela existir, padrão ABC
		if (opt.tonalidade && opt.tonalidade.valor) {
			abc += `K:${opt.tonalidade.toAbc()}\n`;
		} else {
			abc += `K:C\n`;
		}

		// --- Corpo da Obra ---
		// V: Vozes e Pautas
		if (obra.vozes && obra.vozes.length > 0) {
			obra.vozes.forEach(v => {
				abc += v.toAbc();
			});
		}

		// W: Words (Letras globais) - Geralmente vêm ao final de tudo no padrão ABC
		if (opt.letra && opt.letra.length > 0) {
			opt.letra.forEach(l => abc += `W:${l}\n`);
		}

		return abc.trim();
	}
	/**
	 * USAGE: Cria uma nova instância de Obra a partir de uma string em notação ABC.
	 * @param {string} abcString - A string completa no formato ABC.
	 * @returns {Obra} Uma nova instância da classe Obra.
	 */
	static fromAbc(abcString) {
		const normalize = (abcString) => {
			return abcString
				.split('\n')
				.map(line => {
					const commentIndex = line.indexOf('%');
					if (line.startsWith('%%')) return line.trim();
					return (commentIndex !== -1 ? line.substring(0, commentIndex) : line).trim();
				})
				.filter(line => line.length > 0)
				.join('\n');
		};
		abcString = normalize(abcString);

		const lines = abcString.split('\n').map(l => l.trim()).filter(l => l);

		const keyIndex = lines.findIndex(l => l.startsWith('K:'));
		if (keyIndex === -1) {
			throw new Error("Obra.parseAbc: Tonalidade (K:) não encontrada na string ABC.");
		}

		const headerLines = lines.slice(0, keyIndex + 1);
		const bodyLines = lines.slice(keyIndex + 1);

		const { index, options } = ObraAbc.#parseHeader(headerLines);

		const firstMusicalLineIndex = bodyLines.findIndex(l =>
			!l.startsWith('%%') && !l.startsWith('P:') && !l.startsWith('W:') && l.match(/[a-zA-Z]/)
		);

		if (firstMusicalLineIndex !== -1 && !bodyLines.some(l => l.startsWith('V:'))) {
			bodyLines.splice(Math.max(0, firstMusicalLineIndex), 0, 'V:1');
		}

		const voiceGroupsMap = new Map();
		let currentVoiceId = null;

		const getNextValidLine = (startIndex) => {
			for (let j = startIndex + 1; j < bodyLines.length; j++) {
				const nextLine = bodyLines[j].trim();
				if (nextLine && !nextLine.startsWith('%')) {
					return nextLine;
				}
			}
			return null;
		};

		for (let i = 0; i < bodyLines.length; i++) {
			const line = bodyLines[i].trim();

			if (!line || line.startsWith('%')) {
				continue;
			}

			if (line.startsWith('W:')) {
				options.letra = options.letra || [];
				options.letra.push(line.substring(2).trim());
			} else if (line.startsWith('V:')) {
				const voiceDeclarationMatch = line.match(/^V:(\S+)(.*)$/);
				if (!voiceDeclarationMatch) {
					console.warn(`Linha V: malformada encontrada: ${line}`);
					continue;
				}
				const voiceId = voiceDeclarationMatch[1];
				const voiceMetadata = voiceDeclarationMatch[2].trim();
				const nextValidLine = getNextValidLine(i);

				const isPureVoiceDeclaration = voiceMetadata === '';
				const nextIsHeaderInstruction = nextValidLine && nextValidLine.match(/^[A-Z]:/);

				if (!isPureVoiceDeclaration || nextIsHeaderInstruction) {
					if (!voiceGroupsMap.has(voiceId)) {
						voiceGroupsMap.set(voiceId, { declaration: line, lines: [] });
					} else {
						voiceGroupsMap.get(voiceId).declaration = line;
					}
					currentVoiceId = voiceId;
				} else {
					if (!voiceGroupsMap.has(voiceId)) {
						voiceGroupsMap.set(voiceId, { declaration: `V:${voiceId}`, lines: [] });
					}
					currentVoiceId = voiceId;
				}
			} else if (currentVoiceId !== null) {
				const currentGroup = voiceGroupsMap.get(currentVoiceId);
				if (currentGroup) {
					currentGroup.lines.push(line);
				}
			}
		}

		const voiceGroups = Array.from(voiceGroupsMap.values());
		const obraParsed = new Obra(index, [], options);
		const vozes = voiceGroups.map(group => Voz.parseAbc(group, { obra: obraParsed }));
		obraParsed.vozes = vozes;

		return obraParsed;
	}


	/**
	 * @private
	 * USAGE: Processa as linhas do cabeçalho da notação ABC.
	 * @param {Array<string>} headerLines - As linhas que compõem o cabeçalho.
	 * @returns {{index: number, options: Object}} - O índice da obra e um objeto de opções.
	 */
	static #parseHeader(headerLines) {
		const options = {
			titulo: [], compositor: [], livro: [], discografia: [], historia: [],
			informacoes: [], notas: [], fonte: [], letra: [], diretivas: []
		};
		let index = 1;

		for (const line of headerLines) {
			if (line.startsWith('X:')) {
				const keyValue = line.split(':');
				if ( Number( keyValue[1] ) ) {
					index = parseInt(line.substring(2).trim(), 10);
				}
			} else if (line.startsWith('T:')) {
				options.titulo.push(line.substring(2).trim());
			} else if (line.startsWith('C:')) {
				options.compositor.push(line.substring(2).trim());
			} else if (line.startsWith('M:')) {
				options.metrica = TempoMetrica.create(line.substring(2).trim());
			} else if (line.startsWith('L:')) {
				options.unidadeTempo = TempoDuracao.create(line.substring(2).trim());
			} else if (line.startsWith('Q:')) {
				const andamento = line.substring(2).trim();
				if (andamento.includes('=')) {
					const [tempo, duracao] = andamento.split('=');
					options.tempoAndamento = TempoAndamento.create({ tempo, duracao });
				}
			} else if (line.startsWith('K:')) {
				const content = line.substring(2).trim();
				const parts = content.split(/\s+/);
				options.tonalidade = Tonalidade.create(parts[0]);
				const clefPart = parts.find(p => p.startsWith('clef='));
				if (clefPart) options.clave = Clave.create(clefPart.substring('clef='.length));
			} else if (line.startsWith('R:')) {
				options.ritmo = Ritmo.getByNome(line.substring(2).trim());
			} else if (line.startsWith('A:')) {
				options.areaGeografica = line.substring(2).trim();
			} else if (line.startsWith('O:')) {
				options.origemGeografica = line.substring(2).trim();
			} else if (line.startsWith('B:')) {
				options.livro.push(line.substring(2).trim());
			} else if (line.startsWith('D:')) {
				options.discografia.push(line.substring(2).trim());
			} else if (line.startsWith('F:')) {
				options.nomeArquivo = line.substring(2).trim();
			} else if (line.startsWith('G:')) {
				options.grupoInstrumento = GrupoInstrumento.getByNome(line.substring(2).trim());
			} else if (line.startsWith('H:')) {
				options.historia.push(line.substring(2).trim());
			} else if (line.startsWith('I:')) {
				options.informacoes.push(line.substring(2).trim());
			} else if (line.startsWith('N:')) {
				options.notas.push(line.substring(2).trim());
			} else if (line.startsWith('P:')) {
				options.partes = line.substring(2).trim();
			} else if (line.startsWith('S:')) {
				options.fonte.push(line.substring(2).trim());
			} else if (line.startsWith('W:')) {
				options.letra.push(line.substring(2).trim());
			} else if (line.startsWith('Z:')) {
				options.notaTranscricao = line.substring(2).trim();
			} else if (line.startsWith('%%')) {
				options.diretivas.push(line.substring(2).trim());
			}
		}

		if (options.titulo.length === 1) options.titulo = options.titulo[0];
		if (options.titulo.length === 0) delete options.titulo;

		// Limpa arrays vazios
		['compositor', 'livro', 'discografia', 'historia', 'informacoes', 'notas', 'fonte', 'letra', 'diretivas'].forEach(key => {
			if (options[key] && options[key].length === 0) delete options[key];
		});

		return { index, options };
	}

}