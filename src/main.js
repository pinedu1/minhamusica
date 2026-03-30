import abcjs from "abcjs";
import "abcjs/abcjs-audio.css";
import "./styles/main.scss";

const mzk = `X:1
T:One Silver Dollar
L:1/4
Q:1/4=90
M:6/8
K:none
V:1 nm="Violão" snm="Vln" clef=treble-8
%%MIDI program 24
V:1
A/d/e/ f d/ | c _B F/G/ | A3- | A3 |
A/d/e/ f d/ | c _B F/G/ | A3- | A3 |
a/g/f/ g c'/ | a3 | f/e/d/ f g/ | a3 |
A/d/e/ f d/ | c _B F/G/ | A3- | A3 |
A/d/e/ f d/ | c _B F/G/ | d3- | d3 |
a3/2 g f/ | g3/2 f e/ | e3/2 d3/2- | d3 |
A/d/e/ f d/ | c _B2 | A/d/e/ f d/ | c _B2 |
A/d/e/ f d/ | f d A/^c/ | d3- | d3 |]`;

// Cálculo de 5mm para 96 DPI (~18.9px)
const margin5mm = 5 * 3.7795;

function onEvent(event) {
    if (!event || !event.elements || event.elements.length === 0) return;

    // 1. Destaque Visual com Duração Real
    let durationMs = 0;
    if (event.midiPitches && event.midiPitches.length > 0) {
        durationMs = event.midiPitches[0].duration * 1000;
    }

    event.elements.forEach(group => {
        group.forEach(el => {
            el.classList.add('highlight-note');

            // 2. AUTO-SCROLL: Seguir a nota se ela sair da tela
            // block: 'center' mantém a nota no meio da tela verticalmente
            el.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'nearest' });

            setTimeout(() => {
                el.classList.remove('highlight-note');
            }, durationMs || 200);
        });
    });
}

function resetAll() {
    const allNotes = document.querySelectorAll('.abcjs-note');
    allNotes.forEach(n => n.classList.remove('highlight-note'));
}

// 1. Renderização A4 com Margens de 5mm
const visualObj = abcjs.renderAbc("paper", mzk, {
    responsive: "resize",
    staffwidth: 794 - (margin5mm * 2), // Largura A4 menos as margens
    paddingleft: margin5mm,
    paddingright: margin5mm,
    paddingtop: margin5mm,
    paddingbottom: margin5mm,
    add_classes: true
})[0];

// 2. Inicialização do Áudio com Som de Violão Real
if (abcjs.synth.supportsAudio()) {
    const synthControl = new abcjs.synth.SynthController();

    synthControl.load("#audio-controls", { onEvent, onFinished: resetAll }, {
        displayRestart: true,
        displayPlay: true,
        displayProgress: true,
        displayWarp: true
    });

    const createSynth = new abcjs.synth.CreateSynth();
    createSynth.init({
        visualObj,
        options: {
            // URL essencial para carregar o som de Violão (Program 24)
            //soundFontUrl: "https://paulrosen.github.io/midi-js-soundfonts/abcjs/",
            program: 24
        }
    }).then(() => {
        synthControl.setTune(visualObj, false);
    });
}