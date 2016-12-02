(function($) {

    var PLAY = 'PLAY';
    var PAUSE = 'PAUSE';

    var TabRotate = function() {

        var state = {
            currentTabIndex: 0,
            tabs: []
        };
        
        var cycleWorker;

        var getDefaults = (function () {
            var DEFAULT_CONFIG = {
                source: "DIRECT",
                url: "/app/config.sample.json",
                configFile: ""
            };

            jQuery.get("/app/config.sample.json", function (res) {
                DEFAULT_CONFIG.configFile = res;
            });

            return function () {
                return jQuery.extend({}, DEFAULT_CONFIG);
            }
        })();

        function loadSettingsFromDisc() {
            return new Promise(function (resolve) {
                chrome.storage.sync.get(null, function (discSettings) {
                    var loadedConfig = jQuery.isEmptyObject(discSettings) ? getDefaults() : discSettings;
                    state = jQuery.extend(state,parseSettings(loadedConfig));
                    console.log(state);
                    resolve();
                });
            });
        }

        function parseSettings(settings) {
            var config = JSON.parse(settings.configFile);
            config.url = settings.url;
            return config;
        }
        
        function createNewTab(tabConfig) {
            chrome.tabs.create({
                "index": state.currentTabIndex,
                "url": tabConfig.url,
                "pinned": true
            }, function (tab) {
                console.log("Created tabId: " + tab.id);
                tabConfig.id = tab.id;
                tabConfig.lastReloadTimestamp = Date.now();
                tabConfig.lastActivationTimestamp = Date.now();
            });
        }

        function removeTab(tabConfig) {
            chrome.tabs.remove(tabConfig.id, function () {
                console.log("Removed tabId: " + tabConfig.id);
            });
        }
        
        function activateTab(tabConfig) {
            chrome.tabs.update(tabConfig.id, {active: true}, function(tab){
                console.log("Activated tabId: " + tab.id);
                tabConfig.lastActivationTimestamp = Date.now();
            });
        }
        
        function startCycleWorker() {
            cycleWorker = setInterval(cycleTabs, 1000);
        }

        function stopCycleWorker() {
            clearInterval(cycleWorker);
        }
        
        function cycleTabs() {
            var tabConfig = state.tabs[state.currentTabIndex];
            
            if (!("id" in tabConfig && typeof tabConfig.id != "undefined")) {
                createNewTab(tabConfig);
                return;
            }

            chrome.tabs.get(tabConfig.id, function(tab) {
                if (chrome.runtime.lastError)
                {
                    console.log(chrome.runtime.lastError.message);
                } 
                if (typeof tab === "undefined") {
                    createNewTab(tabConfig);
                } else if (!tab.active) {
                    activateTab(tabConfig);
                } else if (needReload(tabConfig)) {
                    removeTab(tabConfig);
                } else if (needCycle(tabConfig)) {
                    setNextTabIndex();
                }
            });
        }
        
        function needReload(tabConfig) {
            console.log('checking reload for url: ' + tabConfig.url);
            if (typeof tabConfig.lastReloadTimestamp === "undefined") {
                tabConfig.lastReloadTimestamp = 0;
            }
            if (typeof tabConfig.reloadIntervalSeconds === "undefined") {
                tabConfig.reloadIntervalSeconds = state.reloadIntervalSeconds;
            }
            
            var secondsSinceReload = (Date.now() - tabConfig.lastReloadTimestamp) / 1000;
            var reloadIntervalSeconds = tabConfig.reloadIntervalSeconds;
            console.log(secondsSinceReload + "/" + reloadIntervalSeconds);
            return (secondsSinceReload >= reloadIntervalSeconds);
        }

        function needCycle(tabConfig) {
            console.log('checking cycle for url: ' + tabConfig.url);
            if (typeof tabConfig.lastActivationTimestamp === "undefined") {
                tabConfig.lastActivationTimestamp = 0;
            }
            if (typeof tabConfig.cycleIntervalSeconds === "undefined") {
                tabConfig.cycleIntervalSeconds = state.cycleIntervalSeconds;
            }

            var secondsSinceActivation = (Date.now() - tabConfig.lastActivationTimestamp) / 1000;
            var activationIntervalSeconds = tabConfig.cycleIntervalSeconds;
            console.log(secondsSinceActivation + "/" + activationIntervalSeconds);
            return (secondsSinceActivation >= activationIntervalSeconds);
        }

        function setNextTabIndex() {
            state.currentTabIndex = state.currentTabIndex + 1;
            if (state.currentTabIndex >= state.tabs.length) {
                state.currentTabIndex = 0;
            }
        }

        this.play = function () {
            chrome.browserAction.setIcon({path: "app/img/Play-38.png"});
            chrome.storage.local.set({"playPauseStatus": PLAY});
            console.log(PLAY);
            loadSettingsFromDisc().then(function () {
                console.log(state);
                startCycleWorker();
            });
        };

        this.pause = function () {
            chrome.browserAction.setIcon({path: "app/img/Pause-38.png"});
            chrome.storage.local.set({"playPauseStatus": PAUSE});
            console.log(PAUSE);
            stopCycleWorker();
        };
    };

    
    var tabRotate = new TabRotate(); 
    document.addEventListener('DOMContentLoaded', function() {
        console.log("DOM Loaded: Listening for commands...");
        chrome.storage.local.set({"playPauseStatus": PAUSE}, function() {
            if (chrome.runtime.lastError) {
                console.log(chrome.runtime.lastError.message);
            }
        });

        chrome.browserAction.onClicked.addListener(function() {
            chrome.storage.local.get("playPauseStatus", function(storage) {
                if (chrome.runtime.lastError) {
                    console.log(chrome.runtime.lastError.message);
                    return;
                }
                if (storage.playPauseStatus == PLAY) {
                    tabRotate.pause();
                } else {
                    tabRotate.play();
                }
            })
        });
    });

    console.log("background.js running");
})(jQuery);
