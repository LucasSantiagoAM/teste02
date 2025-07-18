document.addEventListener("DOMContentLoaded", () => {
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby30S47b_kwp4fIPZ-pR5F-4mViat5wwwoEotXK3JhiDpQGROJ8LaFOsZvMwVKXPSGR9g/exec";
    
    // Elementos DOM
    const loadingScreen = document.getElementById('loading-screen');
    const menuContainer = document.getElementById('menu-container');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('search-input');
    const statusIndicator = document.getElementById('status-indicator');
    const lastUpdateElement = document.getElementById('last-update');
    
    // Estado da aplicação
    let menuData = [];
    let filteredData = [];
    let isLoading = false;
    
    // Ícones para categorias
    const categoryIcons = {
        'Pizzas': '🍕',
        'Bebidas': '🥤',
        'Sobremesas': '🍰',
        'Entradas': '🥗',
        'Pratos Principais': '🍽️',
        'Lanches': '🍔',
        'Saladas': '🥬',
        'Massas': '🍝',
        'Carnes': '🥩',
        'Peixes': '🐟',
        'Vegetariano': '🌱',
        'Vegano': '🌿',
        'Café': '☕',
        'Sucos': '🧃',
        'Vinhos': '🍷',
        'Cervejas': '🍺',
        'Default': '🍽️'
    };
    
    // Função para obter ícone da categoria
    function getCategoryIcon(category) {
        return categoryIcons[category] || categoryIcons['Default'];
    }
    
    // Função para formatar preço
    function formatPrice(price) {
        if (typeof price === 'number') {
            return `R$ ${price.toFixed(2).replace('.', ',')}`;
        }
        if (typeof price === 'string') {
            // Se já tem R$, retorna como está
            if (price.includes('R$')) return price;
            // Tenta converter para número
            const numPrice = parseFloat(price.replace(',', '.'));
            if (!isNaN(numPrice)) {
                return `R$ ${numPrice.toFixed(2).replace('.', ',')}`;
            }
        }
        return price || 'Consulte o preço';
    }
    
    // Função para normalizar texto para busca
    function normalizeText(text) {
        return text.toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '');
    }
    
    // Função para filtrar menu
    function filterMenu(searchTerm) {
        if (!searchTerm.trim()) {
            filteredData = [...menuData];
        } else {
            const normalizedSearch = normalizeText(searchTerm);
            filteredData = menuData.filter(item => {
                const name = normalizeText(item["Nome do Item"] || '');
                const description = normalizeText(item.Descrição || '');
                const category = normalizeText(item.Categoria || '');
                
                return name.includes(normalizedSearch) || 
                       description.includes(normalizedSearch) || 
                       category.includes(normalizedSearch);
            });
        }
        renderMenu();
    }
    
    // Função para renderizar o menu
    function renderMenu() {
        menuContainer.innerHTML = '';
        
        if (filteredData.length === 0) {
            emptyState.style.display = 'block';
            return;
        }
        
        emptyState.style.display = 'none';
        
        // Agrupar por categoria
        const categories = {};
        filteredData.forEach(item => {
            const category = item.Categoria || 'Outros';
            if (!categories[category]) {
                categories[category] = [];
            }
            categories[category].push(item);
        });
        
        // Renderizar cada categoria
        Object.entries(categories).forEach(([category, items], index) => {
            const categoryDiv = document.createElement('div');
            categoryDiv.classList.add('menu-category');
            categoryDiv.style.animationDelay = `${index * 0.1}s`;
            
            const categoryHeader = document.createElement('div');
            categoryHeader.classList.add('category-header');
            
            const categoryIcon = document.createElement('div');
            categoryIcon.classList.add('category-icon');
            categoryIcon.textContent = getCategoryIcon(category);
            
            const categoryTitle = document.createElement('h2');
            categoryTitle.classList.add('category-title');
            categoryTitle.textContent = category;
            
            const categoryCount = document.createElement('span');
            categoryCount.classList.add('category-count');
            categoryCount.textContent = `${items.length} ${items.length === 1 ? 'item' : 'itens'}`;
            
            categoryHeader.appendChild(categoryIcon);
            categoryHeader.appendChild(categoryTitle);
            categoryHeader.appendChild(categoryCount);
            
            const itemsGrid = document.createElement('div');
            itemsGrid.classList.add('menu-items-grid');
            
            items.forEach((item, itemIndex) => {
                const itemDiv = document.createElement('div');
                itemDiv.classList.add('menu-item');
                itemDiv.style.animationDelay = `${(index * 0.1) + (itemIndex * 0.05)}s`;
                itemDiv.setAttribute('tabindex', '0');
                
                const itemHeader = document.createElement('div');
                itemHeader.classList.add('item-header');
                
                const itemName = document.createElement('h3');
                itemName.classList.add('item-name');
                itemName.textContent = item["Nome do Item"] || 'Item sem nome';
                
                const itemPrice = document.createElement('div');
                itemPrice.classList.add('item-price');
                itemPrice.textContent = formatPrice(item.Preço);
                
                itemHeader.appendChild(itemName);
                itemHeader.appendChild(itemPrice);
                
                const itemDescription = document.createElement('p');
                itemDescription.classList.add('item-description');
                itemDescription.textContent = item.Descrição || 'Sem descrição disponível';
                
                const itemFooter = document.createElement('div');
                itemFooter.classList.add('item-footer');
                
                const availabilityBadge = document.createElement('span');
                availabilityBadge.classList.add('availability-badge');
                availabilityBadge.textContent = 'Disponível';
                
                itemFooter.appendChild(availabilityBadge);
                
                itemDiv.appendChild(itemHeader);
                itemDiv.appendChild(itemDescription);
                itemDiv.appendChild(itemFooter);
                
                // Adicionar evento de clique para acessibilidade
                itemDiv.addEventListener('click', () => {
                    itemDiv.style.transform = 'scale(0.98)';
                    setTimeout(() => {
                        itemDiv.style.transform = '';
                    }, 150);
                });
                
                itemsGrid.appendChild(itemDiv);
            });
            
            categoryDiv.appendChild(categoryHeader);
            categoryDiv.appendChild(itemsGrid);
            menuContainer.appendChild(categoryDiv);
        });
    }
    
    // Função para carregar o menu
    async function loadMenu() {
        if (isLoading) return;
        
        isLoading = true;
        statusIndicator.style.color = '#f59e0b'; // Amarelo para carregando
        
        try {
            const response = await fetch(SCRIPT_URL);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const jsonResponse = await response.json();
            
            if (!jsonResponse.success || !Array.isArray(jsonResponse.data)) {
                throw new Error("Dados inválidos recebidos do Apps Script.");
            }
            
            menuData = jsonResponse.data;
            filteredData = [...menuData];
            
            // Atualizar timestamp
            const now = new Date();
            lastUpdateElement.textContent = `Última atualização: ${now.toLocaleTimeString('pt-BR')}`;
            
            // Esconder loading screen
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
            
            renderMenu();
            statusIndicator.style.color = '#10b981'; // Verde para sucesso
            
        } catch (error) {
            console.error("Erro ao carregar o cardápio:", error);
            
            // Esconder loading screen mesmo com erro
            if (loadingScreen) {
                loadingScreen.classList.add('hidden');
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                }, 500);
            }
            
            menuContainer.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">⚠️</div>
                    <h3>Erro ao carregar o cardápio</h3>
                    <p>Não foi possível carregar o cardápio. Verifique sua conexão e tente novamente.</p>
                    <button onclick="refreshMenu()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: var(--primary-color); color: white; border: none; border-radius: var(--radius-md); cursor: pointer;">
                        Tentar novamente
                    </button>
                </div>
            `;
            statusIndicator.style.color = '#ef4444'; // Vermelho para erro
        } finally {
            isLoading = false;
        }
    }
    
    // Função para atualizar o menu (chamada pelo botão)
    window.refreshMenu = function() {
        loadMenu();
    };
    
    // Event listener para busca
    searchInput.addEventListener('input', (e) => {
        filterMenu(e.target.value);
    });
    
    // Event listener para busca com Enter
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            filterMenu(e.target.value);
        }
    });
    
    // Carregar menu inicial
    loadMenu();
    
    // Atualizar automaticamente a cada 30 segundos
    
    
    // Service Worker para cache (opcional)
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/sw.js')
                .then((registration) => {
                    console.log('SW registered: ', registration);
                })
                .catch((registrationError) => {
                    console.log('SW registration failed: ', registrationError);
                });
        });
    }
    
    // Detectar quando o usuário volta para a aba
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !isLoading) {
            // Recarregar dados quando o usuário volta para a aba
            setTimeout(loadMenu,);
        }
    });
    
    // Adicionar suporte a gestos de pull-to-refresh em mobile
    let startY = 0;
    let currentY = 0;
    let pullDistance = 0;
    const pullThreshold = 100;
    
    document.addEventListener('touchstart', (e) => {
        if (window.scrollY === 0) {
            startY = e.touches[0].clientY;
        }
    });
    
    document.addEventListener('touchmove', (e) => {
        if (window.scrollY === 0 && startY > 0) {
            currentY = e.touches[0].clientY;
            pullDistance = currentY - startY;
            
            if (pullDistance > 0 && pullDistance < pullThreshold * 2) {
                e.preventDefault();
                // Adicionar feedback visual aqui se desejar
            }
        }
    });
    
    document.addEventListener('touchend', () => {
        if (pullDistance > pullThreshold && !isLoading) {
            loadMenu();
        }
        startY = 0;
        currentY = 0;
        pullDistance = 0;
    });
});
