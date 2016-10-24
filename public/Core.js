(function() {
    let products = {
        1: {
            name: "Book",
            price: 20.00
        },
        2: {
            name: "Hat",
            price: 12.00
        },
        3: {
            name: "T-Shirt",
            price: 15.00
        }
    };

    var myBasket = new Basket(document.getElementById("basket-button"), products);

    Array.from(document.querySelectorAll(".products .product")).forEach(function(element) {
        element.querySelector("button").addEventListener("click", function(e) {
            myBasket.addToBasket(element.dataset.id)
        });
    }, this);

    document.getElementById("basket-button").addEventListener("click", function(e) {
        if(myBasket.isVisible()) {
            myBasket.hideBasket();
        } else {
            myBasket.showBasket();
        }
    });
})();