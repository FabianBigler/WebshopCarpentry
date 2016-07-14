'use strict';

(function (routing) {

    angular.module('maribelle.routing', ['ui.router'])
        .config(function($stateProvider, $urlRouterProvider, $uiViewScrollProvider) {
            $uiViewScrollProvider.useAnchorScroll();
            
            $urlRouterProvider.otherwise(maribelle.product.overviewRoute.url);
            $stateProvider
                .state(maribelle.product.overviewRoute)
                .state(maribelle.product.detailRoute)
                .state(maribelle.user.registerRoute)
                .state(maribelle.user.loginRoute)
                .state(maribelle.user.profileRoute)
                .state(maribelle.basket.basketRoute);
        });

})(maribelle.routing || (maribelle.routing = {}));