// For opening links in New Tab
document.addEventListener('DOMContentLoaded', function () {
    var links = document.getElementsByTagName("a");
    for(var i = 0; i < links.length; i++) {
        (function () {
            var ln = links[i];
            links[i].onclick = function () {
                chrome.tabs.create({active: true, url: ln.href});
            };
        })();
    }
    // chrome.runtime.sendMessage({message: "isUser"}, function(response) {
    //   console.log("request made");
    //   console.log(response.msg);
    // });
    $('.form-signin').on('submit', function(e){
        //Prevent Default Submit Event
        e.preventDefault();
    
        // Get data from the form and put them into variables
        var data = $(this).serializeArray();
        var email = data[0].value;
        var password = data[1].value;
        console.log(email);
        console.log(password);
    });
});

