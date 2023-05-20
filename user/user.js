// GLOBAL
var productList = [];
var cart = [];
var orderList = [];
var listAccSignin = [];
var arrType = [];
function domId(id) {
  return document.getElementById(id);
}
function profile() {
  const userInfo = getFromLocal("USERLOGIN");

  var profileUser = productServ.fetchProfile(userInfo.id).then((res) => {
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

  var row = domId("rowRender");
  var s = "";

  for (var i = 0; i < data.length; i++) {
    s += `
        <div class="col-lg-4 col-sm-4">
            <div class="box_main">
            <h4 class="shirt_text">${data[i].name}</h4>
            <p class="price_text">Start Price  <span style="color: #262626;">${formatCurrencyVND(
              data[i].price
            )}</span></p>
            <div class="electronic_img"><img src="${data[i].image}"></div>
            <div class="btn_main">
                <button class="buy_bt btnAddToCart" onclick="addToCart('${
                  data[i].id
                }')">add to cart</button>
                <button type="button" onclick="selectedProduct('${
                  data[i].id
                }')" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
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
  if (userInfo.length !== 0) {
    productServ
      .fetchProductDetail(id) //lay thong tin 1 sp tu db
      .then(function (res) {
        var product = res.data;
        var quantity = 1;
        var cartItem = new CartItem(product, quantity);
        var isExist = false;

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
                await profile();
                await productServ.fetchProfile(userInfo.id).then((res) => {});

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
  } else {
    alert("Vui lòng đăng nhập");
  }
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
                <td><input type="checkbox" class="checkbox" id="${
                  cart[i].product.id
                }" onclick="selectedItemCart(${
        cart[i].product.id
      })" data-index="${cart[i].product.id}" value="${cart[i].product.id}"></td>
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
                <td>${formatCurrencyVND(
                  cart[i].product.price * cart[i].quantity
                )}</td>
                <td><button type="button" onclick="deleteProduct('${
                  cart[i].product.id
                }')" class="btn btn-danger"><i class="fa fa-trash"></i></button></td>
            </tr>
            
      `;
    }

    domId("cartProduct").innerHTML = html;
  } else {
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
          var isInventory=true;
          var quantity_inventory =0;
          console.log(productList);
          for (let i = 0; i < productList.length; i++) {
            if(productList[i].id===id){
              // if (id === currentCart.cartList[i].product.id) {
              //   var quantity = currentCart.cartList[i].quantity * 1;              
              //   var index = i;
              //   currentCart.cartList[i].quantity += number;
              //   isExist = true;
              // }
              quantity_inventory = productList[i].quantity;
              
            }

          }          
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
              await profile();
              await productServ.fetchProfile(userInfo.id).then((res) => {});

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

      renderCart();
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
              await profile();
              await productServ.fetchProfile(userInfo.id).then((res) => {});

              renderCart();
            })
            .catch((error) => {
              console.error("Lỗi khi cập nhật giỏ hàng:", error);
            });
        });

      renderCart();
    })
    .catch(function (err) {
      console.log(err);
    });
}

function selectedItemCart(id) {
  var userInfo = getFromLocal("USERLOGIN");

  axios
    .get("https://63e677b27eef5b223386ae8a.mockapi.io/signin/" + userInfo.id)
    .then((res) => {
      const currentCart = res.data;
      var checkbox = document.getElementById(id);
      var newArr = [];
      if (checkbox.checked) {
        newArr = currentCart.cartList.filter((item) => {
          return item.product.id === checkbox.id;
        });
        orderList.push(newArr[0]);
      } else {
        orderList = orderList.filter((item) => {
          return item.product.id * 1 !== checkbox.id * 1;
        });
      }
    })
    .catch((err) => {
      console.log(err);
    });
}

function btnOrder() {
  if (orderList.length === 0) return alert("VUi long chon san pham can mua");
  var modalCheckout = document.querySelector(".modalCheckout");
  modalCheckout.style.display = "block";
  var html = "";
  var total = 0;
  for (var i = 0; i < orderList.length; i++) {
    total += orderList[i].product.price * orderList[i].quantity;
    html += `
              <tr>
              
              <td class="product-thumbnail">
                  <img class="img-cart" style="width: 200px; height: 150px; transform: scale(0.8, 1);" src="${
                    orderList[i].product.image
                  }">
              </td>
              <td class="product-name">
                  <h2 class="h5 text-black">${orderList[i].product.name}</h2>
              </td>
              <td>${formatCurrencyVND(orderList[i].product.price)}</td>
              <td>
                  
                      
                          <p style="margin: 0px;" class="form-control text-center tdQuantity">${
                            orderList[i].quantity
                          }</p>
                      
              </td>
              <td>${formatCurrencyVND(
                orderList[i].product.price * orderList[i].quantity
              )}</td>
              
          </tr>
          
          
    `;
  }

  domId("tongHoaDon").innerHTML = `Tổng hóa đơn: ${formatCurrencyVND(total)}`;
  domId("contentCheckout").innerHTML = html;
}

