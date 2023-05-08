// GLOBAL
var productList = [];
var cart = [];
var listAccSignin = [];
function domId(id) {
  return document.getElementById(id);
}
function profile() {
  const userInfo = getFromLocal("USERLOGIN");

  var profileUser = productServ.fetchProfile(userInfo.id).then((res) => {
    // console.log(res.data);
    // cart.push(res.data.cartList);
    cart = [...res.data.cartList];
    var innerProf = `
      <p>Account: ${res.data.account}</p>
      <p>Fullname: ${res.data.fullName}</p>
      <p>Email: ${res.data.email}</p>
      <p>Address: ${res.data.address}</p>
      
    `;
    domId("contentProfile").innerHTML = innerProf;
  });
}
// ========================== Sản Phẩm ========================
// fetch api
async function fetchProductList() {
  productList = [];
  renderProduct();

  var promise = productServ.fetchProduct();

  try {
    var res = await promise;
    productList = mapProductList(res.data);

    renderProduct();
  } catch (err) {
    console.log(err);
  } finally {
  }
}
// map dữ liệu từ api
function mapProductList(local) {
  var result = [];

  for (var i = 0; i < local.length; i++) {
    var oldProduct = local[i];
    var newProduct = new Product(
      oldProduct.name,
      oldProduct.price,
      oldProduct.description,
      oldProduct.quantity,
      oldProduct.type,
      oldProduct.image,
      oldProduct.id
    );
    result.push(newProduct);
  }

  return result;
}

//render ra dữ liệu ra table
function renderProduct(data) {
  data = data || productList;

  // var tc = document
  //   .getElementsByClassName("sanpham")[0]
  //   .getElementsByClassName("table-content")[0];
  var row = domId("rowRender");
  var s = "";

  for (var i = 0; i < data.length; i++) {
    s += `
        <div class="col-lg-4 col-sm-4">
            <div class="box_main">
            <h4 class="shirt_text">${data[i].name}</h4>
            <p class="price_text">Start Price  <span style="color: #262626;">${formatCurrencyVND(data[i].price)}</span></p>
            <div class="electronic_img"><img src="${data[i].image}"></div>
            <div class="btn_main">
                <button class="buy_bt" onclick="addToCart('${data[i].id}')">add to cart</button>
                <button type="button" onclick="selectedProduct('${data[i].id}')" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
  Detail
</button>
            </div>
            </div>
        </div>
    `;
  }

  row.innerHTML = s;
}

function addToCart(id) {
  var userInfo = getFromLocal("USERLOGIN");
  productServ
    .fetchProductDetail(id) //lay thong tin 1 sp tu db
    .then(function (res) {
      var product = res.data;
      var quantity = 1;
      var cartItem = new CartItem(product, quantity);
      var isExist = false;

      // console.log(cart);

      // Lấy thông tin giỏ hàng hiện tại từ API
      axios
        .get(
          "https://63e677b27eef5b223386ae8a.mockapi.io/signin/" + userInfo.id
        )
        .then((response) => {
          const currentCart = response.data;

          for (var i = 0; i < currentCart.cartList.length; i++) {
            var itemCurrent = currentCart.cartList[i];
            if (itemCurrent.product.id === id) {
              currentCart.cartList[i].quantity++;
              isExist = true;
              console.log("da ton tai");
            }
          }
          if (isExist == false) {
            console.log("them thanh cong");
            currentCart.cartList.push(cartItem);
            var count = currentCart.cartList.length;
            domId("amount").innerHTML = count;
          }

          // Thêm sản phẩm mới vào giỏ hàng hiện tại
          // currentCart.cartList.push(cartItem);

          // API bằng cách gửi yêu cầu PUT
          axios
            .put(
              "https://63e677b27eef5b223386ae8a.mockapi.io/signin/" +
                userInfo.id,
              currentCart
            )
            .then(async (response) => {
              console.log(
                "Giỏ hàng đã được cập nhật thành công:",
                response.data
              );
              await profile();
              await productServ.fetchProfile(userInfo.id).then((res) => {
                console.log("fetch thanh cong", res.data);
              });
              console.log("cart ne", cart);
              renderCart();
            })
            .catch((error) => {
              console.error("Lỗi khi cập nhật giỏ hàng:", error);
            });
        })
        .catch((error) => {
          console.log("loi", error);
        });
      // saveProductCartList();

      var count = cart.length;
      // domId("amount").innerHTML = count;
      // renderCheckout();
    })
    .catch(function (err) {
      console.log(err);
    });
}

