
var bestCouponFound = 0;
var couponsArray = [];
console.log("I'm in the page now");

// To avoid Dominos payment
var testRestaurant = $('.breadcrumb_pages').find('a:eq(1)').find('span').text();
console.log(testRestaurant);

// var amountPayable = parseFloat(finalTotal);

// Listening to requestId from eventPage.js after the order has been posted to server.
chrome.runtime.onMessage.addListener(
		function(request, sender, sendResponse) {

		if (request.status == "done") {
				sendResponse({status: "got request id"});
		}

		// if (request.message == "couponsFetched") {
		//   sendResponse({message: "goodbye"});
		//   console.log(request.coupons);
		//   var obj = JSON.parse(request.coupons);
		//   console.log(obj)
		//   var arr = [];
		//   for(i=0;i<obj.coupons.length;i++) {
		//     console.log(obj.coupons[i].code);
		//     arr.push(obj.coupons[i].code);
		//   }
		//   setCookie("coupons", JSON.stringify(arr), 1);
		//   // setCookie("coupons", arr, 1);
		//   addCoupons();
		// }

});

// Fetching values and storing it on Parse on checkout button click
$(function(){
		console.log("This is executed first! I didn't knew :p");
		var foodpandaArea = "";

		// Fetching area from local storage
		chrome.storage.local.get('area', function (items) {
				foodpandaArea = items.area;
		});

		toastr.options.timeOut = 60000;
		toastr.info('Click on "Click to apply coupons" thumbnail.');

		$('#shop_order_cart_type_checkout_secondary_button, #shop_order_cart_type_checkout_primary_button').on('click', function(){
				var data = {};
				var restaurant = $('.vendor-title').text();
				var delivery = $('#shop_order_cart_type_expeditionType_0').prop('checked');
				var coupon = $('#shop_order_cart_type_vouchers').val();
				var comment = $('#shop_order_cart_type_orderComment').val();
				var finalTotal = $('tr.total').find('td.price').text();

				data["restaurant"] = restaurant;
				data["delivery"]   = delivery;
				data["coupon"]     = coupon;
				data["comment"]    = comment;
				data["finalTotal"] = finalTotal;

				var order = [];
				// Getting order
				$('li.product').each(function() {
						var item = {};
						item["quantity"] = $(this).find(".checkout-review-order-quantity-controls-container").find(".checkout-review-order-quantity").text();
						var details = $(this).find(".details").find(".checkout-review-product-detail-wrapper").find("h4").html();
						item["details"] = $.trim(details);
						var price = $(this).find(".checkout-review-order-price-wrapper").text();
						item["price"] = $.trim(price);
						item["toppings"] = $(this).find(".toppings-and-choices").text().trim().replace(/\s/g, '');
						order.push(item);
				});

				data["order"] = order;

				// Spliting the Area field
				var res = foodpandaArea.split("|");
				var rees = res[0].split(" ");
				var ans="";
				for(i=4;i<rees.length;i++) {
						ans = ans+rees[i];
				}

				data["area"] = ans;
				// Adding source for the data
				data["source"] = "foodpanda";

				// Sending message to the eventPage.js to store the order
				chrome.runtime.sendMessage({message: "postOrder", data: data}, function(response) {
						// console.log(response.done);
				});

		});
});

function setCookie(cname,cvalue,exdays) {
		var d = new Date();
		d.setTime(d.getTime()+(exdays*24*60*60*1000));
		var expires = "expires="+d.toGMTString();
		document.cookie = cname + "=" + cvalue + "; " + expires;
}

function getCookie(cname) {
	var name = cname + "=";
	var ca = document.cookie.split(';');
	// console.log(ca);
	for(var i=0; i<ca.length; i++) {
		var c = ca[i].trim();
		if (c.indexOf(name)==0) return c.substring(name.length,c.length);
	}
	return "";
}

function checkSavings(coupons) {
	// alert("checkSavings");
	totLen = $(".voucher").find(".title").length;
	// console.log(totLen);
	savings = 0;
	console.log("checkSavings totlen "+ totLen );
	if($(".voucher").find(".title").find(".voucher-applied, p").length > 0) {
		savings=$(".price").find(".price-wrapper").text().trim().split("Rs.")[1].trim();
		console.log(savings);
		savings=parseFloat(savings);
		console.log("checkSavings savings "+ savings );
	}
	else
	{
		savings = 0;
	}
	if(savings>getCookie("perSaving")){
			setCookie("perSaving", savings, 1);
	}

	varName = "savingsFood" + getCookie("doneTill");
	setCookie(varName, savings, 1);
	setCookie("doneTill", parseFloat(getCookie("doneTill")) + 1 , 1);
	applyCoupons(coupons);
}

