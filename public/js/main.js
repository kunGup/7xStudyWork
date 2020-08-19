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

