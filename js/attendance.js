var matched, browser;

jQuery.uaMatch = function(ua) {
    ua = ua.toLowerCase();

    var match = /(chrome)[ \/]([\w.]+)/.exec(ua) ||
            /(webkit)[ \/]([\w.]+)/.exec(ua) ||
            /(opera)(?:.*version|)[ \/]([\w.]+)/.exec(ua) ||
            /(msie) ([\w.]+)/.exec(ua) ||
            ua.indexOf("compatible") < 0 && /(mozilla)(?:.*? rv:([\w.]+)|)/.exec(ua) ||
            [];

    return {
        browser: match[ 1 ] || "",
        version: match[ 2 ] || "0"
    };
};

matched = jQuery.uaMatch(navigator.userAgent);
browser = {};

if (matched.browser) {
    browser[ matched.browser ] = true;
    browser.version = matched.version;
}

// Chrome is Webkit, but Webkit is also Safari.
if (browser.chrome) {
    browser.webkit = true;
} else if (browser.webkit) {
    browser.safari = true;
}

jQuery.browser = browser;

function onLoad() {
    $("#startTime").timeEntry({
        show24Hours: true,
        spinnerImage: '',
        showSeconds: true
    });
    $("#refreshtoken").focus(function() {
        if ($(this).val() == "refreshtoken") {
            $(this).val("");
        }
    });    
    $("#clientID").focus(function() {
        if ($(this).val() == "clientID") {
            $(this).val("");
        }
    });    
    $("#clientSecret").focus(function() {
        if ($(this).val() == "clientSecret") {
            $(this).val("");
        }
    });
    $("#dbPassword").focus(function() {
        if($(this).val()=="password"){
            $(this).val("");
        }
    });
    $("#proxyPassword").focus(function() {
        if ($(this).val() == "password") {
            $(this).val("");
        }
    });
    $("#refreshtoken").blur(function() {
        if ($(this).val() == "") {
            $(this).val("refreshtoken");
        }
    } );
    $("#clientID").blur(function() {
        if ($(this).val() == "") {
            $(this).val("clientID");
        }
    });
    $("#clientSecret").blur(function() {
        if ($(this).val() == "") {
            $(this).val("clientSecret");
        }
    });
    $("#dbPassword").blur(function() {
        if($(this).val()==""){
            $(this).val("password");
        }
    } );
    $("#proxyPassword").blur(function() {
        if ($(this).val() == "") {
            $(this).val("password");
        }
    });
    $(".inputs").focus(function() {
        $(this).css("border-color", "#a0bed9");
    })
    $("#dbQuery").focus(function() {
        $(this).css("border-color", "#a0bed9")
    })
    $(".inputs").blur(function() {
        $(this).css("border-color", "#ddd")
    })
    $("#dbQuery").blur(function() {
        $(this).css("border-color", "#ddd")
    })
    $("#selectDay").select2({
        placeholder: "Today",
        allowClear: true
    });

    $('#datetimepicker1').datetimepicker({
        format: 'DD-MM-YYYY HH:mm:ss'
    });
    $('#datetimepicker2').datetimepicker({
        format: 'DD-MM-YYYY HH:mm:ss'
    });
    $("#datetimepicker1").on("dp.change", function(e) {
        $('#datetimepicker2').data("DateTimePicker").minDate(e.date);
    });
    $("#datetimepicker2").on("dp.change", function(e) {
        $('#datetimepicker1').data("DateTimePicker").maxDate(e.date);
    });
    $("#vname").click(function() {
        $("#vname").css("display", "none");
        $("#vnameEdit").css("display", "block");   
        $("#vnameEdit").val($("#vname").html());
        $("#vnameEdit").focus();
    });
    $("#vnameEdit").blur(function() {
        $("#vname").css("display", "block");
        $(this).css("display", "none");
        if($("#vnameEdit").val() != $("#vname").html()) {
            var param = {};
            param.mode = "saveVendorName";
            param.vendorName = $("#vnameEdit").val();
            $.post("/ZAttendance/ClientAction.do", param, function(res) { 
                try {
                    res = JSON.parse(res);
                } catch (e) {
                }
                if(res.vendorname) {
                    $("#vname").html(res.vendorname);
                }
            });
        }
    });
    showLogsReportPage();
    getInfo();
}
var store;
function showLogsReportPage() {
    $("#logsReport").show();
    $("#manualSync").hide();
}

function showManualSyncPage() {
    $("#logsReport").hide();
    $("#manualSync").show();
    $(".glyphicon-calendar").first().click();
}

