const sandbox_api_key = 'pk_29859590fc235c9fd3cb841f6e406f5af26d5129645d3'
const commerce = new Commerce(sandbox_api_key, true)
// Data 
const Data = {
  products: [],
  cart: {
    test: null,
  },
  cart_id: null,
  category: [],
  categoryId: null,
  chekoutToken: null
}


const urlParams = new URLSearchParams(window.location.search);
const categoryId = urlParams.get('category');
console.log(categoryId);
Data.categoryId = categoryId;


// fetch product
const fetchProducts = () => {
  Data.products = [];
  const url = new URL(
    "https://api.chec.io/v1/products"
  );

  let headers = {
    "X-Authorization": sandbox_api_key,
    "Accept": "application/json",
    "Content-Type": "application/json",
  };
  fetch(url, {
    method: "GET",
    headers: headers,
  }).then(response => response.json())
    .then(json => {
      // console.log(json.data);
      Data.products = json.data;

      if (Data.categoryId) {
        Data.products = Data.products.filter(product => {
          return product.categories[0].id == Data.categoryId;
        })
      }

      console.log(Data.products)

      Data.products.forEach((product) => {
        displayProduct(product)
      })
    });
}
//--------------------Category Product Function---------------------
const Category_prodcut = () => {
  Data.products.forEach((curr, index) => {
    let categoryKey = curr.categories[0].id;
    if (categoryKey && !Data.category_Product[categoryKey]) {
      Data.category_Product[categoryKey] = []
    }
    Data.category_Product[categoryKey].push({ ...curr });
  })
  console.log(Data.category_Product)
}

// Display product
const displayProduct = (product) => {
  console.log(product)
  const randomNumber = Math.random();
  const html = `<div class="card shadow-2-strong">
    <div class="bg-image hover-overlay ripple" data-mdb-ripple-color="light">
      <img
        src="${product.media.source}"
        class="img-fluid" />
      <a href="#!">
        <div class="mask" style="background-color: rgba(251, 251, 251, 0.15);"></div>
      </a>
    </div>
    <div class="card-body">
      <h5 class="card-title">${product.name}</h5>
      <a class="Detail-btn" data-mdb-toggle="collapse" href="#collapseExample_${product.id}" role="button" aria-expanded="false"
        aria-controls="collapseExample">
        <h6 class = "detailText">Detail</h6>   
      </a>
      <!-- Collapsed content -->
      <div class="collapse mt-3" id="collapseExample_${product.id}">
            ${product.description}
          </div>
      <!-- <a href="#!" class="btn btn-primary addToCart">Add to Cart</a> -->
      <div class="d-flex justify-content-between align-items-center">
        <div class="test">
          <a href="#!" type="button" class="card-link-secondary small text-uppercase mr-3">
            <i class="fa fa-shopping-cart fa-2x cart-icon add_to_cart" id="${product.id}" aria-hidden="true" onclick = add_to_cart(${product.id})></i>
        </div>
        <p class="mb-0 price"><span>${product.price.formatted_with_symbol}</span></p class="mb-0">
      </div>

    </div>
  </div>
    `
  document.querySelector('.products-card').insertAdjacentHTML('beforeend', html)

};

const urlparams = new URLSearchParams(window.location.search);
const cartId = urlParams.get('cart');
console.log(cartId);
Data.cart_id = cartId;



const fetchCart = (user) => {
  db.collection('users').doc(user.uid).collection('cart').get().then((querySnapshot) => {
    let getCart;
    querySnapshot.forEach((doc) => {
      getCart = doc.data();
      if (getCart) {
        getCart.cart.line_items.forEach((singleCart, index) => {
          displayCart(singleCart)

        })
        displayCartTotal(getCart)
      }
    })
  })
}

