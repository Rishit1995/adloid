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

// Extracting Area from the webpage
function getArea() {
	var data = {};
  var area = $('title').text();
  data["area"] = $.trim(area);
	data["source"] = "foodpandaGetArea";
	chrome.storage.local.set({
		'area': data["area"]
	});
  setCookie("area", data["area"], 1);
}

// Requesting the Eventpage to get Coupons from the Cloud
function getCouponsFromCloud() {
  // console.log("getting coupons");
  chrome.runtime.sendMessage({message: "GetCouponsFoodPanda"}, function(response){
  	// console.log(response.message);
  });

	chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse){
      // console.log("received response");
  		if(request.message == "couponsFetched"){
    		sendResponse({message: "goodbye"});
    		console.log("Coupons" + request.coupons);
        setCookie("coupons",JSON.stringify(request.coupons),1);
        console.log(JSON.stringify(request.coupons));
        var a = getCookie("coupons");
        console.log(JSON.parse(a));
        console.log(JSON.parse(a).length);
      }
  });
}
getArea();
getCouponsFromCloud();
