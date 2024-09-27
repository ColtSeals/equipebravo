// Configura o caminho para o arquivo do worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "./js/pdf.worker.min.js";
document.getElementById('btnAnalisarPDF').style.display = 'none';

// Adiciona um ouvinte de evento de entrada no textarea mandadoTexto
var textAreaInicial = document.getElementById('textAreaInicial');
textAreaInicial.addEventListener('input', updateContCaracteres);

// Adiciona um ouvinte de evento de entrada no textarea resultadoFinal
var textAreaResultado = document.getElementById('textAreaResultado');
textAreaResultado.addEventListener('input', updateContCaracteres1);

// Adiciona um ouvinte de evento de clique no botão #limparTextAreaManual
document.addEventListener('DOMContentLoaded', function () {
    const limparTextAreaManualButton = document.getElementById('limparTextAreaManual');
    limparTextAreaManualButton.addEventListener('click', function () {
        // Limpar todos os textareas
        clearTextAreas();

        // Atualizar contagem de caracteres para textAreaInicial
        updateContCaracteres();

        // Atualizar contagem de caracteres para textAreaResultado
        updateContCaracteres1();

        // Desmarcar o checkbox #possuiFotoTextArea
        const checkboxPossuiFotoTextArea = document.getElementById('possuiFotoTextArea');
        checkboxPossuiFotoTextArea.checked = false;

        // Colocar o foco de volta no #textAreaInicial
        document.getElementById('textAreaInicial').focus();
    });
});

function updateFileName() {
    const input = document.getElementById('file-upload');
    const label = document.getElementById('custom-upload');
    const divPossuiFotoPDF = document.getElementById('divPossuiFotoPDF');
    const fileName = input.value.split('\\').pop(); // Get the file name without the path
    label.textContent = fileName !== '' ? fileName : 'Selecionar arquivo';
    document.getElementById('file-name').textContent = fileName !== '' ? ` ${fileName}` : '';

    // Exibe o botão de limpar se um arquivo foi carregado
    const clearButton = document.getElementById('clear-button');
    clearButton.style.display = fileName !== '' ? 'inline-block' : 'none';

    // Oculta o botão "Selecionar arquivo" se um arquivo foi carregado
    label.style.display = fileName !== '' ? 'none' : 'inline-block';

    // Exibe o div Possui Foto se um arquivo foi carregado
    divPossuiFotoPDF.style.display = fileName !== '' ? 'flex' : 'none';

    // Adiciona a classe "selected" ao contêiner de arquivo se um arquivo foi selecionado
    const fileContainer = document.getElementById('file-container');
    fileContainer.classList.toggle('selected', fileName !== '');

    // Exibe o botão de análise apenas se um arquivo foi carregado
    const btnAnalisar = document.getElementById('btnAnalisarPDF');
    btnAnalisar.style.display = fileName !== '' ? 'inline-block' : 'none';

    // Oculta a div #containerInicial se um arquivo PDF for selecionado
    const containerInicial = document.getElementById('containerInicial');
    containerInicial.style.display = fileName !== '' ? 'none' : 'flex';
}

function clearFile() {
    const input = document.getElementById('file-upload');
    const label = document.getElementById('custom-upload');
    label.textContent = 'Selecionar arquivo';
    document.getElementById('file-name').textContent = '';
    input.value = ''; // Clear the file input

    // Limpa o valor do textareaResultado
    document.getElementById('textAreaResultado').value = '';

    // Desmarca o checkbox checkPossuiFotoPDF
    const checkboxPossuiFotoPDF = document.getElementById('checkPossuiFotoPDF');
    checkboxPossuiFotoPDF.checked = false;

    // Oculta o botão de limpar após limpar o arquivo
    const clearButton = document.getElementById('clear-button');
    clearButton.style.display = 'none';

    // Oculta o botão de analisar após limpar o arquivo
    const btnAnalisar = document.getElementById('btnAnalisarPDF');
    btnAnalisar.style.display = 'none';

    // Exibe o botão "Selecionar arquivo" após limpar o arquivo
    label.style.display = 'inline-block';

    // Oculta a div Possui Foto se um arquivo foi carregado
    const divPossuiFotoPDF = document.getElementById('divPossuiFotoPDF');
    if (divPossuiFotoPDF) { // Verifica se a div existe
        divPossuiFotoPDF.style.display = 'none';
    }

    // Remove a classe "selected" do contêiner de arquivo ao limpar o arquivo
    const fileContainer = document.getElementById('file-container');
    fileContainer.classList.remove('selected');

    // Exibe a div #containerInicial após limpar o arquivo
    const containerInicial = document.getElementById('containerInicial');
    containerInicial.style.display = 'flex';

    // Atualizar a contagem de caracteres
    updateContCaracteres1();
}

