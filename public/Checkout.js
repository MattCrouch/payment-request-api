var Checkout = (function(basket) {
    //Check if Payment Request API is supported
    if(!window.PaymentRequest) {
        //In production, you would need to display a regular payment form instead
        throw new Error("Payment Request API not supported");
    }
    
    //Don't go further if the basket is empty
    if(Object.keys(basket).length === 0) {
        throw new Error("Basket is empty");
    }

    //Stores all possible shipping methods
    var allShippingMethods = {
        first: {
            id: "first",
            label: "First Class",
            amount: {
                currency: "GBP",
                value: "5.00"
            },
            selected: false
        },
        second: {
            id: "second",
            label: "Second Class",
            amount: {
                currency: "GBP",
                value: "2.00"
            },
            selected: false
        },
        international: {
            id: "international",
            label: "International Shipping",
            amount: {
                currency: "GBP",
                value: "20.00"
            },
            selected: false
        }
    };

    //Hold the current set option of the shipping method
    var currentShipId;

    //Contains all details related to the customer's payment method
    var method = [
        {
            supportedMethods: ["mastercard", "visa", "amex"]
        }
    ];

    //Contains details of what the customer is buying
    var details = {
        displayItems: generateDisplayItems(),
        total: {
            label: "Total",
            amount: {
                currency: "GBP",
                value: "0.00"
            }
        }
    };

    //Contains extra details about the transaction, such as other details to ask for
    var options = {
        requestShipping: true,
        requestPayerPhone: true,
        requestPayerEmail: true
    }

    details.total.amount.value = generateTotal().toFixed(2);

    function generateDisplayItems() {
        var displayItems = [];

        //Build "purchases" from basket items
        var total = 0;

        for(var id in basket) {
            if (!basket.hasOwnProperty(id)) continue;

            total += basket[id].price * basket[id].qty;
        }

        displayItems.push({
            label: "Purchases",
            amount: {
                currency: "GBP",
                value: total.toFixed(2)
            }
        });

        //Add shipping info in if set
        if(request && currentShipId && allShippingMethods.hasOwnProperty(currentShipId)) {
            displayItems.push({
                label: "Shipping",
                amount: {
                    currency: allShippingMethods[currentShipId].amount.currency,
                    value: allShippingMethods[currentShipId].amount.value
                }
            });
        }

        return displayItems;
    }

    //Generate the final "total" number on request
    function generateTotal() {
        var displayItemsTotal = 0;
        details.displayItems.forEach(function(item) {
            displayItemsTotal += parseFloat(item.amount.value);
        }, this);

        return displayItemsTotal;
    }

    //Set up the PaymentRequest with the correct values
    var request = new PaymentRequest(method, details, options);

    //Listen for shipping address changes
    request.addEventListener('shippingaddresschange', e => {
        e.updateWith(((details, address) => {
            var shippingOptions = [];

            //Reset shipping method when changing address
            currentShipId = undefined;

            if(address.country == "GB") {
                //Offer first and second class postage
                shippingOptions.push(JSON.parse(JSON.stringify(allShippingMethods.first)));
                shippingOptions.push(JSON.parse(JSON.stringify(allShippingMethods.second)));
            } else {
                //Offer international postage only
                shippingOptions.push(JSON.parse(JSON.stringify(allShippingMethods.international)));
            }

            details.shippingOptions = shippingOptions;

            //Update display items to remove any existing "shipping" value     
            details.displayItems = generateDisplayItems();
            details.total.amount.value = generateTotal().toFixed(2);

            return Promise.resolve(details);
        })(details, request.shippingAddress));
    });

    //Fire when shipping option changes
    request.addEventListener('shippingoptionchange', e => {
        e.updateWith(((details, shippingOptionId) => {
            currentShipId = shippingOptionId;
            //Update display items based on shipping option selected
            details.displayItems = generateDisplayItems();
            details.total.amount.value = generateTotal().toFixed(2);

            //Update selected status of current shipping option to keep UI up-to-date
            details.shippingOptions.forEach(function(shippingOption) {
                if(shippingOption.id == shippingOptionId) {
                    shippingOption.selected = true;
                } else {
                    shippingOption.selected = false;
                }
                shippingOption.selected = (shippingOption.id == shippingOptionId ? true : false)
            }, this);

            return Promise.resolve(details);
        })(details, request.shippingOption));
    });

    //Abort the payment after 5 minutes
    setTimeout(function() {
        if(request) {
            request.abort();
        }
    }, (1000 * 60 * 5));

    return new Promise(function(topResolve, topReject) {
        request.show().then(function(paymentResponse) {
            //paymentResponse contains payment information
            console.log(paymentResponse);

            //Create object to send to server
            var paymentDetails = {
                method: paymentResponse.method,
                details: paymentResponse.details
            }

            //Send details to payment provider for success/failure
            return fetch("/checkout", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(paymentDetails)
            }).then(res => {
                if (res.status >= 200 && res.status < 300) {  
                    paymentResponse.complete("success").then(function() {
                        request = null;
                        topResolve(res);
                    });
                } else {  
                    return Promise.reject(new Error(res.statusText));  
                } 
            }).catch(err => {
                //Payment was rejected
                paymentResponse.complete("fail").then(function() {
                    request = null;
                    topReject(err);
                });
            });    
        }).catch(function(err) {
            //Other error, e.g. user cancelled payment
            request = null;
            topReject(err);
        });
    });
});