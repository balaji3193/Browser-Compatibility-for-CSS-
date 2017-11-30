/**
 * Created by vn94857 on 12/26/2016.
 */
'use strict';
angular
    .module('app.core',['ui.grid', 'ui.grid.expandable', 'ui.grid.pagination','ui.bootstrap', 'ui.grid.resizeColumns', 'ng-fusioncharts', 'xeditable', 'dndLists', 'angular-loading-bar', 'tableSort'])
    .constant("Modernizr", Modernizr)
    .controller('IndexController', function($scope, Modernizr, $http, $timeout, $parse, $filter, $uibModal) {

        //Array to get css parameters which does not support the browser
        $scope.cssErrors = [];
        $scope.disableValidate = true; //Disable validate button
        $scope.fileName = null;
        $scope.fileType = null;
        $scope.disableExcel = true;

        //Read the file and convert to string
        $scope.displayFileContents = function(contents) {
            if($scope.fileType == "text/css") {
                $scope.results = contents;
                $scope.disableValidate = false;
            }else{
                $scope.fileName = null;
                $scope.disableValidate = true;
                $scope.openModal();
            }
        };

        //Function to download as Excel
        $scope.exportToExcel=function(id, name) {
            var tab_text = '<html xmlns:x="urn:schemas-microsoft-com:office:excel">';
            tab_text = tab_text + '<head><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>';
            tab_text = tab_text + '<x:Name>Test Sheet</x:Name>';
            tab_text = tab_text + '<x:WorksheetOptions><x:Panes></x:Panes></x:WorksheetOptions></x:ExcelWorksheet>';
            tab_text = tab_text + '</x:ExcelWorksheets></x:ExcelWorkbook></xml></head><body>';
            tab_text = tab_text + "<table border='1px'>";
            var exportTable = $('#' + id).clone();
            exportTable.find('input').each(function (index, elem) { $(elem).remove(); });
            tab_text = tab_text + exportTable.html();
            tab_text = tab_text + '</table></body></html>';
            var fileName = name + '_' + parseInt(Math.random() * 10000000000) + '.xls';
            //Save the file
            var blob = new Blob([tab_text], { type: "application/vnd.ms-excel;charset=utf-8" });
            window.saveAs(blob, fileName);
        };

        //Function to find if property is supported
        function isPropertySupported(property)
        {
            return property in document.body.style;
        }

        //Function to split css string in to key value pair & check validity
        $scope.validateCSS = function() {
            var lines = $scope.results.split('\n');
            $scope.cssErrors = [];
            $scope.kvp = [];
            var block = false;
            lines.forEach(function (line, index) {
                block = (line.indexOf("}") !== -1) ? false : block;
                if(block) {
                    var pair = line.split(':');
                    if (pair.length === 2) {
                        var ptyHypen = pair[0].trim();
                        var pty = pair[0].trim().replace(/-([a-z])/g, function (g) { return g[1].toUpperCase(); });
                        var val = pair[1].split(';')[0].trim();
                        $scope.kvp.push({
                            key: pty,
                            value: val,
                            display: ptyHypen,
                            line: index + 1
                        });
                    }
                }
                block = (line.indexOf("{") !== -1) ? true : block;
            });
            if(typeof CSS !== "undefined"){
                $scope.keyValue = true;
                $scope.kvp.forEach(function (parameters, index) {
                    if (!CSS.supports(parameters.display,parameters.value)) {
                        $scope.cssErrors.push(parameters);
                    }
                });
            }else {
                $scope.keyValue = false;
                $scope.kvp.forEach(function (parameters, index) {
                    if (!isPropertySupported(parameters.key)) {
                        $scope.cssErrors.push(parameters);
                    }
                });
            }
            $scope.disableExcel = false;
        };
        $scope.openModal = function() {
            var modalInstance = $uibModal.open({
                animation: false,
                templateUrl: 'assets/html/myModalContent.html',
                controller: ModalInstanceCtrl
            });
            return modalInstance;
        };
        function ModalInstanceCtrl($scope, $uibModalInstance) {
            $scope.cancel = function () {
                $uibModalInstance.close();
            };
        }
    });
