/**
 * Created by calvarezg on 5/30/17.
 */
(function () {
    'use strict';

    angular.module('d3GraphCreator', ['d3'])
        .factory('d3GraphCreator', ['$document', '$q', '$rootScope',
            function($document, $q, $rootScope) {
                var d = $q.defer();
                function onScriptLoad() {
                    // Load client in the browser
                    $rootScope.$apply(function() { d.resolve(window.d3GraphCreator); });
                }
                // Create a script tag with d3 as the source
                // and call our onScriptLoad callback when it
                // has been loaded
                var scriptTag = $document[0].createElement('script');
                scriptTag.type = 'text/javascript';
                scriptTag.async = true;
                scriptTag.src = 'libs/graph-creator.js';
                scriptTag.onreadystatechange = function () {
                    if (this.readyState == 'complete') onScriptLoad();
                }
                scriptTag.onload = onScriptLoad;

                var s = $document[0].getElementsByTagName('body')[0];
                s.appendChild(scriptTag);

                return {
                    d3GraphCreator: function() { return d.promise; }
                };
            }]);
})();