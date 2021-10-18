<?php
session_start();
$env = ''; // the environment id
$orderarray = array();

//start with html_header
echo <<<EOL
<!doctype html>
<head>
<link rel="stylesheet" href="style.css">
</head>
<body>
<header>
  <h1 class = "brand">SquaredAnt</h1>
</header>
<div class="topnav">
  <div class="dropdown">
    <button class="dropbtn">other pages</button>
    <div class="dropdown-content">
      <a href="imakeFreeQR.php">make free QR</a>
      <a href="imakePromoQR.php">make promo QR</a>
      <a href="index.php">home</a>
    </div>
  </div>
</div>

<script>
function confirmSend(form){
  var message = "you are submitting " + form.total.value + " testkits \\nfrom order " +  form.orderID.value + " \\nof payment ID " + form.paymentID.value  + "\\n\\nThe shipping ID is: " + form.shipmentNumber.value;
  var x = confirm( message );
  return x;
}
</script>
EOL;

//first we have to get the token (we need a button to refresh?)
$url  = 'https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid [] secret= []'; //get link from your wechat account
$data = file_get_contents($url);
$characters = json_decode($data);
$token = $characters->access_token;
$_SESSION['token'] = $token;


//then we run the newOrderlist cloud function to get all the new new orders
//NOL = New Order List

$url_NOL = 'https://api.weixin.qq.com/tcb/invokecloudfunction?access_token='. $token .'&env=' . $env . '&name=newOrderList';
$entries_NOL  = http_post($url_NOL,array()); // this is an array
$entries_NOL = json_decode( $entries_NOL['content'], TRUE);
$data_NOL = ($entries_NOL['resp_data']);

//$data_NOL = implode($data_NOL);
$data_NOL = json_decode( $data_NOL, TRUE);
$data_NOL = $data_NOL[0]['data']; //finally get to all the data



foreach ($data_NOL as $d){
  $payment_id = $d['payment_id'];
  if ( !isset($d['qrLink'])){
    continue;
  }
  $qrLink = $d['qrLink'];

  //  print_r ($d);
  // now get the picture of this one
  $url_FL = 'https://api.weixin.qq.com/tcb/invokecloudfunction?access_token='. $token .'&env=' . $env . '&name=getFileLink';
  $entries_FL  = http_post_2($url_FL,array('link'=>$qrLink)); // this is an array
  $entries_FL = json_decode( $entries_FL['content'], TRUE);
  $data_FL = ($entries_FL['resp_data']);
  $data_FL = json_decode( $data_FL, TRUE);


  $data_FL = $data_FL[0]['tempFileURL']; //finally get to all the data
  // and get the address
  $address = $d['address'];
  $userName = $address['userName'];
  $detailInfo = $address['detailInfo'];
  $cityName = $address['cityName'];
  $countyName = $address['countyName'];
  $provincename = $address['provinceName'];
  $postalCode = $address['postalCode'];
  $nationalCode = $address['nationalCode'];
  $telNumber = $address['telNumber'];

  // and the order
  $orderID = $d['paymentFirstEight'];
  $orderClass = $d['subcategory'];
  $paid = $d['paid'];
  $tests_total = $d['tests_total'];
  $time = $d['time'];

  //now put in an associative array
  $temp_array = array(
    'link'        => $data_FL,
    'userName'    =>  $userName,
    'detailInfo'  => $detailInfo,
    'cityName'    => $cityName,
    'countyName'  => $countyName,
    'provinceName' => $provincename,
    'postalCode'  => $postalCode,
    'nationaCode' => $nationalCode,
    'telNumber'   => $telNumber,
    'orderID'     => $orderID,
    'orderClass'  => $orderClass,
    'paid'        => $paid,
    'test_total'  => $tests_total,
    'time'        => $time
  );
  $orderarray[$payment_id][] =  $temp_array;
}

//now print each order
printOrder($orderarray);

//check if a form is submitted
if (isset($_POST['Send'])) {
  $oid = $_POST['orderID'];
  $pid = $_POST['paymentID'];
  $shipmentNumber = $_POST['shipmentNumber'];

  if ($shipmentNumber == ''){
    echo <<< EOL
    <script type="text/javascript">
    alert("You have not enetered a shipping ID");
    </script>
  EOL;
  return false;
  }


 $url_shipped = 'https://api.weixin.qq.com/tcb/invokecloudfunction?access_token='. $token .'&env=' . $env . '&name=confirmShipped';
  $entries_shipped  = http_post_2($url_shipped,array('orderID'=>$oid, 'paymentID' =>$pid , 'shipmentNumber'=>$shipmentNumber)); // this is an array

  echo <<< EOL
  <script type="text/javascript">
  alert("Succes! removing $oid $pid from the list");
    el=document.getElementById("$oid $pid");
    el.remove();
  </script>
EOL;

}



