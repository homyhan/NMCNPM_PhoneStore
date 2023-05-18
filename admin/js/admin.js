var productList = [];
var userList = [];
function setListProducts(newList) {
    window.localStorage.setItem('ListProduct', JSON.stringify(newList));
}

function getListProducts() {
    return JSON.parse(window.localStorage.getItem('ListProduct'));
}

function domId(id) {
    return document.getElementById(id);
}

window.onload = async function () {
    list_product = getListProducts() || list_product;
    await fetchUserList();
    addEventChangeTab();
    addTableProducts();
    openTab("Sản Phẩm");
};

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
    domId('form').reset();
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
// console.log(nguoiDungMoi)
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



// ========================== Sản Phẩm ========================
// Vẽ bảng danh sách sản phẩm
function addTableProducts() {
    var tc = document.getElementsByClassName('sanpham')[0].getElementsByClassName('table-content')[0];
    var s = `<table class="table-outline hideImg">`;

    for (var i = 0; i < list_product.length; i++) {
        var p = list_product[i];
        s += `<tr>
            <td style="width: 5%">` + p.id + `</td>
            <td style="width: 10%">` + p.type + `</td>
            <td style="width: 20%">
                <a title="Xem chi tiết" target="_blank"` + p.name.split(' ').join('-') + `">` + p.name + `</a>
                <img src="` + p.image + `"></img>
            </td>
            <td style="width: 30%">` + p.description + `</td>
            <td style="width: 10%">` + p.price + `</td>
            <td style="width: 10%">` + p.quantity + `</td>
            <td style="width: 15%">
                <div class="tooltip">
                    <i class="fa fa-wrench" onclick="addKhungSuaSanPham('` + p.id + `')"></i>
                    <span class="tooltiptext">Sửa</span>
                </div>
                <div class="tooltip">
                    <i class="fa fa-trash" onclick="xoaSanPham('` + p.id + `', '`+p.name+`')"></i>
                    <span class="tooltiptext">Xóa</span>
                </div>
            </td>
        </tr>`;
    }

    s += `</table>`;

    tc.innerHTML = s;
}


// Tìm kiếm
function timKiemSanPham(inp) {
    var kieuTim = document.getElementsByName('kieuTimSanPham')[0].value;
    var text = inp.value;

    // Lọc
    var vitriKieuTim = {'ma':0, 'ten':2}; // mảng lưu vị trí cột

    var listTr_table = document.getElementsByClassName('sanpham')[0].getElementsByClassName('table-content')[0].getElementsByTagName('tr');
    for (var tr of listTr_table) {
        var td = tr.getElementsByTagName('td')[vitriKieuTim[kieuTim]].innerHTML.toLowerCase();

        if (td.indexOf(text.toLowerCase()) < 0) {
            tr.style.display = 'none';
        } else {
            tr.style.display = '';
        }
    }
}

