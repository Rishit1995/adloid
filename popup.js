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
});

// $('.form-signin').on('submit', function(e) {
//
//     // Prevent Default Submit Event
//     e.preventDefault();
//
//     // Get data from the form and put them into variables
//     var data = $(this).serializeArray(),
//         email = data[0].value,
//         password = data[1].value;
//
//     // Call Parse Login function with those variables
//     Parse.User.logIn(email, password, {
//         // If the username and password matches
//         success: function(user) {
//             alert('Welcome!');
//         },
//         // If there is an error
//         error: function(user, error) {
//             console.log(error);
//         }
//     });
//
// });

// chrome.runtime.onMessage.addListener(
//   function(request, sender, sendResponse) {
//     console.log("received response");
//
//     console.log(request.message);
//     alert(request.message);
//     // if (request.message == "voucherFetched") {
//     //   sendResponse({message: "goodbye"});
//     //
//     //   toastr.options.timeOut = 60000;
//     //   toastr.info("Enter voucher code '" + request.voucher + "'.");
//     // }
// });
