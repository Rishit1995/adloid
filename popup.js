// For opening links in New Tab
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
        //Prevent Default Submit Event
        e.preventDefault();
    
        // Get data from the form and put them into variables
        var data = $(this).serializeArray();
        var book_id = data[0].value;
        // console.log(book_id);
        
        chrome.runtime.sendMessage({message: "UserAuth",value:book_id},function(response) {
          //console.log("userAuth request made");  
        });
    });
});

