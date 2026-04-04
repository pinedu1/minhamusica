import { mzk } from "./data/score.js";
import { setupMusic } from "./services/musicEngine.js";
import { exportarParaPDF } from "./services/print.js";
import "./styles/main.scss";

const initApp = async () => {
    console.log("Iniciando interface...");

    try {
        // Inicializa o ABCJS (Desenho + Áudio)
        // Passamos os IDs dos containers definidos no seu HTML
        const visualObj = await setupMusic("paper", "#audio-controls", mzk);

        // Após o ABCJS renderizar, o SVG existirá no DOM.
        // Agora podemos configurar seus cliques customizados:
        const svgElement = document.querySelector('#paper svg');

        if (svgElement) {
            svgElement.addEventListener('click', (e) => {
                const rect = svgElement.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                // Exemplo de desenho manual sobre o SVG da partitura
                const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
                circle.setAttribute("cx", x);
                circle.setAttribute("cy", y);
                circle.setAttribute("r", "5");
                circle.setAttribute("fill", "red");
                svgElement.appendChild(circle);
            });
        }

    } catch (error) {
        console.error("Falha ao carregar a música:", error);
    }
};

// No ES6 moderno com Vite, você pode usar apenas:
document.addEventListener('DOMContentLoaded', initApp);