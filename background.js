Parse.initialize("TEqFhaM4HLieGdKlpL10nwcZyattYPUteRGASah5","wMwVLl2UKIcc51J1uXiayCrWTkGgGXB5DXGetX5h");

Parse.Cloud.run('hello', {}, {
	success: function(result) {
		// result is 'Hello world!'
		console.log(result);
		var NotebookClass = Parse.Object.extend("Notebook");
		var notebook = new NotebookClass();

		// notebook.set("objectId",1);
		notebook.set("numberOfCoupons",5);
		notebook.set("coupons",["1","2","3A","4A","CBA"]);
		notebook.set("value","1");
		// notebook.set("id","1");
		notebook.save(null,{
		success:function(person){ 
				console.log("Saved!");
				console.log(notebook.id);
		},
		error:function(error){
				console.log("Error!");
		}
		});
	},
	error: function(error) {
		console.log(result);
	}
});

// chrome.runtime.onInstalled.addListener(function(details){
// 		if(details.reason == "install"){
// 				// console.log("This is a first install!");
// 				var ExtensionUser = Parse.Object.extend("extensionUser");
// 				var extensionUser = new ExtensionUser();

// 				extensionUser.save(null, {
// 					success: function(extensionUser) {
// 						chrome.storage.local.set({
// 							'userID': extensionUser.id
// 						});
// 					},
// 					error: function(extensionUser, error) {
// 					}
// 				});
// 		}
// 		// On extension update
// 		else if(details.reason == "update"){
// 				var thisVersion = chrome.runtime.getManifest().version;
// 				// console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
// 				// alert("updated");
// 		}
// });


// // User Login

// // var currentUser = Parse.User.current();
// // if (currentUser) {
// //     // do stuff with the user
// //     alert("yes user");
// // } else {
// //     // show the signup or login page
// //     alert("no user");
// // }

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
