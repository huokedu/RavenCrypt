'use strict';

app.controller('RegisterSignUpCtrl', function ($scope, $window, $location, $state, $stateParams, $ydnDB) {
    $scope.userName = $stateParams.userName;
    $scope.server = $stateParams.server;
    $scope.keyHasPassword = $stateParams.keyHasPassword;

    $scope.privateKeyArmored = $.trim($stateParams.privateKeyArmored);
    $scope.publicKeyArmored = $.trim($stateParams.publicKeyArmored);

    $scope.showError = false;

    $scope.error = "";
    $scope.showError = false;

    try{
        var rcKeyPair = RavenCryptAsymmetricKeyPair.createNew({
            privateKeyArmored: $scope.privateKeyArmored,
            publicKeyArmored: $scope.publicKeyArmored
        });
        $scope.error = "NO_PGP_KEY";
        $scope.keyID = rcKeyPair.keyID;
    } catch (err) {
        $scope.showError = true;
    }

    $scope.register = function () {
        var requestUrl = "https://" + $scope.server + "/register";

        $scope.showError = false;
        $scope.showPending = true;

        $.ajax({
            type: 'POST',
            url: requestUrl,
            data: JSON.stringify({
                user: $scope.userName,
                publicKey: $scope.publicKeyArmored,
                keyID: $scope.keyID
            }),
            success: function (data) {
                $scope.showPending = false;

                $state.transitionTo("register.confirm", {
                    server: $scope.server,
                    userName: $scope.userName,
                    privateKeyArmored: $scope.privateKeyArmored,
                    publicKeyArmored: $scope.publicKeyArmored,
                    confirmCodeImage: data
                });
            },
            error: function(jqXHR){
                $scope.showPending = false;
                $scope.showError = true;
                switch(jqXHR.status){
                    case 500:
                        // Server side error
                        $scope.error = 'SERVER_ERROR';
                        break;
                    case 503:
                        // Server overload - try again
                        $scope.error = 'SERVER_OVERLOAD';
                        break;
                    case 400:
                        //something went wrong
                        $scope.error = jqXHR.responseText;
                        break;
                    default:
                        //everything else
                        $scope.error = 'SERVER_UNABLE_TO_GET_DATA';
                }
                $scope.$apply();
            }
        });
    }
});
