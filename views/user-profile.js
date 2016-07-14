'use strict';

(function (user) {

    function ProfileViewModel($scope, $http, rootUrl, userService) {
        $scope.user = userService.currentUser();
        $scope.summaryEntries = [];
        
        getBasketSummaryEntries().then(function(entries) {
            $scope.summaryEntries = entries;
            $scope.summaryEntries.forEach(function(e) { 
                e.orderDate = new Date(e.orderDate);
            });
        });
        
        function getBasketSummaryEntries() {
            return $http({
                url: rootUrl + '/controller.php?controller=user&action=getBasketSummaryEntries',
                method: 'GET'
            })
            .then(maribelle.mapData);
        }
    }

    user.profileRoute = {
        name: 'user-profile',
        url: '/user/profile',
        views: {
            '@': {
                templateUrl: 'views/user-profile.html',
                controller: ProfileViewModel
            }
        }
    }

})(maribelle.user || (maribelle.user = {}));