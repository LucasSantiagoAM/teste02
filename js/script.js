document.addEventListener("DOMContentLoaded", () => {
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby30S47b_kwp4fIPZ-pR5F-4mViat5wwwoEotXK3JhiDpQGROJ8LaFOsZvMwVKXPSGR9g/exec";

    async function loadMenu() {
        try {
            const response = await fetch(SCRIPT_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const jsonResponse = await response.json();

            if (!jsonResponse.success || !Array.isArray(jsonResponse.data)) {
                throw new Error("Dados inválidos recebidos do Apps Script.");
            }

            const menuData = jsonResponse.data;

            const menuContainer = document.getElementById("menu-container");
            menuContainer.innerHTML = ""; // Limpa o conteúdo existente

            const categories = {};
            menuData.forEach(item => {
                if (!categories[item.Categoria]) {
                    categories[item.Categoria] = [];
                }
                categories[item.Categoria].push(item);
            });

            for (const category in categories) {
                const categoryDiv = document.createElement("div");
                categoryDiv.classList.add("menu-category");
                categoryDiv.innerHTML = `<h2>${category}</h2>`;

                categories[category].forEach(item => {
                    const itemDiv = document.createElement("div");
                    itemDiv.classList.add("menu-item");
                    itemDiv.innerHTML = `
                        <h3>${item["Nome do Item"]}</h3>
                        <p>${item.Descrição}</p>
                        <p><strong>R$ ${item.Preço}</strong></p>
                    `;
                    categoryDiv.appendChild(itemDiv);
                });
                menuContainer.appendChild(categoryDiv);
            }
        } catch (error) {
            console.error("Erro ao carregar o cardápio:", error);
            document.getElementById("menu-container").innerHTML = "<p>Não foi possível carregar o cardápio. Verifique o console para mais detalhes.</p>";
        }
    }

    loadMenu();

    // Atualiza a cada 30 segundos
    setInterval(loadMenu, 30000);
});

