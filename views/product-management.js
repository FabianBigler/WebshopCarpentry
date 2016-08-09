'use strict';

(function (product) {

    function ProductManagementViewModel($scope, $http, rootUrl, debounce) {
        $scope.newProduct = {};
        $scope.status = {};        
        $scope.myImage='';
        $scope.myCroppedImage='';

                               
        $scope.canSubmit = function() {
            return $scope.productManagementForm.$dirty 
                && $scope.productManagementForm.$valid;
        };
        
        $scope.submit = function() {
            $scope.newProduct.imageData = $scope.myCroppedImage;
            insertItem($scope.newProduct).then(function(res) {                
                $scope.status = { type: 'success', messageKey: 'productedAddedSuccessful', show: true };
                $scope.newProduct = {};
                $scope.myCroppedImage = '';
            });
        };
        
        function insertItem(newProduct) {
            return $http({
                url: rootUrl + '/controller.php?controller=product&action=insert',
                method: 'POST',
                data: newProduct
            });
        }       

        var handleFileSelect=function(evt) {
        var file=evt.currentTarget.files[0];
        var reader = new FileReader();
        reader.onload = function (evt) {
            $scope.$apply(function($scope){
            $scope.myImage=evt.target.result;
            });
        };
        reader.readAsDataURL(file);
        };        

        angular.element(document.querySelector('#fileInput')).on('change',handleFileSelect);
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