const displayCartTotal = (getCart) => {
  if (getCart) {
    console.log(getCart.cart.subtotal.formatted_with_symbol)
    let html = `
    <h3 class="Cart_total_price_heading">Total:</h3>
      <h3 class="cart_total_price">${getCart.cart.subtotal.formatted_with_symbol}</h3>
    `
    document.querySelector('.cart_total').insertAdjacentHTML('beforeend', html);
  }
  else {
    let html = `
    <h3 class="Cart_total_price_heading">Total:</h3>
      <h3 class="cart_total_price">$ 0</h3>
    `
    document.querySelector('.cart_total').insertAdjacentHTML('beforeend', html);
  }
}
auth.onAuthStateChanged((user) => {
  if (user) {
    db.collection('users').doc(user.uid).collection('cart').get().then((querySnapshot) => {
      querySnapshot.forEach((doc) => {
        let getCart = doc.data();
        if (getCart) {
          document.querySelector('.emptyCart').style.display = 'block';
          document.querySelector('.checkoutBtn').style.display = 'block';
          document.querySelector('.horizontal_line').style.display = "block";
          document.querySelector('.emptyCart').addEventListener('click', () => {
            console.log('EMPTY CART BUTTON CLICKED')
            emptyCart(getCart.cart.id, user)
          })
          document.querySelector('.checkoutBtn').addEventListener('click', () =>{
            console.log('checkout btn clicked')
            captureOrder(Data.chekoutToken)
          })
          const url = new URLSearchParams(window.location.search);
          const blank_url = url.get('cart');
          if (!blank_url) {
            document.querySelector('.emptyCart').style.display = 'none';
            document.querySelector('.checkoutBtn').style.display = 'none';
            document.querySelector('.horizontal_line').style.display = "none"
          }
        }
      })
    })
  }
})

const captureOrder = (checkoutToken) =>{
  console.log(checkoutToken)
  document.querySelector('.alert').style.display = 'block'
  setTimeout(() =>{
    document.querySelector('.alert').style.display = 'none';
  },2000)
}

const emptyCart = (cartId, user) => {
  const url = new URL(
    `https://api.chec.io/v1/carts/${cartId}/items`
  );

  let headers = {
    "X-Authorization": sandbox_api_key,
    "Accept": "application/json",
    "Content-Type": "application/json",
  };

  fetch(url, {
    method: "DELETE",
    headers: headers,
  })
    .then(response => response.json())
    .then(json => {
      console.log(json.cart)
      const cart = json.cart;
      db.collection('users').doc(user.uid).collection('cart').doc(cart.id).set({
        cart: cart
      }).then(() => {
        db.collection('users').doc(user.uid).collection('cart').doc(cart.id).get().then((doc) => {
          console.log('empty cart', doc.data())
          displayCart(null);
        })
      })
    });
}

// DISPLAY CART
const displayCart = (cart) => {
  console.log(cart)
  if (cart) {
    const html = `
    <div class="item-list shadow-1-strong">
             <div class="image">
                 <img src="${cart.media.source}" height="100px" width="100px" alt="">
             </div>
             <div class="title_desc">
                 <h3 class="cproduct_title">${cart.name}</h3>
             <!-- <p class="cProduct_desc">Lorem ipsum, dolor sit amet consectetur adipisicing elit. Voluptas quod sunt adipisci. Consequuntur eum, perspiciatis alias officia a voluptate enim error, corrupti, minus sed accusantium non in esse odit veniam!</p> -->
             </div>
             
             <div class="vertical_line"></div>
             <h4 class="cProduct_price">${cart.price.formatted_with_symbol}</h4>
             
         </div>
         
    `
    document.querySelector('.container').insertAdjacentHTML('beforeend', html);
  }
  else {
    location.reload(true);
  }


}

//------------------fetch category-----------------------
const fetchCategories = () => {
  Data.category = [];
  const url = new URL(
    "https://api.chec.io/v1/categories"
  );

  let headers = {
    "X-Authorization": sandbox_api_key,
    "Accept": "application/json",
    "Content-Type": "application/json",
  };

  fetch(url, {
    method: "GET",
    headers: headers,
  })
    .then(response => response.json())
    .then((json) => {
      Data.category = json.data
      Data.category.forEach((category) => {
        displayCategoryNav(category)

      })
    });
};