function btnDathang() {
  var userInfo = getFromLocal("USERLOGIN");

  productServ
    .fetchProfile(userInfo.id)
    .then((res) => {
      var currentCart = res.data;
      const rs = cart.filter(
        (item) =>
          !orderList.some(
            (itemOrderList) => itemOrderList.product.id === item.product.id
          )
      );
      var infoOrder = {};
      infoOrder.orderItem = [...orderList];
      infoOrder.state = false;
      currentCart.ordered.push(infoOrder);
      currentCart.cartList = [...rs];

      axios
        .put(
          "https://63e677b27eef5b223386ae8a.mockapi.io/signin/" + userInfo.id,
          currentCart
        )
        .then(async (response) => {
          console.log("Dat hang thanh cong:", response.data);
          var modalCheckout = document.querySelector(".modalCheckout");
          modalCheckout.style.display = "none";
          var contentCheckout = document.getElementById("contentCheckout");
          contentCheckout.innerHTML = "";
          await profile();
          await productServ.fetchProfile(userInfo.id).then((res) => {});

          await fetchOrder();
          renderCart();
          domId("amount").innerHTML = cart.length;
          orderList = [];
        })
        .catch((error) => {
          console.error("Lỗi khi cập nhật giỏ hàng:", error);
        });
    })
    .catch((err) => {
      console.log(err);
    });
}

function order() {
  if (orderList.length === 0) {
    alert("Vui long chon san pham can mua");
  } else {
    var userInfo = getFromLocal("USERLOGIN");
    axios
      .get("https://63e677b27eef5b223386ae8a.mockapi.io/signin/" + userInfo.id)
      .then((response) => {
        const currentCart = response.data;

        var orderItem = [...orderList];
        currentCart.ordered.push(orderItem);

        // API bằng cách gửi yêu cầu PUT
        axios
          .put(
            "https://63e677b27eef5b223386ae8a.mockapi.io/signin/" + userInfo.id,
            currentCart
          )
          .then(async (response) => {
            console.log("Giỏ hàng đã được cập nhật thành công:", response.data);
            await profile();
            await productServ.fetchProfile(userInfo.id).then((res) => {});
          })
          .catch((error) => {
            console.error("Lỗi khi cập nhật giỏ hàng:", error);
          });
      })
      .catch((error) => {
        console.log("loi", error);
      });
  }
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
  const userInfo = getFromLocal("USERLOGIN");
  console.log(userInfo);
  if (userInfo.length !== 0) {
    document.querySelector(".btnLogout").style.display = "block";
    document.querySelector(".btnSignin").style.display = "none";
  } else {
    document.querySelector(".btnLogout").style.display = "none";
    document.querySelector(".btnSignin").style.display = "block";
  }  

  await profile();
  await fetchProductList();
  await fetchAccSigninList();
  renderCart();
  // renderType();
  var count = cart.length;
  domId("amount").innerHTML = count;
  await fetchOrder();

  await type();

  if (userInfo.isAdmin) {
    document.querySelector(".hrefAdmin").style.display = "block";
    const listBtnAddToCart = document.querySelectorAll('.btnAddToCart');
    console.log("list", listBtnAddToCart);
    for (let i = 0; i < listBtnAddToCart.length; i++) {
      listBtnAddToCart[i].style.display = "none";
    }
  } else {
    document.querySelector(".hrefAdmin").style.display = "none";
    var listBtnAddToCart = document.querySelectorAll(".buy_bt");
    for (let i = 0; i < listBtnAddToCart.length; i++) {
      listBtnAddToCart[i].style.display = "block";
    }
  }
};

// LẤY DỮ LIỆU TỪ LOCALHOST
function getFromLocal(name) {
  var obj = localStorage.getItem(name);
  if (!obj) return [];
  return JSON.parse(obj);
}

function saveToLocal(el, name) {
  var obj = JSON.stringify(el);
  localStorage.setItem(name, obj);
}

