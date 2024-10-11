<!DOCTYPE html>
<html>
    <head>
        <meta charset="UTF-8">
        <title>ZOHO People Attendance</title>
        <script type="text/javascript" src="js/jquery-1.10.2.min.js"></script>
        <script type="text/javascript" src="js/jquery.timeentry.js"></script>
        <script type="text/javascript" src="js/select2.min.js"></script>
        <script type="text/javascript" src="js/bootstrap.min.js"></script>
        <script type="text/javascript" src="js/attendance.js"></script>
        <script type="text/javascript" src="js/moment.js"></script>
        <script type="text/javascript" src="js/bootstrap-datetimepicker.js"></script>

        <style>
            .dvtabcom {
                background-color: #fff;
                border-bottom: 1px solid #ddd;
                z-index: 99 !important
            }
            .dvtabcom .nav a {
                color: #333;
                font-size: 18px;
            }
            .table > thead > tr > th, .table > tbody > tr > th, .table > tfoot > tr > th, .table > thead > tr > td, .table > tbody > tr > td, .table > tfoot > tr > td {
                border-bottom: 1px solid #eee
            }
            .dvtabcom .nav-tabs > li.active > a, .dvtabcom .nav-tabs > li.active > a:hover, .dvtabcom .nav-tabs > li.active > a:focus {
                border: 1px solid transparent;
                border-bottom: 2px solid #337ab7;
                color: #337ab7
            }
            .dvtabcom .nav > li > a:hover, .dvtabcom .nav > li > a:focus {
                background-color: transparent;
                border: 1px solid transparent
            }
            .tab-content {
                position: absolute;
                top: 55px;
                right: 0;
                left: 0;
                bottom: 0;
                overflow: hidden;
                overflow-y: auto
            }
            .tab-content .control-label {
                min-width: 170px
            }
            .tab-content .control-label + span {
                color: #337ab7
            }
            .dvmodal-body label {
            }
            /* Slide */
            .dvmodal-overlay {
                background: black;
                opacity: .3;
                position: fixed;
                top: 0px;
                bottom: 0px;
                left: 0px;
                right: 0px;
                z-index: 100
            }
            .dvmodal-outer {
                position: absolute;
                background-color: #fff;
                right: -100%;
                top: 0;
                bottom: 0;
                z-index: 101;
                box-shadow: -6px 0px 5px #aaa;
            }
            .dvmodal-popup {
                position: absolute;
                top: 0;
                bottom: 0;
                right: 0;
                width: 100%;
            }
            .dvmodal-head {
                background-color: #f9f9f9;
                position: absolute;
                top: 0;
                width: 100%;
                min-height: 52px;
                color: #333;
                padding: 18px 20px;
                left: 0;
                right: 0;
                border-bottom: 1px solid #eee
            }
            .dvmodal-head h3 {
                font-size: 16px;
                margin: 0
            }
            .dvmodal-body {
                padding: 10px;
                overflow-y: auto;
                position: absolute;
                top: 60px;
                bottom: 70px;
                left: 0;
                right: 0
            }
            .dvmodal-foo {
                position: absolute;
                bottom: 0;
                border-top: 1px solid #eee;
                width: 100%;
                padding: 15px 20px
            }
            .grey {
                color: #999;
                font-size: 13px;
                margin-top: 5px;
                display: inline-block
            }
        </style>
        <link href="css/select2.min.css" rel="stylesheet" />
        <link href="css/bootstrap.css" rel="stylesheet" />
        <link href="css/bootstrap-datetimepicker.css" rel="stylesheet" />
    </head>
    <body onload="onLoad()" style="overflow:hidden">
        <div class="">
            <div class="col-md-12 PT10 MB10 dvtabcom navbar-fixed-top"> 
                <div class="pull-right">                     
                    <a id="clock" style="color:black; margin:2px 20px 0px 0px; font-size:20px; float: left;"></a>                    
                    <a id="stopSync" style="background-color:red; " data-toggle="modal" data-target="#myConfig" class="submit MR5 btn btn-primary" onclick="stop();">Stop Sync</a>
                    <a id="resumeSync" data-toggle="modal" data-target="#myConfig" class="submit MR5 btn btn-primary" onclick="Resume();">Resume Sync</a>
                    <a onclick="showConfigPage()" class="btnConfig btn">Configure</a>
                </div>
                <ul class="nav nav-tabs B0">
                    <!--<li role="presentation" class="active"><a href="#dvDataConfig" role="tab" data-toggle="tab">Configuration</a></li>-->
                    <li><a href="#" class="btn-link" onclick="showLogsReportPage();">Logs Report</a></li>
                    <li><a href="#" class="btn-link" onclick="showManualSyncPage()">Manual Sync</a></li>
                    <li><a id="vname" style="color:black; margin:2px 20px 10px 300px; font-size:25px; float: center;"></a></li>   
                    <li><input id="vnameEdit" style="display:none; color:black; width:300px; height:40px; margin:10px 30px 0px 300px; font-size:25px; float: center;"></input></li>                      
                </ul>
            </div>
        </div>
        <div class="container-fluid">
            <div class="tab-content PT30 MB30">
                <div class="clearfix">

                    <div style="display:none" class="row PL15 PR15 PB5" id="manualSync">
                        <div class="col-md-12">
                            <div class="col-md-2">
                                <div class='input-group date' id='datetimepicker1'>
                                    <input type='text' class="form-control" />
                                    <span class="input-group-addon">
                                        <span class="glyphicon glyphicon-calendar"></span>
                                    </span>
                                </div>
                            </div>
                            <div class="col-md-2">
                                <div class='input-group date' id='datetimepicker2'>
                                    <input type='text' class="form-control" />
                                    <span class="input-group-addon">
                                        <span class="glyphicon glyphicon-calendar"></span>
                                    </span>
                                </div>

                            </div>
                            <div class="col-md-8">
                                <div class="input-group">
                                    <a class="btn btn-primary MR10" onclick="manualUpdate(true, this);">Fetch&upload</a><a class="btn btn-primary" id="countButton" onclick="manualUpdate(false, this);">Get Record Count</a>
                                </div>
                            </div>
                        </div>
                    </div>


                    <div class="row PL15 PR15" id="logsReport"> 
                        <!-- <div class="col-md-4">
                            <div id="displayServerTime" class="form-group">
                              <label class="MR20 control-label">Server Time</label>
                              <span>0</span>
                            </div>
                          </div>-->
                        <div class="col-md-7">
                            <div id="info">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="control-label">Number of Data Sent</label>
                                        <span id="numOfDataSent">0</span> </div>
                                    <div class="form-group">
                                        <label class="control-label">Average Time Taken</label>
                                        <span id="averageTime">0</span> </div>                                                                
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label class="control-label">Successful Requests Sent</label>
                                        <span id="numberOfSuccreqSent">0</span> </div>
                                    <div class="form-group">
                                        <label class="control-label">Request Failed</label>
                                        <span id="failedReq">0</span> </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-md-5">
                            <div class="col-md-12">
                                <div id="displayClock" class="form-group">
                                    <label class="control-label">Next Update in</label>
                                    <span> - </span> </div>
                            </div>
                            <div class="col-md-12">
                                <div id="lastRefreshTime" class="form-group">
                                    <label class="control-label">Last Updated Time</label>
                                    <span>00:00:00 (29/04/2015)</span> </div>
                            </div>
                        </div>

                    </div>

                    <div class="col-md-12 PT10 PL15 PB20">
                        <div class="col-md-3">
                            <select id="selectDay" onchange='getLogs(this.value)' class="js-example-placeholder-single" style="width:90%">
                            </select>
                        </div>
                    </div>                    



                    <table class="table table-hover MT10">
                        <thead>
                            <tr>
                                <th width="1%"></th>
                                <th width="20%">Time</th>
                                <th width="20%">From</th>
                                <th width="16%">To</th>
                                <th >Count</th>
                                <th>Status</th>
                                <th width="14%">Time taken</th>
                            </tr>
                        </thead>
                        <tbody id="logs1">

                        </tbody>
                    </table>
                </div>
            </div>
        </div>
        <div id="dvmodal-lft" class="dvmodal-outer" style="width:60%">
            <div class="dvmodal-popup">
                <div class="dvmodal-head">
                    <h3>Database Configuration<a ZPtitle="Close" class="IC-cls pull-right dvmodal-cls hide">x</a></h3>
                </div>
                <div class="dvmodal-body">
                    <div id="dvDataConfig">
                        <div class=""> 
                            <!--<h2>Database Configuration</h2>-->
                            <div class="clearfix">  
                                <div class="col-md-3">
                                    <div class="form-group">
                                        <label>Database Type</label>

                                        <select id="databaseType" class="js-example-placeholder-single">
                                            <option value="1" selected="selected">MS SQL SERVER</option>
                                            <option value="2">MS ACCESS</option>
                                            <option value="3">MY SQL</option>
                                        </select> 
                                    </div>
                                </div>
                                <div class="col-md-9">
                                    <div class="form-group">
                                        <label>
                                            <req style="color: red">*</req>
                                            Connection URL </label>
                                        <input id="dbConnectionUrl" class="form-control" type="text" />
                                        <em class="MT5 grey">EX : jdbc:jtds:sqlserver://localhost:1433/ZAttendance</em> </div>
                                </div>

                            </div>

                            <div class="clearfix">                                                                
                                <div class="col-md-3">
                                    <div class="form-group">
                                        <label>
                                            <req style="color: red">*</req>
                                            User name </label>
                                        <input id="dbUserName" class="form-control" type="text">
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="form-group">
                                        <label>
                                            <req style="color: red">*</req>
                                            Password </label>
                                        <input id="dbPassword" placeholder="Password" class="form-control" type="password" />
                                    </div>
                                </div>

                                <div class="col-md-6">
                                    <div class="form-group">

                                        <div class="col-md-6">
                                            <label>Delay Time(mins)</label>
                                            <input id="delaySysTime" class="form-control" type="text"/>
                                        </div>
                                    </div>
                                </div>
                            </div>                            
                            <div class="col-md-12">
                                <div class="form-group">
                                    <label>
                                        <req style="color: red">*</req>
                                        SQL Query</span> </label>
                                    <textarea id="dbQuery" rows="11" class="form-control" ></textarea>
                                    <em class="MT5 grey">EX : select employeeId,eventTime,isCheckin from Attendance where evenCreationTime >= $1 and evenCreationTime<$2 <br> Dynamic Table Format Ex : #Attendance_%M_%Y#</em> </div>
                            </div>

                            <div class="clearfix">
                                <div class="col-md-3">
                                    <div class="form-group">
                                        <label>
                                            <req style="color: red">*</req>
                                            Refresh Token</label>
                                        <a onclick="showGenerateRTPopup()">Generate</a>
                                        <input id="refreshtoken" class="form-control" type="password" />
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="form-group">
                                        <label>
                                            <req style="color: red">*</req>
                                            Client ID</label>
                                        <input id="clientID" class="form-control" type="password" />
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="form-group">
                                        <label>
                                            <req style="color: red">*</req>
                                            Client Secret</label>
                                        <input id="clientSecret" class="form-control" type="password" />
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="form-group">
                                        <label>TimeZone</label>
                                        <input type="text" class="form-control" id="timeZone" checked="checked"/>
                                    </div>
                                </div>
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <div class="col-md-6">
                                            <label>Start Time </label>
                                            <input id="startTime" class="form-control" type="text" />
                                            <em class="MT5 grey">Ex Time format : HH:mm:ss</em> </div>
                                        <div class="col-md-6">
                                            <label>Sleep Time(mins) </label>
                                            <input id="sleepTime" class="form-control" type="text" />
                                        </div>
                                    </div>
                                </div>

                            </div>


                            <div class="clearfix">
                                <div class="col-md-6">
                                    <div class="form-group">
                                        <label>Proxy host and port</label>
                                        <div class="row">
                                            <div class="col-md-6">
                                                <input id="host" class="form-control" type="text"  style="display:inline-block"/>
                                            </div>
                                            <div class="col-md-6">
                                                <input id="port" class="form-control" type="text" style="display:inline-block"/>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="form-group">
                                        <label>Proxy username</label>
                                        <input id="proxyUserName" class="form-control" type="text" />
                                    </div>
                                </div>
                                <div class="col-md-3">
                                    <div class="form-group">
                                        <label>Proxy password</label>
                                        <input id="proxyPassword" class="form-control" type="password"/>
                                    </div>
                                </div>
                            </div>

                        </div>

                    </div>
                </div>
                <div class="dvmodal-foo">  
                    <input type="button" class="btn btn-primary MR5" value="Save" onclick="saveStart();">
                    <input id="resumeSync2" type="button" class="btn btn-default MR5" value="Resume" onclick="Resume();">
                    <a class="btn btn-default dvmodal-cls" onclick="hideConfigPage()">Cancel</a>
                </div>
            </div>
        </div>
        <div onclick="hideConfigPage()" class="dvmodal-overlay" style="display:none"></div>
    </body>
      <!-- Modal -->