function preProcessor(i, coupon){
	// console.log("I got " + i + " " + coupon);
	// alert(coupon);
	$('#voucher-success').removeClass("hide");
	$('#voucher-error').removeClass("hide");
	$('#shop_order_cart_type_vouchers').val(coupon);
	document.getElementById('shop_order_cart_type_voucher_button').click();
	// console.log("Coupon Code applied " + coupon);

	// setTimeout(function(){changeFlag(i, coupon);},1000);
}

function finalApply(i, finalCoupon) {
		preProcessor(i, finalCoupon);
}

function endProcess(coupons) {
		alert("endProcess");
		max = -111111;
		ind_req = 1000;
		for(i=0;i<coupons.length;i++) {
				varName = "savingsFood" + i;
				curSaving = getCookie(varName);
				curSaving = parseFloat(curSaving);
				alert("Saving "+curSaving);
				if(max < curSaving) {
						max = curSaving;
						ind_req = i;
				}
				setCookie(varName,0,-1);
		}

		if(max>0) {
				bestCouponFound = 1;
				coup_req = coupons[ind_req];
				setCookie("doneTill", 0, 1);
				setCookie("coupInProgress", 0, 1);
				alert("Final Coupon"+coup_req);
				finalApply(ind_req, coup_req);
		}
}

function applyCoupons(coupons){
		var savings = [];
		var start = parseFloat(getCookie("doneTill"));
		console.log("In the apply coupons:" + start + "  " +coupons.length);
		if(start==""){
				start=0;
		}
		if(start==coupons.length){
				endProcess(coupons);
		}
		else if(start<coupons.length && bestCouponFound==0){
			// alert("appling coupon " + coupons[start]);
			preProcessor(start,coupons[start]);
		}
}

function getCoupons(coupons){
	bestCouponFound = 0;
	setCookie("coupInProgress", 1, 1);
	setCookie("doneTill", 0, 1);
	setCookie("perSaving", 0, 1);
	applyCoupons(coupons);
}

function addCoupons() {
	// console.log("coupons received");
	couponsArray = JSON.parse(getCookie("coupons"));
	// console.log(couponsArray);
}

// function getCouponsFromCloud() {
//
//   console.log("getting coupons");
//   chrome.runtime.sendMessage({message: "getCoupons"}, function(response) {
//   	console.log(response.message);
//   });
//
	// chrome.runtime.onMessage.addListener(
	//   function(request, sender, sendResponse) {
	//     console.log("received response");
	//     // if (request.status == "done") {
	//     //   // var arr = [];
	//     //   // arr = request.coupons;
	//     //   // addCoupons(arr);
	// 		// 	console.log("yes status");
	//     // }
	//
	// 		if (request.message == "couponsFetched") {
	// 			sendResponse({message: "goodbye"});
	// 			console.log(request.coupons);
	// 			var obj = JSON.parse(request.coupons);
	// 			console.log(obj)
	// 			var arr = [];
	// 			for(i=0;i<obj.coupons.length;i++) {
	// 			  console.log(obj.coupons[i].code);
	// 			  arr.push(obj.coupons[i].code);
	// 			}
	//       setCookie("coupons", JSON.stringify(arr), 1);
	//       // setCookie("coupons", arr, 1);
	//       addCoupons();
	//     }
	// });
//
// }

function couponCheck() {

	// getCouponsFromCloud();
	addCoupons();
	var coupStatus = getCookie("coupInProgress");
	if(coupStatus==""){
		setCookie("coupInProgress", 0, 1);
		// console.log("in coupStatus=0");
		// getCouponsFromCloud();
	}
	else if(coupStatus==1){
		// addToDOM();
		// addCoupons();
		checkSavings(couponsArray);
	}
	var imgURL = chrome.extension.getURL("apply-coupons-icon.png");
	// console.log(imgURL);

	if($('#shop_order_cart_type_vouchers').length>0){
		$('.voucher-input-container').after("<a id='couponClick' href='javascript:void();'><img style='margin-top:15px;margin-left:70px;' src='" + imgURL + "'></a>");
		// addToDOM();
		var button = document.getElementById("couponClick");
		button.addEventListener("click", function(){
			getCoupons(couponsArray);
		}, false);
	}
}



if(testRestaurant.indexOf("Domino's") > -1 || testRestaurant.indexOf("Pizza hut") > -1 || testRestaurant.indexOf("Mast") > -1) {
		// We don't accept payments for that
}
else {
		couponCheck();
		// UI elements
		// var $button = $('<input type="button" id="brthePay" class="btn-brthe btn-primary-brthe btn-checkout-brthe" value="Use PayTM wallet to get it for: Rs.'+payable+'" /></br></br></br>');
		// var $message1 = $('<div class="mess" ><span id="message1" class="message">* PayUMoney discount already applied</span></br><span id="message2" class="message">* Extra 20 Off using Brthe</span></div>');
		// var $message2 = $('<span id="message2" class="message">*Extra 20 Off using Brthe</span></div>);
		// var $line = $('</br></br></br>');

		// $('.checkout-review-order').after($message1);
		// $('.checkout-review-order').after($button);
}
