document.addEventListener('DOMContentLoaded', function () {
	
	var links = document.getElementsByTagName("a");
	for(var i = 0; i < links.length; i++) {
		(function () {
			var ln = links[i];
			ln.onclick = function () {
				  chrome.tabs.create({active: true, url: ln.href});
			};
		})();
	}
	// chrome.runtime.sendMessage({message: "isUser"}, function(response) {
	//   console.log("request made");
	//   console.log(response.msg);
	// });
	
	$('.form-signin').on('submit', function(e){
		e.preventDefault();
		
		// var email = document.getElementById("inputEmail").value;
		// var bookID = document.getElementById("inputBookID").value;

		chrome.runtime.sendMessage({message: "UserAuth",value:bookID,user:email},function(response){
		  //console.log("userAuth request made");  
		});
	});
});