<div id="refreshTokenGenerator" class="modal fade" role="dialog">
  <div class="modal-dialog" style="width:100%;max-width:1000px">

    <!-- Modal content-->
    <div class="modal-content">
      <div class="modal-header">
        <button type="button" class="close" data-dismiss="modal">&times;</button>
        <h4 class="modal-title">Generate Refresh Token</h4>
      </div>
      <div class="modal-body">
                                        <label>
                                            <req style="color: red">*</req>
                                            Client ID</label>
                                        <input id="generateRTClientID" class="form-control" type="text" />
                                
                                        <label>
                                            <req style="color: red">*</req>
                                            Client Secret</label>
                                        <input id="generateRTClientSecret" class="form-control" type="text" />
                                        <label>
                                            <req style="color: red">*</req>
                                            Code</label>
                                        <input id="generateRTCode" class="form-control" type="text" />

                                    <div class="form-group MT20">

                                        <label>DC Type</label>

                                        <select id="generateRTDC" class="js-example-placeholder-single ML10">
                                            <option value="1" selected="selected">US</option>
                                            <option value="2">IN</option>
                                            <option value="3">EU</option>
                                            <option value="4">AU</option>
                                            <option value="5">CN</option>
                                        </select> 
                                    </div>
                                        <input type="button" class="btn btn-primary MR5 MT20" value="Generate Token" onclick="generateRT();">
                                        <h4 id="refershTokenGenerated" class="MT20"></h4>
                                    </div>
      </div>
    </div>

  </div>
</div>
</html>
