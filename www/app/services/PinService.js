(function(){
    function PinService(Request, SessionService, $q, $rootScope) {
        return {
            getPin: function(number) {
                var deferred = $q.defer();
                Request.get('/pin/'+number).then(
                    function(data) {
                        deferred.resolve(data);
                    },
                    function(failure) {
                        deferred.reject(failure.data.error);
                    }
                );
                return deferred.promise;
            },
            getPins: function() {
                var deferred = $q.defer();
                Request.get('/pin/location/'+SessionService.getLocation().id).then(
                    function(data) {
                        deferred.resolve(data)
                    },
                    function(failure) {
                        deferred.reject(failure.data.error);
                    }
                )
                return deferred.promise;
            },
            deletePin: function(number) {
                var deferred = $q.defer();
                Request.del('/pin/'+number).then(
                    function(data) {
                        deferred.resolve(data.message);
                    },
                    function(failure) {
                        deferred.reject(failure.data.error);
                    }
                );
                return deferred.promise;
            },
            createPin: function(value) {
                var deferred = $q.defer();
                var pinData = {
                    credits: value*100,
                    location: SessionService.getLocation().id
                };
                Request.post('/pin', pinData).then(
                    function(data) {
                        deferred.resolve(data);
                        $rootScope.$broadcast("pin:newPin");
                    },
                    function(failure) {
                        deferred.reject(failure.data.error);
                    }
                );
                return deferred.promise;
            },
            forceCashOut: function(number) {
                var pin = this._findPin(number),
                    deferred = $q.defer();
                if(pin && pin.status == "active") {
                    pin.status = "cashout";
                    $rootScope.$broadcast("pin:forcedCashout", pin);
                    deferred.resolve(pin);
                } else {
                    deferred.reject("Cannot force cashout for non-active PINs!");
                }
                return deferred.promise;
            },
            cashOutPin: function(number) {
                var pin = this._findPin(number),
                    deferred = $q.defer();
                if(pin && pin.status == "cashout") {
                    pin.status = "redeemed";
                    deferred.resolve(pin);
                } else {
                    deferred.reject("Cannot confirm cashout for new, active or redeemed PINs!");
                }

                return deferred.promise;
            }
        }
    }

    angular.module('pulltabs.pos').factory('PinService', ['Request', 'SessionService', '$q', '$rootScope', PinService]);
})();
