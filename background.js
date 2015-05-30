Parse.initialize("TEqFhaM4HLieGdKlpL10nwcZyattYPUteRGASah5","wMwVLl2UKIcc51J1uXiayCrWTkGgGXB5DXGetX5h");


// Parse.Cloud.run('hello', {}, {
// 	success: function(result) {
// 		// result is 'Hello world!'
// 		console.log(result);
// 		var NotebookClass = Parse.Object.extend("Notebook");
// 		var notebook = new NotebookClass();

// 		// notebook.set("objectId",1);
// 		var arr = [];
// 		for(var i=0;i<5;i++){
// 		  arr.push({"applyTo" : "foodpanda","id":i});
// 		}
// 		notebook.set("coupons",arr);
// 		notebook.set("value","1");
// 		// notebook.set("id","1");
// 		notebook.save(null,{
// 		success:function(person){ 
// 				console.log("Saved!");
// 				console.log(notebook.id);
// 		},
// 		error:function(error){
// 				console.log("Error!");
// 		}
// 		});
// 	},
// 	error: function(error) {
// 		console.log(result);
// 	}
// });

chrome.runtime.onInstalled.addListener(function(details){
		if(details.reason=="install"){
				// console.log("This is a first install!");
				var ExtensionUserClass = Parse.Object.extend("ExtensionUser");
				var extensionUser = new ExtensionUserClass();
				extensionUser.set("coupons",[]);
				extensionUser.save(null, {
					success: function(extensionUser) {
							chrome.storage.sync.set({
							'userID': extensionUser.id
							});
					},
					error: function(extensionUser, error){
					}
				});
		}
		else if(details.reason == "update"){
				var thisVersion = chrome.runtime.getManifest().version;
				// console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
		}
});



chrome.runtime.onMessage.addListener(
	function(request,sender,sendResponse){
	if(request.message === "UserAuth"){
	console.log(request);
	var NotebookClass = Parse.Object.extend("Notebook");
	var query = new Parse.Query(NotebookClass);
	query.equalTo("value", request.value);
	query.find({
		success: function(results) {
		if(results.length > 0){
			console.log(results[0].get("coupons"));
			chrome.storage.sync.get("userID",function(result){
				console.log(result);
				var userID = result.userID;
				var ExtensionUserClass = Parse.Object.extend("ExtensionUser");
				var query1 = new Parse.Query(ExtensionUserClass);
				console.log(userID);
				query1.equalTo("objectId",userID);
				query1.first({
					success: function(object) {
						console.log("success");
						console.log(object);
						var arr = object.get("coupons");
						var arr1 = results[0].get("coupons");
						console.log(arr);
						console.log(arr1);
						var arr2 = arr.concat(arr1);
						console.log(arr2);
						object.set("coupons",arr2);
						object.save();
						alert("Done");
						results[0].destroy({
							success: function(myObject) {
						},
						error: function(myObject, error) {
						}
						});
					},
					error: function(error) {
							alert("Error: " + error.code + " " + error.message);
					}
				});
					
			});		  
		}
		else{
			alert("This is an invalid BookID!!");
		}
		},
		error: function(error) {
		}
	});
	}
	
	
	if(request.message === "GetCouponsFoodPanda"){
		chrome.storage.sync.get("userID",function(result){
			var userID = result.userID;
			console.log(userID);
			Parse.Cloud.run('GetCouponsFoodPanda',{"objectId": userID},{
				success: function(result){
					console.log(result);
					chrome.tabs.query({active: true,currentWindow: true},function(tabs){
						chrome.tabs.sendMessage(tabs[0].id,{message:"couponsFetched",coupons:result},function(response){
						// console.log(response.status);
						});
					});
				},
				error: function(error) {
					alert("failure");	
				}
			});
		// sendResponse({message: "request created"});
		});	
	}

});

// chrome.runtime.onMessage.addListener(
//  function(request, sender, sendResponse) {

// 		// Foodpanda User Details Pushed to Cloud
// 		if (request.message === "postUserDetails") {

// 			var UserDetailsObject = Parse.Object.extend("UserDetails");
// 			var userDetailsObject = new UserDetailsObject();

