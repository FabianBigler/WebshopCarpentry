'use strict';

var maribelle;
(function (maribelle) {
    
    function AppViewModel($scope, $state, $translate, $http, $cookies, rootUrl, userService) {
        var self = this;

        $scope.$watchCollection(
            function() { return userService.currentUser(); },
            function(user) { 
                self.userName = user.givenname + ' ' + user.surname;
                self.userAuthenticated = userService.isAuthenticated();
            }
        );
        
        self.logout = function() {
            userService.logout();
        }
        
        self.changeLang = function (langCode, reloadPage) {
            if (reloadPage == void(0)) reloadPage = true;
            $translate.use(langCode);
            self.currentLang = langCode;
            setCurrentLangToCookie(langCode);
            
            if (reloadPage === true) {
                $state.reload();
            }
        };
       
        setDefaultLang();
        getAllLanguages().then(function(languages) { self.languages = languages; });
        
        function setCurrentLangToCookie(currentLang) {
            $cookies.put('currentLang', currentLang);
        }
        
        function setDefaultLang() {
            var langByCookie = $cookies.get('currentLang');
            var langByClient = $translate.use();
            self.changeLang(langByCookie || langByClient, false);
        }
        
        function getAllLanguages() {
            return $http({
                url: rootUrl + '/controller.php?controller=user&action=languages',
                method: 'GET'
            })
            .then(maribelle.mapData);
        }
    }
    
    function UserServiceFactory($http, $state, rootUrl) {
        var user = {};
        var userInitialized = false;
        var userInitializationInProgress = false;

        return {
            currentUser: function() {
                if (!userInitialized) {
                    initializeUser();
                }

                return user;
            },
            
            isAuthenticated: function() {
                if (!userInitialized) {
                    initializeUser();
                }
                
                return user.hasOwnProperty("id");
            },
            
            login: function(credentials) {
                return loginUser(credentials).then(function (isSuccessful) {
                    if (isSuccessful === true) {
                        userInitializationInProgress = false;
                        initializeUser();
                    }

                    return isSuccessful;
                });
            },
            
            logout: function(credentials) {
                return logoutUser().then(function () {
                    user = {};
                    userInitialized = false;
        
                    $state.go(maribelle.product.overviewRoute, { reload: true });
                });
            }
        };
        
        function initializeUser() {
            if (!userInitializationInProgress) {
                userInitializationInProgress = true;
                
                getCurrentUser().then(function(result) {
                    if (result) {
                        angular.extend(user, result);
                    }
                    
                    userInitialized = true;
                    userInitializationInProgress = false;
                });
            }
        }
        
        function getCurrentUser() {
            return $http({
                url: rootUrl + '/controller.php?controller=user&action=getCurrent',
                method: 'GET'
            })
            .then(maribelle.mapData)
        }
        
        function loginUser(credentials) {
            return $http({
                url: rootUrl + '/controller.php?controller=user&action=login',
                method: 'POST',
                data: credentials,
            })
            .then(maribelle.mapData);
        }
        
        function logoutUser(credentials) {
            return $http({
                url: rootUrl + '/controller.php?controller=user&action=logout',
                method: 'POST'
            });
        }
    }
    
    function DebounceFactory($timeout) {
        return function(callback, interval) {
            var timeout = null;
            return function() {
                var args = arguments;
                $timeout.cancel(timeout);
                timeout = $timeout(
                    function () { callback.apply(this, args); }, 
                    interval
                );
            };
        }; 
    }
    
    angular.module('maribelle', ['maribelle.routing', 'maribelle.translations', 'ui.bootstrap', 'ngAnimate', 'ngCookies'])
        .constant("rootUrl", "")
        .controller('AppViewModel', AppViewModel)
        .service('userService', UserServiceFactory)
        .factory('debounce', DebounceFactory)
        .run(function($rootScope, $rootElement, rootUrl) {
            $rootScope.$ignore = function() { return false };
            $rootScope.$today = moment().startOf('day').toDate();
            $rootScope.$tomorrow = moment().add(1, 'day').startOf('day').toDate();
            $rootScope.$yesterday = moment().add(-1, 'day').startOf('day').toDate();
            $rootScope.rootUrl = rootUrl;
        });

    maribelle.mapData = function (promise) {
        return promise.data;  
    };

})(maribelle || (maribelle = {}));