async function renderCart() {
  await profile();
  var html = "";
  var totalCheck = 0;
  var userInfo = getFromLocal("USERLOGIN");
  if (userInfo.length !== 0) {
    for (var i = 0; i < cart.length; i++) {
      html += `
                <tr>
                <td><input type="checkbox" name="productsCheckBox" value="${
                  cart[i].product.id
                }"></td>
                <td class="product-thumbnail">
                    <img class="img-cart" style="width: 200px; height: 150px; transform: scale(0.8, 1);" src="${
                      cart[i].product.image
                    }">
                </td>
                <td class="product-name">
                    <h2 class="h5 text-black">${cart[i].product.name}</h2>
                </td>
                <td>${formatCurrencyVND(cart[i].product.price)}</td>
                <td>
                    <div class="input-group group-quantity" >
                        <div class="input-group-prepend">
                            <button onclick="changeAmount('${
                              cart[i].product.id
                            }', -1)" class="btn btn-outline-primary js-btn-minus reduce"
                                type="button">−</button>
                        </div>
                        
                            <p style="margin: 0px;" class="form-control text-center tdQuantity">${
                              cart[i].quantity
                            }</p>
                        <div class="input-group-append">
                            <button onclick="changeAmount('${
                              cart[i].product.id
                            }', 1)" class="btn btn-outline-primary js-btn-plus raise"
                                type="button">+</button>
                        </div>
                    </div>
                </td>
                <td>${formatCurrencyVND(cart[i].product.price * cart[i].quantity)}</td>
                <td><button type="button" onclick="deleteProduct('${
                  cart[i].product.id
                }')" class="btn btn-danger"><i class="fa fa-trash"></i></button></td>
            </tr>
            
      `;
      // totalCheck += cart[i].total();
    }
    // console.log(total);
    // domId("total").innerHTML = "Total: " + totalCheck;
    domId("cartProduct").innerHTML = html;
    console.log("ok");
  } else {
    console.log("not ok");
    domId("cartProduct").innerHTML = `<tr>Vui long dang nhap</tr>`;
  }
}

function changeAmount(id, number) {
  var userInfo = getFromLocal("USERLOGIN");
  productServ
    .fetchProductDetail(id)
    .then(function (res) {
      var product = res.data;
      var isExist = false;

      var cartItem = new CartItem(product, quantity);

      // Lấy thông tin giỏ hàng hiện tại từ API
      axios
        .get(
          "https://63e677b27eef5b223386ae8a.mockapi.io/signin/" + userInfo.id
        )
        .then((response) => {
          const currentCart = response.data;

          for (var i = 0; i < currentCart.cartList.length; i++) {
            // var itemCurrent = cart[i];
            if (id === currentCart.cartList[i].product.id) {
              var quantity = currentCart.cartList[i].quantity * 1;
              var index = i;
              currentCart.cartList[i].quantity += number;
              isExist = true;
            }
            if (currentCart.cartList[i].quantity == 0) {
              currentCart.cartList.splice(index, 1);
              var count = currentCart.cartList.length;
              domId("amount").innerHTML = count;
            }
          }

          // API bằng cách gửi yêu cầu PUT
          axios
            .put(
              "https://63e677b27eef5b223386ae8a.mockapi.io/signin/" +
                userInfo.id,
              currentCart
            )
            .then(async (response) => {
              console.log(
                "Giỏ hàng đã được cập nhật thành công: (dang tang so luong)",
                response.data
              );
              await profile();
              await productServ.fetchProfile(userInfo.id).then((res) => {
                console.log("fetch thanh cong: tang so luong", res.data);
              });
              console.log("cart ne: tang thanh cong", cart);
              renderCart();
            })
            .catch((error) => {
              console.error("Lỗi khi cập nhật giỏ hàng:", error);
            });
        });

      for (var i = 0; i < cart.length; i++) {
        // var itemCurrent = cart[i];
        if (id === cart[i].product.id) {
          var quantity = cart[i].quantity * 1;
          var index = i;
          cart[i].quantity += number;
          isExist = true;
        }
        if (cart[i].quantity == 0) {
          cart.splice(index, 1);
          var count = cart.length;
          domId("amount").innerHTML = count;
        }
      }
      if (isExist == false) {
        cart.push(cartItem);
      }

      console.log(cart);
      // saveProductCartList();
      renderCart();
      // renderCheckout();
    })
    .catch(function (err) {
      console.log(err);
    });
}

