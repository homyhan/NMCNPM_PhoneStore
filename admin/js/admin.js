var productList = [];
var userList = [];
var donHangList = [];
function setListProducts(newList) {
    window.localStorage.setItem('ListProduct', JSON.stringify(newList));
}

function getListProducts() {
    return JSON.parse(window.localStorage.getItem('ListProduct'));
}

function domId(id) {
    return document.getElementById(id);
}

// ======================= Các Tab =========================
function addEventChangeTab() {
    var sidebar = document.getElementsByClassName('sidebar')[0];
    var list_a = sidebar.getElementsByTagName('a');
    for(var a of list_a) {
        if(!a.onclick) {
            a.addEventListener('click', function() {
                turnOff_Active();
                this.classList.add('active');
                var tab = this.childNodes[1].data.trim()
                openTab(tab);
            })
        }
    }
}

function turnOff_Active() {
    var sidebar = document.getElementsByClassName('sidebar')[0];
    var list_a = sidebar.getElementsByTagName('a');
    for(var a of list_a) {
        a.classList.remove('active');
    }
}

function openTab(nameTab) {
    // ẩn hết
    var main = document.getElementsByClassName('main')[0].children;
    for(var e of main) {
        e.style.display = 'none';
    }

    // mở tab
    switch(nameTab) {
        case 'Sản Phẩm': document.getElementsByClassName('sanpham')[0].style.display = 'block'; break;
        case 'Người Dùng': document.getElementsByClassName('nguoidung')[0].style.display = 'block'; break;
        case 'Đơn Hàng': document.getElementsByClassName('donhang')[0].style.display = 'block'; break;
    }
}

//========================== Người dùng ========================
async function fetchUserList() {
    userList = [];
    try {
        const response = await fetch('https://63e677b27eef5b223386ae8a.mockapi.io/signin/');
        const users = await response.json();
        userList = mapUserList(users);
        renderUser(userList);
    } catch (error) {
        console.log(error);
    }
}

function mapUserList(data) {
    const userList = data.map(user => {
        return {
            id: user.id,
            fullName: user.fullName,
            account: user.account,
            email: user.email,
            password: user.password,
            isAdmin: user.isAdmin,
            address: user.address,
            ordered: user.ordered,
            cartList: user.cartList
        };
    });
    return userList;
}

function renderUser(data) {
    data = data || userList;

    var tc = document
        .getElementsByClassName("nguoidung")[0]
        .getElementsByClassName("table-content")[0];
    var s = `<table class="table-outline hideImg">`;

    for (var i = 0; i < data.length; i++) {
        s += `<tr>
            <td style="width: 5%">${data[i].id}</td>
            <td style="width: 15%">${data[i].fullName}</td>
            <td style="width: 15%">${data[i].email}</td>
            <td style="width: 10%">${data[i].account}</td>
            <td style="width: 10%">${data[i].password}</td>
            <td style="width: 10%">${data[i].isAdmin}</td>
            <td style="width: 20%">${data[i].address}</td>
            <td style="width: 10%">
                <div class="tooltip">
                    <i class="fa fa-wrench" onclick="addKhungSuaNguoiDung(${data[i].id})"></i>
                    <span class="tooltiptext">Sửa</span>
                </div>
                <div class="tooltip">
                    <i class="fa fa-trash" onclick="xoaNguoiDung(${data[i].id}, '${data[i].fullName}')"></i>
                    <span class="tooltiptext">Xóa</span>
                </div>
                
            </td>
        </tr>`;
    }
    s += `</table>`;
    tc.innerHTML = s;
}

