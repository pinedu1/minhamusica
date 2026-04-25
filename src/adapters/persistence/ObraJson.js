import { obraSchema } from "@schemas/obraSchema.js";
import { TempoDuracao } from "@domain/tempo/TempoDuracao.js";
import { TempoMetrica } from "@domain/tempo/TempoMetrica.js";
import { TempoAndamento } from "@domain/tempo/TempoAndamento.js";
import { Tonalidade } from "@domain/compasso/Tonalidade.js";
import { Clave } from "@domain/obra/Clave.js";
import { Ritmo } from "@domain/obra/Ritmo.js";
import { GrupoInstrumento } from "@domain/obra/GrupoInstrumento.js";
import { Voz } from "@domain/voz/Voz.js";
import { ObjectFactory } from "@factory/ObjectFactory.js";

export class ObraJson {
	/**
	 * Converte a instância da Obra para um objeto JSON que pode ser usado para recriá-la.
	 * @param {Obra} obra
	 * @returns {Object}
	 */
	static toJson( obra ) {
		const json = {
			index: obra.index,
			vozes: obra.vozes.map(voz => voz.toJSON())
		};

		const options = {};
		const opt = obra.options;

		/* Obj */
		if (opt.unidadeTempo) {
			options.unidadeTempo = opt.unidadeTempo.toString();
		}
		if (opt.metrica) {
			options.metrica = opt.metrica.toString();
		}
		if (opt.tonalidade) {
			options.tonalidade = opt.tonalidade.valor;
		}
		if (opt.clave) {
			if (opt.clave.oitava === 0) {
				options.clave = opt.clave.key;
			} else {
				options.clave = {tipo: opt.clave.tipo, oitava: opt.clave.oitava};
			}
		}
		if (opt.tempoAndamento) {
			options.tempoAndamento = { tempo: opt.tempoAndamento.tempo.toString(), duracao: opt.tempoAndamento.duracao };
		}
		if (opt.ritmo) {
			options.ritmo = opt.ritmo.key;
		}
		if (opt.grupoInstrumento) {
			options.grupoInstrumento = opt.grupoInstrumento.key;
		}
		/* Array */
		if (opt.titulo) {
			options.titulo = opt.titulo;
		}
		if (opt.letra) {
			options.letra = opt.letra;
		}
		if (opt.livro && opt.livro.length > 0) {
			options.livro = opt.livro;
		}
		if (opt.compositor && opt.compositor.length > 0) {
			options.compositor = opt.compositor;
		}
		if (opt.discografia && opt.discografia.length > 0) {
			options.discografia = opt.discografia;
		}
		if (opt.historia && opt.historia.length > 0) {
			options.historia = opt.historia;
		}
		if (opt.informacoes && opt.informacoes.length > 0) {
			options.informacoes = opt.informacoes;
		}
		if (opt.notas && opt.notas.length > 0) {
			options.notas = opt.notas;
		}
		if (opt.fonte && opt.fonte.length > 0) {
			options.fonte = opt.fonte;
		}
		if (opt.diretivas && opt.diretivas.length > 0) {
			options.diretivas = opt.diretivas;
		}
		/* String */
		if (opt.notaTranscricao) {
			options.notaTranscricao = opt.notaTranscricao;
		}
		if (opt.areaGeografica) {
			options.areaGeografica = opt.areaGeografica.toString();
		}
		if (opt.origemGeografica) {
			options.origemGeografica = opt.origemGeografica.toString();
		}
		if (opt.nomeArquivo && opt.nomeArquivo.length > 0) {
			options.nomeArquivo = opt.nomeArquivo;
		}
		if (opt.partes) {
			options.partes = opt.partes;
		}

		if (Object.keys(options).length > 0) {
			json.options = options;
		}

		return json;
	}
	/**
	 * USAGE: Criação estática limpa a partir de dados JSON.
	 * @param {Object} dados
	 * Combina o parse e validação dos schemas e instanciacoes em cascata.
	 */
	static fromJson(dados) {
		if (dados instanceof Obra) return dados;

		// 1. Validação Segura do JSON
		const resultado = obraSchema.safeParse(dados);

		if (!resultado.success) {
			throw new TypeError("Obra.create: Falha na validação do JSON.\n" + resultado.error.message);
		}

		const validado = resultado.data;
		const opt = validado.options || {};

		// 2. Hidratação das instâncias complexas
		const unidadeTempoInstancia = opt.unidadeTempo ? TempoDuracao.create(opt.unidadeTempo) : null;
		const metricaInstancia = opt.metrica ? TempoMetrica.create(opt.metrica) : null;
		const tempoAndamentoInstancia = opt.tempoAndamento ? TempoAndamento.create(opt.tempoAndamento) : null;
		const tonalidadeInstancia = opt.tonalidade ? Tonalidade.create(opt.tonalidade) : null;
		const claveInstancia = opt.clave ? Clave.create(opt.clave) : null;
		const ritmoInstancia = opt.ritmo ? Ritmo.create(opt.ritmo) : null;
		const grupoInstrumentoInstancia = opt.grupoInstrumento ? GrupoInstrumento.create(opt.grupoInstrumento) : null;

		// 3. Hidratação das Vozes
		const vozesInstancias = validado.vozes.map(vozDados => Voz.create(vozDados));

		// 4. Instanciação e ligação
		return new Obra(validado.index, vozesInstancias, {
			// Complexos instanciados
			unidadeTempo: unidadeTempoInstancia,
			metrica: metricaInstancia,
			tempoAndamento: tempoAndamentoInstancia,
			tonalidade: tonalidadeInstancia,
			clave: claveInstancia,
			ritmo: ritmoInstancia,
			grupoInstrumento: grupoInstrumentoInstancia,

			// Primitivos validados (copiados do opt)
			areaGeografica: opt.areaGeografica,
			origemGeografica: opt.origemGeografica,
			livro: opt.livro,
			compositor: opt.compositor,
			discografia: opt.discografia,
			nomeArquivo: opt.nomeArquivo,
			historia: opt.historia,
			informacoes: opt.informacoes,
			notas: opt.notas,
			partes: opt.partes,
			fonte: opt.fonte,
			titulo: opt.titulo,
			letra: opt.letra,
			notaTranscricao: opt.notaTranscricao,
			diretivas: opt.diretivas
		});
	}

}