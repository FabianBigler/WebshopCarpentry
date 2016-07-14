'use strict';

(function (product) {
    
    function OverviewViewModel($scope, $http, rootUrl) {
        $scope.products = [];
        
        loadAllProducts().then(function (products) {
            $scope.products = products;
        });
        
        function loadAllProducts() {
            return $http({
                url: rootUrl + '/controller.php?controller=product&action=getAll',
                method: 'GET',
                params: null,
            })
            .then(maribelle.mapData);
        }
    }

    product.overviewRoute = {
        name: 'overview',
        url: '/product/home',
        views: {
            '@': {
                templateUrl: 'views/product-overview.html',
                controller: OverviewViewModel
            }
        }
    }

})(maribelle.product || (maribelle.product = {}));