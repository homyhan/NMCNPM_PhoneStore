function CartItem(product, quantity) {
    this.product = product;
    this.quantity = quantity;

    this.total = function(){
        return this.product.price * this.quantity;
    }
    
}