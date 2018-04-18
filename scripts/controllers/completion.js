(function() {
    'use strict';

    OSC.controller('CompletionCtrl', CompletionCtrl);

    CompletionCtrl.$inject = ['$http', '$rootScope', '$state', '$stateParams', 'selectionService'];

    function CompletionCtrl($http, $rootScope, $state, $stateParams, selectionService) {
        var vm = this;
        vm.viewPolicyPdf = viewPolicyPdf; 
        window.scrollTo(0, 0);

        onLoad();

        function onLoad() {
            if (!$stateParams.outputData) {
                $state.go("/selection");
            } else {

                vm.inputData = $stateParams.outputData;
                vm.diff = $stateParams.outputData.inputData;
                //if selectedFamily
                if(vm.diff.selectedOption!=undefined){
                    vm.showSelectedOption = true;
                }else{  
                    vm.showSelectedOption = false;
                }

                //if family selection 
                 if (vm.diff.familySelection == 'myself') {
                    vm.family= false;
                 }else{
                    vm.family= true;
                 }

                 //if Gaurdian
                 if(vm.inputData.guardian.firstName==undefined){
                    vm.guardian = false;
                 }else{
                    vm.guardian = true;
                 }

            }

        }
        function viewPolicyPdf(){
            window.open('osc/pdf/PolicyWordings.pdf', '_blank');
        }
    }
})();
