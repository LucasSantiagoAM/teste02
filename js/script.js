document.addEventListener("DOMContentLoaded", () => {
    const SCRIPT_URL = "https://script.google.com/macros/s/AKfycby30S47b_kwp4fIPZ-pR5F-4mViat5wwwoEotXK3JhiDpQGROJ8LaFOsZvMwVKXPSGR9g/exec";
    const WHATSAPP_NUMBER = "5592994991899"; // Substitua pelo número do WhatsApp do restaurante
    
    // Elementos DOM
    const loadingScreen = document.getElementById('loading-screen');
    const menuContainer = document.getElementById('menu-container');
    const emptyState = document.getElementById('empty-state');
    const searchInput = document.getElementById('search-input');
    const statusIndicator = document.getElementById('status-indicator');
    const lastUpdateElement = document.getElementById('last-update');
    const cartCountElement = document.getElementById('cart-count');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartItemsContainer = document.getElementById('cart-items');
    const cartEmpty = document.getElementById('cart-empty');
    const cartFooter = document.getElementById('cart-footer');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartTotal = document.getElementById('cart-total');
    const checkoutModal = document.getElementById('checkout-modal');
    const checkoutOverlay = document.getElementById('checkout-overlay');
    const checkoutForm = document.getElementById('checkout-form');
    const checkoutTotal = document.getElementById('checkout-total');
    
    // Estado da aplicação
    let menuData = [];
    let filteredData = [];
    let cart = [];
    let isLoading = false;
    let lastModified = null;
    
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
            if (price.includes('R$')) return price;
            const numPrice = parseFloat(price.replace(',', '.'));
            if (!isNaN(numPrice)) {
                return `R$ ${numPrice.toFixed(2).replace('.', ',')}`;
            }
        }
        return price || 'Consulte o preço';
    }
    
    // Função para converter preço para número
    function priceToNumber(price) {
        if (typeof price === 'number') return price;
        if (typeof price === 'string') {
            const cleanPrice = price.replace(/[R$\s]/g, '').replace(',', '.');
            const numPrice = parseFloat(cleanPrice);
            return isNaN(numPrice) ? 0 : numPrice;
        }
        return 0;
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
                
                // Imagem do item
                const itemImage = document.createElement('div');
                itemImage.classList.add('item-image');
                
                if (item.Imagem && item.Imagem.trim()) {
                    const img = document.createElement('img');
                    img.src = item.Imagem;
                    img.alt = item["Nome do Item"] || 'Imagem do produto';
                    img.onerror = function() {
                        this.style.display = 'none';
                        itemImage.textContent = '🍽️';
                    };
                    itemImage.appendChild(img);
                } else {
                    itemImage.textContent = getCategoryIcon(item.Categoria);
                }
                
                // Conteúdo do item
                const itemContent = document.createElement('div');
                itemContent.classList.add('item-content');
                
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
                
                const itemActions = document.createElement('div');
                itemActions.classList.add('item-actions');
                
                // Controles de quantidade
                const quantityControls = document.createElement('div');
                quantityControls.classList.add('quantity-controls');
                
                const decreaseBtn = document.createElement('button');
                decreaseBtn.classList.add('quantity-btn');
                decreaseBtn.textContent = '-';
                decreaseBtn.onclick = () => updateQuantity(item, -1);
                
                const quantityDisplay = document.createElement('span');
                quantityDisplay.classList.add('quantity-display');
                quantityDisplay.textContent = '1';
                quantityDisplay.id = `quantity-${item["Nome do Item"]}`;
                
                const increaseBtn = document.createElement('button');
                increaseBtn.classList.add('quantity-btn');
                increaseBtn.textContent = '+';
                increaseBtn.onclick = () => updateQuantity(item, 1);
                
                quantityControls.appendChild(decreaseBtn);
                quantityControls.appendChild(quantityDisplay);
                quantityControls.appendChild(increaseBtn);
                
                // Botão adicionar ao carrinho
                const addToCartBtn = document.createElement('button');
                addToCartBtn.classList.add('add-to-cart-btn');
                addToCartBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="m1 1 4 4 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    Adicionar
                `;
                addToCartBtn.onclick = () => addToCart(item, parseInt(quantityDisplay.textContent));
                
                itemActions.appendChild(quantityControls);
                itemActions.appendChild(addToCartBtn);
                
                itemContent.appendChild(itemHeader);
                itemContent.appendChild(itemDescription);
                itemContent.appendChild(itemActions);
                
                itemDiv.appendChild(itemImage);
                itemDiv.appendChild(itemContent);
                
                itemsGrid.appendChild(itemDiv);
            });
            
            categoryDiv.appendChild(categoryHeader);
            categoryDiv.appendChild(itemsGrid);
            menuContainer.appendChild(categoryDiv);
        });
    }
    
    // Função para atualizar quantidade
    function updateQuantity(item, change) {
        const quantityElement = document.getElementById(`quantity-${item["Nome do Item"]}`);
        if (quantityElement) {
            let currentQuantity = parseInt(quantityElement.textContent);
            currentQuantity = Math.max(1, currentQuantity + change);
            quantityElement.textContent = currentQuantity;
        }
    }
    
    // Função para adicionar ao carrinho
    function addToCart(item, quantity) {
        const existingItem = cart.find(cartItem => cartItem.name === item["Nome do Item"]);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            cart.push({
                name: item["Nome do Item"],
                price: priceToNumber(item.Preço),
                quantity: quantity,
                image: item.Imagem || '',
                category: item.Categoria || 'Outros'
            });
        }
        
        updateCartUI();
        
        // Reset quantity display
        const quantityElement = document.getElementById(`quantity-${item["Nome do Item"]}`);
        if (quantityElement) {
            quantityElement.textContent = '1';
        }
        
        // Feedback visual
        const addBtn = event.target.closest('.add-to-cart-btn');
        if (addBtn) {
            addBtn.style.background = '#059669';
            addBtn.innerHTML = '✓ Adicionado';
            setTimeout(() => {
                addBtn.style.background = '';
                addBtn.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="m1 1 4 4 2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    Adicionar
                `;
            }, 1500);
        }
    }
    
    // Função para atualizar UI do carrinho
    function updateCartUI() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCountElement.textContent = totalItems;
        
        if (cart.length === 0) {
            cartEmpty.style.display = 'block';
            cartFooter.style.display = 'none';
            cartItemsContainer.innerHTML = '';
            return;
        }
        
        cartEmpty.style.display = 'none';
        cartFooter.style.display = 'block';
        
        // Renderizar itens do carrinho
        cartItemsContainer.innerHTML = '';
        cart.forEach((item, index) => {
            const cartItemDiv = document.createElement('div');
            cartItemDiv.classList.add('cart-item');
            
            cartItemDiv.innerHTML = `
                <div class="cart-item-image">
                    ${item.image ? `<img src="${item.image}" alt="${item.name}" onerror="this.style.display='none'; this.parentElement.textContent='🍽️';">` : getCategoryIcon(item.category)}
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatPrice(item.price)}</div>
                    <div class="cart-item-controls">
                        <div class="cart-item-quantity">
                            <button class="quantity-btn" onclick="updateCartItemQuantity(${index}, -1)">-</button>
                            <span class="quantity-display">${item.quantity}</span>
                            <button class="quantity-btn" onclick="updateCartItemQuantity(${index}, 1)">+</button>
                        </div>
                        <button class="cart-item-remove" onclick="removeFromCart(${index})">
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <polyline points="3,6 5,6 21,6"></polyline>
                                <path d="m19,6v14a2,2 0 0,1-2,2H7a2,2 0 0,1-2-2V6m3,0V4a2,2 0 0,1,2-2h4a2,2 0 0,1,2,2v2"></path>
                            </svg>
                        </button>
                    </div>
                </div>
            `;
            
            cartItemsContainer.appendChild(cartItemDiv);
        });
        
        // Calcular totais
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        cartSubtotal.textContent = formatPrice(subtotal);
        cartTotal.textContent = formatPrice(subtotal);
        checkoutTotal.textContent = formatPrice(subtotal);
    }
    
    // Função para atualizar quantidade no carrinho
    window.updateCartItemQuantity = function(index, change) {
        if (cart[index]) {
            cart[index].quantity = Math.max(1, cart[index].quantity + change);
            updateCartUI();
        }
    };
    
    // Função para remover do carrinho
    window.removeFromCart = function(index) {
        cart.splice(index, 1);
        updateCartUI();
    };
    
    // Função para toggle do carrinho
    window.toggleCart = function() {
        cartSidebar.classList.toggle('open');
        cartOverlay.classList.toggle('active');
    };
    
    // Função para abrir checkout
    window.openCheckout = function() {
        if (cart.length === 0) return;
        
        checkoutModal.classList.add('active');
        document.body.style.overflow = 'hidden';
    };
    
    // Função para fechar checkout
    window.closeCheckout = function() {
        checkoutModal.classList.remove('active');
        document.body.style.overflow = '';
    };
    
    // Função para carregar o menu
    async function loadMenu() {
        if (isLoading) return;
        
        isLoading = true;
        statusIndicator.style.color = '#f59e0b';
        
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
            lastModified = jsonResponse.lastModified;
            
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
            statusIndicator.style.color = '#10b981';
            
        } catch (error) {
            console.error("Erro ao carregar o cardápio:", error);
            
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
            statusIndicator.style.color = '#ef4444';
        } finally {
            isLoading = false;
        }
    }
    
    // Função para verificar atualizações
    async function checkForUpdates() {
        if (isLoading) return;
        
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: 'action=checkUpdates'
            });
            
            if (response.ok) {
                const data = await response.json();
                if (data.success && data.lastModified && data.lastModified !== lastModified) {
                    // Há atualizações disponíveis
                    loadMenu();
                }
            }
        } catch (error) {
            console.log('Erro ao verificar atualizações:', error);
        }
    }
    
    // Função para atualizar o menu (chamada pelo botão)
    window.refreshMenu = function() {
        loadMenu();
    };
    
    // Função para gerar mensagem do WhatsApp
    function generateWhatsAppMessage(orderData) {
        let message = "🍽️ *NOVO PEDIDO - CARDÁPIO DIGITAL*\\n\\n";
        
        // Informações do cliente
        message += "👤 *DADOS DO CLIENTE*\\n";
        message += `Nome: ${orderData.customerName}\\n`;
        message += `Telefone: ${orderData.customerPhone}\\n\\n`;
        
        // Endereço
        message += "📍 *ENDEREÇO DE ENTREGA*\\n";
        message += `${orderData.customerAddress}\\n`;
        if (orderData.addressReference) {
            message += `Referência: ${orderData.addressReference}\\n`;
        }
        message += "\\n";
        
        // Itens do pedido
        message += "🛒 *ITENS DO PEDIDO*\\n";
        let total = 0;
        cart.forEach(item => {
            const itemTotal = item.price * item.quantity;
            total += itemTotal;
            message += `• ${item.quantity}x ${item.name}\\n`;
            message += `  ${formatPrice(item.price)} cada = ${formatPrice(itemTotal)}\\n\\n`;
        });
        
        // Total
        message += `💰 *TOTAL: ${formatPrice(total)}*\\n\\n`;
        
        // Forma de pagamento
        message += "💳 *FORMA DE PAGAMENTO*\\n";
        const paymentMethods = {
            'dinheiro': '💵 Dinheiro',
            'pix': '📱 PIX',
            'cartao-debito': '💳 Cartão de Débito',
            'cartao-credito': '💳 Cartão de Crédito'
        };
        message += `${paymentMethods[orderData.paymentMethod] || orderData.paymentMethod}\\n`;
        
        if (orderData.paymentMethod === 'dinheiro' && orderData.changeAmount) {
            message += `Troco para: ${formatPrice(orderData.changeAmount)}\\n`;
        }
        message += "\\n";
        
        // Observações
        if (orderData.orderNotes) {
            message += "📝 *OBSERVAÇÕES*\\n";
            message += `${orderData.orderNotes}\\n\\n`;
        }
        
        message += "⏰ Pedido realizado em: " + new Date().toLocaleString('pt-BR');
        
        return message;
    }
    
    // Event listeners
    searchInput.addEventListener('input', (e) => {
        filterMenu(e.target.value);
    });
    
    searchInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            filterMenu(e.target.value);
        }
    });
    
    // Event listener para forma de pagamento
    document.addEventListener('change', (e) => {
        if (e.target.name === 'paymentMethod') {
            const changeGroup = document.getElementById('change-group');
            if (e.target.value === 'dinheiro') {
                changeGroup.style.display = 'block';
            } else {
                changeGroup.style.display = 'none';
            }
        }
    });
    
    // Event listener para submit do checkout
    checkoutForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (cart.length === 0) {
            alert('Seu carrinho está vazio!');
            return;
        }
        
        const formData = new FormData(checkoutForm);
        const orderData = {
            customerName: formData.get('customerName'),
            customerPhone: formData.get('customerPhone'),
            customerAddress: formData.get('customerAddress'),
            addressReference: formData.get('addressReference'),
            paymentMethod: formData.get('paymentMethod'),
            changeAmount: formData.get('changeAmount'),
            orderNotes: formData.get('orderNotes')
        };
        
        // Validação básica
        if (!orderData.customerName || !orderData.customerPhone || !orderData.customerAddress || !orderData.paymentMethod) {
            alert('Por favor, preencha todos os campos obrigatórios.');
            return;
        }
        
        // Gerar mensagem do WhatsApp
        const message = generateWhatsAppMessage(orderData);
        const whatsappUrl = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
        
        // Abrir WhatsApp
        window.open(whatsappUrl, '_blank');
        
        // Limpar carrinho e fechar modal
        cart = [];
        updateCartUI();
        closeCheckout();
        toggleCart();
        
        // Reset form
        checkoutForm.reset();
        
        alert('Pedido enviado! Você será redirecionado para o WhatsApp.');
    });
    
    // Carregar menu inicial
    loadMenu();
    
    // Verificar atualizações a cada 30 segundos
    setInterval(checkForUpdates, 30000);
    
    // Detectar quando o usuário volta para a aba
    document.addEventListener('visibilitychange', () => {
        if (!document.hidden && !isLoading) {
            setTimeout(checkForUpdates, 1000);
        }
    });
    
    // Suporte a gestos de pull-to-refresh em mobile
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