function analyzePDF() {
    // Limpar os textareas antes de analisar o PDF
    clearTextAreas();

    const fileInput = document.getElementById('file-upload');
    const file = fileInput.files[0];

    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            const typedArray = new Uint8Array(event.target.result);
            pdfjsLib.getDocument(typedArray).promise.then(function (pdf) {
                pdf.getPage(1).then(function (page) {
                    // Extrai o texto diretamente da página do PDF
                    page.getTextContent().then(function (textContent) {
                        const text = textContent.items.map(function (s) {
                            return s.str;
                        }).join(' ');

                        // Verifica se o texto começa com "MANDADO DE PRISÃO"
                        if (text.startsWith("MANDADO DE PRISÃO")) {
                            // Popula a variável resultadoFinalPDF apenas se o texto começar com "MANDADO DE PRISÃO"
                            // Use expressões regulares para extrair as informações
                            const nMandadoMatch = text.match(/N° do Mandado:\s*(\S.{36})/);
                            const dataValidadeMatch = text.match(/Data de validade:\s*(\S.{9})/);
                            const nomeMatch = text.match(/Nome:\s*(.*?)(?=Sexo:)/);
                            const rgMatch = text.match(/RG: (.*?)(\s|$)/);
                            const cpfMatch = text.match(/CPF:\s*([\d.-]+)/);
                            const nProcessoMatch = text.match(/Nº do processo:\s*(\S.{24})/);
                            const tipPenalMatch = text.match(/Tipificação Penal:\s*(.*?)(?=Teor do Documento:)/);
                            const dataExpedicaoMatch = text.match(/Local e Data:.*, (.*?)\./);

                            const nMandado = nMandadoMatch ? nMandadoMatch[1].trim() : 'Não encontrado';
                            const dataValidade = dataValidadeMatch ? dataValidadeMatch[1].trim() : 'Não encontrado';
                            const nome = nomeMatch ? nomeMatch[1].trim() : 'Não encontrado';
                            const rg = rgMatch ? rgMatch[1].trim() : 'Não encontrado';
                            const cpf = cpfMatch ? cpfMatch[1].trim() : 'Não encontrado';
                            const nProcesso = nProcessoMatch ? nProcessoMatch[1].trim() : 'Não encontrado';
                            const tipPenal = tipPenalMatch ? tipPenalMatch[1].trim() : 'Não encontrado';
                            const dataExpedicao = dataExpedicaoMatch ? formatarDataExpedicao(dataExpedicaoMatch[1].trim()) : 'Não encontrado';

                            // Defina o valor da variável possuiFotoPDF com base no estado do checkbox
                            const checkboxPossuiFotoPDF = document.getElementById('checkPossuiFotoPDF');
                            const possuiFotoPDF = checkboxPossuiFotoPDF.checked;

                            // Popula a variável resultadoFinalPDF com os dados extraídos
                            const resultadoFinalPDF = `CONSTA VIA BNMP MANDADO DE PRISÃO CONTRA: ${nome}, - RG: ${rg} - CPF: ${cpf}, - MANDADO: ${nMandado}, - DATA DE VALIDADE: ${dataValidade}, - Nº DO PROCESSO: ${nProcesso}, - TIPIFICAÇÃO PENAL: ${tipPenal}, - EXPEDIDO EM: ${dataExpedicao}, ${possuiFotoPDF ? 'Possui Foto no Detecta' : ''} / COPOM CAPTURA.`;

                            // Exibe o resultado na área de texto
                            const resultadoTextArea = document.getElementById('textAreaResultado');
                            resultadoTextArea.value = resultadoFinalPDF;

                            // Atualizar a contagem de caracteres
                            updateContCaracteres1();

                        } else if (text.startsWith("MANDADO DE INTERNAÇÃO")) {
                            // Extrai as informações conforme as especificações
                            const nMandadoMatch = text.match(/N° do Mandado:\s*(\S.{36})/);
                            const dataValidadeMatch = text.match(/Data de validade:\s*(\S.{9})/);
                            const nomeMatch = text.match(/Nome:\s*(.*?)(?=Sexo:)/);
                            const rgMatch = text.match(/RG: (.*?)(\s|$)/);
                            const cpfMatch = text.match(/CPF:\s*([\d.-]+)/);
                            const nProcessoMatch = text.match(/Nº do processo:\s*(\S.{24})/);
                            const tipPenalMatch = text.match(/Tipificação Penal:\s*(.*?)(?=Teor do Documento:)/);
                            const dataExpedicaoMatch = text.match(/Local e Data:.*, (.*?)\./);

                            const nMandado = nMandadoMatch ? nMandadoMatch[1].trim() : 'Não encontrado';
                            const dataValidade = dataValidadeMatch ? dataValidadeMatch[1].trim() : 'Não encontrado';
                            const nome = nomeMatch ? nomeMatch[1].trim() : 'Não encontrado';
                            const rg = rgMatch ? rgMatch[1].trim() : 'Não encontrado';
                            const cpf = cpfMatch ? cpfMatch[1].trim() : 'Não encontrado';
                            const nProcesso = nProcessoMatch ? nProcessoMatch[1].trim() : 'Não encontrado';
                            const tipPenal = tipPenalMatch ? tipPenalMatch[1].trim() : 'Não encontrado';
                            const dataExpedicao = dataExpedicaoMatch ? formatarDataExpedicao(dataExpedicaoMatch[1].trim()) : 'Não encontrado';

                            // Defina o valor da variável possuiFotoPDF com base no estado do checkbox
                            const checkboxPossuiFotoPDF = document.getElementById('checkPossuiFotoPDF');
                            const possuiFotoPDF = checkboxPossuiFotoPDF.checked;

                            // Popula a variável resultadoFinalPDF com os dados extraídos
                            const resultadoFinalPDF = `CONSTA VIA BNMP MANDADO DE INTERNAÇÃO CONTRA: ${nome}, - RG: ${rg} - CPF: ${cpf}, - MANDADO: ${nMandado}, - DATA DE VALIDADE: ${dataValidade}, - Nº DO PROCESSO: ${nProcesso}, - TIPIFICAÇÃO PENAL: ${tipPenal}, - EXPEDIDO EM: ${dataExpedicao}, ${possuiFotoPDF ? 'Possui Foto no Detecta' : ''} / COPOM CAPTURA.`;

                            // Exibe o resultado na área de texto
                            const resultadoTextArea = document.getElementById('textAreaResultado');
                            resultadoTextArea.value = resultadoFinalPDF;

                            // Atualizar a contagem de caracteres
                            updateContCaracteres1();
                        } else {
                            // Se o texto não começar com "MANDADO DE PRISÃO" ou "MANDADO DE INTERNAÇÃO", exiba uma mensagem de erro
                            const resultadoTextArea = document.getElementById('textAreaResultado');
                            resultadoTextArea.value = 'Não foi possível encontrar um padrão correspondente ao mandado de prisão ou internação. Verifique o arquivo PDF e tente novamente.';

                            // Atualizar a contagem de caracteres
                            updateContCaracteres1();
                        }
                    });
                });
            });
        };
        reader.readAsArrayBuffer(file);
    }
}