domId("btnSubmitUser").addEventListener('click', async function(e) {
    e.preventDefault();
    var fullName = domId("fullName").value.trim();
    var email = domId("email").value.trim();
    var account = domId("account").value.trim();
    var password = domId("password").value.trim();
    var type = domId("admin").value;
    var address = document.querySelector("#khungThemNguoiDung textarea").value.trim();

    if (fullName === "" || email === "" || account === "" || password === "" || type === "0" || address === "") {
        alert("Vui lòng điền đầy đủ thông tin");
        return;
    }

    if (type === "1") {
        type = "true";
    } else if (type === "2") {
        type = "false";
    }

    try {
        const response = await axios.get(`https://63e677b27eef5b223386ae8a.mockapi.io/signin?email=${email}`);
        const userList = response.data;
        const existingUser = userList.find(user => user.email === email);
        if (existingUser) {
            alert("Email đã tồn tại. Vui lòng sử dụng email khác.");
            return;
        }
    } catch (error) {
        console.error(error);
        return;
    }

    try {
        var nguoiDungMoi = {
            fullName: fullName,
            email: email,
            account: account,
            password: password,
            isAdmin: type,
            address: address,
            ordered: [],
            cartList: []
        };
        // Gọi API để thêm người dùng
        axios.post("https://63e677b27eef5b223386ae8a.mockapi.io/signin", nguoiDungMoi)
            .then(async function (response) {
                console.log(response.data);
                // Thực hiện các thao tác khác sau khi thêm người dùng thành công
                await fetchUserList();
                await alert("Thêm người dùng thành công.");
                document.getElementById("khungThemNguoiDung").style.transform = "scale(0)";
            })
            .catch(function(error) {
                console.error(error);
            });
        } catch (e) {
            alert("Lỗi: " + e.toString());
        }
});


async function xoaNguoiDung(id, name) {
    try {
        // Hiển thị hộp thoại xác nhận xóa sản phẩm
        if (window.confirm('Bạn có chắc muốn xóa ' + name)) {
            // Gửi yêu cầu xóa người dùng tới API mock
            const response = await axios.delete(`https://63e677b27eef5b223386ae8a.mockapi.io/signin/${id}`);
            console.log(response.data);
            // Sau khi xóa thành công, cập nhật lại danh sách người dùng
            await fetchUserList();
            // Hiển thị thông báo xóa nguoi dùng thành công
            alert(`Đã xóa người dùng ${name} thành công.`);
        }
    } catch (error) {
        // Nếu có lỗi xảy ra, hiển thị thông báo lỗi trên console
        console.error(error);
    }
}

domId('btnCloseUser').addEventListener('click', function(){
    domId('khungThemNguoiDung').style.transform = "scale(0)";
    domId('formUser').reset();
    var arrError = document.getElementsByClassName("sp-error");
    for (let i = 0; i < arrError.length; i++) {
        arrError[i].innerHTML="";

    }
})

function addKhungSuaNguoiDung(id) {
    var nguoiDung;
    for (var user of userList) {
        if (user.id == id) {
            nguoiDung = user;
            break;
        }
    }
    var s = `<span class="close" onclick="this.parentElement.style.transform = 'scale(0)';">&times;</span>
    <table class="overlayTable table-outline table-content table-header">
      <tr>
        <th colspan="2">` + nguoiDung.fullName + `</th>
      </tr>
      <tr>
        <td>Họ và Tên:</td>
        <td><input type="text" value="` + nguoiDung.fullName + `"></td>
      </tr>
      <tr>
        <td>Email:</td>
        <td><input type="text" value="` + nguoiDung.email + `"></td>
      </tr>
      <tr>
        <td>Tài Khoản:</td>
        <td><input type="text" value="` + nguoiDung.account + `"></td>
      </tr>
      <tr>
        <td>Mật Khẩu:</td>
        <td><input type="text" value="` + nguoiDung.password + `"></td>
      </tr>
      <tr>
        <td>Admin:</td>
        <td>
          <select id="admin" class="form-select form-control" onblur="requiredType()" aria-label="Default select example">
              <option value="" selected>Type</option>
              <option value="1" ${nguoiDung.isAdmin ? 'selected' : ''}>true</option>
              <option value="2" ${!nguoiDung.isAdmin ? 'selected' : ''}>false</option>
          </select>
        </td>
      </tr>
      <tr>
        <td>Địa Chỉ:</td>
        <td><textarea rows="6">` + nguoiDung.address + `</textarea></td>
      </tr>
      <tr>
        <td colspan="2" class="table-footer">
          <button onclick="capNhatNguoiDung('` + nguoiDung.id + `')">SỬA</button>
        </td>
      </tr>
    </table>`;

    var k = document.getElementById('khungSuaNguoiDung');
    k.innerHTML = s;
    k.style.transform = 'scale(1)';
}
function layThongTinNguoiDungTuTable() {
    var khung = document.getElementById("khungSuaNguoiDung");
    var tr = khung.getElementsByTagName("tr");

    var hoTen = tr[1]
        .getElementsByTagName("td")[1]
        .getElementsByTagName("input")[0].value;
    var email = tr[2]
        .getElementsByTagName("td")[1]
        .getElementsByTagName("input")[0].value;
    var taiKhoan = tr[3]
        .getElementsByTagName("td")[1]
        .getElementsByTagName("input")[0].value;
    var matKhau = tr[4]
        .getElementsByTagName("td")[1]
        .getElementsByTagName("input")[0].value;
    var admin = tr[5]
        .getElementsByTagName("td")[1]
        .getElementsByTagName("select")[0].value;
    var diaChi = tr[6]
        .getElementsByTagName("td")[1]
        .getElementsByTagName("textarea")[0].value;

    try {
        return {
            "fullName": hoTen,
            "email": email,
            "account": taiKhoan,
            "password": matKhau,
            "isAdmin": admin,
            "address": diaChi
        };
    } catch (e) {
        alert('Lỗi: ' + e.toString());
        return false;
    }
}

