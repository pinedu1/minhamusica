import html2pdf from 'html2pdf.js';

export const exportarParaPDF = (seletorContainer, nomeArquivo = "partitura.pdf") => {
    const elemento = document.querySelector(seletorContainer);

    const opcoes = {
        margin: [10, 10, 10, 10], // Margens em mm
        filename: nomeArquivo,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: {
            scale: 2, // Aumenta a resolução para impressão nítida
            useCORS: true
        },
        jsPDF: {
            unit: 'mm',
            format: 'a4',
            orientation: 'portrait'
        }
    };

    html2pdf().set(opcoes).from(elemento).save();
};