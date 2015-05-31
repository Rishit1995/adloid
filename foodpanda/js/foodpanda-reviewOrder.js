function setCookie(cname,cvalue,exdays) {
	var d = new Date();
	d.setTime(d.getTime()+(exdays*24*60*60*1000));
	var expires = "expires="+d.toGMTString();
	document.cookie = cname + "=" + cvalue + "; " + expires;
}
function getCookie(cname){
	var name = cname + "=";
	var ca = document.cookie.split(';');
	for(var i=0; i<ca.length; i++) {
		var c = ca[i].trim();
		if (c.indexOf(name)==0) return c.substring(name.length,c.length);
	}
	return "";
}

var bestCouponFound = 0;
var couponsArray = [];

chrome.runtime.onMessage.addListener(
	function(request, sender, sendResponse) {
	if (request.status == "done"){
		sendResponse({status: "got request id"});
	}
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


function calculateSavings(coupons) {
	var len = $(".voucher").find(".title").length;
	savings = 0;
	if($(".voucher").find(".title").find(".voucher-applied, p").length > 0){
		savings=$(".price").find(".price-wrapper").text().trim().split("Rs.")[1].trim();
		savings=parseFloat(savings);
		console.log("calculateSavings savings:"+ savings);
	}
	else{
		savings = 0;
	}
	if(savings>getCookie("maxSaving")){
			setCookie("maxSaving", savings, 1);
	}

	varName = "savingsFood" + getCookie("appliedTill");
	setCookie(varName,savings,1);
	setCookie("appliedTill",parseFloat(getCookie("appliedTill"))+1,1);
	applyCoupons(coupons);
}

function preProcessor(coupon){
	$('#voucher-success').removeClass("hide");
	$('#voucher-error').removeClass("hide");
	$('#shop_order_cart_type_vouchers').val(coupon);
	document.getElementById('shop_order_cart_type_voucher_button').click();
}
function finalApply(finalCoupon) {
		preProcessor(finalCoupon);
}
function sortFunction(a,b){
	return a.coupon - b.coupon;
}
function applyNextCoupon(){
	console.log("Apply next coupon");
	setCookie("couponsApplied",parseFloat(getCookie("couponsApplied"))+1,1);
	var n = getCookie("couponsApplied");
	var arr =  JSON.parse(getCookie("sortedCoupons"));
	if(arr.length > n){
		finalApply(arr[n]["coupon"]);
	}
	else{
		alert("No coupons found!");
	}
}
function endProcess(coupons) {
		alert("Final Process");
		var couponsWithSavings = [];
		for(i=0;i<coupons.length;i++) {
			varName = "savingsFood" + i;
			curSaving = getCookie(varName);
			curSaving = parseFloat(curSaving);
			if(curSaving>0){
				couponsWithSavings.push({});
				couponsWithSavings[i]["savings"] = curSaving;
				couponsWithSavings[i]["coupon"] = couponsArray[i];
			}
			setCookie(varName,0,-1);
		}
		couponsWithSavings.sort(sortFunction);
		if(couponsWithSavings.length>0){
			bestCouponFound = 1;
			coup_req = couponsWithSavings[0]["coupon"];
			setCookie("appliedTill", 0,1);
			setCookie("applyingCoupons", 0,1);
			setCookie("couponApplied",0,1);
			setCookie("sortedCoupons",JSON.stringify(couponsWithSavings),1);
			alert("Final Coupon : "+coup_req);
			finalApply(coup_req);
		}
		else{
			setCookie("couponApplied",-1,1);
			setCookie("sortedCoupons",JSON.stringify(couponsWithSavings),1);
			alert("No coupons found!");
		}
}
function applyCoupons(coupons){
	var savings = [];
	var start = parseFloat(getCookie("appliedTill"));
	console.log("Coupons no:" + start + " ; Coupons length:" +coupons.length);
	if(start==""){
		start=0;
	}
	if(start==coupons.length){
		endProcess(coupons);
	}
	else if(start<coupons.length && bestCouponFound==0){
		preProcessor(coupons[start]);
	}
}
function startApplyCoupons(coupons){
	bestCouponFound = 0;
	setCookie("applyingCoupons", 1, 1);
	setCookie("appliedTill", 0, 1);
	setCookie("maxSaving", 0, 1);
	applyCoupons(coupons);
}
function couponCheck(){
	console.log("coupons checks");
	couponsArray = JSON.parse(getCookie("coupons"));
	console.log(couponsArray);
	console.log(couponsArray.length);
	var couponApplyingStatus = getCookie("applyingCoupons");
	if(couponApplyingStatus==""){
		setCookie("applyingCoupons", 0, 1);
	}
	else if(couponApplyingStatus==1){
		calculateSavings(couponsArray);
	}
	var imgURL = chrome.extension.getURL("apply-coupons-icon.png");
	var imgURL1 = chrome.extension.getURL("next.png");
	console.log(imgURL);
	console.log(imgURL1);
	if($('#shop_order_cart_type_vouchers').length>0){
		$('.voucher-input-container').after("<a id='nextClick' href='javascript:void();'><img style='margin-top:15px;margin-left:70px;height:120px;width:120px;' src='" + imgURL1 + "'></a>");
		$('.voucher-input-container').after("<a id='couponClick' href='javascript:void();'><img style='margin-top:15px;margin-left:10px;height:100px;width:100px;' src='" + imgURL + "'></a>");
		
		var button = document.getElementById("couponClick");
		var nextButton = document.getElementById("nextClick");
		
		button.addEventListener("click",function(){startApplyCoupons(couponsArray);},false);
		nextButton.addEventListener("click",function(){
			console.log("Next button clicked");
			applyNextCoupon();
		},false);
	}
}

couponCheck();