// Thêm
let previewSrc; // biến toàn cục lưu file ảnh đang thêm
function layThongTinSanPhamTuTable(id) {
    var khung = document.getElementById(id);
    var tr = khung.getElementsByTagName('tr');

    var masp = tr[1].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var type = tr[2].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var name = tr[3].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var image = tr[4].getElementsByTagName('td')[1].getElementsByTagName('img')[0].src;
    var des = tr[5].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var price = tr[6].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value;
    var quantity = tr[7].getElementsByTagName('td')[1].getElementsByTagName('input')[0].value

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
function themSanPham() {
    var newSp = layThongTinSanPhamTuTable('khungThemSanPham');
    if(!newSp) return;

    for(var p of list_product) {
        if(p.id == newSp.id) {
            alert('Mã sản phẩm bị trùng !!');
            return false;
        }

        if(p.name == newSp.name) {
            alert('Tên sản phẩm bị trùng !!');
            return false;
        }
    }
     // Them san pham vao list_product
     list_product.push(newSp);

     // Lưu vào localstorage
     setListProducts(list_product);
 
     // Vẽ lại table
     addTableProducts();

    alert('Thêm sản phẩm "' + newSp.name + '" thành công.');
    document.getElementById('khungThemSanPham').style.transform = 'scale(0)';
}
function autoMaSanPham(type) {
    // hàm tự tạo mã cho sản phẩm mới
    if(!type) type = document.getElementsByName('chonCompany')[0].value;
    var index = 0;
    for (var i = 0; i < list_product.length; i++) {
        if (list_product[i].type == company) {
            index++;
        }
    }
    document.getElementById('maspThem').value = company.substring(0, 3) + index;
}

// Xóa
function xoaSanPham(id, name) {
    if (window.confirm('Bạn có chắc muốn xóa ' + name)) {
        // Xóa
        for(var i = 0; i < list_product.length; i++) {
            if(list_product[i].id == id) {
                list_product.splice(i, 1);
            }
        }

        // Lưu vào localstorage
        setListProducts(list_product);
        // Vẽ lại table 
        addTableProducts();
    }
}

// Sửa
function suaSanPham(id) {
    var sp = layThongTinSanPhamTuTable('khungSuaSanPham');
    if(!sp) return;
    
    for(var p of list_product) {
        if(p.id == id && p.id != sp.id) {
            alert('Mã sản phẩm bị trùng !!');
            return false;
        }

        if(p.name == sp.name && p.id != sp.id) {
            alert('Tên sản phẩm bị trùng !!');
            return false;
        }
    }
    // Sửa
    for(var i = 0; i < list_product.length; i++) {
        if(list_product[i].id == id) {
            list_product[i] = sp;
        }
    }

    // Lưu vào localstorage
    setListProducts(list_product);

    // Vẽ lại table
    addTableProducts();

    alert('Sửa ' + sp.name + ' thành công');

    document.getElementById('khungSuaSanPham').style.transform = 'scale(0)';
}

function addKhungSuaSanPham(id) {
    var sp;
    for(var p of list_product) {
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
            <td><input type="text" value="`+sp.type+`"></td>
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
         </tr>
            <td>Mô tả:</td>
            <td><input type="text" value="`+sp.description+`"></td>
        </tr>
        <tr>
            <td>Giá tiền:</td>
            <td><input type="text" value="`+sp.price+`"></td>
        </tr>
       <tr>
            <td>Số lượng:</td>
            <td><input type="text" value="`+sp.quantity+`"></td>
        </tr>
            <td colspan="2"  class="table-footer"> <button onclick="suaSanPham('`+sp.id+`')">SỬA</button> </td>
        </tr>
    </table>`
    var khung = document.getElementById('khungSuaSanPham');
    khung.innerHTML = s;
    khung.style.transform = 'scale(1)';
}

// Cập nhật ảnh sản phẩm
function capNhatAnhSanPham(files, id) {
    const reader = new FileReader();
    reader.addEventListener("load", function () {
        // convert image file to base64 string
        previewSrc = reader.result;
        document.getElementById(id).src = previewSrc;
    }, false);

    if (files[0]) {
        reader.readAsDataURL(files[0]);
    }
} 

// Sắp Xếp sản phẩm
function sortProductsTable(loai) {
    var list = document.getElementsByClassName('sanpham')[0].getElementsByClassName("table-content")[0];
    var tr = list.getElementsByTagName('tr');

    quickSort(tr, 0, tr.length-1, loai, getValueOfTypeInTable_SanPham); // type cho phép lựa chọn sort theo mã hoặc tên hoặc giá ... 
    decrease = !decrease;
}

// Lấy giá trị của loại(cột) dữ liệu nào đó trong bảng
function getValueOfTypeInTable_SanPham(tr, loai) {
    var td = tr.getElementsByTagName('td');
    switch(loai) {
        case 'stt' : return Number(td[0].innerHTML);
        case 'ten' : return td[2].innerHTML.toLowerCase();
        case 'gia' : return td[4].innerHTML;
        case 'soluong' : return td[5].innerHTML;
    }
    return false;
}

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


