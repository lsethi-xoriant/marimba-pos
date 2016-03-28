(function(module){
    'use strict';

    function SessionService(Request, $rootScope, $state, $q) {
        function login(email, password) {
            var deferred = $q.defer();
            Request.post('/auth/', {email: email, password: password}).then(
                function(response){ // success
                    var data = response.data;
                    $rootScope.user = data;
                    // notify application user logged in
                    $rootScope.$broadcast("session:loggedIn", data);
                    // send to cashier shift state
                    if($rootScope.user.locations.length > 1) {
                        deferred.resolve(data);
                        $state.go('location');
                    } else if($rootScope.user.locations.length == 0) {
                        deferred.reject("User has no site associated!");
                    } else {
                        deferred.resolve(data);
                        $state.go('app.shift');
                    }
                },
                function(err){ // failure
                    deferred.reject(err.data.error);
                });
            return deferred.promise;
        }

        function setLocation(location) {
            $rootScope.location = location;
        }

        function getLocation() {
            return $rootScope.location;
        }

        function logout() {
            var deferred = $q.defer();
            Request.del('/auth').then(function(){
                $rootScope.user = null;
                $rootScope.$broadcast("session:loggedOut");
                $state.go('login');
                deferred.resolve();
            }, function(failure){
                deferred.reject(failure.data.error);
            });
        }

        function assureLogged() {
            if(!this.isLogged()) {
                $state.go('login');
            }
        }

        function isLogged() {
            return !!$rootScope.user;
        }

        function currentUser() {
            return $rootScope.user;
        }

        return {
            login: login,
            logout: logout,
            isLogged: isLogged,
            assureLogged: assureLogged,
            currentUser: currentUser,
            setLocation: setLocation,
            getLocation: getLocation
        }
    }

    module.factory('SessionService', ['Request', '$rootScope', '$state', '$q', SessionService]);

})(angular.module('pulltabs.pos'));
