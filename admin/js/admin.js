var productList = [];
function setListProducts(newList) {
    window.localStorage.setItem('ListProduct', JSON.stringify(newList));
}

function getListProducts() {
    return JSON.parse(window.localStorage.getItem('ListProduct'));
}

window.onload = function () {
    // get data từ localstorage
    list_product = getListProducts() || list_product;

    addEventChangeTab();
    addTableProducts();
    openTab('Sản Phẩm')
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


