Parse.initialize("TEqFhaM4HLieGdKlpL10nwcZyattYPUteRGASah5","wMwVLl2UKIcc51J1uXiayCrWTkGgGXB5DXGetX5h");

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

chrome.runtime.onInstalled.addListener(function(details){
	if(details.reason==="install"){
		var ExtensionUserClass=Parse.Object.extend("ExtensionUser");
		var extensionUser = new ExtensionUserClass();
		extensionUser.set("coupons",[]);
		extensionUser.set("order_and_user",[]);
		extensionUser.save(null, {
			success: function(extensionUser) {
				chrome.storage.sync.set({
				'userID': extensionUser.id
				});
			},
			error: function(extensionUser, error){
				alert("There was some problem. Please re-install!");
			}
		});
	}
	else if(details.reason==="update"){
		var thisVersion = chrome.runtime.getManifest().version;
	}
});

chrome.runtime.onMessage.addListener(
	function(request,sender,sendResponse){
	//console.log(request);
	if(request.message === "UserAuth"){	
		var NotebookClass = Parse.Object.extend("Notebook");
		var query = new Parse.Query(NotebookClass);
		query.equalTo("value", request.value);
		query.find({
			success: function(results) {
			if(results.length > 0){
				//console.log(results[0].get("coupons"));
				chrome.storage.sync.get("userID",function(result){
					//console.log(result);
					var userID = result.userID;
					var ExtensionUserClass = Parse.Object.extend("ExtensionUser");
					var query1 = new Parse.Query(ExtensionUserClass);
					query1.equalTo("objectId",userID);
					query1.first({
						success: function(object) {
							var arr = object.get("coupons");
							var arr1 = results[0].get("coupons");
							var arr2 = arr.concat(arr1);
							object.set("coupons",arr2);
							object.save();
							//alert("Done");
							results[0].destroy({
								success: function(myObject){},
								error: function(myObject, error) {}
							});
						},
						error: function(error) {
								alert("Error: " + error.code + " " + error.message);
						}
					});
						
				});		  
			}
			else{alert("This is an invalid BookID!!");}
			},
			error: function(error){}
		});
	}
	if(request.message === "GetCouponsFoodPanda"){
		chrome.storage.sync.get("userID",function(res){
			//console.log("User ID = "+res.userID);
			Parse.Cloud.run('GetCouponsFoodPanda',{"objectId": res.userID},{
				success: function(result){
					//console.log("Coupons-Fetched="+result);
					chrome.tabs.query({active: true,currentWindow: true},function(tabs){
						chrome.tabs.sendMessage(tabs[0].id,{message:"couponsFetched",coupons:result},function(response){});
					});
				},
				error: function(error){
					alert("Failed to receive Coupons.(Server Failure)");	
				}
			});
		});	
	}


	if(request.message === "PostOrder"){
		var FoodPandaObject = Parse.Object.extend("FoodPanda");
		var foodpandaObject = new FoodPandaObject();

		foodpandaObject.set("area", request.data.area);
		foodpandaObject.set("restaurant", request.data.restaurant);
		foodpandaObject.set("delivery", request.data.delivery);
		foodpandaObject.set("coupon", request.data.coupon);
		foodpandaObject.set("comment", request.data.comment);
		foodpandaObject.set("finalTotal", request.data.finalTotal);
		foodpandaObject.set("order", request.data.order);
		foodpandaObject.set("payable", request.data.payable);

		//console.log(request.data);
		foodpandaObject.save(null, {
			success: function(foodpandaObject) {
				setCookie("orderID",foodpandaObject.id,1);
				setCookie("coupon",request.data.coupon,1);

				chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
				chrome.tabs.sendMessage(tabs[0].id, {status:"done", orderID: foodpandaObject.id}, function(response){});
				});
			},
			error: function(foodpandaObject,error){
			}
		});
	}

	if (request.message === "PostUserDetails"){
		var UserDetailsObject = Parse.Object.extend("UserDetails");
		var userDetailsObject = new UserDetailsObject();

		userDetailsObject.set("firstName", request.data.firstName);
		userDetailsObject.set("lastName", request.data.lastName);
		userDetailsObject.set("email", request.data.email);
		userDetailsObject.set("mobileNumber", request.data.mobileNumber);
		userDetailsObject.set("addressLine1", request.data.addressLine1);
		userDetailsObject.set("addressLine2", request.data.addressLine2);

		var requestId="";
		userDetailsObject.save(null, {
			success: function(userDetailsObject){
				requestId = userDetailsObject.id;

				chrome.storage.sync.get("userID",function(result){
					var ExtensionUserClass = Parse.Object.extend("ExtensionUser");
					var query = new Parse.Query(ExtensionUserClass);
					query.equalTo("objectId",result.userID);
					query.first({
						success: function(object) {
							var coupon = getCookie("coupon");
							var arr = object.get("coupons");
							//console.log("Previous array is "+ arr);
							
							for(var i=0;i<arr.length;i++){
								if(arr[i].id===coupon)arr.splice(i,1);
							}
							//console.dir("Coupons is "+coupon);

							//console.log("New array is "+ arr);

							object.set("coupons",arr);

							var arr1 = object.get("order_and_user");
							var tmp={};
							tmp["orderID"] = getCookie("orderID");
							tmp["userID"] = requestId;
							arr1.push(tmp);
							object.set("order_and_user",arr1);
							
							object.save();
							// alert("Done");
						},
						error: function(error){}
					});		
				});
			},
			error: function(userDetailsObject, error){}
		});
	}
});