function selectedProduct(id) {
  const selected = productServ
    .fetchProductDetail(id)
    .then((res) => {
      const html = `
      <b>Name: </b><span>${res.data.name}</span> <br>
      <b>Price: </b><span>${formatCurrencyVND(res.data.price)}</span> <br>
      <b>Description: </b><p>${res.data.description.replace(/\|/g, "<br>")}</p> 
      <div>
        <img src="${res.data.image}"></img>
      </div>
      
    `;
      domId("contentDetail").innerHTML = html;
    })
    .catch((err) => {
      console.log(err);
    });
}

async function signin(e) {
  const userInfo = getFromLocal();
  e.preventDefault();
  var email = domId("emailSignin").value;
  var pass = domId("passSignin").value;
  var temp = false;
  var arrNotiErr = [];
  for (let i = 0; i < listAccSignin.length; i++) {
    if (
      email === listAccSignin[i].email &&
      pass === listAccSignin[i].password
    ) {
      if (listAccSignin[i].isAdmin) {
        document.querySelector(".hrefAdmin").style.display = "block";
        var listBtnAddToCart = document.querySelectorAll(".buy_bt");
        for (let i = 0; i < listBtnAddToCart.length; i++) {
          listBtnAddToCart[i].style.display = "none";
        }
      } else {
        document.querySelector(".hrefAdmin").style.display = "none";
        var listBtnAddToCart = document.querySelectorAll(".buy_bt");
        for (let i = 0; i < listBtnAddToCart.length; i++) {
          listBtnAddToCart[i].style.display = "block";
        }
      }
      saveToLocal(listAccSignin[i], "USERLOGIN");
      document.querySelector(".btnLogout").style.display = "block";
      document.querySelector(".btnSignin").style.display = "none";
      await profile();
      await fetchOrder();
      await productServ.fetchProfile(listAccSignin[i].id).then((res) => {
        alert("Đăng nhập thành công");
        var count = res.data.cartList.length;
        domId("amount").innerHTML = count;
        return domId("btnSubmitSigin").setAttribute("data-bs-dismiss", "modal");
      });
      renderCart();
    } else {
      arrNotiErr.push(temp);
    }
  }
  if (arrNotiErr.length === listAccSignin.length) {
    console.log(arrNotiErr);
    if (
      arrNotiErr.every(function (notification) {
        return notification === false;
      })
    ) {
      alert("Lỗi thông tin vui lòng nhập lại");
    }
  } else {
    console.log("ok");
  }
}

function formatCurrencyVND(number) {
  let formatter = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    minimumFractionDigits: 0,
  });
  return formatter.format(number);
}

document.querySelector(".btnClose").addEventListener("click", function () {
  var modalCheckout = document.querySelector(".modalCheckout");
  modalCheckout.style.display = "none";
  const checkboxes = document.querySelectorAll(".checkbox");
  checkboxes.forEach((checkbox) => {
    checkbox.checked = false;
  });
  orderList = [];
});

async function fetchOrder() {
  const userInfo = getFromLocal("USERLOGIN");
  var html = "";
  var listOrder = await productServ
    .fetchCart(userInfo.account)
    .then((res) => {
      const listOrdered = res.data[0].ordered;
      console.log(listOrdered);
      listOrdered?.map((item, index) => {
        html += `
        <div>
          <p style="margin: 0px">${item?.orderItem?.map((itemName) => {
              return `<div>
              <p style="margin: 0px">${itemName?.quantity} ${
                itemName?.product?.name
              } - ${formatCurrencyVND(
                itemName?.product?.price * itemName?.quantity
              )}</p>
            </div>`;
            })
            .join("")}</p>        
        </div>
        <div >
          <p style="margin: 0px" class="text-end">
            Trạng thái: ${
              item.state === false ? "Đang chờ xác nhận" : "Đã được xác nhận"
            }
          </p>
          <p style="margin: 0px" class="text-end">
            <button onclick="cancelOrder(${index})" ${
          item.state === true ? 'style="cursor: not-allowed"' : ""
        } class="btn btn-danger" ${
          item.state === true ? "disabled" : ""
        }>Huy</button>
          </p>
        </div>
        <hr>
      `;
      });
      domId("contentOrdered").innerHTML = html;
    })
    .catch((err) => {
      console.log(err);
    });
}

function cancelOrder(id) {
  const userInfo = getFromLocal("USERLOGIN");

  axios
    .get("https://63e677b27eef5b223386ae8a.mockapi.io/signin/" + userInfo.id)
    .then((response) => {
      const currentOrder = response.data;

      currentOrder.ordered = currentOrder.ordered.filter((item, index) => {
        return index !== id;
      });

      axios
        .put(
          "https://63e677b27eef5b223386ae8a.mockapi.io/signin/" + userInfo.id,
          currentOrder
        )
        .then(async (response) => {
          console.log("Giỏ hàng đã xoa mot san pham:", response.data);
          await profile();
          await productServ.fetchProfile(userInfo.id).then((res) => {});
          await fetchOrder();
        })
        .catch((error) => {
          console.error("Lỗi khi cập nhật giỏ hàng:", error);
        });
    });
}

