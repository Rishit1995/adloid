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
		setCookie("orderID",request.orderID);
	}
});

// Fetching values and storing it on Parse on checkout button click
$(function(){
		var foodpandaArea = "";
		chrome.storage.local.get('area', function (items) {
				foodpandaArea = items.area;
		});
		$('#shop_order_cart_type_checkout_secondary_button, #shop_order_cart_type_checkout_primary_button').on('click', function(){
			console.log("checkout clicked");
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
			if(coupon===""){
				chrome.storage.local.set({"coupon":""});
			}
			var order = [];
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
			data["area"] = foodpandaArea;
			data["source"] = "foodpanda";
			
			console.log("Posting order. Data is +");
			console.dir(data);
			chrome.runtime.sendMessage({message: "PostOrder", data: data},function(response){});
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
	varName = "savingsFood"+getCookie("appliedTill");
	setCookie(varName,savings,1);
	setCookie("appliedTill",parseFloat(getCookie("appliedTill"))+1,1);
	applyCoupons(coupons);
}
function preProcessor(coupon){
	
	$('#voucher-success').removeClass("hide");
	$('#voucher-error').removeClass("hide");
	$('#shop_order_cart_type_vouchers').val(coupon.id);
	document.getElementById('shop_order_cart_type_voucher_button').click();
}
function finalApply(finalCoupon){
	chrome.storage.local.set({"coupon":finalCoupon});
	preProcessor(finalCoupon);
}
function applyNextCoupon(){
	console.log("Apply next coupon");
	setCookie("couponApplied",parseFloat(getCookie("couponApplied"))+1,1);
	var n = getCookie("couponApplied");
	
	var arr =  JSON.parse(getCookie("sortedCoupons"));
	console.dir(arr);

	if(arr.length>n){
		chrome.storage.local.set({
			'done':1
		});
		finalApply(arr[n]["coupon"]);
	}
	else{
		chrome.storage.local.set({"coupon":""});
	}
}
function sortFunction(a,b){
	return a.savings - b.savings;
}
function endProcess(coupons) {
	var couponsWithSavings=[];
	var n=0;
	for(i=0;i<coupons.length;i++) {
		varName = "savingsFood" + i;
		curSaving = getCookie(varName);
		curSaving = parseFloat(curSaving);
		if(curSaving>0){
			couponsWithSavings.push({});
			couponsWithSavings[n]["savings"] = curSaving;
			couponsWithSavings[n]["coupon"] = couponsArray[i];
			n++;
		}
		setCookie(varName,0,-1);
	}
	couponsWithSavings.sort(sortFunction);
	
	if(couponsWithSavings.length>0){
		bestCouponFound=1;
		coup_req = couponsWithSavings[0]["coupon"];
		setCookie("appliedTill", 0,1);
		setCookie("applyingCoupons", 0,1);
		setCookie("couponApplied",0,1);
		setCookie("sortedCoupons",JSON.stringify(couponsWithSavings),1);
		// alert("Final Coupon : "+coup_req.id);
		finalApply(coup_req);
	}
	else{
		setCookie("couponApplied",-1,1);
		setCookie("sortedCoupons",JSON.stringify(couponsWithSavings),1);
		// alert("No coupons found!");
	}
}
function applyCoupons(coupons){
	var start = parseFloat(getCookie("appliedTill"));
	console.log("Coupons no:" + start + " ; Coupons length:" +coupons.length);
	if(start==""){
		start=0;
	}
	if(start==coupons.length){
		chrome.storage.local.set({
			'done': 1
		});
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
function note(){
	$(document).ready(function(){
	$.notify.addStyle('buttonNotify',{
		html: 
		  "<div>" +
			"<div class='clearfix'>" +
			  "<div class='title' data-notify-html='title'/>" +
			  "<div class='buttons'>" +
				"<button class='yes' data-notify-text='button'></button>" +
				"<button class='no'>Cancel</button>" +
			  "</div>" +
			"</div>" +
		  "</div>"
		});
	var status=0;
	chrome.storage.local.get(null, function (items) {
		console.log(items);
		status = items.done;
		var str;
		var coupon = getCookie("couponID");
		var note = getCookie("note");
		if(status==1){
			str="Click to apply next best coupon.";
			if(items.coupon===""){
				console.log("No coupons applicable!");
				$.notify("No coupons applicable!",{className:'error',autoHide:false,clickToHide:false});
			}
			else{
				$.notify("Coupon : "+items.coupon.id,{className:'success',autoHide:false,clickToHide:false});
				if(typeof items.coupon.note != "undefined"){
					$.notify("Note : "+items.coupon.note,{className:'info',autoHide:false,clickToHide:false});
				}
			}
		}
		else{
			str="Click to apply best coupon.";
		}
		$.notify({
		  title: str,
		  button: 'Apply'
		},
		{ 
		  style: 'buttonNotify',
		  autoHide: false,
		  clickToHide: false
		});
		// Handlers
		$(document).on('click', '.notifyjs-buttonNotify-base .no', function() {
			$(this).trigger('notify-hide');
		});
		$(document).on('click', '.notifyjs-buttonNotify-base .yes', function() {
			if(status==1)applyNextCoupon();
			else startApplyCoupons(couponsArray);
			$(this).trigger('notify-hide');
		});
		});
	});
}

function couponCheck(){
	chrome.storage.local.get('coupons',function (items) {
		couponsArray = items.coupons;
		console.dir("Coupon Array=");
		console.dir(couponsArray);
		var couponApplyingStatus = getCookie("applyingCoupons");
		console.log("Coupon Applying Status="+ couponApplyingStatus);
		if(couponApplyingStatus==""){
			setCookie("applyingCoupons", 0, 1);
		}
		else if(couponApplyingStatus==1){
			calculateSavings(couponsArray);
		}
		note();
	});
}
couponCheck();