async function capNhatNguoiDung(id) {
    // Lấy thông tin người dùng cần cập nhật từ form
    var nguoiDungCapNhat = layThongTinNguoiDungTuTable("khungSuaNguoiDung");
    if (!nguoiDungCapNhat) return;

    // Kiểm tra người dùng có tồn tại trong danh sách người dùng hay không
    var nguoiDungCu = userList.find(nguoiDung => nguoiDung.id === id);
    if (!nguoiDungCu) {
        alert("Không tìm thấy người dùng cần cập nhật.");
        return false;
    }

    // Cập nhật thông tin người dùng mới
    var nguoiDungMoi = {
        ...nguoiDungCu,
        fullName: nguoiDungCapNhat.fullName,
        email: nguoiDungCapNhat.email,
        account: nguoiDungCapNhat.account,
        password: nguoiDungCapNhat.password,
        isAdmin: nguoiDungCapNhat.isAdmin,
        address: nguoiDungCapNhat.address,
        ordered: nguoiDungCu.ordered,
        cartList: nguoiDungCu.cartList
    };

    // Gọi API để cập nhật người dùng
    try {
        const response = await axios.put(`https://63e677b27eef5b223386ae8a.mockapi.io/signin/${id}`, nguoiDungMoi);
        console.log(response.data);
        await fetchUserList();
        alert(`Đã cập nhật người dùng có id là ${id} thành công.`);
        document.getElementById("khungSuaNguoiDung").style.transform = "scale(0)";
    } catch (error) {
        console.error(error);
    }
}

function timKiemNguoiDung(input) {
    var kieuTim = document.getElementsByName('kieuTimKhachHang')[0].value;
    var text = input.value;

    // Lọc
    var vitriKieuTim = {'ten':1, 'email':2, 'taikhoan':3};

    var listTr_table = document.getElementsByClassName('nguoidung')[0].getElementsByClassName('table-content')[0].getElementsByTagName('tr');
    for (var tr of listTr_table) {
        var td = tr.getElementsByTagName('td')[vitriKieuTim[kieuTim]].innerHTML.toLowerCase();

        if (td.indexOf(text.toLowerCase()) < 0) {
            tr.style.display = 'none';
        } else {
            tr.style.display = '';
        }
    }
}

function sortUserTable(loai) {
    var list = document.getElementsByClassName('nguoidung')[0].getElementsByClassName("table-content")[0];
    var tr = list.getElementsByTagName('tr');

    quickSort(tr, 0, tr.length-1, loai, getValueOfTypeInTable_User);
    decrease = !decrease;
}

