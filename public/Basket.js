var Basket = (function(basketButton, products) {
    var basket = {};
    var total = basketButton.querySelector("span.price");
    var container = basketButton.parentNode;
    var basketDisplay;

    function getBasketButton() {
        return basketButton;
    }

    function showBasket() {
        basketDisplay = document.createElement("div");
        basketDisplay.classList.add("basket-display");

        if(Object.keys(basket).length === 0) {
            var noItems = document.createElement("div");
            noItems.classList.add("no-items", "basket-list");
            noItems.innerText = "There are no items in your basket";
            
            basketDisplay.appendChild(noItems);
        } else {
            if(isVisible()) {
                _renderBasketList();
            }
        }

        var payNow = document.createElement("button");
        payNow.classList.add("pay-now");
        payNow.innerText = "Pay Now";

        basketDisplay.appendChild(payNow);

        payNow.addEventListener("click", _checkOut);

        container.appendChild(basketDisplay);
    }

    function hideBasket() {
        basketDisplay.querySelector(".pay-now").removeEventListener("click", _checkOut);

        basketDisplay.parentNode.removeChild(basketDisplay);
        basketDisplay = undefined;
    }

    function isVisible() {
        if(typeof basketDisplay === "undefined") {
            return false;
        }
        return true;
    }

    function addToBasket(id) {
        if(!(id in products)) {
            throw new Error("Product not found");
        }

        if(id in basket) {
            basket[id].qty++;
        } else {
            _addToBasket(id);
        }

        if(isVisible()) {
            _renderBasketList();
        }

        _updateTotal();
    }

    function removeFromBasket(id) {
        if(!(id in basket)) {
            throw new Error("Product not in basket");
        }

        basket[id].qty--;

        if(basket[id].qty === 0) {
            _clearFromBasket(id);
        }

        _renderBasketList();

        _updateTotal();
    }

    function _addToBasket(id) {
        if(!(id in products)) {
            throw new Error("Product not found");
        }

        basket[id] = {
            name: products[id].name,
            price: products[id].price,
            qty: 1
        }
    }

    function _clearFromBasket(id) {
        if(!(id in basket)) {
            throw new Error("Product not in basket");
        }

        delete basket[id];
    }

    function _clearBasket() {
        basket = {};
    }

    function _renderBasketList() {
        if(!isVisible()) {
            throw new Error("Basket is not visible");
        }

        if(basketDisplay.querySelector(".basket-list")) {
            basketDisplay.removeChild(basketDisplay.querySelector(".basket-list"));
        }

        var list = document.createElement("table");
        list.classList.add("basket-list");
        var heading = document.createElement("thead");
        var headingRow = document.createElement("tr");

        var headingName = document.createElement("th");
        headingName.innerText = "Name";
        headingRow.appendChild(headingName);
        var headingQty = document.createElement("th");
        headingQty.innerText = "Qty";
        headingRow.appendChild(headingQty);
        var headingPrice = document.createElement("th");
        headingPrice.classList.add("price");
        headingPrice.innerText = "Price";
        headingRow.appendChild(headingPrice);

        heading.appendChild(headingRow);
        list.appendChild(heading);
        
        for(let id in basket) {
            if (!basket.hasOwnProperty(id)) continue;

            var basketItem = document.createElement("tr");
            var basketItemName = document.createElement("td");
            basketItemName.innerText = basket[id].name;
            basketItem.appendChild(basketItemName);
            var basketItemQty = document.createElement("td");
            basketItemQty.innerText = basket[id].qty;
            basketItem.appendChild(basketItemQty);
            var basketItemPrice = document.createElement("td");
            basketItemPrice.innerHTML = "&pound;" + (basket[id].price * basket[id].qty).toFixed(2);
            basketItem.appendChild(basketItemPrice);

            list.appendChild(basketItem);
        }

        if(basketDisplay.querySelector(".pay-now")) {
            basketDisplay.insertBefore(list, basketDisplay.querySelector(".pay-now"));
        } else {
            basketDisplay.appendChild(list);
        }
    }

    function _calculateTotal() {
        let totalPrice = 0;
        
        for(let id in basket) {
            if (!basket.hasOwnProperty(id)) continue;

            totalPrice += basket[id].price * basket[id].qty;
        }

        return totalPrice;
    }

    function _updateTotal() {
        var totalPrice = _calculateTotal();

        total.innerHTML = "&pound;" + totalPrice.toFixed(2);
    }

    function _checkOut() {
        try {
            var myCheckout = new Checkout(basket);

            if(myCheckout) {
                myCheckout.then(function(response) {
                    _clearBasket();
                    
                    if(isVisible()) {
                        _renderBasketList();
                    }

                    _updateTotal();

                    alert("Your payment was successful");
                }).catch(function(error) {
                    console.warn(error);
                    alert("Could not complete payment");
                });
            }
        } catch(e) {
            console.log(":(");
            alert(e.message);
        }
    }

    return {
        getBasketButton: getBasketButton,
        showBasket: showBasket,
        hideBasket: hideBasket,
        addToBasket: addToBasket,
        removeFromBasket: removeFromBasket,
        isVisible: isVisible
    }
});