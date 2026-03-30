import { AbcDocument } from '../models/AbcDocument.js';

export class AbcParser {
    #doc = null;

    parse(content) {
        this.#doc = new AbcDocument();
        const lines = content.split('\n');

        for (let line of lines) {
            line = line.trim();
            if (!line || line.startsWith('%')) continue;

            if (/^[A-Z]:/.test(line)) {
                this.#handleHeader(line);
            } else {
                this.#handleVoices(line);
            }
        }
        return this.#doc;
    }

    #handleHeader(line) {
        const key = line[0];
        const value = line.substring(2).trim();

        if (key === 'V') {
            const voiceId = value.split(' ')[0];
            this.#doc.activeVoiceId = voiceId;
            this.#doc.ensureVoice(voiceId);

            const nameMatch = value.match(/nm="([^"]+)"/);
            if (nameMatch) {
                this.#doc.voices[voiceId].metadata.name = nameMatch[1];
            }
        } else {
            const map = {
                'T': 'title', 'M': 'meter', 'L': 'unitNoteLength', 'K': 'key', 'Q': 'tempo'
            };
            if (map[key]) this.#doc[map[key]] = value;
        }
    }

    #handleVoices(line) {
        // Regex robusta para capturar nota, duração completa (incluindo // e 3/4) e ligadura
        const tokenRegex = /([_ \^ =]?[a-gA-G][,']*)([\d\/\.]*)([\-]?)/g;
        const cleanLine = line.replace(/\|/g, ' ');
        const matches = cleanLine.matchAll(tokenRegex);

        for (const match of matches) {
            const notePart = match[1];
            const durationPart = match[2];
            const tiePart = match[3];

            if (!notePart) continue;

            const pitch = this.#calculateMidi(notePart);
            const duration = this.#calculateDuration(durationPart);

            const currentVoice = this.#doc.voices[this.#doc.activeVoiceId];
            currentVoice.notes.append({
                pitch,
                duration,
                isTie: tiePart === '-',
                playable: this.#doc.isPlayable(pitch),
                raw: match[0]
            });
        }
    }

    #calculateMidi(noteStr) {
        const baseMap = {
            'C': 48, 'D': 50, 'E': 52, 'F': 53, 'G': 55, 'A': 57, 'B': 59,
            'c': 60, 'd': 62, 'e': 64, 'f': 65, 'g': 67, 'a': 69, 'b': 71
        };
        const char = noteStr.match(/[a-gA-G]/)[0];
        let pitch = baseMap[char];
        if (noteStr.includes('^')) pitch += 1;
        if (noteStr.includes('_')) pitch -= 1;
        const shiftDown = (noteStr.match(/,/g) || []).length;
        const shiftUp = (noteStr.match(/'/g) || []).length;
        return pitch - (shiftDown * 12) + (shiftUp * 12);
    }

    #calculateDuration(durStr) {
        if (!durStr) return 1.0;

        // 1. Tratamento de notas dobradas/múltiplas barras (ex: // -> 0.25, /// -> 0.125)
        if (/^\/+$/.test(durStr)) {
            return 1 / Math.pow(2, durStr.length);
        }

        // 2. Tratamento de frações complexas (ex: 3/4) ou implícitas (ex: /2, 3/)
        if (durStr.includes('/')) {
            const parts = durStr.split('/');
            const num = parts[0] === "" ? 1 : parseFloat(parts[0]);

            // Se houver múltiplas barras após um número (ex: 3//)
            const slashCount = (durStr.match(/\//g) || []).length;
            if (parts[1] === "" && slashCount > 1) {
                return num / Math.pow(2, slashCount);
            }

            const den = parts[1] === "" ? 2 : parseFloat(parts[1]);
            return num / den;
        }

        // 3. Multiplicadores simples (ex: A3)
        return parseFloat(durStr);
    }

}