// ---------------Navbar------------------
const displayCategoryNav = (category) => {
  console.log(category)
  const html = `<li class="nav-item">
  <a class="nav-link" id = "${category.id}" href="index.html?category=${category.id}" >${category.name}</a>
</li>
  `
  document.querySelector('.categories').insertAdjacentHTML('beforeend', html)


};


//---------------Add to Cart function--------------------     

const add_to_cart = (prod) => {
  const user = auth.currentUser;
  console.log(user)
  if (user) {
    db.collection('users').doc(user.uid).collection('cart').get().then((querySnapshot) => {
      let getCart;
      querySnapshot.forEach((doc) => {
        getCart = doc.data();
      })
      if (getCart) {

        testAddtoCart(prod, getCart, user)
      }
    })
    console.log(prod.id)
  }
  else {
    console.log('user is not logged in')
  }
};


const testAddtoCart = (prod, getcart, user) => {
  const cart_id = getcart.cart.id;

  console.log(cart_id)

  const url = new URL(
    `https://api.chec.io/v1/carts/${cart_id}`
  );

  let headers = {
    "X-Authorization": sandbox_api_key,
    "Content-Type": "application/json",
    "Accept": "application/json",
  };

  let body = {
    "id": prod.id,
    "quantity": 1
  }

  fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(body)
  })
    .then(response => response.json())
    .then(json => {
      let getcart;

      console.log(json)
      let setcart = json.cart;
      db.collection('users').doc(user.uid).collection('cart').doc(setcart.id).set({
        cart: setcart
      }).then(() => {
        db.collection('users').doc(user.uid).collection('cart').doc(setcart.id).get().then((doc) => {
          getcart = doc.data();
          document.querySelector('.badge-notification').innerHTML = getcart.cart.total_items
        })
      })
    })
}


// ---------------End of Navbar-----------
const createCart = () => {
  let Data_Cart = Data.cart.test;
  const url = new URL(
    "https://api.chec.io/v1/carts"
  );

  let headers = {
    "X-Authorization": sandbox_api_key,
    "Accept": "application/json",
    "Content-Type": "application/json",
  };

  fetch(url, {
    method: "GET",
    headers: headers,
  })
    .then(response => response.json())
    .then((json) => {
      auth.onAuthStateChanged((user) => {
        if (user) {
          console.log(user);
          console.log('Response', json)
          Data_Cart = json;
          console.log(Data_Cart, 'Just For Test')
          // set Cart in database
          let setCart = db.collection('users').doc(user.uid).collection('cart').doc(Data_Cart.id).set({
            cart: Data_Cart,

          }, { merge: true }).then(() => {
          }).then(() => {
            console.log('Cart set in database')
            db.collection('users').doc(user.uid).collection('cart').doc(Data_Cart.id).get().then((doc) => {
              const getCart = doc.data();
              console.log(getCart, 'Fetched Cart from CreateCart Function');
              const html = `
              <a class="text-reset me-5 cart-icon" href = "index.html?cart=${getCart.cart.id}">
                  <i class="fas fa-shopping-cart"></i>
                  <span class="badge rounded-pill badge-notification bg-danger">${getCart.cart.total_items}</span>
                </a>
              `
              document.querySelector('.main-nav').insertAdjacentHTML('afterbegin', html)
            })
          })

          auth.signOut().then(() => {
            let user = auth.currentUser;
            console.log(user);
          })
        }
      })
    })

}


// -----------------------------------------------END----------------------------------

// UI Controller
const UIController = (() => {
  return {
    registerationFormInput: () => {
      return {
        signUpName: document.querySelector('.signup-name').value,
        signUpPhoneNo: document.querySelector('.signup-phone').value,
        signUpEmail: document.querySelector('.signup-email').value,
        signUpPassword: document.querySelector('.signup-password').value
      }
    },
    signInFormInput: () => {
      return {
        signInEmail: document.querySelector('.login-email').value,
        signInPassword: document.querySelector('.login-password').value,
      }
    },
    clearInputField: () => {
      document.querySelector('.signup-name').value = '';
      document.querySelector('.signup-phone').value = '';
      document.querySelector('.signup-email').value = '';
      document.querySelector('.signup-password').value = '';


    }
  }
})()


