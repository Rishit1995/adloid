$(function(){
  toastr.options.timeOut = 60000;
  toastr.info("Select 'Pay Online' as payment option.");

  // Submit user details to Cloud
  $('#shop_checkout_type_place_order_button').on('click', function() {
    var data = {};
    console.log("Yes buttons is clicked");
    var firstName = $('#shop_checkout_type_orderMetaData_customer_firstName').val();
    var lastName =  $('#shop_checkout_type_orderMetaData_customer_lastName').val();
    var email = $('#shop_checkout_type_orderMetaData_customer_email').val();
    var mobileNumber = $('#shop_checkout_type_orderMetaData_customer_mobileNumber').val();

    var addressLine1 = $('#shop_checkout_type_orderMetaData_customerAddress_addressLine1').val();
    var addressLine2 = $('#shop_checkout_type_orderMetaData_customerAddress_addressLine2').val();


    data["firstName"] = firstName;
    data["lastName"] = lastName;
    data["email"] = email;
    data["mobileNumber"] = mobileNumber;
    data["addressLine1"] = addressLine1;
    data["addressLine2"] = addressLine2;

    // Sending message to the eventPage.js to store the order
    chrome.runtime.sendMessage({message: "postUserDetails", data: data}, function(response) {
        // console.log(response.done);
    });

    chrome.runtime.onMessage.addListener(
      function(request, sender, sendResponse) {
      // if (request.done == "done") {
      //     sendResponse({status: "got request id"});
      // }
    });
  });
});
