// VARIABLES

const cartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const clearCartBtn = document.querySelector('.clear-cart');
const cartDOM = document.querySelector('.cart');
const cartOverlay = document.querySelector('.cart-overlay');
const cartItems = document.querySelector('.cart-items');
const cartTotal = document.querySelector('.cart-total');
const cartContent = document.querySelector('.cart-content');
const productsDOM = document.querySelector('.products-center');

// CART
let cart = [];

// BUTTONS
let buttonsDOM = [];

// GETTING THE PRODUCTS
class Products {
  getProducts = async () => {
    try {
      let result = await fetch('products.json');
      let data = await result.json();
      let products = data.items;
      products = products.map((item) => {
        const { title, price } = item.fields;
        const { id } = item.sys;
        const image = item.fields.image.fields.file.url;
        return { title, price, id, image };
      });
      return products;
    } catch (error) {
      console.error(error);
    }
  };
}

// DISPLAY PRODUCTS
class UI {
  displayProducts = (products) => {
    let result = '';
    products.forEach((product) => {
      result += `
        <article class="product">
          <div class="img-container">
            <img
              src=${product.image}
              alt=${product.title}
              srcset=""
              class="product-img"
            />
            <button class="bag-btn" data-id=${product.id}>
              <i class="fas fa-shopping-cart"></i>
                add to cart
            </button>
          </div>
          <h3>${product.title}</h3>
          <h4>${product.price}</h4>
        </article>
      `;
    });
    productsDOM.innerHTML = result;
  };

  getBagButtons = () => {
    const buttons = [...document.querySelectorAll('.bag-btn')];
    buttonsDOM = buttons;
    buttons.forEach((button) => {
      let id = button.dataset.id;
      let inCart = cart.find((item) => item.id === id);
      if (inCart) {
        button.innerText = 'In Cart';
        button.disabled = true;
      }
      button.addEventListener('click', (e) => {
        e.target.innerText = 'In Cart';
        e.target.disabled = true;

        // GET PRODUCT, ADD TO CART, SAVE TO LOCALSTORAGE, SET CART VALUES, DISPLAY CART ITEM, OPEN CART OVERLAY
        let cartItem = { ...Storage.getProduct(id), amount: 1 };

        cart = [...cart, cartItem];

        Storage.saveCart(cart);

        this.setCartValues(cart);

        this.addCartItem(cartItem);

        this.showCart();
      });
    });
  };

  // SETS $TOTAL AND TOTAL QUANTITY OF ITEMS IN CART
  setCartValues = (cart) => {
    let tempTotal = 0;
    let itemsTotal = 0;
    cart.map((item) => {
      tempTotal += item.price * item.amount;
      itemsTotal += item.amount;
    });
    cartTotal.innerText = parseFloat(tempTotal.toFixed(2));
    cartItems.innerText = itemsTotal;
    console.log(cartTotal, cartItems);
  };

  addCartItem = (item) => {
    const div = document.createElement('div');
    div.classList.add('cart-item');
    div.innerHTML = `
      <img src=${item.image} alt=${item.id} srcset="" />
      <div>
        <h4>${item.title}</h4>
        <h5>$${item.price}</h5>
        <span class="remove-item" data-id=${item.id}>remove</span>
      </div>
      <div>
        <i class="fas fa-chevron-up" data-id=${item.id}></i>
        <p class="item-amount" >${item.amount}</p>
        <i class="fas fa-chevron-down" data-id=${item.id}></i>
      </div>`;
    cartContent.prepend(div);
  };

  showCart = () => {
    cartOverlay.classList.add('transparentBcg');
    cartDOM.classList.add('showCart');
  };

  hideCart = () => {
    cartOverlay.classList.remove('transparentBcg');
    cartDOM.classList.remove('showCart');
  };

  populate = (cart) => {
    cart.forEach((item) => {
      this.addCartItem(item);
    });
  };

  setupApp = () => {
    cart = Storage.getCart();
    this.setCartValues(cart);
    this.populate(cart);
    closeCartBtn.addEventListener('click', (e) => this.hideCart());
    cartDOM.addEventListener('click', (e) => e.stopPropagation());
    cartOverlay.addEventListener('click', (e) => this.hideCart());
    cartBtn.addEventListener('click', (e) => this.showCart());
  };

  cartLogic = () => {
    clearCartBtn.addEventListener('click', (e) => this.clearCart());

    cartContent.addEventListener('click', (e) => {
      if (e.target.classList.contains('remove-item')) {
        this.removeItem(e.target.dataset.id);
        cartContent.removeChild(e.target.parentElement.parentElement);
      }
      if (e.target.classList.contains('fa-chevron-up')) {
        let tempItem = cart.find((item) => item.id === e.target.dataset.id);
        tempItem.amount += 1;
        Storage.saveCart(cart);
        this.setCartValues(cart);
        e.target.nextSibling.nextSibling.innerHTML = `<p class="item-amount">${tempItem.amount}</p>`;
      }
      if (e.target.classList.contains('fa-chevron-down')) {
        let tempItem = cart.find((item) => item.id === e.target.dataset.id);
        if (tempItem.amount > 1) {
          tempItem.amount -= 1;
          Storage.saveCart(cart);
          this.setCartValues(cart);
          e.target.previousSibling.previousSibling.innerHTML = `<p class="item-amount">${tempItem.amount}</p>`;
        } else {
          this.removeItem(e.target.dataset.id);
          cartContent.removeChild(e.target.parentElement.parentElement);
        }
      }
    });
  };

  clearCart = () => {
    let cartItems = cart.map((item) => item.id);
    cartItems.forEach((id) => this.removeItem(id));
    while (cartContent.children.length > 1) {
      cartContent.removeChild(cartContent.children[0]);
    }
    this.hideCart();
  };

  removeItem = (id) => {
    cart = cart.filter((item) => item.id !== id);
    this.setCartValues(cart);
    Storage.saveCart(cart);
    let button = this.getSingleButton(id);
    button.disabled = false;
    button.innerHTML = `<i class="fas fa-shopping-cart"></i>add to cart`;
  };

  getSingleButton = (id) => {
    return buttonsDOM.find((button) => button.dataset.id === id);
  };
}

// LOCAL STORAGE
class Storage {
  static saveProducts = (products) => {
    localStorage.setItem('products', JSON.stringify(products));
  };

  static getProduct = (id) => {
    let products = JSON.parse(localStorage.getItem('products'));
    return products.find((product) => product.id === id);
  };

  static saveCart = (cartItems) => {
    localStorage.setItem('cart', JSON.stringify(cartItems));
  };

  static getCart = () => {
    return localStorage.getItem('cart')
      ? JSON.parse(localStorage.getItem('cart'))
      : [];
  };
}

document.addEventListener('DOMContentLoaded', () => {
  const ui = new UI();
  const products = new Products();

  ui.setupApp();

  // GET AND DISPLAY PRODCUTS
  products
    .getProducts()
    .then((products) => {
      ui.displayProducts(products);
      Storage.saveProducts(products);
    })
    .then(() => {
      ui.getBagButtons();
      ui.cartLogic();
    });
});
