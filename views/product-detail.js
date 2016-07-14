'use strict';

(function (product) {

    function DetailViewModel($scope, $http, $stateParams, rootUrl) {
        $scope.product = {};
        $scope.amount = 1;
        $scope.status = {};
        
        getProduct($stateParams.id).then(function (product) {
            $scope.product = product;
        });
        
        $scope.canAddLineToBasket = function() {
            return ($scope.amount > 0);
        };
        
        $scope.addLineToBasket = function() {
            addLineToBasket($scope.product.id, $scope.amount).then(function(res) {
                $scope.status = { type: 'success', messageKey: 'addedItemToBasket', show: true };
                $scope.amount = 1;
            });
        };
                
        function getProduct(id) {
            return $http({
                url: rootUrl + '/controller.php?controller=product&action=get',
                method: 'GET',
                params: { productId: id }
            })
            .then(maribelle.mapData);
        }
        
        function addLineToBasket(id, amount) {
            return $http({
                url: rootUrl + '/controller.php?controller=basket&action=addLineToBasket',
                method: 'POST',
                data: { productId: id, amount: amount }
            });
        }
    }

    product.detailRoute = {
        name: 'product-detail',
        url: '/product/:id/detail',
        views: {
            '@': {
                templateUrl: 'views/product-detail.html',
                controller: DetailViewModel
            }
        }
    }

})(maribelle.product || (maribelle.product = {}));