var webstore = new Vue({
    el: '#app',
    data: {
        showClasses: true,
        sitename: 'After School Classes',
        cart: [], //Array to store items in shopping cart
        lessons: [],
        navButtonName: "Cart and Checkout",
        sortType: '', //Variable for the sorting type
        order: {
            firstName: "",
            lastName: "",
            address: "",
            city:"",
            phone:"",
            method:'Home',
            gift: false,
            sendGift: 'Send as a gift',
            dontSendGift: 'Do not send as a gift'
        },
    },
    methods:{
        addToCart: function (lesson) {     
            this.cart.push({
                lesson_id: lesson.lesson_id, 
                topic: lesson.topic, 
                image: lesson.image,
                price: lesson.price,
                location: lesson.location,
                availableSpaces: lesson.availableSpaces,
                description: lesson.description
            });
            lesson.availableSpaces = lesson.availableSpaces - 1;
        },
        addToCheckOutCart(lesson){
            this.addToCheckOutCart.push(lesson);
        },
        showCheckout: function(){
            this.showClasses = this.showClasses ? false : true;
            this.showCart();
            //Changing button name for navigation between classes and cart/checkout
            if (this.showClasses == false){
                this.navButtonName = "Classes";
            }else{
                this.navButtonName = "Cart and Checkout";
            }
        },
        showCart: function(){
            let cartHTML = "";
            let cartItemsDiv = document.getElementById('cartItemsDiv');
            cartHTML += '<h2>Cart</h2>';
                for(let i=0; i < this.cart.length; i++){
                    //Displaying all classes in cart
                    cartHTML +=
                    "<div class='cart-product'>"+
                            "<div class='card horizontal'>" +
                                "<div class='card-image'>" +
                                    "<img src ='" + this.cart[i].image + "'>"+
                                "</div>" +
                                "<div class='card-stacked'>" +
                                    "<div class='card-content'>" +
                                    "<span class='topic'>Topic: </span>" +
                                    "<p class='topicp'>" + this.cart[i].topic + "</p>" +
                                    "<span class='location'>Location: </span>" +
                                    "<p class='locationp'>" + this.cart[i].location + "</p>" +
                                    "<span class='price'> Price: </span>" +
                                    "<p class='pricep'>£" + this.cart[i].price + "</p>" + 
                                    "<span class='description'>Description: </span>" +
                                    "<p class='descriptionp'>" + this.cart[i].description + "</p>" +  
                                    "<button class='removeItemBtn' ref='removeItemBtn' onclick='removeItem(this.lesson, this.cart)'> Remove </button>" +          
                                    "</div>" + 
                                "</div>" + 
                            "</div>" + 
                    "</div>";
                }
            cartItemsDiv.innerHTML = cartHTML;
        }, 
        //Showing checkout button if an item is added to the cart
        showCheckoutButton: function(){
            return 0 < this.cart.length;
        },
        sort(type) {
            this.sortType = type;
        },
        canAddToCart: function(lesson){
            return lesson.availableSpaces > this.cartCount(lesson.id);
        },
        validateCheckoutInputs: function() {
            if (this.order.firstName.value == "") {
                var x = document.forms["myForm"]["firstName"].value;
            if (x == "") {
                alert("Name must be filled");
                return false;
            }
            }else{
                this.submitForm();
            }
        },
        checkForm: function () {
            return (this.order.firstName.length > 0 && this.order.lastName.length > 0 && this.order.phone.length > 0);
        },     
        cartCount(id){
            let count = 0;
            for (let i = 0; i < this.cart.length; i++){
                if(this.cart[i] === id){
                    count++
                }
            }
            return count;
        },
        async fetchData() {
            const response = await fetch('/lessons');
            this.lessons = await response.json();
        },
        async placeOrder(){
            document.getElementById("orderForm").addEventListener("click", (event) => {
                event.preventDefault();
                const orderData = {
                    firstName: document.querySelector("#orderFirstName").value,
                    lastName: document.querySelector("#orderLastName").value,
                    address: document.querySelector("#orderAddress").value,
                    city: document.querySelector("#orderCity").value,
                    phone_no: document.querySelector("#orderPhone").value,
                    order: this.cart
                }

                //Fetch to POST order data
                fetch('/placeOrder', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify(orderData),
                }).then(this.updateSpaces());
            });
        },
        async updateSpaces(){
            const updateData = this.cart;

            //Fetch to update available lesson spaces after order
            fetch('/updateSpaces', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(updateData),
            }).then(window.location = "/")
        },
    },
    created() {
        this.fetchData();
    },
    computed: {
        cartItemCount: function(){
            return this.cart.length;
        },
        async fetchData() {
            fetch('/lessons').then(
            function (response) {
            response.json().then(
                function (json) {
                    this.lessons = json;
                });
            });
        },
        //Sorting Classes
        items() {
            if(this.sortType === '') return this.classes;
            if(this.sortType === 'topicAscending') {
              return this.classes.sort((a,b) => {
                if(a.topic > b.topic) return -1;
                if(a.topic < b.topic) return 1;
                return 0;
              });
            }
            if(this.sortType === 'topicDescending') {
                return this.classes.sort((a,b) => {
                  if(a.topic < b.topic) return -1;
                  if(a.topic > b.topic) return 1;
                  return 0;
                });
              }
            if(this.sortType === 'priceAscending') {
              return this.classes.sort((a,b) => {
                if(a.price < b.price) return -1;
                if(a.price > b.price) return 1;
                return 0;
              });
            }
            if(this.sortType === 'priceDescending') {
                return this.classes.sort((a,b) => {
                  if(a.price > b.price) return -1;
                  if(a.price < b.price) return 1;
                  return 0;
                });
            }
            if(this.sortType === 'locationAscending') {
                return this.classes.sort((a,b) => {
                  if(a.location > b.location) return -1;
                  if(a.location < b.location) return 1;
                  return 0;
                });
            }
            if(this.sortType === 'locationDescending') {
                return this.classes.sort((a,b) => {
                  if(a.location < b.location) return -1;
                  if(a.location > b.location) return 1;
                  return 0;
                });
            }
            if(this.sortType === 'availabilityAscending') {
                return this.classes.sort((a,b) => {
                  if(a.availableSpaces < b.availableSpaces) return -1;
                  if(a.availableSpaces > b.availableSpaces) return 1;
                  return 0;
                });
            }
            if(this.sortType === 'availabilityDescending') {
                return this.classes.sort((a,b) => {
                  if(a.availableSpaces > b.availableSpaces) return -1;
                  if(a.availableSpaces < b.availableSpaces) return 1;
                  return 0;
                });
            }
        },
    },
});