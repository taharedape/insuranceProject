'use strict';



(function() {
    'use strict';

    OSC.controller('selectionDetailsCtrl', selectionDetailsCtrl);

    selectionDetailsCtrl.$inject = ['$http', '$rootScope', '$state', '$stateParams', 'selectionService', 'server', 'api'];

    function selectionDetailsCtrl($http, $rootScope, $state, $stateParams, selectionService, server, api) {
        var vm = this;
        vm.policy = {};
        vm.customer = {};
        vm.sponsor = {};
        vm.guardian = {};
        vm.familyMembers = [];

        vm.makePayment = makePayment;
        vm.viewPolicyPdf = viewPolicyPdf;
        vm.viewTermsPdf = viewTermsPdf;
        vm.viewOfferTermsPdf = viewOfferTermsPdf;
        vm.addNewPerson = addNewPerson;
        vm.removePerson = removePerson;
        vm.copySameValue = copySameValue;
        vm.checkAge = checkAge;
        vm.getAddressByPostal = getAddressByPostal;
        vm.getAgentInfo = getAgentInfo;
        vm.nricChecker = nricChecker;
        vm.familyAgeChecker = familyAgeChecker;
        vm.getYears = getYears;

        vm.familyErrFlag = true;
        window.scrollTo(0, 0);

        onLoad();
        // getYears();

        function onLoad() {
            if (!$stateParams.inputData) {
                $state.go("/selection");
            } else {
                vm.inputData = $stateParams.inputData;

                vm.studyInterruption = vm.inputData.studyInterruption;
                var diff = vm.inputData.dEnd.getTime() - vm.inputData.dStart.getTime();
                var yearDate = new Date(diff);
                vm.yearDiff = Math.abs(yearDate.getUTCFullYear() - 1970);
                if (vm.yearDiff > 1) {
                    vm.duration = vm.yearDiff + ' years';

                } else {

                    vm.duration = vm.yearDiff + ' year';
                }

                //if less than a year
                if (vm.yearDiff < 1) {
                    // var month= (vm.inputData.dEnd.getFullYear() - vm.inputData.dStart.getFullYear()) * 12;
                    var monthDiff = vm.inputData.dEnd - vm.inputData.dStart;
                    vm.monthDiff = (monthDiff % 31536000000) / 2628000000 | 0;
                    if (vm.monthDiff > 1) {
                        vm.duration = vm.monthDiff + ' months';

                    } else {

                        vm.duration = vm.monthDiff + ' month';
                    }

                    //if less than a month
                    if (vm.monthDiff < 1) {
                        vm.dayDiff = Math.round(vm.inputData.dEnd - vm.inputData.dStart) / (1000 * 60 * 60 * 24)
                        if (vm.dayDiff > 1) {
                            vm.duration = vm.dayDiff + ' days';

                        } else {

                            vm.duration = vm.dayDiff + ' day';
                        }
                    }

                } else {
                    //if the year is more than 1 
                    var diff_date = vm.inputData.dEnd - vm.inputData.dStart;
                    var num_years = diff_date / 31536000000 | 0;
                    var num_months = (diff_date % 31536000000) / 2628000000 | 0;
                    var num_days = ((diff_date % 31536000000) % 2628000000) / 86400000 | 0;
                    if (num_months == 0) {
                        if (num_years > 1) {

                            vm.duration = num_years + ' years';
                        } else {
                            vm.duration = num_years + ' year';

                        }
                    } else {
                        var yearText;
                        var monthText;
                        if (num_years == 1) {
                            yearText = ' year'
                        } else {
                            yearText = ' years'
                        }
                        if (num_months == 1) {
                            monthText = 'month'
                        } else {
                            monthText = 'months'
                        }
                        vm.duration = num_years + yearText;
                        vm.duration += ' and ' + num_months + ' ' + monthText;
                    }

                }
//              IN-3056 - Month in JS will start from 0; adding one to show the original month
                vm.startDate = vm.inputData.dStart.getDate() + "/" + (vm.inputData.dStart.getMonth()+1) + "/" + vm.inputData.dStart.getFullYear();
                vm.endDate = vm.inputData.dEnd.getDate() + "/" + (vm.inputData.dEnd.getMonth()+1) + "/" + vm.inputData.dEnd.getFullYear();
                
                //checking if the user selected I or my family and I
                if (vm.inputData.familySelection == 'myself') {
                    vm.familyErrAdditionalFlag = false;
                    vm.familyErrFlag = false;

                } else {
                    vm.familyErrAdditionalFlag = true;
                    vm.familyErrFlag = true;

                }

                // titles
                selectionService.getTitle().then(function(response) {
                    vm.titles = response.data;
                });

                // Nationalities
                selectionService.getNationalities().then(function(response) {
                    vm.listOfNationalities = response.data;
                    vm.nationalities =vm.listOfNationalities.nationalityList;
                    
                });
                // Countries
                selectionService.getCountries().then(function(response) {
                    vm.countries = response.data;
                });
                // Relationship
                selectionService.getRelations().then(function(response) {
                    vm.relations = response.data;
                    var familyMember = {};
                    vm.familyMembers.push(familyMember);
                });
                // Sponsor Relationship
                selectionService.getSponsorRelations().then(function(response) {
                    vm.sponsorRelations = response.data;
                });
                // CountryCode
                selectionService.getCountryCode().then(function(response) {
                    vm.countryCode = response.data;
                });

                // Day
                selectionService.getDays().then(function(response) {
                    vm.days = response.data;
                });

                // Month
                selectionService.getMonths().then(function(response) {
                    vm.months = response.data;
                });

                // Year
                selectionService.getYears().then(function(response) {
                    vm.years = response.data;
                });
                // Year for additional persons
                // selectionService.getAdditionalYears().then(function(response) {
                //     vm.additionalYears = response.data;
                // });
                
            }
            
            vm.policy.agentCode = agentId; 
            vm.policy.agentName = agentName;
        }
        //Year selection 
        var range = 75;
        var offset = 0;
        getYears(offset, range);

        //Year selection if sponsor  
        var range = 125;
        var offset = 0;
        getYears(offset, range);

        function getYears(offset, range) {
            var currentYear = new Date().getFullYear();
            var years = [];
            if (range == 75) {

                for (var i = 0; i < range + 1; i++) {
                    years.push(currentYear + offset - i);
                }
                vm.year = years;
            }else{
                    for (var i = 0; i < range + 1; i++) {
                    years.push(currentYear + offset - i);
                }
                vm.yearSponsor = years;
            }
        }

        //family age checker
        function familyAgeChecker(e) {
            //today's date
            var today = new Date();
            var months = (today.getFullYear() - e.year) * 12;
            vm.familyMonthDiff = (months + today.getMonth() + 1 - e.month) / (100 * 60 * 60 * 24);
            if (e.selectedRelationShip != undefined && e.selectedRelationShip.RELATION_DESC == 'Child') {
                if (((today.getFullYear() - e.year > 18) || (today.getFullYear() - e.year == 17 && e.month < today
                        .getMonth() + 1) || (today.getFullYear() - e.year == 17 && e.month == today.getMonth() + 1 && e.day >= today
                        .getDate()))) {
                    e.familyAgeErrMsg = 'Your child must be below 18';
                    vm.familyErrFlag = true;
                } else if ((today.getFullYear() - e.year < 1) && (today.getMonth() + 1 - e.month < 6 || (today.getMonth() + 1 - e.month == 6 && today.getDate() < e.day))) {
                    e.familyAgeErrMsg = 'Your child must be above 6 months old';
                    vm.familyErrFlag = true;
                } else {
                    e.familyAgeErrMsg = '';
                    vm.familyErrFlag = false;
                }
            } else {
                e.familyAgeErrMsg = '';
                vm.familyErrFlag = false;
            }

            //checking if the user has selected more than 1 spouse or 3 children
            var array1 = [];
            var array2 = [];
            angular.forEach(vm.familyMembers, function(e) {
                if (e.selectedRelationShip != undefined) {

                    if (e.selectedRelationShip.RELATION_DESC == 'Spouse') {
                        array1.push(1);
                    } else if (e.selectedRelationShip.RELATION_DESC == 'Child') {
                        array2.push(1);
                    }

                    if (array1.length > 1 || array2.length > 3) {
                        e.additionalPersonErr = "Select 1 spouse and max of 3 children only";
                        vm.familyErrAdditionalFlag = true;
                    } else {
                        e.additionalPersonErr = "";
                        vm.familyErrAdditionalFlag = false;

                    }
                }
            });

        }

        //Customer age checker
        function checkAge() {
            var today = new Date();
            if ((today.getFullYear() - vm.customer.year > 44) || (today.getFullYear() - vm.customer.year == 44 && vm.customer.month > today
                    .getMonth() + 1) || (today.getFullYear() - vm.customer.year == 44 && vm.customer.month == today.getMonth() + 1 && vm.customer.day >= today
                    .getDate())) {
                vm.yearErrMsg = "Your age cannot be above 45";
                vm.lessThan18 = false;
                vm.lessThan15 = "";
                vm.guardian = {};
            } else if ((today.getFullYear() - vm.customer.year < 18 && today.getFullYear() - vm.customer.year > 15) || (today.getFullYear() - vm.customer.year == 18 && vm.customer.month > today
                    .getMonth() + 1) || (today.getFullYear() - vm.customer.year == 15 && vm.customer.month < today
                    .getMonth() + 1) || (today.getFullYear() - vm.customer.year == 18 && vm.customer.month == today.getMonth() + 1 && vm.customer.day >= today
                    .getDate()) || (today.getFullYear() - vm.customer.year == 15 && vm.customer.month == today.getMonth() + 1 && vm.customer.day <= today
                    .getDate())) {
                if (vm.inputData.familySelection == 'family') {
                    vm.lessThan18Text = "Your age cannot be below 18";
                } else {

                    vm.lessThan18 = true;
                    vm.lessThan15 = "";
                    vm.yearErrMsg = "";
                }

            } else if ((today.getFullYear() - vm.customer.year < 15) || (today.getFullYear() - vm.customer.year == 15 && vm.customer.month > today.getMonth() + 1) || (today.getFullYear() - vm.customer.year == 15 && vm.customer.month == today.getMonth() + 1 && vm.customer.day >= today.getDate())) {
                if (vm.inputData.familySelection == 'family') {
                    vm.lessThan18Text = "Your age cannot be below 18";
                } else {
                    vm.lessThan18 = false;
                    vm.lessThan15 = "Your age cannot be below 15";
                    vm.yearErrMsg = "";
                    vm.guardian = {};
                }

            } else {
                vm.yearErrMsg = "";
                vm.lessThan18 = false;
                vm.lessThan15 = "";
                vm.lessThan18Text = "";
                vm.guardian = {};


            }
        }

        function nricChecker(a) {
            if (vm.familyMembers.nric != '') {
                angular.forEach(vm.familyMembers, function(a) {
                    return a;
                });
            }
            if (a.nric != undefined) {


                var length = a.nric.length;
                var charBetween = a.nric.substring(1, 8);
                var b = charBetween.match(/[a-zA-Z]/i);
                var val1 = parseInt(a.nric.charAt(0));
                var val9 = parseInt(a.nric.charAt(8));

                if (!isNaN(val1) || !isNaN(val9) || b != null || length < 9) {
                    a.ErrNric = "Wrong Nric format";
                    vm.ErrNricFlag = true;
                } else {
                    a.ErrNric = "";
                    vm.ErrNricFlag = false;
                }
            }

        }

        function makePayment() {
            vm.loadingPayment = true;
            var customerDTO={};
            vm.today = new Date();
            
            if (vm.customer.day && vm.customer.month && vm.customer.year) {
                vm.customer.dob = new Date(vm.customer.year, vm.customer.month-1, vm.customer.day);
            }
            if (vm.customer.selectedTitle) {
                vm.customer.title = vm.customer.selectedTitle.TITLE_DESC;
            }
            if (vm.customer.selectedNationality) {
                vm.customer.nationality = vm.customer.selectedNationality.nationalityDesc;
            }
            if (vm.customer.selectedCountryCode) {
                vm.customer.countryCode = vm.customer.selectedCountryCode.CountryCode
            }  
            if (vm.optional) {
                vm.customer.pdpa = 'Y'
            }  else {
                vm.customer.pdpa = 'N'
            }
            
            
            var customerDTO = {
                   "title": vm.customer.title,
                   "firstName": vm.customer.firstName,
                   "lastName": vm.customer.lastName,
                   "nric": vm.customer.nric,
                   "dob": vm.customer.dob,
                   "nationality": vm.customer.nationality,
                   "mobile": vm.customer.countryCode + vm.customer.mobile,
                   "email": vm.customer.email,
                   "postCode": vm.customer.postalCode,
                   "address1": vm.customer.address1,
                   "address2": vm.customer.address2,
                   "address3": vm.customer.address3,
                   "floorAndUnit": vm.customer.floor + "-" + vm.customer.unit,
                   "pdpa": vm.customer.pdpa,
                   "duration" : vm.duration
             };

            if (vm.sponsor.selectedTitle) {
                vm.sponsor.title = vm.sponsor.selectedTitle.TITLE_DESC;
            }
            if (vm.sponsor.selectedRelationship) {
                vm.sponsor.relationship = vm.sponsor.selectedRelationship.RELATION_DESC;             
            }
            if (vm.sponsor.day && vm.sponsor.month && vm.sponsor.year) {
                vm.sponsor.dob = new Date(vm.sponsor.year, vm.sponsor.month-1, vm.sponsor.day);             
            }            
            if((vm.sponsor.title!=null && vm.sponsor.title!=undefined) || (vm.sponsor.nric!=null && vm.sponsor.nric!=undefined)
                    || (vm.sponsor.dob!=null && vm.sponsor.dob!=undefined) || (vm.sponsor.relationShip!=null && vm.sponsor.relationShip!=undefined)){
                
                customerDTO.sponsor = {
                      "sponsorTitle": vm.sponsor.title,
                      "sponsorFirstName" : vm.sponsor.firstName,
                      "sponsorLastName" : vm.sponsor.lastName,
                      "sponsorName": vm.sponsor.firstName + " " + vm.sponsor.lastName,
                      "sponsorNRIC": vm.sponsor.nric,
                      "sponsorDOB": vm.sponsor.dob,
                      "sponsorRelationship": vm.sponsor.relationship
                };
            }
            

            if (vm.guardian.selectedTitle) {
                vm.guardian.title = vm.guardian.selectedTitle.TITLE_DESC;
            }
            if((vm.guardian.title!=null && vm.guardian.title!=undefined) || (vm.guardian.firstName!=null && vm.guardian.firstName!=undefined)
                    || (vm.guardian.lastName!=null && vm.guardian.lastName!=undefined) || (vm.guardian.nric!=null && vm.guardian.nric!=undefined)
                    || (vm.guardian.address1!=null && vm.guardian.address1!=undefined) || (vm.guardian.address2!=null && vm.guardian.address2!=undefined)
                    || (vm.guardian.address3!=null && vm.guardian.address3!=undefined) || (vm.guardian.postalCode!=null && vm.guardian.postalCode!=undefined)
                    || (vm.guardian.floorUnit!=null && vm.guardian.floorUnit!=undefined)){
                
                customerDTO.guardian = {
                       "guardianTitle": vm.guardian.title,
                       "guardianFirstName": vm.guardian.firstName,
                       "guardianLastName": vm.guardian.lastName,
                       "guardianNRIC": vm.guardian.nric,
                       "guardianAddress1": vm.guardian.address1,
                       "guardianAddress2": vm.guardian.address2,
                       "guardianAddress3": vm.guardian.address3,
                       "guardianPostalCode": vm.guardian.postalCode,
                       "guardianFloorUnit": vm.guardian.floor + "-" + vm.guardian.unit
                };
            }
            
            
            if (vm.policy.selectedCountry) {
                vm.policy.destinationCountry = vm.policy.selectedCountry.CountryName;
            }
            //vm.policy.amount=vm.inputData.premium.;
            if (vm.inputData) {
                vm.policy.startDate = vm.inputData.dStart;
                vm.policy.endDate = vm.inputData.dEnd;
                vm.policy.planType = vm.inputData.familySelection;
                vm.policy.optionalBenefit = vm.inputData.selectedOption;
                if (vm.inputData.premium) {
                    vm.policy.amount = vm.inputData.premium.basic;
                    vm.policy.optionA = vm.inputData.premium.optionA;
                    vm.policy.optionB = vm.inputData.premium.optionB;
                    vm.policy.optionC = vm.inputData.premium.optionC;
                    vm.policy.total = vm.inputData.premium.total;
                }
            }
            
            if((vm.policy.destinationCountry!=null && vm.policy.destinationCountry!=undefined) || (vm.policy.startDate!=null && vm.policy.startDate!=undefined) 
                    || (vm.policy.endDate!=null && vm.policy.endDate!=undefined) || (vm.policy.agentName!=null && vm.policy.agentName!=undefined)
                    || (vm.policy.agentCode!=null && vm.policy.agentCode!=undefined) || (vm.policy.planType!=null && vm.policy.planType!=undefined) 
                    || (vm.policy.optionalBenefit!=null && vm.policy.optionalBenefit!=undefined) || (vm.policy.educationalInstitute!=null && vm.policy.educationalInstitute!=undefined) 
                    || (vm.policy.policyNo!=null && vm.policy.policyNo!=undefined) 
                    || (vm.policy.amount!=null && vm.policy.amount!=undefined) || (vm.policy.optionA!=null && vm.policy.optionA!=undefined)
                    || (vm.policy.optionB!=null && vm.policy.optionB!=undefined) || (vm.policy.optionC!=null && vm.policy.optionC!=undefined) 
                    || (vm.policy.total!=null && vm.policy.total!=undefined)){
                
                customerDTO.policy = {
                         "agentName": vm.policy.agentName,
                         "agentCode": vm.policy.agentCode,                               
                         "startDate": vm.policy.startDate,
                         "endDate": vm.policy.endDate,
                         "planType": vm.policy.planType,
                         "optionalBenefit": vm.policy.optionalBenefit,
                         "educationalInstitute": vm.policy.educationalInstitute,
                         "destinationCountry": vm.policy.destinationCountry,
                         "policyNo": vm.policy.policyNo,
                         "amount": vm.policy.total                           
                 };
            }
            
            
            if (vm.inputData.familySelection == 'myself') {
                vm.familyMembers = [];
            }

            var familyMemberDTOs = [];
            if (vm.familyMembers.length > 0) {
                angular.forEach(vm.familyMembers, function(e) {
                    if (e.selectedTitle) {
                        e.title = e.selectedTitle.TITLE_DESC;
                    }
                    if (e.selectedNationality) {
                        e.nationality = e.selectedNationality.NATIONALITY_DESC;
                    }
                    if (e.selectedCountryCode) {
                        e.countryCode = e.selectedCountryCode.CountryCode
                    }
                    if (e.selectedRelationShip) {
                        e.relationShip = e.selectedRelationShip.RELATION_DESC;
                    }
                    if (e.day && e.month && e.year) {
                        e.dob = new Date(e.year, e.month-1, e.day);
                    }

                    var familyMemberDTO = {
                        "title": e.title,
                        "name": e.firstName + " " + e.lastName,
                        "dob": e.dob,
                        "relationship": e.relationShip,
                        "nationality": e.nationality,
                        "nric": e.nric
                    };
                    familyMemberDTOs.push(familyMemberDTO);
                });
                customerDTO.familyMembers=familyMemberDTOs;
            }

            vm.customer.familyMembers = vm.familyMembers;
            vm.customer.sponsor = vm.sponsor;
            vm.customer.guardian = vm.guardian;
            vm.customer.policy = vm.policy;
            vm.customer.dateOfIssue = vm.today;
            vm.customer.duration = vm.duration;

            vm.inputData.yearDiff = vm.yearDiff;
            vm.inputData.monthDiff = vm.monthDiff;
            vm.inputData.dayDiff = vm.dayDiff;
            vm.customer.inputData = vm.inputData;
                        
            var reqObj = {
                'dateAndTime': new Date(),
                'customerDTO': customerDTO,
                'policyDTO': customerDTO.policy
            };
            
            delete reqObj.customerDTO.policy;
            console.log(reqObj);
            selectionService.createPolicy(reqObj).then(function(response) {
                if (response.statusMessage == 'success' && response.status == 0) {
                    var url = server.API_PREFIX + "/" + api.MAKE_PAYMENT;
                    //var url = server.DOMAIN + ":" + server.PORT + "/" + server.API_PREFIX + "/" + api.MAKE_PAYMENT;
                    //window.open(url, "_self");
                    redirect(url);
                    /*selectionService.makePayment().then(function() {
                            vm.loadingPayment = false;
                    });*/
                } else {                   
                    //$state.go('/completion', { "outputData": vm.customer });                  
                    vm.loadingPayment = false;
                    //var url = server.DOMAIN + ":" + server.PORT + "/" + server.API_PREFIX + "/"+api.MAKE_PAYMENT;
                    //window .open(url, "_blank");
                    $state.go('/error', { "outputData": vm.customer });
                }
            });
        }
        

        // this function is used to properly redirect with IE. So that referrer header field is set.  
        function redirect(url) {
            if (/MSIE (\d+\.\d+);/.test(navigator.userAgent)){
                var referLink = document.createElement('a');
                referLink.href = url;
                document.body.appendChild(referLink);
                referLink.click();
            } else {
                location.href = url;
            }
        }

        function addNewPerson() {
            if (vm.familyMembers.length < 4) {
                var familyMember = {};
                vm.familyMembers.push(familyMember);
            }
        }

        function removePerson(index) {
            vm.familyMembers.splice(index, 1);
        }

        //if the check same address radio is selected

        function copySameValue(check) {
            if (check) {
                vm.guardian.floor = vm.customer.floor;
                vm.guardian.unit = vm.customer.unit;
                vm.guardian.address1 = vm.customer.address1;
                vm.guardian.address2 = vm.customer.address2;
                vm.guardian.address3 = vm.customer.address3;
                vm.guardian.floorAndUnit = vm.customer.floorAndUnit;
                vm.guardian.postalCode = vm.customer.postalCode;
                vm.guardian.state = vm.customer.state;
                vm.guardian.country = vm.customer.country;
                vm.guardian.stateAndCountry = vm.customer.state + ', ' + vm.customer.countryName;
            } else {
                delete vm.guardian.floor;
                delete vm.guardian.unit;
                delete vm.guardian.address1;
                delete vm.guardian.address2;
                delete vm.guardian.address3;
                delete vm.guardian.floorAndUnit;
                delete vm.guardian.postalCode;
                delete vm.guardian.state;
                delete vm.guardian.country;
                delete vm.guardian.stateAndCountry;
            }
        }

        //PDF Views

        function viewPolicyPdf() {
            window.open('osc/pdf/PolicyWordings.pdf', '_blank');
        }

        function viewTermsPdf() {
            window.open('osc/pdf/ProposalTerms.pdf', '_blank');
        }

        function viewOfferTermsPdf() {
            window.open('osc/pdf/TermsMarketingConsent.pdf', '_blank');
        }


        function getAddressByPostal(customer) {
            vm.loading = true;
            if (customer.postalCode != null && customer.postalCode != undefined && customer.postalCode.length > 0 && customer.postalCode.length == 6) {
                var reqObj = {
                    "postCode": customer.postalCode
                };
                selectionService.getAddressByPostal(reqObj).then(function(response) {
                    if (response.statusMessage == 'success' && response.status == 0) {
                        if (response.addressResponseDTO) {
                            customer.area = response.addressResponseDTO.area;
                            customer.region = response.addressResponseDTO.region;
                            customer.city = response.addressResponseDTO.city;
                            customer.state = response.addressResponseDTO.state;
                            customer.country = response.addressResponseDTO.country;
                            customer.countryName = response.addressResponseDTO.countryName;
                            customer.postalCode = response.addressResponseDTO.postal;
                            customer.address1 = response.addressResponseDTO.address1;
                            customer.address2 = response.addressResponseDTO.address2;
                            customer.address3 = response.addressResponseDTO.address3;
                            customer.address2Required = response.addressResponseDTO.address2Required;
                            customer.basementYN = response.addressResponseDTO.basementYN;
                            customer.buildingType = response.addressResponseDTO.buildingType;
                            customer.block = response.addressResponseDTO.block;
                            customer.street = response.addressResponseDTO.street;
                            customer.addDetails = response.addressResponseDTO.addDetails;
                            customer.stateAndCountry = customer.state + ', ' + customer.countryName;
                            customer.floorUnit = response.addressResponseDTO.floorUnit;
                            vm.postErrMsg = "";
                        } else {
                            vm.loading = false;

                            vm.postErrMsg = "No address found";
                        }

                    } else {
                        vm.loading = false;

                        vm.postErrMsg = "No address found";
                    }
                });
            } else {
                vm.loading = false;

                vm.postErrMsg = "Postal code should be 6 digits";
            }
        }

        function getAgentInfo(policy) {
            if (policy.agentCode != null && policy.agentCode != undefined && policy.agentCode.length > 0) {
                var reqObj = {
                    "agentCode": policy.agentCode
                };
                selectionService.getAgentInfo(reqObj).then(function(response) {
                    if (response.statusMessage == 'success' && response.status == 0) {
                        if (response.agent) {
                            policy.agentCode = response.agent.agentCode;
                            policy.agentName = response.agent.firstName;
                            vm.agentErrMsg = "";

                        }
                    } else {
                        delete policy.agentName;
                        vm.agentErrMsg = "No agent found";

                    }
                });
            } else {
                delete policy.agentName;
            }
        }

    }
})();