function getInfo() {
    if (timer != null) {
        clearTimeout(timer);
    }
    var param = {};
    param.mode = "getInfo";
    $.post("/ZAttendance/ClientAction.do", param, function(res) {
        if (!res) {
            return;
        }
        try {
            res = JSON.parse(res);
        } catch (e) {
            $("body").html(res);
            return;
        }
        showLogsPage(res);
        if (clockTimer != null) {
            clearTimeout(clockTimer);
        }
        startClock(new Date().getTime() - res.delayedTime);
    });
}

function showLogsPage(res) {
    $("#logs1")[0].innerHTML = res.logs;
    if (res.recordinfo) {
        setReportVal(res.recordinfo[new Date(res.delayedTime).getFullYear() + '-' + twoDigits(new Date(res.delayedTime).getMonth() + 1) + '-' + twoDigits(new Date(res.delayedTime).getDate())]);
    } else {
        setReportVal("resetToZero");
    }
    $("#vname").text(res.vendorname);
    $("#lastRefreshTime span")[0].innerHTML = res.lastRequestTime;
    $("#selectDay option").remove();
    $("#selectDay").append('<option value="" disabled selected style="display:none;">Label</option>');
    for (var i = res.logsFiles.length - 1; i >= 0; i--) {
        if (res.recordinfo) {
            var curDate = res.recordinfo;
            if (curDate[res.logsFiles[i]]) {
                $("#selectDay").append("<option>" + res.logsFiles[i] + " (" + curDate[res.logsFiles[i]].dataCount + ")</option>");
            } else {
                $("#selectDay").append("<option>" + res.logsFiles[i] + "</option>");
            }
        } else {
            $("#selectDay").append("<option>" + res.logsFiles[i] + "</option>");
        }
    }
    if (res.isRunning) {
        nextUpdateSecs = res.nextUpdateSecs;
        showNextUpdateInSecs();
        $("#stopSync").show();
        $("#resumeSync").hide();
        $("#resumeSync2").hide();
    } else {
        $("#stopSync").hide();
        $("#resumeSync").show();
        $("#resumeSync2").show();
    }
}

var nextUpdateSecs = 120;
var timer = null;
function showNextUpdateInSecs() {
    if (nextUpdateSecs == null) {
        return;
    }
    if (nextUpdateSecs <= -1) {
        nextUpdateSecs = 60;
        console.log("Get Info")
        getInfo();
        return;
    }
    $("#displayClock span")[0].innerHTML = nextUpdateSecs-- + "secs";
    timer = setTimeout(function() {
        showNextUpdateInSecs();
    }, 1000);
}

setReportVal = function(obj) {
    if (obj == "resetToZero" || obj == null) {
        $("#numOfDataSent")[0].innerHTML = 0;
        $("#numberOfSuccreqSent")[0].innerHTML = 0;
        $("#failedReq")[0].innerHTML = 0;
        $("#averageTime")[0].innerHTML = 0;
        return;
    }
    $("#numOfDataSent")[0].innerHTML = obj.dataCount;
    $("#numberOfSuccreqSent")[0].innerHTML = obj.reqSuccessCount;
    $("#failedReq")[0].innerHTML = obj.reqFailCount;
    $("#averageTime")[0].innerHTML = obj.averageTimeTaken;
}

var clockTimer = null;
function startClock(delay) {
    var today = new Date(new Date().getTime() - delay);
    document.getElementById('clock').innerHTML = twoDigits(today.getHours()) + ":" + twoDigits(today.getMinutes()) + ":" + twoDigits(today.getSeconds());
    clockTimer = setTimeout(function() {
        startClock(delay);
    }, 1000);
}