function printOrder($oa){
  $action =  htmlspecialchars($_SERVER['PHP_SELF']);
  $orderlength = sizeof($oa);

  echo <<<EOL
   <h2>Number of orders to send out: $orderlength</h2>
  EOL;

  foreach (array_keys($oa) as $order){
    $payment_id = $order;
    echo "<h2>Payment ID $order </h2>";
    $order = $oa[$order];
    foreach ($order as $suborder){
      $json_string = json_encode($suborder, JSON_PRETTY_PRINT);
      $use = $suborder['userName'];
      $det = $suborder['detailInfo'];
      $cit = $suborder['cityName'];
      $cou = $suborder['countyName'];
      $pro = $suborder['provinceName'];
      $pos = $suborder['postalCode'];
      $nat = $suborder['nationaCode'];
      $tel = $suborder['telNumber'];
      $ordID = $suborder['orderID'];
      $ordClass = $suborder['orderClass'];
      $paid = $suborder['paid'];
      $tot = $suborder['test_total'];
      $dat = $suborder['link'];
      $time = $suborder['time'];
      echo <<< EOL
      <div>
        <form method="post" action="$action" id="$ordID $payment_id"  onsubmit="return confirmSend(this);" >
        <div style = "display:flex; margin-left:50px;">
          <div style = "flex:1;">
            <h3>Address information</h3>
            <text>$use</text>
            <text>$det</text>
            <text>$cit</text>
            <text>$cou</text>
            <text>$pro</text>
            <text>$pos</text>
            <text>$nat</text>
            <h3>Phone number</h3>
            <text>$tel</text>
          </div>
          <div style ="flex:1;">
            <h3>Order Information</h3>
            <div style= "display:flex; justify-content: flex-start;">
              <text style = "flex:1; justify-content: left;" >Order ID</text>
              <text style = "flex:1; justify-content: left;" >$ordID</text>
            </div>
            <div style= "display:flex; justify-content: flex-start;">
              <text style = "flex:1; ">Test class</text>
              <text style = "flex:1; ">$ordClass</text>
            </div>
            <div style= "display:flex; justify-content: flex-start;">
              <text style = "flex:1">Payment complete:</text>
              <text style = "flex:1">$paid</text>
            </div>
            <div style= "display:flex; justify-content: flex-start;">
              <text style = "flex:1">Ordered on:</text>
              <text style = "flex:1">$time</text>
            </div>
            <div style= "display:flex; justify-content: flex-start;">
              <text style = "flex:1; font-size:larger">________</text>
              <text style = "flex:1; font-size:larger">________</text>
            </div>
            <div style= "display:flex; justify-content: flex-start; ">
              <text style = "flex:1; font-size:larger">Total Tests</text>
              <text style = "flex:1;font-size:larger">$tot</text>
            </div>
          </div>
          <input hidden name="total" value="$tot" />
          <input hidden name="paymentID" value="$payment_id" />
          <input hidden name="orderID" value="$ordID" />
        </div>
        <div>
          <a href= "$dat" target="_blank">
            <img style = "margin:20px 0 10px 50px;" src = "$dat" height="200" width="200"/>
          </a>
        </div>
        <div>
          <input style = "margin:20px 0 10px 50px;font-size:25px" length=250 type = "text" name= "shipmentNumber" placeholder="shipment number"/>
        </div>
      <div>
    		<input style = "margin:20px 0 50px 50px;font-size:25px"  class="submit" type ="submit" name="Send" value="Ready for shipping!"/>
    	</div>
      </form>
    </div>
EOL;
    }
  }
}

// this is still npt perfect - data and header quiet useless
function http_post ($url, $data)
{
    $data_url = http_build_query($data);
    $data_len = strlen($data_url);

    return array ('content'=>file_get_contents($url, false, stream_context_create (
            array ('http'=>array (
              'method'=>'POST',
              'header'=>"Connection: close\r\nContent-Length: $data_len\r\n",
              'content'=>$data_url
            )
          )
        )
      )
      , 'headers'=>$http_response_header
        );
}


// this one does the trick for FL
function http_post_2 ($url, $data)
{
    $data_url = json_encode($data);
    $data_len = strlen($data_url);

    return array ('content'=>file_get_contents($url, false, stream_context_create (
            array ('http'=>array (
              'method'=>'POST',
              'header'=>  "Content-Type: application/json\r\n" .
                          "Accept: application/json\r\n",
              'content'=>$data_url
            )
          )
        )
      )
      , 'headers'=>$http_response_header
        );
}

//end with
echo <<<EOL
</body>
EOL;
?>
