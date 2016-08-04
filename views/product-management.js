'use strict';

(function (product) {

    function ProductManagementViewModel($scope, $http, rootUrl, debounce) {
        $scope.newProduct = {};
        $scope.status = {};        
                               
        $scope.canSubmit = function() {
            return $scope.productManagementForm.$dirty 
                && $scope.productManagementForm.$valid;
        };
        
        $scope.submit = function() {
            insertItem($scope.newProduct).then(function(res) {
                $scope.status = { type: 'success', messageKey: 'productedAddedSuccessful', show: true };
                $scope.newProduct = {};
            });
        };
        
        function insertItem(newProduct) {
            return $http({
                url: rootUrl + '/controller.php?controller=product&action=insert',
                method: 'POST',
                data: newProduct
            });
        }               
    }

    product.managementRoute = {
        name: 'product-management',
        url: '/product/management',
        views: {
            '@': {
                templateUrl: 'views/product-management.html',
                controller: ProductManagementViewModel
            }
        }
    }

})(maribelle.product || (maribelle.product = {}));