function clearTextAreas() {
    document.getElementById('textAreaInicial').value = '';
    document.getElementById('textAreaResultado').value = '';

    // Desmarcar o checkbox #possuiFotoTextArea
    document.getElementById('possuiFotoTextArea').checked = false;
}

function analyzeText() {
    const mandadoTexto = document.getElementById('textAreaInicial').value;

    if (mandadoTexto) {
        if (mandadoTexto.includes("MANDADO DE PRISÃO") || mandadoTexto.includes("MANDADO DE INTERNAÇÃO")) {
            // Use expressões regulares para extrair as informações
            const nMandadoMatch = mandadoTexto.match(/N° do Mandado:\s*([\d.-]+)/);
            const dataValidadeMatch = mandadoTexto.match(/Data de validade:\s*(\S.{9})/);
            const nomeMatch = mandadoTexto.match(/Nome:\s*(.*?)(?=RJI:)/);
            const rgMatch = mandadoTexto.match(/RG: (.*?)(\s|$)/);
            const cpfMatch = mandadoTexto.match(/CPF:\s*([\d.-]+)/);
            const nProcessoMatch = mandadoTexto.match(/Nº do processo:\s*(\S.{24})/);
            const tipPenalMatch = mandadoTexto.match(/Tipificação Penal:\s*([\s\S]*?)(?=Teor do Documento:)/);
            const dataExpedicaoMatch = mandadoTexto.match(/Local e Data:.*, (.*?)\./);

            const nMandado = nMandadoMatch ? nMandadoMatch[1].trim() : 'Não encontrado';
            const dataValidade = dataValidadeMatch ? dataValidadeMatch[1].trim() : 'Não encontrado';
            const nome = nomeMatch ? nomeMatch[1].trim() : 'Não encontrado';
            const rg = rgMatch ? rgMatch[1].trim() : 'Não encontrado';
            const cpf = cpfMatch ? cpfMatch[1].trim() : 'Não encontrado';
            const nProcesso = nProcessoMatch ? nProcessoMatch[1].trim() : 'Não encontrado';
            const tipPenal = tipPenalMatch ? tipPenalMatch[1].trim() : 'Não encontrado';
            const dataExpedicao = dataExpedicaoMatch ? formatarDataExpedicao(dataExpedicaoMatch[1].trim()) : 'Não encontrado';

            // Defina o valor da variável possuiFotoTextArea com base no estado do checkbox
            const checkboxPossuiFotoTextArea = document.getElementById('possuiFotoTextArea');
            const possuiFotoTextArea = checkboxPossuiFotoTextArea.checked;

            // Verifica se é um mandado de internação para excluir a data de validade do resultado final
            if (mandadoTexto.includes("MANDADO DE INTERNAÇÃO")) {
                // Popula a variável resultadoFinal com os dados extraídos excluindo a data de validade
                const resultadoFinal = `CONSTA VIA BNMP MANDADO DE INTERNAÇÃO CONTRA: ${nome}, - RG: ${rg} - CPF: ${cpf}, - MANDADO: ${nMandado}, - Nº DO PROCESSO: ${nProcesso}, - TIPIFICAÇÃO PENAL: ${tipPenal}, - EXPEDIDO EM: ${dataExpedicao}, ${possuiFotoTextArea ? 'Possui Foto no Detecta' : ''} / COPOM CAPTURA.`;

                // Exibe o resultado na área de texto
                const resultadoTextArea = document.getElementById('textAreaResultado');
                resultadoTextArea.value = resultadoFinal;

                // Atualizar a contagem de caracteres
                updateContCaracteres1();
            } else {
                // Popula a variável resultadoFinal com os dados extraídos incluindo a data de validade
                const resultadoFinal = `CONSTA VIA BNMP MANDADO DE PRISÃO CONTRA: ${nome}, - RG: ${rg} - CPF: ${cpf}, - MANDADO: ${nMandado}, - DATA DE VALIDADE: ${dataValidade}, - Nº DO PROCESSO: ${nProcesso}, - TIPIFICAÇÃO PENAL: ${tipPenal}, - EXPEDIDO EM: ${dataExpedicao}, ${possuiFotoTextArea ? 'Possui Foto no Detecta' : ''} / COPOM CAPTURA.`;

                // Exibe o resultado na área de texto
                const resultadoTextArea = document.getElementById('textAreaResultado');
                resultadoTextArea.value = resultadoFinal;

                // Atualizar a contagem de caracteres
                updateContCaracteres1();
            }
        } else {
            // Limpa o textAreaInicial
            document.getElementById('textAreaInicial').value = '';

            // Exibe um alerta informando que o texto não corresponde a um mandado de prisão ou mandado de internação
            alert('O texto não corresponde a um mandado de prisão ou mandado de internação. Por favor, verifique o texto e tente novamente.');

            // Mantém o foco no textAreaInicial
            document.getElementById('textAreaInicial').focus();

            // Atualizar a contagem de caracteres
            updateContCaracteres();
        }
    } else {
        // Colocar o foco de volta no #textAreaInicial
        document.getElementById('textAreaInicial').focus();
        return;
        // Atualizar a contagem de caracteres
        updateContCaracteres1();
    }
}





