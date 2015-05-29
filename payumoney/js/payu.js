$(function(){
  var provider =  $(".append-bottom").find("span").find("a").text();
  console.log("provider");
  // FoodPanda
  if (provider=="www.foodpanda.inwww.foodpanda.inwww.foodpanda.in") {
    toastr.options.timeOut = 60000;
    toastr.info("Select 'PayUMoney' to make payment.");
  }
});