function deleteProduct(id) {
  const userInfo = getFromLocal("USERLOGIN");
  productServ
    .fetchProductDetail(id)
    .then(function (res) {
      var product = res.data;

      // Lấy thông tin giỏ hàng hiện tại từ API
      axios
        .get(
          "https://63e677b27eef5b223386ae8a.mockapi.io/signin/" + userInfo.id
        )
        .then((response) => {
          const currentCart = response.data;

          for (var i = 0; i < currentCart.cartList.length; i++) {
            if (id === currentCart.cartList[i].product.id) {
              var index = i;
              currentCart.cartList.splice(index, 1);
              var count = currentCart.cartList.length;
              domId("amount").innerHTML = count;
              console.log(id);
            }
          }

          // API bằng cách gửi yêu cầu PUT
          axios
            .put(
              "https://63e677b27eef5b223386ae8a.mockapi.io/signin/" +
                userInfo.id,
              currentCart
            )
            .then(async (response) => {
              console.log("Giỏ hàng đã xoa mot san pham:", response.data);
              await profile();
              await productServ.fetchProfile(userInfo.id).then((res) => {
                console.log("fetch thanh cong: xoa san pham", res.data);
              });
              console.log("cart ne: xoa thanh cong", cart);
              renderCart();
            })
            .catch((error) => {
              console.error("Lỗi khi cập nhật giỏ hàng:", error);
            });
        });

      console.log(cart);
      // renderCheckout();

      renderCart();

      // var count = cart.length;
      // domId("amount").innerHTML = count;
    })
    .catch(function (err) {
      console.log(err);
    });
}

function booking() {
  const productListChecked = document.getElementsByName("productsCheckBox");
  const selectedProducts = [];
  productListChecked.forEach((checkbox) => {
    if (checkbox.checked) {
      selectedProducts.push(checkbox.value);
      // console.log(selectedProducts);
    }
  });
}

// fetch api
async function fetchAccSigninList() {
  var promise = productServ.fetchAccSignin();

  try {
    var res = await promise;
    listAccSignin = res.data;
  } catch (err) {
    console.log(err);
  } finally {
  }
}

//khi vừa vào trang -> call api để render product
window.onload = async function () {
  const userInfo = getFromLocal();
  await profile();
  await fetchProductList();
  await fetchAccSigninList();
  renderCart();
  var count = cart.length;
  domId("amount").innerHTML = count;
  console.log("cart", cart);
  // console.log("productList", productList);
  console.log("res acc", listAccSignin);
};

// LẤY DỮ LIỆU TỪ LOCALHOST
function getFromLocal(name) {
  var obj = localStorage.getItem(name);
  if (!obj) return [];
  // console.log(JSON.parse(productListJson));
  return JSON.parse(obj);
}

function saveToLocal(el, name) {
  var obj = JSON.stringify(el);
  console.log(el);
  localStorage.setItem(name, obj);
}

function selectedProduct(id) {
  const selected = productServ.fetchProductDetail(id).then(res=>{
    console.log(res.data);
    const html = `
      <b>Name: </b><span>${res.data.name}</span> <br>
      <b>Price: </b><span>${formatCurrencyVND(res.data.price)}</span> <br>
      <b>Description: </b><p>${res.data.description.replace(/\|/g, "<br>")}</p> 
      <div>
        <img src="${res.data.image}"></img>
      </div>
      
    `;
    domId("contentDetail").innerHTML = html;
  }).catch(err=>{
    console.log(err);
  })
}

async function signin(e) {
  const userInfo = getFromLocal();
  e.preventDefault();
  var email = domId("emailSignin").value;
  var pass = domId("passSignin").value;
  for (let i = 0; i < listAccSignin.length; i++) {
    if (
      email === listAccSignin[i].email &&
      pass === listAccSignin[i].password
    ) {
      console.log(listAccSignin[i].email, listAccSignin[i].password);
      console.log("signin thanh cong");
      saveToLocal(listAccSignin[i], "USERLOGIN");
      await profile();
      await productServ.fetchProfile(listAccSignin[i].id).then((res) => {
        console.log("fetch thanh cong", res.data);
      });
      renderCart();
    } else {
      console.log("loi dang nhap");
    }
  }
}

function formatCurrencyVND(number) {
  let formatter = new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    minimumFractionDigits: 0
  });
  return formatter.format(number);
}