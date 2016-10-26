(function() {
    let products = {
        1: {
            name: "Cremoso",
            price: 22.00
        },
        2: {
            name: "Forte",
            price: 22.50
        },
        3: {
            name: "Immediato",
            price: 17.50
        },
        4: {
            name: "Macinato",
            price: 20.00
        },
        5: {
            name: "Miscelato",
            price: 15.00
        },
        6: {
            name: "Ricco",
            price: 30.00
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