function logout() {

  localStorage.removeItem("USERLOGIN");
  domId("amount").innerHTML = 0;
  document.querySelector(".btnLogout").style.display = "none";
  document.querySelector(".btnSignin").style.display = "block";
  document.querySelector(".hrefAdmin").style.display = "none";
  var listBtnAddToCart = document.querySelectorAll('.buy_bt');
        for (let i = 0; i < listBtnAddToCart.length; i++) {
          listBtnAddToCart[i].style.display = "block"
          
        }
}

async function type() {
  var response = await productServ
    .fetchProduct()
    .then((res) => {
      const listProd = res.data;
      for (let i = 0; i < listProd.length; i++) {
        var prod = listProd[i];
        let type = prod.type;

        if (!arrType.includes(type)) {
          arrType.push(type);
        }
      }

      var html = `<li style="cursor: pointer;" onclick="renderProduct()"><a class="dropdown-item" >All</a></li>`;
      for (let i = 0; i < arrType.length; i++) {
        html += `
              <li style="cursor: pointer;" id="${arrType[i]}" onclick="renderProdFollowType(${arrType[i]})"><a class="dropdown-item" >${arrType[i]}</a></li>
            `;
      }
      domId("dd-type").innerHTML = html;
    })
    .catch((err) => {
      console.log(err);
    });
}

function renderProdFollowType(el) {
  var newArrProdList = productList.filter((item) => {
    return item.type === el.id;
  });
  renderProduct(newArrProdList);
}

async function searchProduct() {
  var inputValue = domId("inputSearch").value.replace(/\s/g, "").toLowerCase();
  await productServ
    .fetchProduct()
    .then((res) => {
      const prodList = res.data;
      var newArrPhone = prodList.filter((item) => {
        return item.name.replace(/\s/g, "").toLowerCase().includes(inputValue);
      });
      renderProduct(newArrPhone);
    })
    .catch((err) => {
      console.log(err);
    });
}

domId("modalOrdered").addEventListener('click', async function () {
  await fetchOrder();
})

async function signup(event) {
  event.preventDefault();

  var fullName = domId("fullNameSignup").value.trim();
  var account = domId("accountSignup").value.trim();
  var email = domId("emailSignup").value.trim();
  var password = domId("passwordSignup").value.trim();
  var confirmPassword = domId("confirmPasswordSignup").value.trim();
  var address = domId("addressSignup").value.trim();

  // Kiểm tra thông tin đã được nhập đầy đủ
  if (
    fullName === "" ||
    account == "" ||
    email === "" ||
    password === "" ||
    confirmPassword === "" ||
    address === ""
  ) {
    alert("Vui lòng điền đầy đủ thông tin.");
    return;
  }

  // Kiểm tra mật khẩu và xác nhận mật khẩu khớp nhau
  if (password !== confirmPassword) {
    alert("Mật khẩu và xác nhận mật khẩu không khớp.");
    return;
  }

  try {
    const response = await axios.get(
      `https://63e677b27eef5b223386ae8a.mockapi.io/signin?email=${email}`
    );
    const userList = response.data;
    const existingUser = userList.find((user) => user.email === email);
    if (existingUser) {
      alert("Email đã tồn tại. Vui lòng sử dụng email khác.");
      return;
    }
  } catch (error) {
    console.error(error);
    return;
  }

  // Tạo đối tượng user từ thông tin người dùng
  var user = {
    fullName: fullName,
    account: account,
    email: email,
    password: password,
    isAdmin: false,
    address: address,
    ordered: [],
    cartList: [],
  };

  // Gọi API để tạo người dùng mới
  axios
    .post("https://63e677b27eef5b223386ae8a.mockapi.io/signin/", user)
    .then(async function (response) {
      console.log(response.data);
      alert("Đăng ký thành công.");
      // Xử lý sau khi đăng ký thành công, ví dụ: chuyển hướng đến trang đăng nhập
      domId("modalSignup").classList.remove("show");
      domId("modalSignup").style.display = "none";
      document.querySelector("body").classList.remove("modal-open");
      document.querySelector(".modal-backdrop").remove();
      await fetchAccSigninList();
      await fetchProductList();
      
    })
    .catch(function (error) {
      console.error(error);
      alert("Đã xảy ra lỗi. Vui lòng thử lại sau.");
    });
}