function formatarDataExpedicao(data) {
    // Formatar a data de expedição para o formato dd/mm/aaaa
    const partes = data.split('/');
    if (partes.length === 3) {
        return `${partes[0].padStart(2, '0')}/${partes[1].padStart(2, '0')}/${partes[2]}`;
    }
    return data;
}

function updateContCaracteres() {
    // Atualizar a contagem de caracteres para o textareaInicial
    const textAreaInicial = document.getElementById('textAreaInicial');
    const contCaracteresInicial = document.getElementById('contCaracteresInicial');
    contCaracteresInicial.textContent = `${textAreaInicial.value.length} caracteres`;
}

function updateContCaracteres1() {
    // Atualizar a contagem de caracteres para o textareaResultado
    const textAreaResultado = document.getElementById('textAreaResultado');
    const contCaracteresResultado = document.getElementById('contCaracteresResultado');
    contCaracteresResultado.textContent = `${textAreaResultado.value.length} caracteres`;
}

function copiarTextoFinal() {
    // Selecionar o texto na área de texto
    const textAreaResultado = document.getElementById('textAreaResultado');
    textAreaResultado.select();

    // Copiar o texto selecionado
    document.execCommand('copy');

    // Remover a seleção após a cópia
    removeSelection();

    // Exibir o aviso flutuante
    exibirAvisoFlutuante();

    // Alerta de que o texto foi copiado
    // alert('O texto foi copiado para a área de transferência.');
}

function exibirAvisoFlutuante() {
    var avisoFlutuante = document.getElementById('avisoFlutuante');
    avisoFlutuante.style.display = 'block';

    // Esconder após 2 segundos
    setTimeout(function () {
        avisoFlutuante.style.display = 'none';
    }, 2000);
}


function removeSelection() {
    if (window.getSelection) {
        window.getSelection().removeAllRanges();
    } else if (document.selection) {
        document.selection.empty();
    }
}