function twoDigits(num) {
    return num > 9 ? "" + num : "0" + num;
}
var configInfo;
function showConfigPage(res) {
    var param = {};
    param.mode = "getConfInfo";
    $.post("/ZAttendance/ClientAction.do", param, function(res) {        
        $("#databaseType").select2();
        $('#databaseType').val("1").change();
        if (!res) {
            return;
        }
        res = JSON.parse(res);
        configInfo = res;
        $("#refreshtoken").val(res.refreshtoken);
        $("#clientID").val(res.clientID);
        $("#clientSecret").val(res.clientSecret);
        $("#delaySysTime").val(res.sysDelay);
        $("#startTime").val(res.lastRequestTimeInDate.split(" ")[1]);
        $("#sleepTime").val(res.sleepTime / (60 * 1000));
        $("#host").val(res.proxyHostIP);
        $("#port").val(res.proxyPort);
        $("#proxyUserName").val(res.proxyUname);
        $("#proxyPassword").val(res.proxyPwd);
        $("#dbConnectionUrl").val(res.dburl);
        $("#dbUserName").val(res.dbuname);
        $("#dbPassword").val(res.dbpword);
        $("#dbQuery").val(res.dbquery);
        $("#timeZone").val(res.timeZone);
        $('.dvmodal-overlay').fadeIn(200, function() {
            $('#dvmodal-lft').animate({
                'right': '0'
            }, 400);
        });        
        $('#databaseType').val(res.databaseType).change(); 
        $('#databaseType').change(function(){
            $('#dbConnectionUrl').next().html('EX : jdbc:jtds:sqlserver://localhost:1433/ZAttendance');
            if($('#databaseType').val() === "2") {
                $('#dbConnectionUrl').next().html('EX : jdbc:ucanaccess://D://Database//Attendance.accdb');
            } else if($('#databaseType').val() === "3") {
                $('#dbConnectionUrl').next().html('EX : jdbc:mysql://localhost:1433/ZAttendance');                   
            }            
        });
    });
}

function hideConfigPage() {
    $('#dvmodal-lft').animate({
        'right': '-75%'
    }, 400, function() {
        $('.dvmodal-overlay').fadeOut('fast');
    });
}

function getLogs(fileName) {
    if (timer != null) {
        clearTimeout(timer);
    }
    var param = {};
    param.mode = "getLogs";
    if (fileName != null && fileName.trim() != "") {
        param.fileName = fileName;
    } else {
        getInfo();
        return;
    }
    $.post("/ZAttendance/ClientAction.do", param, function(res) {
        if (!res) {
            return;
        }
        res = JSON.parse(res);
        $("#logs1")[0].innerHTML = res.logs;
        if (!res.recordinfo) {
            setReportVal("resetToZero");
        }
        else {
            setReportVal(res.recordinfo);
        }
    });
}

function saveStart() {

    if (clockTimer != null) {
        clearTimeout(clockTimer);
    }
    var param = {};
    param.mode = "save";
    if ($("#refreshtoken").val().trim() != "" && $("#refreshtoken").val().trim() != "refreshtoken") {
        param.refreshtoken = $("#refreshtoken").val().trim();
    } else if ($("#refreshtoken").val().trim() == "") {
        $("#refreshtoken").css("border-color", "red");
        return;
    }
    
    if ($("#clientID").val().trim() != "" && $("#clientID").val().trim() != "clientID") {
        param.clientID = $("#clientID").val().trim();
    } else if ($("#clientID").val().trim() == "") {
        $("#clientID").css("border-color", "red");
        return;
    }
    
    if ($("#clientSecret").val().trim() != "" && $("#clientSecret").val().trim() != "clientSecret") {
        param.clientSecret = $("#clientSecret").val().trim();
    } else if ($("#clientSecret").val().trim() == "") {
        $("#clientSecret").css("border-color", "red");
        return;
    }
    if ($("#startTime").val().trim() != "" && (configInfo === undefined || configInfo.lastRequestTimeInDate.split(" ")[1] != $("#startTime").val().trim())) {
        var startTimeVal = $("#startTime").val().trim();
        var currDate = new Date();
        var date = checkTime(currDate.getDate());
        var month = checkTime(currDate.getMonth() + 1);
        var year = checkTime(currDate.getFullYear());
        param.lastRequestTime = date + "/" + month + "/" + year + " " + startTimeVal;
    }
    if ($("#sleepTime").val().trim() != "" && (configInfo === undefined || (configInfo.sleepTime / (60 * 1000)) != $("#sleepTime").val().trim())) {
        param.sleepTime = $("#sleepTime").val().trim();
    }
    if (configInfo === undefined || configInfo.proxyHostIP != $("#host").val().trim()) {
        param.proxyHostIP = $("#host").val().trim();
    }
    if (configInfo === undefined || configInfo.proxyPort != $("#port").val().trim()) {
        param.proxyPort = $("#port").val().trim();
    }
    if (configInfo === undefined || configInfo.proxyUname != $("#proxyUserName").val().trim()) {
        param.proxyUname = $("#proxyUserName").val().trim();
    }
    if ($("#proxyPassword").val().trim() != "" && $("#proxyPassword").val().trim() != "password") {
        param.proxyPwd = $("#proxyPassword").val().trim();
    }
    if ($("#dbConnectionUrl").val().trim() != "" && (configInfo === undefined || configInfo.dburl != $("#dbConnectionUrl").val().trim())) {
        param.dburl = $("#dbConnectionUrl").val().trim();
    } else if ($("#dbConnectionUrl").val().trim() == "") {
        $("#dbConnectionUrl").css("border-color", "red")
        return;
    }
    if ($("#dbUserName").val().trim() != "" && (configInfo === undefined || configInfo.dbuname != $("#dbUserName").val().trim())) {
        param.dbuname = $("#dbUserName").val().trim();
    } else if ($("#dbUserName").val().trim() == "") {
        $("#dbUserName").css("border-color", "red")
        return;
    }
    if($("#dbPassword").val().trim() != "" && $("#dbPassword").val().trim() != "password"){
         param.dbpword = $("#dbPassword").val().trim();    
    }else if($("#dbPassword").val().trim() == ""){
        $("#dbPassword").css("border-color", "red")
        return;
    }
    if ($("#dbQuery").val().trim() != "" && (configInfo === undefined || configInfo.dbquery != $("#dbQuery").val().trim())) {
        param.dbquery = $("#dbQuery").val().trim();
    } else if ($("#dbQuery").val().trim() == "") {
        $("#dbQuery").css("border-color", "red")
        return;
    }
    if ($("#timeZone").val().trim() != "" && (configInfo === undefined || configInfo.timeZone != $("#timeZone").val().trim())) {
        param.timeZone = $("#timeZone").val().trim();
    } else if ($("#timeZone").val().trim() == "") {
        $("#timeZone").css("border-color", "red")
        return;
    }
    if ($("#delaySysTime").val().trim() != "" && (configInfo === undefined || configInfo.sysDelay != $("#delaySysTime").val().trim())) {
        param.delaySysTime = $("#delaySysTime").val().trim();
    }
    if (configInfo === undefined || configInfo.databaseType != $("#databaseType").val()) {
        param.databaseType = $("#databaseType").val();
    }
    if(Object.keys(param).length == 1) {
        return;
    }
    hideConfigPage();
    $.post("/ZAttendance/ClientAction.do", param, function(res) {
        if (!res) {
            return;
        }
        res = JSON.parse(res);
        getInfo();
    });
}