function getValueOfTypeInTable_User(tr, loai) {
    var td = tr.getElementsByTagName('td');
    switch(loai) {
        case 'stt': return Number(td[0].innerHTML);
        case 'hoten' : return td[1].innerHTML.toLowerCase();
        case 'email' : return td[2].innerHTML.toLowerCase();
        case 'taikhoan' : return td[3].innerHTML.toLowerCase();
    }
    return false;
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
        console.log(res.data);
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

    var tc = document
        .getElementsByClassName("sanpham")[0]
        .getElementsByClassName("table-content")[0];
    var s = `<table class="table-outline hideImg">`;

    for (var i = 0; i < data.length; i++) {
        s += `<tr>
            <td style="width: 5%">${data[i].id}</td>
            <td style="width: 10%">${data[i].type}</td>
            <td style="width: 20%">
                <a title="Xem chi tiết" target="_blank" + p.name.split(' ').join('-') + ">${data[i].name}</a>
                <img src="${data[i].image}"></img>
            </td>
            <td style="width: 30%">${data[i].description}</td>
            <td style="width: 10%">${data[i].price}</td>
            <td style="width: 10%">${data[i].quantity}</td>
            <td style="width: 15%">
                <div class="tooltip">
                    <i class="fa fa-wrench" onclick="addKhungSuaSanPham(${data[i].id})"></i>
                    <span class="tooltiptext">Sửa</span>
                </div>
                <div class="tooltip">
                    <i class="fa fa-trash" onclick="xoaSanPham(${data[i].id}, '${data[i].name}')"></i>
                    <span class="tooltiptext">Xóa</span>
                </div>
            </td>
        </tr>`;
    }

    s += `</table>`;

    tc.innerHTML = s;
}

// Thêm sản phẩm mới
let previewSrc; // biến toàn cục lưu file ảnh đang thêm
domId("btnSubmit").addEventListener('click', async function (e) {
    e.preventDefault();
    if (!checkValid()) return;

    var khung = document.getElementById("khungThemSanPham");
    var tr = khung.getElementsByTagName("tr");

    var masp = tr[1]
        .getElementsByTagName("td")[1]
        .getElementsByTagName("input")[0].value;
    var type = tr[2]
        .getElementsByTagName("td")[1]
        .getElementsByTagName("select")[0].value;
    var name = tr[3]
        .getElementsByTagName("td")[1]
        .getElementsByTagName("input")[0].value;
    var image = tr[4]
        .getElementsByTagName("td")[1]
        .getElementsByTagName("input")[0].src;
    var des = tr[5]
        .getElementsByTagName("td")[1]
        .getElementsByTagName("textarea")[0].value;
    var price = tr[6]
        .getElementsByTagName("td")[1]
        .getElementsByTagName("input")[0].value;
    var quantity = tr[7]
        .getElementsByTagName("td")[1]
        .getElementsByTagName("input")[0].value;

    if (isNaN(price)) {
        alert("Giá phải là số nguyên");
        return false;
    }
    if (type === "1") {
        type = "iphone";
    } else if (type === "2") {
        type = "samsung";
    }
    //tạo ra obj với thuộc tính có giá trị đã điền
    var prod = new Product(name, price, des, quantity, type, previewSrc, masp);

    //call api truyền dữ liệu obj được tạo vào
    var promise = productServ.createProduct(prod);
    try {
        var res = await promise;
        console.log("Res", res);
        await fetchProductList();
        await alert("Thêm sản phẩm thành công");
        document.getElementById("khungThemSanPham").style.transform = "scale(0)";
    } catch (err) {
        console.log(err);
        alert("Lỗi");
    }
})


// Cập nhật ảnh sản phẩm review
function capNhatAnhSanPham(files, id) {
    const reader = new FileReader();
    reader.addEventListener(
        "load",
        function () {
            // convert image file to base64 string
            previewSrc = reader.result;
            document.getElementById(id).src = previewSrc;
        },
        false
    );

    if (files[0]) {
        reader.readAsDataURL(files[0]);
    }
}

// Hàm xóa sản phẩm với id và tên sản phẩm được truyền vào
async function xoaSanPham(id, name) {
    try {
        // Hiển thị hộp thoại xác nhận xóa sản phẩm
        if (window.confirm('Bạn có chắc muốn xóa ' + name)) {
            // Gửi yêu cầu xóa sản phẩm tới API mock
            const response = await axios.delete(`https://63e677b27eef5b223386ae8a.mockapi.io/phones/${id}`);
            console.log(response.data);
            // Sau khi xóa thành công, cập nhật lại danh sách sản phẩm
            await fetchProductList();
            // Hiển thị thông báo xóa sản phẩm thành công
            alert(`Đã xóa sản phẩm ${name} thành công.`);
        }
    } catch (error) {
        // Nếu có lỗi xảy ra, hiển thị thông báo lỗi trên console
        console.error(error);
    }
}

