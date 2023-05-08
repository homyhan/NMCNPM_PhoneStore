var productServ={
    fetchProduct: function () {
        return axios({            
            url: "https://63e677b27eef5b223386ae8a.mockapi.io/phones",
            method: "GET"
        })
    },
    fetchProductDetail: function (id) {
        return axios({
            url: "https://63e677b27eef5b223386ae8a.mockapi.io/phones/"+id,
            method: "GET"
        })
    },
    fetchAccSignin: function (){
        return axios({
            url: "https://63e677b27eef5b223386ae8a.mockapi.io/signin",
            method: "GET"
        })
    },
    fetchProfile: function (id){
        return axios({
            url: "https://63e677b27eef5b223386ae8a.mockapi.io/signin/"+id,
            method: "GET"
        })
    },
    fetchCart: function (acc) {
        return axios({
            url: "https://63e677b27eef5b223386ae8a.mockapi.io/signin?account="+acc,
            method: "GET"
        })
    }
}