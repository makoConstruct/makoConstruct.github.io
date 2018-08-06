/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	"use strict";
	var shiver_1 = __webpack_require__(1);
	var toasts_1 = __webpack_require__(2);
	var toasts = new toasts_1.Toasts();
	//configuration
	var config = {
	    startingDate: Date.now(),
	    onTime: 20,
	    offTime: 10,
	    lightMode: true,
	};
	var sep = '|';
	var urlDataFromConfig = function () {
	    var minuteRead = function (seconds) {
	        var minutes = seconds / 60;
	        var justMinutes = Math.floor(minutes);
	        var secDigit = Math.floor((minutes - justMinutes) * 60);
	        var positiveOrAbsent = function (n) { return n == 0 ? '' : '' + n; };
	        return positiveOrAbsent(justMinutes) + ':' + positiveOrAbsent(secDigit);
	    };
	    var offset = (config.startingDate % (config.onTime + config.offTime));
	    return new Number(offset).toString(36) + sep + minuteRead(config.onTime) + sep + minuteRead(config.offTime) + sep + (config.lightMode ? 'L' : 'D');
	};
	var readUrlDataToConfig = function () {
	    ;
	    getEl('shareLinkDisplay').value = document.location.toString();
	    var lhash = location.hash;
	    if (lhash != "") {
	        var urlDataArray = lhash.substr(1).split(sep);
	        var minutesRead = function (mr) {
	            var ml = mr.split(':');
	            var emptyIsZero = function (ns) { return ns == "" ? 0 : parseFloat(ns); };
	            return emptyIsZero(ml[0]) * 60 + emptyIsZero(ml[1]);
	        };
	        config = {
	            startingDate: parseInt(urlDataArray[0], 36),
	            onTime: minutesRead(urlDataArray[1]),
	            offTime: minutesRead(urlDataArray[2]),
	            lightMode: urlDataArray[3] == 'L',
	        };
	    }
	};
	//constants
	var apiUrl = 'q/q/';
	var clockLineThickness = 9;
	var innerCircleLineThickness = 9;
	var clockGaps = 9;
	//utilities
	var loge = function (message) {
	    var optionalParams = [];
	    for (var _i = 1; _i < arguments.length; _i++) {
	        optionalParams[_i - 1] = arguments[_i];
	    }
	    return console.error.apply(console, [message].concat(optionalParams));
	};
	var logi = function (message) {
	    var optionalParams = [];
	    for (var _i = 1; _i < arguments.length; _i++) {
	        optionalParams[_i - 1] = arguments[_i];
	    }
	    return console.info.apply(console, [message].concat(optionalParams));
	};
	var log = function (message) {
	    var optionalParams = [];
	    for (var _i = 1; _i < arguments.length; _i++) {
	        optionalParams[_i - 1] = arguments[_i];
	    }
	    return console.log.apply(console, [message].concat(optionalParams));
	};
	var requestAnimFrame = window.requestAnimationFrame ||
	    window.webkitRequestAnimationFrame ||
	    function (callback) {
	        window.setTimeout(callback, 1000 / 60);
	    };
	function getEl(name) { return document.getElementById(name); }
	function leftPad(n, padChar, baseStr) {
	    var pd = '';
	    while (pd.length + baseStr.length < n) {
	        pd += padChar;
	    }
	    return pd + baseStr;
	}
	function selectElementContents(el) {
	    var range = document.createRange();
	    range.selectNodeContents(el);
	    var sel = window.getSelection();
	    sel.removeAllRanges();
	    sel.addRange(range);
	}
	var ModeTransitioner = (function () {
	    function ModeTransitioner(modes, //the objs can have an enter lambda, am exit lambda, and transition lambdas
	        initialMode) {
	        this.modes = modes;
	        this.currentMode = initialMode;
	    }
	    ModeTransitioner.prototype.transition = function (nm) {
	        if (nm == this.currentMode)
	            return;
	        if (this.currentMode && this.modes.get(this.currentMode).exit) {
	            this.modes.get(this.currentMode).exit();
	        }
	        var enteredMode = this.modes.get(nm);
	        if (enteredMode.enter)
	            enteredMode.enter();
	        if (enteredMode.enterFrom) {
	            if (enteredMode.enterFrom[this.currentMode]) {
	                enteredMode.enterFrom[this.currentMode]();
	            }
	        }
	        this.currentMode = nm;
	    };
	    return ModeTransitioner;
	}());
	var clampUnit = function (n) { return Math.min(1, Math.max(0, n)); };
	var non = function (n) { return 1 - n; };
	var lerp = function (a, b, p) { return non(p) * a + p * b; };
	var unlerp = function (a, b, p) { return (p - a) / (b - a); };
	var sq = function (n) { return n * n; };
	var easeIn = function (n) { return non(sq(non(n))); };
	var easeOut = function (n) { return sq(sq(n)); };
	var lightMode;
	var progressOverInterval = function (startTime, transitionDuration) { return (Date.now() - startTime) / transitionDuration; };
	var backgroundColor = function () { return lightMode ? '#ffffff' : '#000000'; };
	var backgroundColorWithAlpha = function (a) { return lightMode ?
	    'rgba(255,255,255,' + a + ')' :
	    'rgba(0,0,0,' + a + ')'; };
	var arcColor = function () { return lightMode ? '#000' : '#e9e9e9'; };
	var dimColor = function () { return lightMode ? '#CDCDCD' : '#1a1a1a'; };
	var litColor = function () { return lightMode ? '#CDCDCD' : '#1a1a1a'; };
	var circleColor = function () {
	    return dimColor();
	};
	var urlFor = function (key) { return 'http://' + document.location.pathname + key; };
	var pageKey = function () {
	    var pn = window.location.pathname.substring(1);
	    return pn == "" ? null : pn;
	};
	var isShared = function () { return !!pageKey(); };
	function errorToast(msg) {
	    toasts.post(msg, { withClass: 'no' });
	}
	function lastingErrorToast(msg) {
	    toasts.post(msg, { withClass: 'no', lifespan: Infinity });
	}
	function toastNormally(msg) {
	    toasts.post(msg, { withClass: 'alrightToast' });
	}
	function configurationChanged() {
	    // if(isShared()){
	    // objectQuery({op:'edit', key:pageKey(), config:config}).then(
	    // 	()=>{toastNormally("changes saved")},
	    // 	(err)=>{lastingErrorToast("error: "+err)} )
	    // }
	    var linkEnd = '#' + urlDataFromConfig();
	    var newUrl = urlFor(linkEnd);
	    getEl('shareLinkDisplay').value = newUrl;
	    history.pushState(config, "", linkEnd);
	}
	function userIsPresent() {
	    return document.visibilityState == 'visible';
	}
	shiver_1.afterDOMContentLoaded(function () {
	    var clockFace = getEl('clockFace');
	    var clockText = getEl('clockText');
	    var currentStatus = getEl('currentStatus');
	    var focusSound = getEl('focusSound');
	    var breakSound = getEl('breakSound');
	    var canvas = getEl('clockCanvas'); // in your HTML this element appears as <canvas id="mycanvas"></canvas>
	    var setintervalsbtn = getEl('setintervalsBtn');
	    var cw = canvas.width;
	    var ch = canvas.height;
	    var cr = Math.min(cw, ch) / 2;
	    var con = canvas.getContext('2d');
	    if (location.hash == "") {
	        //complete the config if it's fresh
	        config.startingDate = Date.now();
	        configurationChanged();
	    }
	    else {
	        //read it from the url if it's written
	        readUrlDataToConfig();
	    }
	    //fetch settings from localstorage
	    lightMode = shiver_1.getLocalstorageObject('dayMode', config.lightMode);
	    var soundOn = shiver_1.getLocalstorageObject('soundEnabled', true);
	    var userWantsNotifications = shiver_1.getLocalstorageObject('notificationsEnabled');
	    //current rendering state
	    var animations = []; //if animation returns false, wont be called again
	    var secondsIn;
	    var currentTimeRange = config.onTime;
	    var centerCirclep = 0;
	    var arcMin = 0;
	    var arcBound = 0;
	    var ticking; //the intervalID
	    //set up Notifications
	    function updateNotificationSetting(ns) {
	        var currentNotificationSettingDisplay = getEl('currentNotifications');
	        currentNotificationSettingDisplay.textContent = ns ? 'on' : 'off';
	        userWantsNotifications = ns;
	        shiver_1.setLocalstorageObject('notificationsEnabled', userWantsNotifications);
	        if (ns) {
	            if (Notification) {
	                if (Notification.permission == 'default') {
	                    Notification.requestPermission().then(function (result) {
	                        if (result == 'denied') {
	                            userWantsNotifications = false;
	                        }
	                        else if (result == 'default') {
	                            userWantsNotifications = true;
	                        }
	                        else {
	                            userWantsNotifications = true;
	                        }
	                        shiver_1.setLocalstorageObject('notificationsEnabled', userWantsNotifications);
	                    });
	                }
	                else if (Notification.permission == 'denied') {
	                    errorToast("You must have told the web browser to forbid me from using notifications. I can't enable them. You will have to speak with it for me and sort things out.");
	                }
	            }
	            else {
	                errorToast("Your web browser does not support notifications. Maybe you should install a better web browser. How about chrome?");
	            }
	        }
	    }
	    updateNotificationSetting(userWantsNotifications);
	    var notificationsBtn = getEl('notificationsBtn');
	    notificationsBtn.addEventListener('click', function () {
	        updateNotificationSetting(!userWantsNotifications);
	    });
	    //set up sound setting
	    function updateSoundSetting(ns) {
	        soundOn = ns;
	        shiver_1.setLocalstorageObject('soundEnabled', soundOn);
	        getEl('currentSound').textContent = ns ? 'on' : 'off';
	    }
	    updateSoundSetting(soundOn);
	    getEl('soundBtn').addEventListener('click', function () {
	        updateSoundSetting(!soundOn);
	    });
	    //set up theme setting
	    function updateThemeSetting(ns) {
	        lightMode = ns;
	        shiver_1.setLocalstorageObject('dayMode', lightMode);
	        getEl('currentTheme').textContent = lightMode ? 'light' : 'dark';
	        if (lightMode) {
	            document.body.classList.add('lightTheme');
	        }
	        else {
	            document.body.classList.remove('lightTheme');
	        }
	    }
	    updateThemeSetting(lightMode);
	    getEl('themeBtn').addEventListener('click', function () {
	        updateThemeSetting(!lightMode);
	    });
	    function notify(msg, sound) {
	        if (Notification && userWantsNotifications) {
	            new Notification(msg, { icon: 'arc.svg' });
	        }
	        else {
	            console.log('notification: ' + msg + ' B)');
	        }
	        if (soundOn) {
	            sound.play();
	        }
	    }
	    function renderf() {
	        animations = animations.filter(function (anim) { return anim(); });
	        con.clearRect(0, 0, cw, ch);
	        var p = secondsIn / currentTimeRange;
	        var endAngle;
	        var startAngle;
	        var outerAnticlockwise;
	        outerAnticlockwise = false;
	        startAngle = -Math.PI / 2;
	        endAngle = startAngle + Math.PI * 2 * Math.min(Math.max(p, arcMin), arcBound);
	        con.beginPath();
	        con.arc(cw / 2, ch / 2, cr, startAngle, endAngle, outerAnticlockwise);
	        con.arc(cw / 2, ch / 2, cr - clockLineThickness, endAngle, startAngle, !outerAnticlockwise);
	        con.closePath();
	        con.fillStyle = arcColor();
	        con.fill();
	        //inner circle
	        con.beginPath();
	        con.arc(cw / 2, ch / 2, cr - clockGaps - clockLineThickness, 0, Math.PI * 2);
	        con.closePath();
	        con.fillStyle = circleColor();
	        con.fill();
	        //the hole in the circle
	        if (centerCirclep) {
	            var outerm = cr - clockLineThickness - clockGaps - innerCircleLineThickness;
	            var innerm = outerm * 0.7;
	            con.beginPath();
	            con.arc(cw / 2, ch / 2, lerp(innerm, outerm, centerCirclep), 0, Math.PI * 2);
	            con.closePath();
	            con.fillStyle = backgroundColorWithAlpha(centerCirclep);
	            con.fill();
	        }
	        if (animations.length) {
	            requestAnimFrame(renderf);
	        }
	    }
	    function startRendering() {
	        requestAnimFrame(renderf);
	    }
	    function addAnimation(anim) {
	        animations.push(anim);
	        startRendering();
	    }
	    function easeArcDown(startTime) {
	        return function () {
	            arcMin = non(easeOut(progressOverInterval(startTime, 1200)));
	            return arcMin > 0;
	        };
	    }
	    var mapModes = [
	        ['noclock', {
	                entry: function () {
	                    var startTime = Date.now();
	                    addAnimation(function () {
	                        arcBound = easeOut(non(clampUnit(progressOverInterval(startTime, 230))));
	                        return arcBound > 0;
	                    });
	                },
	                exit: function () {
	                    var startTime = Date.now();
	                    addAnimation(function () {
	                        arcBound = easeOut(clampUnit(progressOverInterval(startTime, 450)));
	                        return arcBound < 1;
	                    });
	                }
	            }],
	        ['focused', {
	                exit: function () {
	                    addAnimation(easeArcDown(Date.now()));
	                },
	                enter: function () {
	                    currentTimeRange = config.onTime;
	                    currentStatus.textContent = 'focusing on the task';
	                    var timeOfExit = Date.now();
	                    addAnimation(function () {
	                        centerCirclep = non(clampUnit(progressOverInterval(timeOfExit, 90)));
	                        return centerCirclep > 0;
	                    });
	                },
	                enterFrom: {
	                    'break': function () {
	                        // if(!userIsPresent()){ //this is no good. If the user uses a window manager, and the timer is visible in a workspace, even if that workspace isn't currently active, userIsPresent() will be, and no alert will ever sound.
	                        notify('now focus', focusSound);
	                        // }
	                    }
	                }
	            }],
	        ['break', {
	                exit: function () {
	                    addAnimation(easeArcDown(Date.now()));
	                },
	                enter: function () {
	                    currentTimeRange = config.offTime;
	                    currentStatus.textContent = 'taking a break';
	                    var timeOfEntry = Date.now();
	                    addAnimation(function () {
	                        centerCirclep = clampUnit(progressOverInterval(timeOfEntry, 90));
	                        return centerCirclep < 1;
	                    });
	                },
	                enterFrom: {
	                    'focused': function () {
	                        notify('step back. take a break', breakSound);
	                    }
	                }
	            }]
	    ];
	    var mt = new ModeTransitioner(new Map(mapModes), 'noclock');
	    function tick() {
	        var totalSecondsIn = Math.floor(Date.now() / 1000 - config.startingDate) % (config.onTime + config.offTime);
	        if (totalSecondsIn < config.onTime) {
	            secondsIn = totalSecondsIn;
	            mt.transition('focused');
	        }
	        else {
	            secondsIn = totalSecondsIn - config.onTime;
	            mt.transition('break');
	        }
	        var timeToGo = currentTimeRange - secondsIn;
	        var minutesToGo = Math.floor(timeToGo / 60);
	        clockText.textContent = leftPad(2, '0', '' + (minutesToGo)) + ":" + leftPad(2, '0', '' + (timeToGo % 60));
	        startRendering();
	    }
	    var openCount = 0;
	    function collapsionFor(v) {
	        var ret = new shiver_1.VerticallyCollapsingContainer(v, 0.1, 0.1);
	        var o = {
	            isCollapsed: true,
	            collapse: function () {
	                if (openCount > 0) {
	                    --openCount;
	                }
	                ret.collapse();
	                o.isCollapsed = true;
	                if (openCount == 0) {
	                    getEl('configurationArea').classList.remove('active');
	                }
	            },
	            expand: function () {
	                if (openCount == 0) {
	                    getEl('configurationArea').classList.add('active');
	                }
	                o.isCollapsed = false;
	                ++openCount;
	                ret.expand();
	            },
	            toggle: function () {
	                if (o.isCollapsed) {
	                    o.expand();
	                }
	                else {
	                    o.collapse();
	                }
	            }
	        };
	        return o;
	    }
	    var shareBtn = getEl('shareBtn');
	    var shareInfo = getEl('shareInfo');
	    var shareInfoCollapsion = collapsionFor(shareInfo);
	    var shareLinkDisplay = getEl('shareLinkDisplay');
	    shareBtn.addEventListener('click', function () {
	        if (!shareInfoCollapsion.isCollapsed) {
	            shareInfoCollapsion.collapse();
	        }
	        else {
	            shareInfoCollapsion.expand();
	            shareLinkDisplay.select();
	        }
	    });
	    shareLinkDisplay.addEventListener('click', function () { shareLinkDisplay.select(); });
	    function startTicking() {
	        tick();
	        ticking = setInterval(tick, 1000);
	    }
	    var settingsInfo = getEl('settingsInfo');
	    var settingsBtn = getEl('settingsBtn');
	    var intervalOnTime = getEl('intervalOnTime');
	    var intervalOffTime = getEl('intervalOffTime');
	    var sendIntervalsBtn = getEl('sendIntervalsBtn');
	    var settingsInfoCollapsion = collapsionFor(settingsInfo);
	    function transmitNewIntervals() {
	        //for either mode, we figure out how far we are through the current interval of that mode and make us proportionately far through in the new settings
	        if (intervalOnTime.classList.contains('no') || intervalOnTime.classList.contains('no'))
	            return;
	        var newOnTime = Math.floor(parseFloat(intervalOnTime.value) * 60);
	        var newOffTime = Math.floor(parseFloat(intervalOffTime.value) * 60);
	        var newTimeRange;
	        if (mt.currentMode == 'break') {
	            newTimeRange = newOffTime;
	        }
	        else if (mt.currentMode == 'focused') {
	            newTimeRange = newOnTime;
	        }
	        else {
	            console.error('why is there no clock. I\'m confused');
	            newTimeRange = 0;
	        }
	        secondsIn = lerp(0, newTimeRange, unlerp(0, currentTimeRange, secondsIn));
	        currentTimeRange = newTimeRange;
	        var previousTimeRangesSeconds = mt.currentMode == 'focused' ? 0 : newOnTime;
	        config.startingDate = Math.floor(Date.now() / 1000 - (previousTimeRangesSeconds + secondsIn));
	        config.onTime = newOnTime;
	        config.offTime = newOffTime;
	        configurationChanged();
	    }
	    settingsBtn.addEventListener('click', function () { settingsInfoCollapsion.toggle(); });
	    sendIntervalsBtn.addEventListener('click', transmitNewIntervals);
	    var prepToTakeMinutes = function (htmlel) {
	        htmlel.addEventListener('input', function () {
	            if (parseFloat(htmlel.value) > 0) {
	                htmlel.classList.remove('no');
	            }
	            else {
	                htmlel.classList.add('no');
	            }
	        });
	        htmlel.addEventListener('click', function () { return htmlel.select(); });
	    };
	    prepToTakeMinutes(intervalOnTime);
	    prepToTakeMinutes(intervalOffTime);
	    intervalOnTime.value = '' + (config.onTime / 60);
	    intervalOffTime.value = '' + (config.offTime / 60);
	    var aboutAction = getEl('aboutBtn');
	    var aboutInfoCollapsion = collapsionFor(getEl('aboutInfo'));
	    aboutAction.addEventListener('click', function () { aboutInfoCollapsion.toggle(); });
	    var resetBtn = getEl('resetBtn');
	    function resetTime() {
	        config.startingDate = Math.floor(Date.now() / 1000);
	        secondsIn = 0;
	        configurationChanged();
	    }
	    resetBtn.addEventListener('click', resetTime);
	    function stopTicking() {
	        if (ticking) {
	            clearInterval(ticking);
	            ticking = null;
	        }
	    }
	    function reset() {
	        config.startingDate = Math.floor(Date.now() / 1000);
	        stopTicking();
	        startTicking();
	        configurationChanged();
	    }
	    startTicking();
	});