//Lấy thông tin từ khung cập nhật sản phẩm
function layThongTinSanPhamTuTable(id) {
    var khung = document.getElementById("khungSuaSanPham");
    var tr = khung.getElementsByTagName("tr");

    var masp = tr[1]
        .getElementsByTagName("td")[1]
        .getElementsByTagName("input")[0].value;
    var type = tr[2]
        .getElementsByTagName("td")[1]
        .getElementsByTagName("select")[0].value;
    var name = tr[3]
        .getElementsByTagName("td")[1]
        .getElementsByTagName("input")[0].value;
    var image = tr[4]
        .getElementsByTagName("td")[1]
        .getElementsByTagName("input")[0].src;
    var des = tr[5]
        .getElementsByTagName("td")[1]
        .getElementsByTagName("textarea")[0].value;
    var price = tr[6]
        .getElementsByTagName("td")[1]
        .getElementsByTagName("input")[0].value;
    var quantity = tr[7]
        .getElementsByTagName("td")[1]
        .getElementsByTagName("input")[0].value;

    if(isNaN(price)) {
        alert('Giá phải là số nguyên');
        return false;
    }

    try {
        return {
            "id" : masp,
            "type": type,
            "name": name,
            "image": previewSrc,
            "description": des,
            "price": price,
            "quantity": quantity
        }
    } catch(e) {
        alert('Lỗi: ' + e.toString());
        return false;
    }
}
//Hiển thị khung cập nhật sản phẩm
function addKhungSuaSanPham(id) {
    var sp;
    for(var p of productList) {
        if(p.id == id) {
            sp = p;
        }
    }
    var s = `<span class="close" onclick="this.parentElement.style.transform = 'scale(0)';">&times;</span>
    <table class="overlayTable table-outline table-content table-header">
        <tr>
            <th colspan="2">`+sp.name+`</th>
        </tr>
        <tr>
            <td>Mã sản phẩm:</td>
            <td><input type="text" value="`+sp.id+`"></td>
        </tr>
        <tr>
            <td>Loại:</td>
            <td>
                <select>
                    <option value="samsung" ${sp.type === "samsung" ? "selected" : ""}>samsung</option>
                    <option value="iphone" ${sp.type === "iphone" ? "selected" : ""}>iphone</option>
                </select>
            </td>
        </tr>
            <td>Tên sẩn phẩm:</td>
            <td><input type="text" value="`+sp.name+`"></td>
        </tr>
        <tr>
            <td>Hình:</td>
            <td>
                <img class="hinhDaiDien" id="anhDaiDienSanPhamSua" src="`+sp.image+`">
                <input type="file" accept="image/*" onchange="capNhatAnhSanPham(this.files, 'anhDaiDienSanPhamSua')">
            </td>
        </tr>
         <tr>
            <td>Mô tả:</td>
            <td><textarea rows="6">`+sp.description+`</textarea></td>
         </tr>
        <tr>
            <td>Giá tiền:</td>
            <td><input type="text" value="`+sp.price+`"></td>
        </tr>
       <tr>
            <td>Số lượng:</td>
            <td><input type="text" value="`+sp.quantity+`"></td>
        </tr>
            <td colspan="2"  class="table-footer"> <button onclick="capNhatSanPham('`+sp.id+`')">SỬA</button> </td>
        </tr>
    </table>`
    var khung = document.getElementById('khungSuaSanPham');
    khung.innerHTML = s;
    khung.style.transform = 'scale(1)';
}

async function capNhatSanPham(id) {
    // Lấy thông tin sản phẩm cần cập nhật từ form
    var spCapNhat = layThongTinSanPhamTuTable("khungSuaSanPham");
    if (!spCapNhat) return;

    // Kiểm tra sản phẩm có tồn tại trong productList hay không
    var spCu = productList.find(sp => sp.id === id);
    if (!spCu) {
        alert("Không tìm thấy sản phẩm cần cập nhật.");
        return false;
    }

    // Cập nhật thông tin sản phẩm mới
    var spMoi = {
        ...spCu,
        type: spCapNhat.type,
        name: spCapNhat.name,
        price: spCapNhat.price,
        description: spCapNhat.description,
        image: spCapNhat.image,
    };

    // Gọi API để cập nhật sản phẩm
    try {
        const response = await axios.put(`https://63e677b27eef5b223386ae8a.mockapi.io/phones/${id}`, spMoi);
        console.log(response.data);
        await fetchProductList();
        alert(`Đã cập nhật sản phẩm có id là ${id} thành công.`);
        document.getElementById("khungSuaSanPham").style.transform = "scale(0)";
    } catch (error) {
        console.error(error);
    }
}

