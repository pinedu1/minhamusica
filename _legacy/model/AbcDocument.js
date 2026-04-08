import { LinkedList } from './LinkedList.js';

export class AbcDocument {
    constructor() {
        this.title = "";
        this.unitNoteLength = "1/4";
        this.tempo = "";
        this.meter = "";
        this.key = "";

        // Matriz de vozes: { "V:1": { notes: LinkedList, metadata: {} } }
        this.voices = {};
        this.activeVoiceId = "default";

        this.ensureVoice(this.activeVoiceId);
    }

    ensureVoice(voiceId) {
        if (!this.voices[voiceId]) {
            this.voices[voiceId] = {
                metadata: {},
                notes: new LinkedList()
            };
        }
    }

    isPlayable(pitch) {
        // Range do violão (E2 a B5)
        return pitch >= 40 && pitch <= 83;
    }
}