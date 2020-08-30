$(function () {
    'use strict'

    $('[data-toggle="offcanvas"]').on('click', function () {
        $('.offcanvas-collapse').toggleClass('open')
    })
    })
    //hover Dropdown
    $('.dropdown').hover(function(){ 
    $('.dropdown-toggle', this).trigger('click'); 
    });

    $(document).ready(function(){
$('#nav-icon0,#nav-icon1,#nav-icon2,#nav-icon3,#nav-icon4').click(function(){
    $(this).toggleClass('open');
});
});


//Scrol to contact us page 

//City json control

$(document).ready(function(){
  $("#cityPicker").fuzzyComplete(cities);
  });

// Optionbox

$('#mySelect').on('change', function (e) {
  $('#myTab li a').eq($(this).val()).tab('show'); 
});


/// jquery get value

$(document).ready(function(){
  $("select.product_qty_dropdown").change(function(){
      var quantity = $(this).children("option:selected").val();
      var product_id = $(this).attr("product_id");
      var price_per_qty = $(this).attr("price_per_qty");
      var subtotal_id = product_id + "_subtotal";
      $("#"+subtotal_id).html(price_per_qty * quantity);
  });
});



// load cart from local storage



$(document).ready(function(){
  $("select.product_qty_dropdown").change(function(){
      quantity = $(this).children("option:selected").val();
      product_id = $(this).attr("product_id");
      price_per_qty = $(this).attr("price_per_qty");
      subtotal_id = product_id + "_subtotal";
      $("#"+subtotal_id).html(price_per_qty * quantity);
  });
});




////////////////////////////////////
var cart = [];
        $(function () {
            if (localStorage.cart)
            {
                cart = JSON.parse(localStorage.cart);
                showCart();
            }
        });

        function addToCart() {
            var price = price_per_qty
            var name = product_id
            var qty = quantity

            // update qty if product is already present
            for (var i in cart) {
                if(cart[i].Product == name)
                {
                    cart[i].Qty = qty;
                    showCart();
                    saveCart();
                    return;
                }
            }
            // create JavaScript Object
            var item = { Product: name,  Price: price, Qty: qty }; 
            cart.push(item);
            saveCart();
            showCart();
        }

        function deleteItem(index){
            cart.splice(index,1); // delete item at index
            showCart();
            saveCart();
        }

        function saveCart() {
            if ( window.localStorage)
            {
                localStorage.cart = JSON.stringify(cart);
            }
        }

        function showCart() {
            if (cart.length == 0) {
                $("#cart").css("visibility", "hidden");
                return;
            }

            $("#cart").css("visibility", "visible");

            $("#cartBody").empty();
            for (var i in cart) {
                var item = cart[i];
                var row = "<tr><td>" + item.Product + "</td><td>" +
                             item.Price + "</td><td>" + item.Qty + "</td><td>"
                             + item.Qty * item.Price + "</td><td>"
                             + "<button onclick='deleteItem(" + i + ")'>Delete</button></td></tr>";
                $("#cartBody").append(row);
            }
        }


        // function addToCart() {

        //     products = [];
        
        //     price_per_qty = price_per_qty;
        //     product_id = product_id;
        //     quantity = quantity;

        //     console.log("Quantity = " +  quantity)
        //     console.log("product_id = " +  product_id)
        //     console.log("price = " +  price_per_qty)
        
        //     if(localStorage.getItem('products')){
        //         products = JSON.parse(localStorage.getItem('products'));
                
        //     }
            
        //     products.push({ CourseId : product_id , quantity : quantity, price_per_qty : price_per_qty });
        
        //   localStorage.setItem('products', JSON.stringify(products));

        // };
        
        // $('#Remove').click(function(){
        //     let productId = product_id;
        //     let storageProducts = JSON.parse(localStorage.getItem('products'));
        //   let products = storageProducts.filter(product => product.productId !== productId );
        //   localStorage.setItem('products', JSON.stringify(products));
        // });



        // function myFunction() {
        //     var x = localStorage.getItem("products");
        //     document.getElementById("demo").innerHTML = x;
        // }

        // myFunction();



        //////////////////// Flash message 

