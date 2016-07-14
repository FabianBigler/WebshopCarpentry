'use strict';

(function (user) {

    function LoginViewModel($scope, userService) {
        $scope.credentials = {};
        $scope.status = {};
        
        $scope.canSubmit = function() {
            return $scope.loginForm.$dirty 
                && $scope.loginForm.$valid;
        };
        
        $scope.submit = function() {
            userService.login($scope.credentials).then(function(isSuccessful) {
                if (isSuccessful === true) {
                    $scope.status = { type: 'success', messageKey: 'loginSuccessful', show: true };
                    $scope.credentials = {};
                }
                else {
                    $scope.status = { type: 'danger', messageKey: 'loginFailed', show: true };
                }
            });
        };
    }

    user.loginRoute = {
        name: 'user-login',
        url: '/user/login',
        views: {
            '@': {
                templateUrl: 'views/login.html',
                controller: LoginViewModel
            }
        }
    }

})(maribelle.user || (maribelle.user = {}));