/***/ },
/* 1 */
/***/ function(module, exports) {

	"use strict";
	function sum(ar) { return ar.reduce(function (a, b) { return a + b; }); }
	exports.sum = sum;
	function product(ar) { return ar.reduce(function (a, b) { return a * b; }); }
	exports.product = product;
	function afterDOMContentLoaded(f) {
	    if (document.readyState == "complete" || document.readyState == "interactive") {
	        f();
	    }
	    else {
	        document.addEventListener("DOMContentLoaded", f);
	    }
	}
	exports.afterDOMContentLoaded = afterDOMContentLoaded;
	function zip(a, b, f) {
	    var ret = [];
	    for (var i = 0, max = Math.min(a.length, b.length); i < max; ++i) {
	        ret.push(f(a[i], b[i]));
	    }
	    return ret;
	}
	exports.zip = zip;
	function setLocalstorageObject(key, value) {
	    if (localStorage) {
	        localStorage.setItem(key, JSON.stringify(value));
	    }
	}
	exports.setLocalstorageObject = setLocalstorageObject;
	function getLocalstorageObject(key, defaultValue) {
	    if (defaultValue === void 0) { defaultValue = undefined; }
	    if (localStorage) {
	        var value = localStorage.getItem(key);
	        if (value !== undefined) {
	            return JSON.parse(value);
	        }
	        else {
	            return defaultValue;
	        }
	    }
	    else {
	        return defaultValue;
	    }
	}
	exports.getLocalstorageObject = getLocalstorageObject;
	// function joining<T>(arr:T[], on:(T)=>void, off:()=>void){
	// 	if(arr.length == 0) return
	// 	var i=0
	// 	while(true){
	// 		on(arr[i])
	// 		++i
	// 		if(i < arr.length){ off() }
	// 	}
	// }
	function timeoutSet(timeMilliseconds, cb) {
	    return setTimeout(cb, timeMilliseconds);
	}
	exports.timeoutSet = timeoutSet;
	function awaitRequest(httpType, address, data, contentType) {
	    return new Promise(function (g, b) {
	        var q = new XMLHttpRequest();
	        q.open(httpType, address, true);
	        if (contentType)
	            q.setRequestHeader("Content-Type", contentType);
	        q.onreadystatechange = function (ev) {
	            if (q.readyState == 4) {
	                if (q.status == 200) {
	                    var o;
	                    try {
	                        o = JSON.parse(q.responseText);
	                    }
	                    catch (e) {
	                        b("the json that came through is malformed. " + e);
	                        return;
	                    }
	                    g(o);
	                }
	                else {
	                    b("problem fetching json. status:" + q.status);
	                }
	            }
	        };
	        q.ontimeout = function (ev) {
	            b("query took too long. Network problem?");
	        };
	        q.send(data || null);
	    });
	}
	exports.awaitRequest = awaitRequest;
	function postObjectGetObject(address, data) {
	    return awaitRequest("POST", address, JSON.stringify(data), "application/json");
	}
	exports.postObjectGetObject = postObjectGetObject;
	function postDataGetObject(address, data) {
	    return awaitRequest("POST", address, data);
	}
	exports.postDataGetObject = postDataGetObject;
	function fetchObject(address) {
	    return awaitRequest("GET", address, null);
	}
	exports.fetchObject = fetchObject;
	function copyInObject(target, other) {
	    for (var k in other) {
	        target[k] = other[k];
	    }
	}
	exports.copyInObject = copyInObject;
	function copyObject(v) {
	    var ret = {};
	    copyInObject(ret, v);
	    return ret;
	}
	exports.copyObject = copyObject;
	function removeArrayItem(ar, i) {
	    if (i >= 0) {
	        ++i;
	        while (i < ar.length) {
	            ar[i - 1] = ar[i];
	            ++i;
	        }
	        ar.pop();
	    }
	}
	exports.removeArrayItem = removeArrayItem;
	function outerHeight(el) {
	    var cstyle = getComputedStyle(el);
	    return el.offsetHeight + parseFloat(cstyle.marginTop) + parseFloat(cstyle.marginBottom);
	}
	exports.outerHeight = outerHeight;
	function outerWidth(el) {
	    var cstyle = getComputedStyle(el);
	    return el.offsetWidth + parseFloat(cstyle.marginLeft) + parseFloat(cstyle.marginRight);
	}
	exports.outerWidth = outerWidth;
	function outerTop(el) {
	    var cstyle = getComputedStyle(el);
	    return el.offsetTop - parseFloat(cstyle.marginTop);
	}
	exports.outerTop = outerTop;
	function outerLeft(el) {
	    var cstyle = getComputedStyle(el);
	    return el.offsetLeft - parseFloat(cstyle.marginLeft);
	}
	exports.outerLeft = outerLeft;
	var VerticallyCollapsingContainer = (function () {
	    function VerticallyCollapsingContainer(parent, fadeDurationSeconds, collapseDurationSeconds) {
	        this.parent = parent;
	        this.fadeDurationSeconds = fadeDurationSeconds;
	        this.collapseDurationSeconds = collapseDurationSeconds;
	        this.currentTimeout = 0;
	        this.isCollapsed = true;
	        parent.style.position = 'relative';
	        parent.style.height = '0px';
	        parent.style.transition = 'height ' + collapseDurationSeconds + 's ease-in-out';
	        parent.style.overflow = 'hidden';
	        this.child = parent.firstElementChild;
	        this.child.style.position = 'absolute';
	        this.child.style.top = '0px';
	        this.child.style.left = '0px';
	        this.child.style.right = '0px';
	        this.child.style.opacity = '0';
	        this.child.style.transition = 'opacity ' + fadeDurationSeconds + 's ease-in-out';
	    }
	    VerticallyCollapsingContainer.prototype.expand = function () {
	        var _this = this;
	        if (!this.isCollapsed)
	            return;
	        this.isCollapsed = false;
	        if (this.currentTimeout)
	            clearTimeout(this.currentTimeout);
	        this.parent.style.height = outerHeight(this.child) + 'px';
	        this.currentTimeout = timeoutSet(this.collapseDurationSeconds * 1000, function () {
	            _this.currentTimeout = 0;
	            _this.child.style.opacity = '1';
	        });
	    };
	    VerticallyCollapsingContainer.prototype.collapse = function () {
	        var _this = this;
	        if (this.isCollapsed)
	            return;
	        this.isCollapsed = true;
	        if (this.currentTimeout)
	            clearTimeout(this.currentTimeout);
	        this.child.style.opacity = '0';
	        this.currentTimeout = timeoutSet(this.fadeDurationSeconds * 1000, function () {
	            _this.currentTimeout = 0;
	            _this.parent.style.height = '0px';
	        });
	    };
	    VerticallyCollapsingContainer.prototype.toggle = function () { if (this.isCollapsed) {
	        this.expand();
	    }
	    else {
	        this.collapse();
	    } };
	    return VerticallyCollapsingContainer;
	}());
	exports.VerticallyCollapsingContainer = VerticallyCollapsingContainer;
	var Rng = (function () {
	    function Rng(seed) {
	        if (seed === void 0) { seed = Math.floor(Math.random() * 233280); }
	        this.seed = seed;
	    }
	    Rng.prototype.next = function (min, max) {
	        max = max || 0;
	        min = min || 0;
	        this.seed = (this.seed * 9301 + 49297) % 233280;
	        var rnd = this.seed / 233281;
	        return min + rnd * (max - min);
	    };
	    Rng.prototype.nextInt = function (min, max) {
	        return Math.floor(this.next(min, max));
	    };
	    Rng.prototype.nextDouble = function () {
	        return this.next(0, 1);
	    };
	    Rng.prototype.pick = function (collection) {
	        return collection[this.nextInt(0, collection.length - 1)];
	    };
	    return Rng;
	}());
	exports.Rng = Rng;


/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";
	//util
	function copyInObject(target, other) {
	    for (var k in other) {
	        target[k] = other[k];
	    }
	    return target;
	}
	function copyObject(v) {
	    var ret = {};
	    copyInObject(ret, v);
	    return ret;
	}
	function copyInIfNotPresent(target, other) {
	    for (var k in other) {
	        if (target[k] === undefined) {
	            target[k] = other[k];
	        }
	    }
	    return target;
	}
	function removeArrayItem(ar, i) {
	    if (i >= 0) {
	        ++i;
	        while (i < ar.length) {
	            ar[i - 1] = ar[i];
	            ++i;
	        }
	        ar.pop();
	    }
	}
	function positionMessageBoxAlong(v, along, gravity) {
	    if (gravity[1] > 0) {
	        v.style.bottom = along + 'px';
	    }
	    else {
	        v.style.top = along + 'px';
	    }
	}
	function suggestedLifespanFor(msg) {
	    var base = 2500;
	    var lettersPerSecond = 11 / 1000;
	    return base + msg.length / lettersPerSecond;
	}
	var Toasts = (function () {
	    function Toasts(cfg) {
	        var _this = this;
	        if (cfg === void 0) { cfg = {}; }
	        this.defaults = {
	            lifespan: 'suggested'
	        };
	        this.fadeDuration = 200; //milliseconds
	        this.separation = 20;
	        this.gravity = [1, -1];
	        this.messages = [];
	        this.generate = function (msg, config, invokeDestruction) {
	            var ret = document.createElement('div');
	            ret.style.position = 'absolute';
	            ret.style.transition = 'all ' + _this.fadeDuration + 'ms ease-out';
	            ret.style.padding = '7px';
	            ret.style.margin = '5px';
	            ret.style.opacity = '0';
	            ret.style.cursor = 'pointer';
	            ret.style['border-radius'] = '4px';
	            ret.textContent = msg;
	            ret.addEventListener('click', invokeDestruction);
	            return {
	                element: ret,
	                fadeIn: function () { ret.style.opacity = '1'; },
	                fadeOut: function () { ret.style.opacity = '0'; }
	            };
	        };
	        if (cfg.generationFunction && cfg.cssWay) {
	            console.error("toastbox senses that the programmer is confused. There's no reason to give both generationFunction and cssWay. The css way imposes its own toastbox generationFunction, that is its purpose");
	        }
	        if (cfg.generationFunction) {
	            this.generate = cfg.generationFunction;
	        }
	        if (cfg.cssWay) {
	            this.generate = function (msg, config, invokeDestruction) {
	                var ret = document.createElement('div');
	                ret.classList.add(cfg.cssWay.elementClass || 'toastbox');
	                var tcon = document.createElement('span');
	                tcon.textContent = msg;
	                ret.appendChild(tcon);
	                // ret.textContent = msg
	                ret.addEventListener('click', invokeDestruction);
	                return {
	                    element: ret,
	                    fadeIn: function () { ret.classList.add(cfg.cssWay.fadeInClass || 'toastboxFadingIn'); },
	                    fadeOut: function () { ret.classList.add(cfg.cssWay.fadeOutClass || 'toastboxFadingOut'); }
	                };
	            };
	        }
	        if (cfg.fadeDuration) {
	            this.fadeDuration = cfg.fadeDuration;
	        }
	        if (cfg.gravity) {
	            this.gravity = cfg.gravity;
	        }
	        if (cfg.defaults) {
	            copyInObject(this.defaults, cfg.defaults);
	        }
	    }
	    Toasts.prototype.post = function (msg, config) {
	        var _this = this;
	        if (config === void 0) { config = {}; }
	        var msgbox = { disappearedAlready: false }; //this will be completed later, but it needs to be allocated before disappearance is allocated so that it can be captured by reference (and disappearance needs to be made before generate is called, because the generation function needs to be given disappearance, so that it can choose what to bind it to- maybe it wants to bind it to onclick, maybe only to clicking a particular element, maybe not at all. Not for us to decide here)
	        var disappearance = function () {
	            if (msgbox.disappearedAlready)
	                return;
	            msgbox.disappearedAlready = true;
	            msgbox.fadeOut();
	            setTimeout(function () {
	                var i = _this.messages.indexOf(msgbox);
	                removeArrayItem(_this.messages, i);
	                //reposition remaining items
	                var acc = _this.gravity[1] > 0 ?
	                    msgbox.element.offsetTop + msgbox.element.offsetHeight :
	                    msgbox.element.offsetTop;
	                document.body.removeChild(msgbox.element);
	                while (i < _this.messages.length) {
	                    var tel = _this.messages[i].element;
	                    positionMessageBoxAlong(tel, acc, _this.gravity);
	                    acc += _this.separation + tel.offsetHeight;
	                    ++i;
	                }
	                //reduce potential for leaks if user accidentally holds onto a ref of disappearance
	                for (var k in msgbox) {
	                    msgbox[k] = undefined;
	                }
	                msgbox.disappearedAlready = true;
	            }, msgbox.fadeDuration);
	        };
	        var cfg = copyInObject(copyObject(this.defaults), config);
	        var generata = this.generate(msg, cfg, disappearance);
	        copyInIfNotPresent(copyInObject(msgbox, generata), {
	            fadeDuration: this.fadeDuration,
	            fadeIn: function () { },
	            fadeOut: function () { },
	            lifespan: cfg.lifespan
	        });
	        var endMsgbox = this.messages.length ? this.messages[this.messages.length - 1] : null;
	        var after = endMsgbox && endMsgbox.element;
	        if (this.gravity[0] == -1) {
	            msgbox.element.style.left = this.separation + 'px';
	        }
	        else if (this.gravity[0] == 1) {
	            msgbox.element.style.right = this.separation + 'px';
	        }
	        if (this.gravity[1] == -1) {
	            msgbox.element.style.top = this.separation + (after ? after.offsetTop + after.offsetHeight : 0) + 'px';
	        }
	        else if (this.gravity[1] == 1) {
	            msgbox.element.style.bottom = this.separation + (after ? after.offsetLeft : 0) + 'px';
	        }
	        if (cfg.withClass) {
	            msgbox.element.classList.add(cfg.withClass);
	        }
	        document.body.appendChild(msgbox.element);
	        this.messages.push(msgbox);
	        setTimeout(msgbox.fadeIn, 16); //wont animate if we do it right away
	        if (msgbox.lifespan != Infinity) {
	            var lifespan = (msgbox.lifespan == 'suggested') ?
	                suggestedLifespanFor(msg) :
	                msgbox.lifespan;
	            setTimeout(disappearance, lifespan);
	        }
	        return disappearance;
	    };
	    return Toasts;
	}());
	exports.Toasts = Toasts;


/***/ }
/******/ ]);