import "abcjs/abcjs-audio.css";
import abcjs from "abcjs";

const margin5mm = 5 * 3.7795;

// Função privada para limpar destaques
const resetAll = () => {
    const allNotes = document.querySelectorAll('.abcjs-note');
    allNotes.forEach(n => n.classList.remove('highlight-note'));
};

// Função de callback para eventos de nota
const onEvent = (event) => {
    if (!event?.elements?.length) return;

    let durationMs = (event.midiPitches?.[0]?.duration * 1000) || 200;

    event.elements.forEach(group => {
        group.forEach(el => {
            el.classList.add('highlight-note');
            el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });
            setTimeout(() => el.classList.remove('highlight-note'), durationMs);
        });
    });
};

export const setupMusic = async (visualSelector, audioSelector, abcString) => {
    // 1. Renderização Visual com TABLATURA
    const visualObj = abcjs.renderAbc(visualSelector, abcString, {
        responsive: "resize",
        staffwidth: 794 - (margin5mm * 2),
        paddingleft: margin5mm,
        paddingright: margin5mm,
        add_classes: true,
        // Forçamos a renderização da tablatura vinculada à voz
        /*visualTranspose: 0,*/
        tablature: [
            {
                instrument: "guitar",
                label: "Violão"
            }
        ],
        clickListener: function(abcElem, tuneNumber, classes, analysis, drag, mouseEvent) {

            // 1. Verifica primeiro se clicou em um texto anexado (Letra ou Acorde)
            const alvo = mouseEvent.target;

            if (alvo.classList.contains("abcjs-lyric")) {
                // console.log("Clicou na sílaba:", alvo.textContent);
                // console.log("Nota associada a esta sílaba:", abcElem);
                return; // Para a execução aqui
            }

            if (alvo.classList.contains("abcjs-chord")) {
                // console.log("Clicou na acorde:", alvo.textContent);
                return;
            }

            // 2. Se não foi texto, avalia a estrutura musical
            // console.log("Clicou " + abcElem.el_type);
            switch (abcElem.el_type) {
                case "note":
                    // console.log("Clicou na cabeça da nota ou haste!");
                    // console.log("Duração:", abcElem.duration);
                    break;
                case "rest":
                    // console.log("Clicou na Pausa!");
                    // console.log("Duração:", abcElem.duration);
                    break;

                case "key":
                    // console.log("Clicou na Armadura de Clave. Tom atual:", abcElem.root + abcElem.acc);
                    break;

                case "bar":
                    // console.log("Clicou em uma linha de compasso!");
                    break;

                case "clef":
                    // console.log("Clicou na clave:", abcElem.type);
                    break;

                default:
                    // console.log("Clicou em outro elemento:", abcElem.el_type);
            }
        }
/*
        clickListener: (abcElem, tuneNumber, classes, analysis, drag, mouseEvent) => {
            // console.log("Você clicou em um elemento!");
            // console.log("Classes do SVG:", classes);

            // Verifica se é uma nota
            if (abcElem.el_type === "note") {
                // console.log("Duração:", abcElem.duration);
                // console.log("Pitches (Frequências):", abcElem.pitches);
            }

            // Verifica se é uma pausa
            if (abcElem.el_type === "rest") {
                // console.log("Clicou em uma pausa!");
            }
        }
*/
    })[0];

    // 2. Configuração do Áudio
    if (abcjs.synth.supportsAudio()) {
        const synthControl = new abcjs.synth.SynthController();

        synthControl.load(audioSelector, { onEvent, onFinished: resetAll }, {
            displayRestart: true, displayPlay: true, displayProgress: true/*, displayWarp: true*/
        });

        const createSynth = new abcjs.synth.CreateSynth();
        await createSynth.init({
            visualObj,
            options: { program: 24 } // Timbre de Violão (Nylon)
        });

        await synthControl.setTune(visualObj, false);
    }

    return visualObj;
};