// 			userDetailsObject.set("firstName", request.data.firstName);
// 			userDetailsObject.set("lastName", request.data.lastName);
// 			userDetailsObject.set("email", request.data.email);
// 			userDetailsObject.set("mobileNumber", request.data.mobileNumber);
// 			userDetailsObject.set("addressLine1", request.data.addressLine1);
// 			userDetailsObject.set("addressLine2", request.data.addressLine2);

// 			var requestId="";
// 			userDetailsObject.save(null, {
// 				success: function(userDetailsObject) {
// 					requestId = userDetailsObject.id;

// 					// Sending message back to the active page with the requestId
// 					chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
// 							chrome.tabs.sendMessage(tabs[0].id, {status: "done", reqId: requestId}, function(response) {
// 									// console.log(response.status);
// 							});
// 					});
// 				},
// 				error: function(userDetailsObject, error) {
// 					// $(".error").show();
// 				}
// 			});
// 			sendResponse({done: "request created"});
// 		}

// 		// Foodpanda User Order Pushed to Cloud
// 		if (request.message === "postOrder") {

// 			var FoodPandaObject = Parse.Object.extend("FoodPanda");
// 			var foodpandaObject = new FoodPandaObject();

// 			foodpandaObject.set("area", request.data.area);
// 			foodpandaObject.set("restaurant", request.data.restaurant);
// 			foodpandaObject.set("delivery", request.data.delivery);
// 			foodpandaObject.set("coupon", request.data.coupon);
// 			foodpandaObject.set("comment", request.data.comment);
// 			foodpandaObject.set("finalTotal", request.data.finalTotal);
// 			foodpandaObject.set("order", request.data.order);
// 			foodpandaObject.set("payable", request.data.payable);

// 			var requestId="";
// 			foodpandaObject.save(null, {
// 				success: function(foodpandaObject) {
// 					requestId = foodpandaObject.id;

// 					// Sending message back to the active page with the requestId
// 					chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
// 							chrome.tabs.sendMessage(tabs[0].id, {status: "done", reqId: requestId}, function(response) {
// 									// console.log(response.status);
// 							});
// 					});
// 				},
// 				error: function(foodpandaObject, error) {
// 					// $(".error").show();
// 				}
// 			});
// 			sendResponse({done: "request created"});
// 		}

// 		// Getting Foodpanda Coupons from Cloud
// 		if (request.message === "foodpandaGetCoupons") {
// 			Parse.Cloud.run('foodpandaGetCoupons', {}, {
// 				success: function(result) {
// 					chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
// 						chrome.tabs.sendMessage(tabs[0].id, {message: "couponsFetched", coupons: result}, function(response) {
// 							console.log(response.status);
// 						});
// 					});
// 				},
// 				error: function(error) {
// 				}
// 			});
// 			sendResponse({message: "request created"});
// 		}

// 		// Getting PayUMoney Voucher codes from Cloud
// 		if (request.message === "payumoneyGetVoucher") {

// 			// var manifest = chrome.runtime.getManifest();
// 			// alert(manifest.version);
// 			// alert(request.provider);

// 			Parse.Cloud.run('payumoneyGetVoucher', {provider: request.provider}, {
// 				success: function(result) {
// 					chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
// 						chrome.tabs.sendMessage(tabs[0].id, {message: "voucherFetched", voucher: result}, function(response) {
// 							// console.log(response.status);
// 						});
// 					});
// 				},
// 				error: function(error) {
// 				}
// 			});
// 			sendResponse({message: "request created"});
// 		}

// 		if (request.message === "isUser") {
// 		  alert("here");
// 		  if (currentUser) {
// 		    chrome.runtime.sendMessage({message: "current user"}, function(response) {
// 		      console.log(response.status);
// 		    });
// 		  } else {
// 		    chrome.runtime.sendMessage({message: "no current user"}, function(response) {
// 		      console.log(response.status);
// 		    });
// 		  }
// 		  sendResponse({msg: "request created"});
// 		}

// 		// if (request.message === "logMeIn") {
// 		//   Parse.User.logIn("myname", "mypass", {
// 		//     success: function(user) {
// 		//       // Do stuff after successful login.
// 		//     },
// 		//     error: function(user, error) {
// 		//       // The login failed. Check error to see why.
// 		//     }
// 		//   });
// 		//   sendResponse({message: "request created"});
// 		// }
// });
