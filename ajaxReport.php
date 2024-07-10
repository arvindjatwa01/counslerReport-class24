<?php
$db = mysqli_connect('localhost', 'root', '', 'class24');
if (mysqli_connect_errno()) {
    echo "Failed to connect to MySQL: " . mysqli_connect_error();
    die;
}


function enc_dec($str, $type = "enc", $time = '')
{
    $key = 'crypt';
    if ($type == 'enc') {
        $encrypted = base64_encode(time() . "|" . $str);
        return $encrypted;
    } else {
        $de = base64_decode($str);
        $dec = explode("|", $de);
        if (empty($time)) {
            if (isset($dec[1])) {
                return $dec[1];
            }
            return 0;
        } else {
            return array($dec[0], $dec[1]);
        }
    }
}

function getUserInfo($counslerId, $db)
{
    $query = "SELECT dlb_a_name AS Cname, dlb_salary AS salary
FROM wifi_admin
WHERE dlb_a_id = 670;";
    $result = mysqli_query($db, $query);

    // Fetch data from the result set
    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    return (($data));
}

if ($_POST["getMonthWeeksReport"]) {

    $counslerId = enc_dec($_POST["counslarId"], "dec", "");
    $monthNumber = $_POST["monthNum"];
    // $query = "SELECT * FROM wifi_counsellor_report WHERE dlb_a_id = $counslerId AND MONTH(dlb_created_date) = 6 AND YEAR(dlb_created_date) = YEAR(CURDATE());";

    $query = "SELECT WEEK(dlb_created_date) AS week_number, COUNT(*) AS records_count, SUM(dlb_collectorate_revenue) AS total_revenue, MAX(dlb_collectorate_revenue) AS highest_revenue, dlb_salary, GROUP_CONCAT(dlb_c_id ORDER BY dlb_c_id ASC) AS dlb_c_ids, GROUP_CONCAT(dlb_a_id ORDER BY dlb_c_id ASC) AS dlb_a_ids, GROUP_CONCAT(dlb_created_date ORDER BY dlb_c_id ASC) AS dlb_created_dates FROM wifi_counsellor_report WHERE dlb_counsellor_id = 670 
    AND MONTH(dlb_created_date) = $monthNumber
    AND YEAR(dlb_created_date) = YEAR(CURDATE()) GROUP BY WEEK(dlb_created_date) ORDER BY WEEK(dlb_created_date) ASC";

    $result = mysqli_query($db, $query);

    // Fetch data from the result set
    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    if (empty($data)) {
        $apiSuccess = 0;
    } else {
        $apiSuccess = 1;
    }

    echo json_encode(array("apiSuccess" => $apiSuccess, "responsePacket" => $data));
}

if ($_POST['getMonthsReport']) {

    $userId = $_POST["counslarId"];
    $counslerId = enc_dec($userId, "dec", "");

    $query = "SELECT 
    MONTH(lsm.first_day) AS month_number,
    YEAR(lsm.first_day) AS year_number,
    COUNT(wcr.dlb_created_date) AS records_count,
    COALESCE(SUM(wcr.dlb_collectorate_revenue), 0) AS total_revenue,
    COALESCE(MAX(wcr.dlb_collectorate_revenue), 0) AS highest_revenue, 
    COALESCE(MAX(wcr.dlb_salary), 0) AS dlb_salary, 
    COALESCE(GROUP_CONCAT(wcr.dlb_c_id ORDER BY wcr.dlb_c_id ASC), '') AS dlb_c_ids, 
    COALESCE(GROUP_CONCAT(wcr.dlb_a_id ORDER BY wcr.dlb_c_id ASC), '') AS dlb_a_ids, 
    COALESCE(GROUP_CONCAT(wcr.dlb_created_date ORDER BY wcr.dlb_c_id ASC), '') AS dlb_created_dates 
FROM 
    (SELECT CURDATE() - INTERVAL 5 MONTH AS first_day
    UNION ALL
    SELECT CURDATE() - INTERVAL 4 MONTH
    UNION ALL
    SELECT CURDATE() - INTERVAL 3 MONTH
    UNION ALL
    SELECT CURDATE() - INTERVAL 2 MONTH
    UNION ALL
    SELECT CURDATE() - INTERVAL 1 MONTH
    UNION ALL
    SELECT CURDATE()) lsm
LEFT JOIN 
    wifi_counsellor_report wcr
ON 
    DATE_FORMAT(wcr.dlb_revenue_date, '%Y-%m') = DATE_FORMAT(lsm.first_day, '%Y-%m')
    AND wcr.dlb_counsellor_id = 670
GROUP BY 
YEAR(lsm.first_day), MONTH(lsm.first_day)
ORDER BY 
    YEAR(lsm.first_day), MONTH(lsm.first_day);";

    $result = mysqli_query($db, $query);

    // Fetch data from the result set
    $data = array();
    while ($row = mysqli_fetch_assoc($result)) {
        $data[] = $row;
    }
    if (empty($data)) {
        $apiSuccess = 0;
    } else {
        $apiSuccess = 1;
    }

    $userResponse = (getUserInfo($counslerId, $db));

    echo json_encode(array("apiSuccess" => $apiSuccess, "responsePacket" => $data, "userResult" => $userResponse[0]));

}
?>