function manualUpdate(flag, obj) {
    $(obj).attr('disabled', 'disabled');
    $('#countButton').attr('disabled', 'disabled');
    var param = {};
    param.mode = "manualUpdate";
    if (flag) {
        param.uploadRecord = flag;
    }
    var fDate = $("#datetimepicker1 input").val().trim();
    var tDate = $("#datetimepicker2 input").val().trim();
    if (fDate != "" && tDate != "") {
        param.fDate = fDate;
        param.tDate = tDate;
    }
    $.post("/ZAttendance/ClientAction.do", param, function(res) {
        res = JSON.parse(res);
        if (res.error) {
            alert("Date period should be within 5 Days");
            $(obj).removeAttr('disabled');
            $('#countButton').removeAttr('disabled');
            return;
        } else if (res.error1) {
            alert("Enter valid dates");
            $(obj).removeAttr('disabled');
            $('#countButton').removeAttr('disabled');
            return;
        }
        showLogsPage(res);
        $(obj).removeAttr('disabled');
        $('#countButton').removeAttr('disabled');
    });
}

function checkTime(i) {
    if (i < 10) {
        i = "0" + i
    }
    return i;
}
function Resume() {
    var param = {};
    param.mode = "resume";
    hideConfigPage();
    $("#stopSync").show();
    $("#resumeSync").hide();
    $("#resumeSync2").hide();

    $.post("/ZAttendance/ClientAction.do", param, function() {
        setTimeout(function() {
            getInfo();
        }, 3000);
    });
}

function stop(confirmed) {
    if (!confirmed && confirm("Do you really want to stop ?")) {
        stop(true);
    } else {
        return;
    }

    var param = {};
    param.mode = "stop";
    $.post("/ZAttendance/ClientAction.do", param, function(res) {
        getInfo();
    });
}

function showGenerateRTPopup() {
    $("#refershTokenGenerated").text("");
    $("#refreshTokenGenerator").modal("show");
}

function generateRT() {    
    var param = {};
    param.mode = "generateRT";
    
    param.clientId = $("#refreshTokenGenerator #generateRTClientID").val().trim();
    param.clientSecret = $("#refreshTokenGenerator #generateRTClientSecret").val().trim();
    param.code = $("#refreshTokenGenerator #generateRTCode").val().trim();
    param.dcType = $("#refreshTokenGenerator #generateRTDC").val();
    
    $.post("/ZAttendance/ClientAction.do", param, function(res) {
        res = JSON.parse(res);
        if (res != null && res.refreshToken) {
            $("#refershTokenGenerated").text(res.refreshToken);
        }
    });
}