//validate: bắt buộc nhập giá trị
function required(val, config) {
    if (val.length > 0) {
        domId(config.errorId).innerHTML = "";
        return true;
    }
    domId(config.errorId).innerHTML = "Vui long nhap gia tri";

    return false;
}
//validate: bắt buộc nhập giá trị
function validRequiredForm(idFideld, idNotify) {
    var valueInput = domId(idFideld).value;
    var localCheck = required(valueInput, { errorId: idNotify });
    return localCheck;
}

//validate: theo từng loại: val (giá trị của element), config (obj thể hiện lỗi)
function pattern(val, config) {
    if (config.regexp.test(val)) {
        domId(config.errorId).innerHTML = "";
        return true;
    } else {
        domId(config.errorId).innerHTML = config.main;
        return false;
    }
}

// validate: kiểm tra đã chọn loại của sản phẩm hay chưa
function requiredType() {
    var valueInput = domId("type");
    var notify = domId("notifyType");

    if (valueInput.selectedIndex === 0) {
        notify.innerHTML = "Vui lòng chọn kiểu";
        return false;
    } else {
        notify.innerHTML = "";
        return true;
    }
}

//kiểm tra ô mã sản phẩm
function checkValidID() {
    var idRegexp = /(^[0-9]{1,8}$)+/g;
    var validId =
        validRequiredForm("maspThem", "notifyId") &&
        pattern(domId("maspThem").value, {
            errorId: "notifyId",
            regexp: idRegexp,
            main: "id phai co từ 1 - 3 kí tự số",
        });
    return validId;
}

//kiểm tra ô fullName
function checkFullName() {
    var nameRegexp = /([A-z]+)([0-9]*)+/g;
    var validName =
        validRequiredForm("name", "notifyName") &&
        pattern(domId("name").value, {
            errorId: "notifyName",
            regexp: nameRegexp,
            main: "Tên sản phẩm phải là chữ và có ít nhất 0 hoặc nhiều kí tự số",
        });
    return validName;
}

//kiểm tra ô giá
function checkPrice() {
    var priceRegexp = /(^[0-9])+/g;
    var validPrice =
        validRequiredForm("price", "notifyPrice") &&
        pattern(domId("price").value, {
            errorId: "notifyPrice",
            regexp: priceRegexp,
            main: "Giá sản phẩm phải là số dương",
        });
    return validPrice;
}
//kiểm tra ô mô tả
function checkDesc() {
    var descRegexp = /^[a-zA-Z0-9 ]*$/;
    var validDesc =
        validRequiredForm("desc", "notifyDescription") &&
        pattern(domId("desc").value, {
            errorId: "notifyDescription",
            regexp: descRegexp,
            main: "Mo ta chua ro rang",
        });
    return validDesc;
}
//kiểm tra hình ảnh
function checkImg() {
    var validImg = validRequiredForm("img", "notifyImg");
    return validImg;
}
//kiểm tra ô quantity
function checkQuantity() {
    var quantityRegexp = /(^[0-9])+/g;
    var validQuantity =
        validRequiredForm("quantity", "notifyQuantity") &&
        pattern(domId("quantity").value, {
            errorId: "notifyQuantity",
            regexp: quantityRegexp,
            main: "Giá sản phẩm phải là số dương",
        });
    return validQuantity;
}
//kiểm tra tính hợp lệ của tất cả các ô
function checkValid() {
    var idRegexp = /(^[0-9]{1,8}$)+/g;
    var nameRegexp = /([A-z]+)([0-9]*)+/g;
    var priceRegexp = /(^[0-9])+/g;
    var quantityRegexp = /(^[0-9])+/g;
    var descRegexp = /^[a-zA-Z0-9 ]*$/;

    var validId =
        validRequiredForm("maspThem", "notifyId") &&
        pattern(domId("maspThem").value, {
            errorId: "notifyId",
            regexp: idRegexp,
            main: "id phai co từ 1 - 3 kí tự số",
        });

    var validName =
        validRequiredForm("name", "notifyName") &&
        pattern(domId("name").value, {
            errorId: "notifyName",
            regexp: nameRegexp,
            main: "Tên sản phẩm phải là chữ và có ít nhất 0 hoặc nhiều kí tự số",
        });

    var validPrice =
        validRequiredForm("price", "notifyPrice") &&
        pattern(domId("price").value, {
            errorId: "notifyPrice",
            regexp: priceRegexp,
            main: "Giá sản phẩm phải là số dương",
        });
    var validQuantity =
        validRequiredForm("quantity", "notifyQuantity") &&
        pattern(domId("quantity").value, {
            errorId: "notifyQuantity",
            regexp: quantityRegexp,
            main: "Số lượng phải là số dương",
        });

    var validImg = validRequiredForm("img", "notifyImg");

    var validDesc =
        validRequiredForm("desc", "notifyDescription") &&
        pattern(domId("desc").value, {
            errorId: "notifyDescription",
            regexp: descRegexp,
            main: "Mo ta chua ro rang",
        });

    var validType = requiredType();

    var valid =
        validId && validName && validPrice && validImg && validDesc && validType && validQuantity;
    // var valid = validId && validName;
    return valid;
}

