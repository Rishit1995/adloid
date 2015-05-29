function setCookie(cname,cvalue,exdays) {
    var d = new Date();
    d.setTime(d.getTime()+(exdays*24*60*60*1000));
    var expires = "expires="+d.toGMTString();
    document.cookie = cname + "=" + cvalue + "; " + expires;
}

// Extracting Area from the webpage
function getArea() {
	// console.log("in get area function");
	var data = {};
  var area = $('title').text();
  data["area"] = $.trim(area);
	data["source"] = "foodpandaGetArea";
	// // chrome.storage.local.clear();
	// chrome.storage.local.set({
	// 	'area': data["area"]
	// });

  setCookie("area", data["area"], 1);
}

// Requesting the Eventpage to get Coupons from the Cloud
function getCouponsFromCloud() {
  // console.log("getting coupons");
  chrome.runtime.sendMessage({message: "foodpandaGetCoupons"}, function(response) {
  	// console.log(response.message);
  });

	chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
      // console.log("received response");

  		if (request.message == "couponsFetched") {
  			sendResponse({message: "goodbye"});
  			// console.log(request.coupons);
  			var obj = JSON.parse(request.coupons);
  			// console.log(obj)
  			var arr = [];
  			for(i=0;i<obj.coupons.length;i++) {
  			  // console.log(obj.coupons[i].code);
  			  arr.push(obj.coupons[i].code);
  			}
        setCookie("coupons", JSON.stringify(arr), 1);
      }
  });
}

getArea();
getCouponsFromCloud();
