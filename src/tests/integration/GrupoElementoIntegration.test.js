import { describe, it, expect, beforeEach } from 'vitest';
import { GrupoElementoAbc } from '@abcjs/GrupoElementoAbc.js';
import { GrupoElementoJson } from '@persistence/GrupoElementoJson.js';
import { ObjectFactory } from '@factory/ObjectFactory.js';
import { Compasso } from '@domain/compasso/Compasso.js';
import { TempoDuracao } from '@domain/tempo/TempoDuracao.js';
import { TempoMetrica } from '@domain/tempo/TempoMetrica.js';
import { NotaFrequencia } from '@domain/nota/NotaFrequencia.js';

describe('GrupoElemento Integration (Domain <-> JSON <-> ABCJS)', () => {
	let compassoPadrao;
	let contextOptions;

	beforeEach(() => {
		// Congele a geração de id
		ObjectFactory.contextoTestes = true;

		// Calcule o tempo correto enviando unidadeTempo e metrica em options do GrupoElemento
		compassoPadrao = ObjectFactory.newCompasso([], {
			unidadeTempo: new TempoDuracao(1, 4),
			metrica: new TempoMetrica(4, 4)
		});
		contextOptions = { compasso: compassoPadrao };
	});

	// Helpers de Instanciação usando ObjectFactory
	const criarPausa = (num = 1, den = 4) => ObjectFactory.newPausa(new TempoDuracao(num, den));
	const criarNota = (abc = "C", num = 1, den = 4) => ObjectFactory.newNota(NotaFrequencia.resolverAltura(abc), new TempoDuracao(num, den));
	const criarUnissono = (notasStr = ["C", "E", "G"], num = 1, den = 4) => ObjectFactory.newUnissono(notasStr.map(n => criarNota(n, num, den)), new TempoDuracao(num, den));
	const criarQuialtera = (notasStr = ["C", "D", "E"], num = 1, den = 4) => ObjectFactory.newQuialtera(notasStr.map(n => criarNota(n, num, den)), new TempoDuracao(num, den));
	const criarGrupo = (elementos) => ObjectFactory.newGrupoElemento(elementos, contextOptions);

	/**
	 * Função utilitária que simula o ciclo de vida completo de uma partitura:
	 * Instanciação -> JSON (Banco de Dados) -> Instância -> ABCJS (Tela) -> Instância (Edição ABC)
	 */
	const cicloIntegracao = (grupoOriginal) => {
		// 1. Instância para JSON
		const jsonGerado = GrupoElementoJson.toJson(grupoOriginal);
		
		// 2. JSON para Instância
		const grupoRestauradoJson = GrupoElementoJson.fromJson(jsonGerado);
		// Restaura as referências perdidas na deserialização
		grupoRestauradoJson.compasso = compassoPadrao;
		
		// 3. Instância Restaurada (via JSON) para Notação ABC
		const abcGerado = GrupoElementoAbc.toAbc(grupoRestauradoJson);
		
		// 4. Notação ABC para Nova Instância (Interpretada pelo Lexer)
		const grupoRestauradoAbc = GrupoElementoAbc.fromAbc(abcGerado, contextOptions);
		
		return {
			grupoOriginal,
			jsonGerado,
			grupoRestauradoJson,
			abcGerado,
			grupoRestauradoAbc
		};
	};

	it('1) Ciclo de Integração com 1 pausa', () => {
		const grupo = criarGrupo([criarPausa(1, 4)]);
		const { grupoRestauradoJson, abcGerado, grupoRestauradoAbc } = cicloIntegracao(grupo);
		
		// Verifica a integridade dos dados transitados
		expect(grupoRestauradoJson.elements.length).toBe(1);
		expect(grupoRestauradoJson.elements[0].tipo).toBe('pausa');
		expect(abcGerado).toBe("z");
		
		// Verifica se o Lexer ABC recriou o Domínio perfeitamente
		expect(grupoRestauradoAbc.elements.length).toBe(1);
		expect(grupoRestauradoAbc.elements[0].tipo).toBe('pausa');
		expect(grupoRestauradoAbc.pulsosOcupados).toBe(1);
	});

	it('2) Ciclo de Integração com 1 pausa e 1 nota', () => {
		const grupo = criarGrupo([criarPausa(1, 8), criarNota("C", 1, 8)]);
		const { grupoRestauradoJson, abcGerado, grupoRestauradoAbc } = cicloIntegracao(grupo);
		
		expect(grupoRestauradoJson.elements.length).toBe(2);
		expect(abcGerado).toBe("z/C/"); // Importante: Verifica a aderência literal do ABCJS
		
		expect(grupoRestauradoAbc.elements.length).toBe(2);
		expect(grupoRestauradoAbc.pulsosOcupados).toBe(1); // 0.5 + 0.5 = 1 pulso de 1/4
	});

	it('3) Ciclo de Integração com 1 pausa, 1 nota e 1 unissono', () => {
		const grupo = criarGrupo([
			criarPausa(1, 4), 
			criarNota("C", 1, 4), 
			criarUnissono(["C", "E", "G"], 1, 4)
		]);
		const { grupoRestauradoJson, abcGerado, grupoRestauradoAbc } = cicloIntegracao(grupo);
		
		expect(grupoRestauradoJson.elements.length).toBe(3);
		expect(abcGerado).toBe("zC[CEG]");
		
		expect(grupoRestauradoAbc.elements.length).toBe(3);
		expect(grupoRestauradoAbc.pulsosOcupados).toBe(3);
		expect(grupoRestauradoAbc.elements[2].tipo).toBe('unissono');
	});

	it('4) Ciclo de Integração com 1 pausa, 1 nota, 1 unissono e 1 quialtera', () => {
		const grupo = criarGrupo([
			criarPausa(1, 4), 
			criarNota("C", 1, 4), 
			criarUnissono(["C", "E", "G"], 1, 4), 
			criarQuialtera(["C", "D", "E"], 1, 4)
		]);
		const { grupoRestauradoJson, abcGerado, grupoRestauradoAbc } = cicloIntegracao(grupo);
		
		expect(grupoRestauradoJson.elements.length).toBe(4);
		expect(abcGerado).toBe("zC[CEG](3:1:3CDE");
		
		expect(grupoRestauradoAbc.elements.length).toBe(4);
		expect(grupoRestauradoAbc.pulsosOcupados).toBe(4);
		expect(grupoRestauradoAbc.elements[3].tipo).toBe('quialtera');
	});

	it('5) Ciclo de Integração com 4 notas puras', () => {
		const grupo = criarGrupo([
			criarNota("C", 1, 4), criarNota("D", 1, 4), 
			criarNota("E", 1, 4), criarNota("F", 1, 4)
		]);
		const { grupoRestauradoJson, abcGerado, grupoRestauradoAbc } = cicloIntegracao(grupo);
		
		expect(grupoRestauradoJson.elements.length).toBe(4);
		expect(abcGerado).toBe("CDEF");
		
		expect(grupoRestauradoAbc.elements.length).toBe(4);
		expect(grupoRestauradoAbc.elements.every(e => e.tipo === 'nota')).toBe(true);
		expect(grupoRestauradoAbc.pulsosOcupados).toBe(4); // O total do compasso fechado
	});

	it('6) Ciclo de Integração com 1 pausa e 3 notas mistas', () => {
		const grupo = criarGrupo([
			criarPausa(1, 4), 
			criarNota("C", 1, 4), criarNota("D", 1, 4), criarNota("E", 1, 4)
		]);
		const { grupoRestauradoJson, abcGerado, grupoRestauradoAbc } = cicloIntegracao(grupo);
		
		expect(grupoRestauradoJson.elements.length).toBe(4);
		expect(abcGerado).toBe("zCDE");
		
		expect(grupoRestauradoAbc.elements.length).toBe(4);
		expect(grupoRestauradoAbc.elements[0].tipo).toBe('pausa');
		expect(grupoRestauradoAbc.pulsosOcupados).toBe(4);
	});

	it('7) Ciclo de Integração Avançado (Preservação de Acordes no Pipeline Completo)', () => {
		const grupo = criarGrupo([criarNota("C", 1, 4)]);
		// Adicionamos um acorde intrínseco (Domínio)
		grupo.addAcorde("Cmaj7", 0);

		const { grupoRestauradoJson, abcGerado, grupoRestauradoAbc } = cicloIntegracao(grupo);
		
		// Fase 1: Verifica persistência correta de Acordes no JSON
		expect(grupoRestauradoJson.acordes.length).toBe(1);
		expect(grupoRestauradoJson.acordes[0].texto).toBe("Cmaj7");
		
		// Fase 2: Verifica a renderização exata do Acorde no texto do ABCJS
		expect(abcGerado).toBe('"Cmaj7"C');
		
		// Fase 3: Verifica se o Lexer recuperou o acorde a partir do texto gerado
		expect(grupoRestauradoAbc.elements.length).toBe(1);
	});
});