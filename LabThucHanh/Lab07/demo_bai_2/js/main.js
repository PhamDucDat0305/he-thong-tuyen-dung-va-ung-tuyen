'use strict';

(function ($) {

    /*------------------
        Preloader
    --------------------*/
    $(window).on('load', function () {
        $(".loader").fadeOut();
        $("#preloder").delay(200).fadeOut("slow");

        /*------------------
            Gallery filter
        --------------------*/
        $('.featured__controls li').on('click', function () {
            $('.featured__controls li').removeClass('active');
            $(this).addClass('active');
        });
        if ($('.featured__filter').length > 0) {
            var containerEl = document.querySelector('.featured__filter');
            var mixer = mixitup(containerEl);
        }
    });

    /*------------------
        Background Set
    --------------------*/
    $('.set-bg').each(function () {
        var bg = $(this).data('setbg');
        $(this).css('background-image', 'url(' + bg + ')');
    });

    //Humberger Menu
    $(".humberger__open").on('click', function () {
        $(".humberger__menu__wrapper").addClass("show__humberger__menu__wrapper");
        $(".humberger__menu__overlay").addClass("active");
        $("body").addClass("over_hid");
    });

    $(".humberger__menu__overlay").on('click', function () {
        $(".humberger__menu__wrapper").removeClass("show__humberger__menu__wrapper");
        $(".humberger__menu__overlay").removeClass("active");
        $("body").removeClass("over_hid");
    });

    /*------------------
		Navigation
	--------------------*/
    $(".mobile-menu").slicknav({
        prependTo: '#mobile-menu-wrap',
        allowParentLinks: true
    });


    $('.hero__categories__all').on('click', function(){
        $('.hero__categories ul').slideToggle(400);
    });

    /*-------------------
		Quantity change
	--------------------- */
    var proQty = $('.pro-qty');
    proQty.prepend('<span class="dec qtybtn">-</span>');
    proQty.append('<span class="inc qtybtn">+</span>');
    proQty.on('click', '.qtybtn', function () {
        var $button = $(this);
        var oldValue = $button.parent().find('input').val();
        if ($button.hasClass('inc')) {
            var newVal = parseFloat(oldValue) + 1;
        } else {
            // Don't allow decrementing below zero
            if (oldValue > 0) {
                var newVal = parseFloat(oldValue) - 1;
            } else {
                newVal = 0;
            }
        }
        $button.parent().find('input').val(newVal);
        updateCartTotal();
    });

    /*-------------------
	Bổ sung hàm updateTotal()
	--------------------- */
    
    // function updateTotal(){
    //     var solg=document.getElementById('quantity').value;
    //     var gia=document.getElementsByClassName('shoping__cart__price')[0];
    //     var tong=solg*parseFloat(gia.innerText);

    //     document.getElementById('total').innerText=tong.toFixed(3)+"đ";
    // }

    function fmt(n) {
        return n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".") + " đ";
      }

      // Hàm cập nhật tổng từng sản phẩm và tổng giỏ hàng
      function updateCartTotal() {
        let total = 0;
    
        document.querySelectorAll("tbody tr").forEach(row => {
    
            const priceEl = row.querySelector(".shoping__cart__price");
            const qtyInput = row.querySelector(".quantity");
            const totalEl = row.querySelector(".shoping__cart__total");
    
            if (!priceEl || !qtyInput || !totalEl) return;
    
            // lấy giá
            const price = parseInt(
                priceEl.textContent.replace(/[^\d]/g, "")
            ) || 0;
    
            // lấy số lượng
            let qty = parseInt(qtyInput.value);
            if (isNaN(qty) || qty < 1) qty = 1;
    
            qtyInput.value = qty;
    
            // tính subtotal
            const subtotal = price * qty;
    
            totalEl.textContent = subtotal.toLocaleString("vi-VN") + " đ";
    
            total += subtotal;
        });
    
        const cartTotal = document.getElementById("cart-total");
        if (cartTotal) {
            cartTotal.textContent = total.toLocaleString("vi-VN") + " đ";
        }
    }
})(jQuery);