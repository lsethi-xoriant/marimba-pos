(function(module){
    'use strict';

    function Request($http) {
        var baseURL = 'http://localhost:8000/api/pos';

        function get(uri) {
            return $http.get(baseURL+uri, {accepts: 'application/json'});
        }

        function post(uri, data) {
            return $http.post(baseURL+uri, data, {contentType: 'application/json'});
        }

        function del(uri) {
            return $http.delete(baseURL+uri);
        }

        function put(uri) {
            return $http.put(baseURL+uri, data, {contentType: 'application/json'});
        }

        return {
            get: get,
            post: post,
            del: del,
            put: put
        }
    }

    module.service('Request', ['$http', Request]);
})(angular.module('pulltabs.pos'));