//khi vừa vào trang thì call api để render product
window.onload = async function () {
    await fetchProductList();
    console.log("productList", productList);
};

//khi click vào button close modal sản phẩm biến mất, reset lại form, ẩn lỗi
domId('btnClose').addEventListener('click', function(){
    domId('khungThemSanPham').style.transform = "scale(0)";
    domId('form').reset();
    var arrError = document.getElementsByClassName("sp-error");
    for (let i = 0; i < arrError.length; i++) {
        arrError[i].innerHTML="";

    }
})
// ================== Sort ====================
var decrease = true; // Sắp xếp giảm dần

// loại là tên cột, func là hàm giúp lấy giá trị từ cột loai
function quickSort(arr, left, right, loai, func) {
    var pivot,
        partitionIndex;

    if (left < right) {
        pivot = right;
        partitionIndex = partition(arr, pivot, left, right, loai, func);

        //sort left and right
        quickSort(arr, left, partitionIndex - 1, loai, func);
        quickSort(arr, partitionIndex + 1, right, loai, func);
    }
    return arr;
}

function partition(arr, pivot, left, right, loai, func) {
    var pivotValue =  func(arr[pivot], loai),
        partitionIndex = left;
    
    for (var i = left; i < right; i++) {
        if (decrease && func(arr[i], loai) > pivotValue
        || !decrease && func(arr[i], loai) < pivotValue) {
            swap(arr, i, partitionIndex);
            partitionIndex++;
        }
    }
    swap(arr, right, partitionIndex);
    return partitionIndex;
}

function swap(arr, i, j) {
    var tempi = arr[i].cloneNode(true);
    var tempj = arr[j].cloneNode(true);
    arr[i].parentNode.replaceChild(tempj, arr[i]);
    arr[j].parentNode.replaceChild(tempi, arr[j]);
}

// ========================== Đơn Hàng ========================

async function fetchDonHang() {
    donHangList = [];
    try {
        const response = await fetch('https://63e677b27eef5b223386ae8a.mockapi.io/signin/');
        const data = await response.json();
        const filteredData = data.filter(item => item.ordered && item.ordered.length > 0);
        donHangList = await mapDonHangList(filteredData);
        renderDonHang(donHangList);
    } catch (error) {
        console.log(error);
    }
}

async function mapDonHangList(data) {
    const donHangList = [];

    for (const item of data) {
        if (item.ordered && item.ordered.length > 0) {
            const ordered = item.ordered;
            const donHangs = ordered.flatMap((order) => {
                const orderItems = order.orderItem;

                const donHang = {
                    id: item.id,
                    khachHang: item.fullName,
                    sanPham: '',
                    tongTien: '',
                    trangThai: '',
                };

                if (orderItems.length === 1) {
                    const orderItem = orderItems[0];
                    donHang.sanPham = `${orderItem.product.name} - Số lượng: ${orderItem.quantity}`;
                } else {
                    donHang.sanPham = orderItems.map((orderItem) => {
                        return `${orderItem.product.name} - Số lượng: ${orderItem.quantity}`;
                    }).join(', ');
                }

                donHang.tongTien = calculateTotalPrice(order);
                donHang.trangThai = order.state ? 'Đã xác nhận' : 'Chưa xác nhận';

                return donHang;
            });

            donHangList.push(...donHangs);
        }
    }

    return donHangList;
}

