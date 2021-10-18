<?php
session_start();
$env = 'anthill-2hbtj';
$token = $_SESSION['token'];

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

EOL;


if (isset($_POST['makeQR'])){
  $SAnumber = $_POST['SAnumbers'];
  $quantity = $_POST['quantity'];
  $idmaker = getdate()[0];
  $identifier = $SAnumber.'-'. $idmaker;
  $qrPath = 'pages/testing/testing';
  $qrScene = $identifier.'_wcpk_'.$quantity;
  $qrFilename =  'freeQRcodes/'.$identifier.'.png';
  print_r($qrScene);

  //print a new QR code for free shipments
  $url_qr = 'https://api.weixin.qq.com/tcb/invokecloudfunction?access_token='. $token .'&env=' . $env . '&name=qrcode';
  $exectute_qr  = http_post_2($url_qr,array('page'=>$qrPath, 'scene'=>$qrScene,  'filename'=>$qrFilename)); // this is an array
  print_r($exectute_qr);

  //then retrieve the file link
  $retrieveFileName = 'cloud://anthill-2hbtj.616e-anthill-2hbtj-1302839884/'.$qrFilename;
  $url_FL = 'https://api.weixin.qq.com/tcb/invokecloudfunction?access_token='. $token .'&env=' . $env . '&name=getFileLink';
  $entries_FL  = http_post_2($url_FL,array('link'=>$retrieveFileName)); // this is an array
  $entries_FL = json_decode( $entries_FL['content'], TRUE);
  $data_FL = ($entries_FL['resp_data']);
  $data_FL = json_decode( $data_FL, TRUE);
  $data_FL = $data_FL[0]['tempFileURL']; //finally get to all the data
  echo <<< EOL
  <script type="text/javascript">
    alert("Succes! $data_FL ");
  </script>
EOL;


  echo <<<EOL
  <h2>QR for $quantity x $SAnumber </h2>
  <div>
    <a href= "$data_FL" target="_blank">
      <img style = "margin:20px 0 10px 50px;" src = "$data_FL" height="200" width="200"/>
    </a>
  </div>
  EOL;
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
  $action =  htmlspecialchars($_SERVER['PHP_SELF']);
echo <<<EOL
<form method="post" action="$action" id="generateQR" >
  <div style = "display:flex; margin-left:50px;">
    <div style = "flex:1;">
    <label>Type of antibiotics</label>
      <select id="SAnumbers" name="SAnumbers" class="form-control">
        <option value="SA00001">SA00001 pesticides</option>
        <option value="SA00002">SA00002 quinolones</option>
        <option value="SA00003">SA00003 ractopamine</option>
        <option value="SA00005">SA00005 tetracyclines</option>
        <option value="SA00007">SA00007 chloramphenicol</option>
        <option value="SA00008">SA00008 leanmeat bundle</option>
        <option value="SA00009">SA00009 beta-lactams bundle</option>
        <option value="SA00010">SA00010 sulfonamides bundle</option>
        <option value="SA00011">SA00011 melamine bundle</option>
        <option value="SA00012">SA00012 aflatoxin bundle</option>
        <option value="SA00013">SA00013 dexamethasone bundle</option>
      </select>
    </div>
  </div>
  <input style = "margin:20px 0 10px 50px;font-size:25px" length=30 type = "number" name= "quantity" placeholder="0"/>
  <text  style = "margin:20px 0 10px 50px;font-size:25px">Add the number of pacakges, not the number of tests (eg pestices: 1 box)</text>
  <input style = "margin:20px 0 50px 50px;font-size:25px" class="submit" type ="submit" name="makeQR" value="make QRcode"/>
</body>
EOL;
?>
