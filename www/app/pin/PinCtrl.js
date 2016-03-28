(function(){
    'use strict';

    function PinCtrl($scope, $rootScope, $interval, PinService, $ionicPopup, $ionicModal) {
        $scope.cancel       = cancelPin;
        $scope.cashout      = cashoutPin;
        $scope.updatePins   = updatePins;
        $scope.showNewPinModal = showNewPinModal;
        $scope.confirmNewPin = confirmNewPin;

        function cancelPin(number) {
            console.log("Canceling pin: ", number);
            $ionicPopup.confirm({
                title: 'Delete PIN',
                template: 'Proceed removing "'+number+'"?'
            }).then(function(confirm){
                if(confirm) {
                    PinService.deletePin(number).then(
                    function(pin){
                        updatePins();
                        $ionicPopup.alert({
                            title: 'Delete PIN',
                            template: 'PIN deleted successfully!'
                        });
                    }, function(msg){
                        $ionicPopup.alert({
                            title: 'Delete PIN',
                            template: msg
                        });
                    });
                }
            });
        }

        function cashoutPin(number) {
            console.log("Cashout Pin: ", number);
            PinService.getPin(number).then(function(pin) {
                if(pin.status != 'active') {
                    $ionicPopup.alert({
                        title: "Error",
                        template:"Impossible withdraw from non-active PIN!"
                    });

                    return false;
                }

                $ionicPopup.confirm({
                    title: 'Force Cashout',
                    template: 'Force "'+number+'" cashout?'
                }).then(function(confirm){
                    if(confirm) {
                        PinService.forceCashOut(number).then(
                        function(){
                            updatePins();
                        }, function(msg){
                            $ionicPopup.alert({
                                title: 'Cashout PIN',
                                template: msg
                            });
                        });
                    }
                }); // end popup confirm
            }); // end pin service get pin
       }

        function updatePins() {
            PinService.getPins().then(
                function(data) {
                    if(data) {
                        $scope.pins = data;
                        var pinCount = $scope.pins.filter(function(e){return e.status == 'new'}).length;
                        $rootScope.pinCount = pinCount;
                        console.log("Pin Count: " + $rootScope.pinCount);
                    }
                },
                function() {
                    $scope.pins = null;
                }
            );
        }

        function showNewPinModal() {
            $scope.modalData = {};
            $scope.modal.show();
        }

        function confirmNewPin(data) {
            if(data) {
                PinService.createPin(data.credits);
            }
            $scope.modal.hide();
        }

        function startWatch() {
            if(!$scope.watcher) {
                $scope.watcher = $interval(30000, updatePins);
            }
        }

        function stopWatch() {
            if($scope.watcher) {
                $interval.cancel($scope.watcher);
                delete $scope.watcher;
            }
        }

        function initialize() {
            $ionicModal.fromTemplateUrl('app/pin/modals/create.html', {
                scope: $scope,
                animation: 'slide-in-up'
            }).then(function(modal){
                $scope.modal = modal;
            });

            updatePins();

            $rootScope.$on("session:loggedIn", startWatch);
            $rootScope.$on("session:loggedOut", stopWatch);
            $rootScope.$on("pin:newPin", updatePins);
            $scope.$on("$destroy", stopWatch);

        }

        initialize();

    }

    angular.module('pulltabs.pos').controller('PinCtrl', ['$scope', '$rootScope', '$interval', 'PinService', '$ionicPopup', '$ionicModal', PinCtrl]);
})();