function renderDonHang(data) {
    data = data || donHangList;

    var tc = document
        .getElementsByClassName("donhang")[0]
        .getElementsByClassName("table-content")[0];
    var s = `<table class="table-outline">`;

    for (var i = 0; i < data.length; i++) {
        s += `<tr>
            <td style="width: 5%">${data[i].id}</td>
            <td style="width: 15%">${data[i].khachHang}</td>
            <td style="width: 30%">${data[i].sanPham}</td>
            <td style="width: 25%">${data[i].tongTien}</td>
            <td style="width: 15%">${data[i].trangThai}</td>
            <td style="width: 10%">
                <div class="tooltip">
                     <i class="fa fa-check-square-o"  id="confirm-button" onclick="xacNhanDonHang(${data[i].id})"></i>
                    <span>Xác nhận</span>
                </div>
                <div class="tooltip">
                    <i class="fa fa-close" id="cancle-button" onclick="huyDonHang(${data[i].id})"></i>
                    <span>Hủy</span>
                </div>
            </td>
        </tr>`;
    }
    s += `</table>`;
    tc.innerHTML = s;
}

function calculateTotalPrice(order) {
    let totalPrice = 0;

    for (const orderItem of order.orderItem) {
        const quantity = orderItem.quantity;
        const price = orderItem.product.price;
        const itemTotalPrice = quantity * price;
        totalPrice += itemTotalPrice;
    }

    return totalPrice;
}
// function xacNhanDonHang() {
//     // Lấy đối tượng button xác nhận
//     var confirmButton = document.getElementById('confirm-button');
//     // Gán sự kiện click cho button xác nhận
//     confirmButton.addEventListener('click', function () {
//         // Hiển thị hộp thoại xác nhận
//         var result = confirm('Bạn có chắc chắn muốn xác nhận đơn hàng?');
//
//         // Kiểm tra kết quả từ hộp thoại xác nhận
//         if (result) {
//             // Nếu người dùng nhấn OK, thực hiện các hành động xác nhận đơn hàng ở đây
//             console.log('Đơn hàng đã được xác nhận.');
//
//         } else {
//             // Nếu người dùng nhấn Cancel, không thực hiện hành động nào
//             console.log('Đơn hàng không được xác nhận.');
//         }
//     });
// }
//
//
// // Gọi hàm xác nhận đơn hàng khi cần thiết
// xacNhanDonHang();
//
//
// function huyDonHang(idDonHang) {
//     // Lấy đối tượng button hủy đơn hàng
//     var cancelButton = document.getElementById('cancel-button');
//
// // Gán sự kiện click cho button hủy đơn hàng
//     cancelButton.addEventListener('click', function () {
//         // Hiển thị hộp thoại xác nhận
//         var result = confirm('Bạn có chắc chắn muốn hủy đơn hàng?');
//
//         // Kiểm tra kết quả từ hộp thoại xác nhận
//         if (result) {
//             // Nếu người dùng nhấn OK, thực hiện các hành động hủy đơn hàng ở đây
//             console.log('Đơn hàng đã được hủy.');
//
//             // Gửi yêu cầu đến máy chủ để hủy đơn hàng
//             fetch('/huy-don-hang', {
//                 method: 'POST',
//                 headers: {
//                     'Content-Type': 'application/json'
//                 },
//                 body: JSON.stringify({orderId: 'Mã đơn hàng'})
//             })
//                 .then(function (response) {
//                     if (response.ok) {
//                         // Hủy đơn hàng thành công
//                         console.log('Đơn hàng đã được hủy thành công.');
//
//                     } else {
//                         // Hủy đơn hàng thất bại
//                         console.log('Hủy đơn hàng thất bại.');
//
//                     }
//                 })
//                 .catch(function (error) {
//                     // Xảy ra lỗi trong quá trình gửi yêu cầu
//                     console.log('Đã xảy ra lỗi: ', error);
//                 });
//         } else {
//             // Nếu người dùng nhấn Cancel, không thực hiện hành động nào
//             console.log('Đơn hàng không được hủy.');
//         }
//     });
// }
// // Gọi hàm hủy đơn hàng khi cần thiết
// huyDonHang();
//

window.onload = async function () {
    await fetchProductList();
    await fetchUserList();
    await fetchDonHang();
    addEventChangeTab();
    openTab("Sản Phẩm");
    console.log("productList", productList);
};


