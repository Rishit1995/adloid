chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log("received response");

    if (request.message == "voucherFetched") {
      sendResponse({message: "goodbye"});

      toastr.options.timeOut = 60000;
      toastr.info("Enter voucher code '" + request.voucher + "'.");
      toastr.info(request.voucher);
    }
});

$(function() {
  console.log("Finally I'm here!");
  var waitForProvider = setInterval(checkForElement, 150);

  function checkForElement () {
    console.log("In the function");
    var providerElem = $('.mrchnt_nm').text();
    console.log(providerElem);
    if (providerElem) {
        clearInterval(waitForProvider);
        console.log("here:" + providerElem);
        chrome.runtime.sendMessage({message: "payumoneyGetVoucher", provider: providerElem}, function(response) {
          console.log(response.message);
        });
    }
  }
});
