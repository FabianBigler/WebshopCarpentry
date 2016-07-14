'use strict';

(function (user) {

    function RegisterViewModel($scope, $http, rootUrl, debounce) {
        $scope.newUser = {};
        $scope.status = {};
        $scope.emailAlreadyExists = false;
        
        $scope.$watch(
            function() { return $scope.newUser.email; },
            debounce(function(email) {
                if (email) { 
                    existsUser(email)
                        .then(function(exists) { $scope.emailAlreadyExists = exists; });
                }
            }, 1000)
        );
        
        $scope.passwordsMatch = function() {
            return $scope.newUser.password
                && $scope.newUser.password === $scope.newUser.passwordConfirm;
        }
        
        $scope.canSubmit = function() {
            return $scope.registerForm.$dirty 
                && $scope.registerForm.$valid
                && $scope.passwordsMatch();
        };
        
        $scope.submit = function() {
            registerUser($scope.newUser).then(function(res) {
                $scope.status = { type: 'success', messageKey: 'registrationSuccessful', show: true };
                $scope.newUser = {};
            });
        };
        
        function registerUser(newUser) {
            return $http({
                url: rootUrl + '/controller.php?controller=user&action=register',
                method: 'POST',
                data: newUser
            });
        }
        
        function existsUser(email) {
            return $http({
                url: rootUrl + '/controller.php?controller=user&action=existsUser',
                method: 'GET',
                params: { email: email }
            })
            .then(maribelle.mapData);
        }
    }

    user.registerRoute = {
        name: 'user-register',
        url: '/user/register',
        views: {
            '@': {
                templateUrl: 'views/register.html',
                controller: RegisterViewModel
            }
        }
    }

})(maribelle.user || (maribelle.user = {}));