// App Controller
const appController = ((UiCtrl) => {

  const signUp = () => {

    const registerationInput = UiCtrl.registerationFormInput();
    if (registerationInput.signUpName !== '' && registerationInput.signUpPhoneNo !== '' && registerationInput.signUpEmail !== '' && registerationInput.signUpPassword !== '') {
      auth.createUserWithEmailAndPassword(registerationInput.signUpEmail, registerationInput.signUpPassword).then((cred) => {
        console.log(cred.user.uid)
        db.collection('users').doc(cred.user.uid).set({
          name: registerationInput.signUpEmail,
        }).then(() => {
          UiCtrl.clearInputField();
          createCart();
        })
      })
    }
  }
  const signIn = () => {
    const signInInput = UiCtrl.signInFormInput();
    if (signInInput.signInEmail !== '' && signInInput.signInPassword !== '') {
      auth.signInWithEmailAndPassword(signInInput.signInEmail, signInInput.signInPassword).then(() => {
        console.log('user signed in')
      })
    }
  }
  const signOut = () => {
    auth.signOut().then(() => {
      console.log('User is logged out')
      location.reload(true)
    })
  }
  document.querySelector('.btn-register').addEventListener('click', (e) => {
    e.preventDefault();
    signUp();
  })
  document.querySelector('.btn-login').addEventListener('click', (e) => {
    e.preventDefault();
    console.log('sign In Btn clicked')
    signIn();
  })

  document.querySelector('.signOut_btn').addEventListener('click', (e) => {
    e.preventDefault();
    signOut();
  })

  const url = new URLSearchParams(window.location.search);
  const blank_url = url.get('cart');
  if (!blank_url) {
    fetchProducts()
    document.querySelector('.emptyCart').style.display = 'none';
    document.querySelector('.checkoutBtn').style.display = 'none';
    document.querySelector('.horizontal_line').style.display = "none"
  }
  else {
    document.querySelector('.slides').style.display = 'none';
  }
  auth.onAuthStateChanged((user) => {
    if (user) {
      let getCart;
      document.querySelector('.login_signup_btn').style.display = 'none'
      document.querySelector('.signOut_btn').style.display = 'block'
      db.collection('users').doc(user.uid).collection('cart').get().then((querySnapshot) => {
        querySnapshot.forEach((doc) => {
          getCart = doc.data();

        })
        console.log(getCart, 'Fetched Cart')
        if (getCart) {
          const html = `
        <a class="text-reset me-5 cart-icon" href="index.html?cart=${getCart.cart.id}">
              <i class="fas fa-shopping-cart"></i>
              <span class="badge rounded-pill badge-notification bg-danger">${getCart.cart.total_items}</span>
            </a>
        `
          document.querySelector('.main-nav').insertAdjacentHTML('afterbegin', html)
        }
      })
      const url = new URLSearchParams(window.location.search);
      const blank_url = url.get('cart');
      console.log(blank_url, 'test cart url')

      const generateToken = (cartID) => {
        const url = new URL(
          `https://api.chec.io/v1/checkouts/${cartID}`
        );
        let params = {
          "type": "cart",
        };
        Object.keys(params)
          .forEach(key => url.searchParams.append(key, params[key]));

        let headers = {
          "X-Authorization": sandbox_api_key,
          "Accept": "application/json",
          "Content-Type": "application/json",
        };

        fetch(url, {
          method: "GET",
          headers: headers,
        })
          .then(response => response.json())
          .then((json) => {
            console.log(json)
            Data.chekoutToken = json.id;
            console.log(Data.chekoutToken)
          });
      }
      if (blank_url) {
        fetchCart(user)
        generateToken(blank_url)
      }
    }
    else {
      document.querySelector('.login_signup_btn').style.display = 'block'
      document.querySelector('.signOut_btn').style.display = 'none'
    }

  })

  fetchCategories();
})(UIController)


