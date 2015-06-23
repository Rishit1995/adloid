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
  chrome.storage.local.set({
		'area': data["area"]
	});
  setCookie("area", data["area"], 1);
}

// Requesting the Eventpage to get Coupons from the Cloud
function getCouponsFromCloud(){
  chrome.runtime.sendMessage({message: "GetCouponsFoodPanda"}, function(response){
  });

	chrome.runtime.onMessage.addListener(
    function(request, sender, sendResponse){
  		if(request.message == "couponsFetched"){
        console.log("Coupons : ");
        console.dir(request.coupons);
        chrome.storage.local.set({
          'coupons':request.coupons,
          'done': 0,
          'coupon':"",
          'saving':""
        })
      }
  });
}
getArea();
getCouponsFromCloud();