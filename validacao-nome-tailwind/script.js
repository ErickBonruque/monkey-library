// seleciona os elementos do DOM
const input = document.getElementById('nomeInput');
const mensagem = document.getElementById('mensagem');

// escuta o evento de digitação
input.addEventListener('input', function () {
    const nome = input.value.trim();

    if (nome.length === 0) {
        // campo vazio, limpa tudo
        mensagem.textContent = '';
        input.classList.remove('border-red-500', 'border-green-500');
        input.classList.add('border-gray-300');
    } else if (nome.length < 3) {
        // nome muito curto
        mensagem.textContent = 'O nome deve ter pelo menos 3 caracteres.';
        mensagem.classList.remove('text-green-600');
        mensagem.classList.add('text-red-600');

        input.classList.remove('border-gray-300', 'border-green-500');
        input.classList.add('border-red-500');
    } else {
        // nome válido
        mensagem.textContent = 'Nome válido!';
        mensagem.classList.remove('text-red-600');
        mensagem.classList.add('text-green-600');

        input.classList.remove('border-gray-300', 'border-red-500');
        input.classList.add('border-green-500');
    }
});
