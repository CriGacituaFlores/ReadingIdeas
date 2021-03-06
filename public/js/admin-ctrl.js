"use strict";

let adpp = angular.module("Admin", ["ui.bootstrap", "ui.multiselect", "nvd3", "timer", "ui-notification", "ngQuill", "ngMap", "dndLists", "rzModule", "xeditable"]);

const DASHBOARD_AUTOREALOD = true;
const DASHBOARD_AUTOREALOD_TIME = 15;

adpp.run(function(editableOptions) {
    editableOptions.theme = 'bs3';
});

adpp.factory("ServiceSessions", function() {
   return {
       data: {}
   }
})

adpp.service('modalService',['$uibModal',

    function($uibModal) {
        var modalDefaults = {
            backdrop: true,
            keyboard: true,
            modalFade: true,
            templateUrl: 'templ/model-confirmation.html'
        };

        var modalOptions = {
            closeButtonText: 'Cerrar',
            actionButtonText: 'OK',
            headerText: 'Continuar?',
            bodyText: 'Perform this action?'
        };

        this.showModal = function (customModalDefaults, customModalOptions) {
            if (!customModalDefaults) customModalDefaults = {};
            customModalDefaults.backdrop = 'static';
            return this.show(customModalDefaults, customModalOptions);
        };

        this.show = function (customModalDefaults, customModalOptions) {
            //Create temp objects to work with since we're in a singleton service
            var tempModalDefaults = {};
            var tempModalOptions = {};

            //Map angular-ui modal custom defaults to modal defaults defined in service
            angular.extend(tempModalDefaults, modalDefaults, customModalDefaults);

            //Map modal.html $scope custom properties to defaults defined in service
            angular.extend(tempModalOptions, modalOptions, customModalOptions);

            if (!tempModalDefaults.controller) {
                tempModalDefaults.controller = function ($scope, $uibModalInstance) {
                    $scope.modalOptions = tempModalOptions;
                    $scope.modalOptions.ok = function (result) {
                        $uibModalInstance.close(result);
                    };
                    $scope.modalOptions.close = function (result) {
                        $uibModalInstance.dismiss('cancel');
                    };
                }
            }

            return $uibModal.open(tempModalDefaults).result;
        };
    }

])

adpp.config(['ngQuillConfigProvider', function (ngQuillConfigProvider) {
    ngQuillConfigProvider.set({
        modules:{
            formula: true,
            toolbar: {
                container: [
                    ['bold', 'italic', 'underline', 'strike'],        // toggled buttons

                    [{ 'color': [] }, { 'background': [] }],          // dropdown with defaults from theme
                    [{ 'font': [] }],
                    [{ 'align': [] }],


                    //[{ 'header': 1 }, { 'header': 2 }],               // custom button values
                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],

                    [{ 'script': 'sub'}, { 'script': 'super' }],      // superscript/subscript

                    //[{ 'indent': '-1'}, { 'indent': '+1' }],          // outdent/indent
                    //[{ 'direction': 'rtl' }],                         // text direction

                    //['blockquote', 'code-block'],
                    [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
                    //[{ 'header': [1, 2, 3, 4, 5, 6, false] }],

                    ['clean'],                                         // remove formatting button
                    ['image','link','video'],                                      // remove formatting button
                    ['formula']
                    //['map']
                ],
                handlers: {
                    map: quillMapHandler
                }
            }
        }
    });
}]);

adpp.controller("AdminController", function ($scope, $http, $uibModal, $location, $locale, Notification, ServiceSessions, modalService) {
    let self = $scope;

    self.temp = "";

    $locale.NUMBER_FORMATS.GROUP_SEP = '';
    self.shared = {};
    self.sessions = [];

    self.selectedSes = null;
    self.Tasks = [];
    self.documents = [];
    self.questions = [];
    self.questionTexts = [];
    self.newUsers = [];
    self.users = {};
    self.selectedId = -1;
    self.sesStatusses = ["No Publicada", "Lectura", "Personal", "Anónimo", "Grupal", "Finalizada"];
    self.optConfidence = [0, 25, 50, 75, 100];
    self.iterationNames = [];
    self.iterationUsers = [];
    self.iterationGroups = [];
    self.iterationGroupParts = [{name: "Primera iteración"}, {name: "Segunda iteración"}, {name: "Tercera iteración"}];
    self.openSidebar = true;
    self.semanticByUser = [];
    self.semanticByUser2 = [];
    self.semanticByAllUser = [];
    self.anonymousByAllUser = [];
    self.invited = [];
    self.isChecked = false;
    self.semanticNoAnonymousByUser = [];
    self.anonumousUser = [];
    self.anonumousUser2 = [];
    self.isCheckedAnonymous = false;
    self.isCheckedGroupCourse = false;
    self.groupSemantic = [];
    self.groupSemanticFirst = [];
    self.groupSemanticFirst2 = [];
    self.groupSemanticSecond = [];
    self.groupSemanticSecond2 = [];
    self.groupSemanticThird = [];
    self.groupSemanticThird2 = [];
    self.groupPersonalEvaluation = [];
    self.avg_by_iteration = [];
    self.stages = [{name: "Individual"},{name: "Anónima"},{name: "Grupal"}]
    self.iterationUsersGroup = [];
    self.semanticByTeacher = [];
    self.semanticByTeacher2 = [];
    self.courseIndividual = [];
    self.courseIndividual2 = [];
    self.courseFirstIteration = [];
    self.courseFirstIteration2 = [];
    self.courseSecondIteration = [];
    self.courseThirdIteration = [];

    self.init = () => {
        self.shared.updateSesData();
    };

    self.selectSession = (ses,id) => {
        self.select_session_users(ses);
        self.select_semantic_by_all_users(ses);
        self.selectedId = id;
        self.selectedSes = ses;
        ServiceSessions.data = ses;
        self.shared.LoadTask(id);
        self.sesStatusses = ["notPublicada", "reading", "personal", "anon", "teamWork", "finished"];
        self.optConfidence = [0, 25, 50, 75, 100];
        self.iterationNames = [];
        self.openSidebar = true;
    }

    self.init = () => {
        self.shared.updateSesData();
        self.updateLang("english");
    };

    self.selectSession = (ses,id) => {
        self.selectedId = id;
        self.selectedSes = ses;
        self.select_session_users(ses)
        self.select_group_users(ses)
        self.select_semantic_by_all_users(ses);
        self.shared.LoadTask(ses.id);
        self.requestDocuments();
        self.requestSemDocuments();
        self.requestQuestions();
        self.getNewUsers();
        self.getMembers();
        self.shared.verifyGroups();
        self.shared.resetGraphs();
        self.shared.verifyTabs();
        self.shared.resetTab();
        $location.path(self.selectedSes.id);
    };


    self.select_session_users = (ses) => {
        $http({url: 'select-all-users', method: 'post', data: ses.id}).success((data) => {
            self.iterationUsers = data.map(u => ({id: u.id, name: u.name}))
        })
        $http({url: 'select-all-users-group', method: 'post', data: ses.id}).success((data) => {
            self.iterationUsersGroup = data.map(u => ({id: u.id, name: u.name}))
        })
    }

    self.select_group_users = (ses) => {
        $http({url: '/select-all-groups', method: 'post', data: ses.id}).success((data) => {
            self.iterationGroups = data.map((g,v) => ({id: g.id, name: `Grupo ${v+1}`}))
        })
    }

    self.selectUserTaskByStage = (stage,userid,ses) => {
        $http({url: '/currentTeamForUser', method: 'post', data: {userid: userid, ses: ses}}).then((response) => {
            return response
        }).then((response) => {
            let tmid = response.data[0].tmid;
            if(stage.name == "Individual"){
                $http({url: 'select-semantic-by-users', method: 'post', data: {userid: userid, ses: ses}}).success((data) => {
                    self.semanticByUser = data;
                })
            } else if (stage.name == "Anónima") {
                $http({url: 'select-anonymous-by-user', method: 'post', data: {userid: userid, ses: ses}}).success((data) => {
                    self.anonumousUser = data;
                })
            } else if (stage.name == "Grupal") {
                $http({url: 'select_first_iteration_group', method: 'post', data: {group_id: tmid, ses_id: ses}}).then((response) => {
                    self.groupSemanticFirst = response.data;
                })
                $http({url: 'select_second_iteration_group', method: 'post', data: {group_id: tmid, ses_id: ses}}).then((response) => {
                    self.groupSemanticSecond = response.data;
                })
                $http({url: 'select_third_iteration_group', method: 'post', data: {group_id: tmid, ses_id: ses}}).then((response) => {
                    self.groupSemanticThird = response.data;
                })
            }
        })
    }

    self.selectUserTaskByStage2 = (stage,userid,ses) => {
        $http({url: '/currentTeamForUser', method: 'post', data: {userid: userid, ses: ses}}).then((response) => {
            return response
        }).then((response) => {
            let tmid = response.data[0].tmid;
            if(stage.name == "Individual"){
                $http({url: 'select-semantic-by-users', method: 'post', data: {userid: userid, ses: ses}}).success((data) => {
                    self.semanticByUser2 = data;
                })
            } else if (stage.name == "Anónima") {
                $http({url: 'select-anonymous-by-user', method: 'post', data: {userid: userid, ses: ses}}).success((data) => {
                    self.anonumousUser2 = data;
                })
            } else if (stage.name == "Grupal") {
                $http({url: 'select_first_iteration_group', method: 'post', data: {group_id: tmid, ses_id: ses}}).then((response) => {
                    self.groupSemanticFirst2 = response.data;
                })
                $http({url: 'select_second_iteration_group', method: 'post', data: {group_id: tmid, ses_id: ses}}).then((response) => {
                    self.groupSemanticSecond2 = response.data;
                })
                $http({url: 'select_third_iteration_group', method: 'post', data: {group_id: tmid, ses_id: ses}}).then((response) => {
                    self.groupSemanticThird2 = response.data;
                })
            }
        })
    }

    self.select_all_by_stage = (stage, ses) => {
        if(stage.name == "Individual"){
            $http({url: '/select-semantic-by-all-users', method: 'post', data: ses}).then((response) => {
                self.courseIndividual = response.data
            })
        } else if (stage.name == "Anónima") {
            $http({url: '/select-anonymous-semantic-by-all-users', method: 'post', data: ses}).then((response) => {
                self.courseIndividual = response.data
            })
        } else if (stage.name == "Grupal") {
            $http({url: '/course_first_iteration', method: 'post', data: ses}).then((response) => {
                self.courseFirstIteration = response.data
            })
            $http({url: '/course_second_iteration', method: 'post', data: ses}).then((response) => {
                self.courseSecondIteration = response.data
            })
            $http({url: '/course_third_iteration', method: 'post', data: ses}).then((response) => {
                self.courseThirdIteration = response.data
            })
        }
    }

    self.select_all_by_stage2 = (stage, ses) => {
        if(stage.name == "Individual"){
            $http({url: '/select-semantic-by-all-users', method: 'post', data: ses}).then((response) => {
                self.courseIndividual2 = response.data
            })
        } else if (stage.name == "Anónima") {
            $http({url: '/select-anonymous-semantic-by-all-users', method: 'post', data: ses}).then((response) => {
                self.courseIndividual2 = response.data
            })
        } else if (stage.name == "Grupal") {
            $http({url: '/course_first_iteration', method: 'post', data: ses}).then((response) => {
                self.courseFirstIteration2 = response.data
            })
            $http({url: '/course_second_iteration', method: 'post', data: ses}).then((response) => {
                self.courseSecondIteration2 = response.data
            })
            $http({url: '/course_third_iteration', method: 'post', data: ses}).then((response) => {
                self.courseThirdIteration2 = response.data
            })
        }
    }

    self.differential_semantic_from_teacher = (ses) => {
        $http({url: '/semantic_from_teacher', method: 'post', data: ses}).then((response) => {
            self.semanticByTeacher = response.data
        })
    }

    self.differential_semantic_from_teacher2 = (ses) => {
        $http({url: '/semantic_from_teacher', method: 'post', data: ses}).then((response) => {
            self.semanticByTeacher2 = response.data
        })
    }

    self.select_semantic_by_user = (userid,ses) => {
        $http({url: 'select-semantic-by-users', method: 'post', data: {userid: userid, ses: ses}}).success((data) => {
            self.semanticByUser = data;
        })
    }

    self.select_semantic_and_anonymous_copy_by_user = (userid,ses) => {
        $http({url: 'select-semantic-by-users', method: 'post', data: {userid: userid, ses: ses}}).success((data) => {
            self.semanticNoAnonymousByUser = data;
        })
        $http({url: 'select-anonymous-by-user', method: 'post', data: {userid: userid, ses: ses}}).success((data) => {
            self.anonumousUser = data;
        })
    }

    self.select_tasks_by_iteration = (group, part, ses) => {
        if(part.name == "Primera iteración"){
            $http({url: 'select_first_iteration_group', method: 'post', data: {group_id: group, ses_id: ses}}).then((response) => {
                self.groupSemantic = response.data;
            })
            $http({url: 'select_first_iteration_personal_evaluation', method: 'post', data: {group_id: group, ses_id: ses}}).then((response) => {
                self.groupPersonalEvaluation = response.data;
            })
        } else if (part.name == "Segunda iteración") {
            $http({url: 'select_second_iteration_group', method: 'post', data: {group_id: group, ses_id: ses}}).then((response) => {
                self.groupSemantic = response.data;
            })
            $http({url: 'select_second_iteration_personal_evaluation', method: 'post', data: {group_id: group, ses_id: ses}}).then((response) => {
                self.groupPersonalEvaluation = response.data;
            })
        } else if (part.name == "Tercera iteración") {
            $http({url: 'select_third_iteration_group', method: 'post', data: {group_id: group, ses_id: ses}}).then((response) => {
                self.groupSemantic = response.data;
            })
            $http({url: 'select_third_iteration_personal_evaluation', method: 'post', data: {group_id: group, ses_id: ses}}).then((response) => {
                self.groupPersonalEvaluation = response.data;
            })
        } else {

        }
    }

    self.select_all_by_iteration = (part, ses) => {
        if(part.name == "Primera iteración"){
            $http({url: 'select_all_by_first_iteration', method: 'post', data: {ses_id: ses}}).then((response) => {
                self.avg_by_iteration = response.data;
            })
        } else if (part.name == "Segunda iteración") {
            $http({url: 'select_all_by_second_iteration', method: 'post', data: {ses_id: ses}}).then((response) => {
                self.avg_by_iteration = response.data;
            })
        } else if (part.name == "Tercera iteración") {
            $http({url: 'select_all_by_third_iteration', method: 'post', data: {ses_id: ses}}).then((response) => {
                self.avg_by_iteration = response.data;
            })
        } else {

        }
    }

    self.select_semantic_by_all_users = (ses) => {
        $http({url: 'select-semantic-by-all-users', method: 'post', data: ses.id}).success((data) => {
            self.semanticByAllUser = data;
        })
    }

    //self.select_anonymous_semantic_by_all_users = (ses) => {
    //    $http({url: 'select-anonymous-semantic-by-all-users', method: 'post', data: ses.id}).success((data) => {
    //        self.anonymousByAllUser = data;
    //    })
    //}

    self.callAnonymousAvg = (ses) => {
        if(!self.isCheckedAnonymous) {
            $http({url: 'select-anonymous-semantic-by-all-users', method: 'post', data: ses.id}).success((data) => {
                self.anonymousByAllUser = data;
            })
        } else {

        }
    }

    self.insertinvited = function(user) {
        if(self.isChecked) {
            self.invited.push(user);
            self.isChecked = false
        } else {
            self.isChecked = true
        }
    }

    self.shared.updateSesData = () => {
        $http({url: "get-session-list", method: "post"}).success((data) => {
            console.log("Session data updated");
            self.sessions = data;
            if (self.selectedId != -1) {
                let ses = self.sessions.find(e => e.id == self.selectedId);
                if (ses != null)
                    self.selectSession(ses, self.selectedId);
            }
            else {
                self.sesFromURL();
            }
        });
    };

    self.sesFromURL = () => {
        let sesid = +($location.path().substring(1));
        let ses = self.sessions.find(e => e.id == sesid);
        if (ses != null)
            self.selectSession(ses,sesid);
    };

    self.goDown = (position) => {
        var currentAux = self.Tasks[position]
        let lengthTasks = self.Tasks.length;

        if(position != (lengthTasks -1)) {
            self.Tasks[position] = self.Tasks[position+1]
            self.Tasks[position+1] = currentAux
        }

        return self.Tasks
    }

    self.goUp = (position) => {
        var currentAuxUp = self.Tasks[position]

        if(position != 0) {
            self.Tasks[position] = self.Tasks[position-1]
            self.Tasks[position-1] = currentAuxUp
        }

        return self.Tasks
    }

    self.shared.LoadTask = (id) => {
        self.Tasks = [];
        self.IsProcessing = true;
        $http({url: '/all_semantic_differential', method: 'POST', data: {id: id}}).then(function(response) {
            self.Tasks = response.data;
        }).finally(function () {
            self.IsProcessing = false;
        })
    }

    self.requestDocuments = () => {
        let postdata = {sesid: self.selectedSes.id};
        $http({url: "documents-session", method: "post", data: postdata}).success((data) => {
            self.documents = data;
        });
    };

    self.shared.updateDocuments = self.requestDocuments;

    self.removeDocIcon = (docid) => {
        let custName = 'Documento';

        let modalOptions = {
            closeButtonText: 'Cancelar',
            actionButtonText: 'Eliminar',
            headerText: 'Eliminar ' + custName + '?',
            bodyText: 'Estás seguro que desear este Documento?'
        };

        modalService.showModal({}, modalOptions).then(function (result) {
            self.deleteDocument(docid)
        });
    }

    self.deleteDocument = (docid) => {
        let postdata = {docid: docid};
        $http({url: "delete-document", method: "post", data: postdata}).success((data) => {
            self.requestDocuments();
            Notification.info("Documento eliminado con éxito")
        });
    };

    self.requestQuestions = () => {
        let postdata = {sesid: self.selectedSes.id};
        $http({url: "questions-session", method: "post", data: postdata}).success((data) => {
            self.questions = data.map(e => {
                e.options = e.options.split("\n");
                return e;
            });
        });
        $http({url: "get-question-text", method: "post", data: postdata}).success((data) => {
            self.questionTexts = data;
        });

    };

    self.requestSemDocuments = () => {
        let postdata = {sesid: self.selectedSes.id};
        $http({url: "semantic-documents", method: "post", data: postdata}).success((data) => {
            self.semDocs = data;
        });
    };

    self.getNewUsers = () => {
        let postdata = {sesid: self.selectedSes.id};
        $http({url: "get-new-users", method: "post", data: postdata}).success((data) => {
            self.newUsers = data;
        });
    };

    self.getMembers = () => {
        let postdata = {sesid: self.selectedSes.id};
        $http({url: "get-ses-users", method: "post", data: postdata}).success((data) => {
            self.usersArr = data;
            self.users = {};
            data.forEach((d) => {
                self.users[d.id] = d;
            });
        });
    };

    self.openNewSes = () => {
        $uibModal.open({
            templateUrl: "templ/new-ses.html"
        });
    };

    self.openDuplicateSes = () => {
        if(self.selectedSes == null) return;
        let ses = angular.copy(self.selectedSes);
        $uibModal.open({
            templateUrl: "templ/duplicate-ses.html",
            controller: "DuplicateSesModalController",
            controllerAs: "vm",
            scope: self,
            resolve: {
                data: function () {
                    return ses;
                },
            }
        });
    };

    self.toggleSidebar = () => {
        self.openSidebar = !self.openSidebar;
        self.shared.updateState()
    };

    self.updateLang = (lang) => {
        $http.get("data/" + lang + ".json").success((data) => {
            window.DIC = data;
        });
    };

    self.init();
});

adpp.controller("TabsController", function ($scope, $http) {
    let self = $scope;
    self.tabOptions = ["description", "dashboard"];
    self.tabConfig = ["users", "groups"];
    self.selectedTab = 0;
    self.semanticTab = 0;
    self.selectedTabConfig = -1;

    self.shared.resetTab = () => {
        self.selectedTab = 0;
        if (self.selectedSes != null && self.selectedSes.status > 1) {
            //self.selectedTab = 1;
        }
        self.selectedTabConfig = 0;
        if (self.selectedSes.status == 7) {
            self.shared.gotoRubrica();
        }
    };

    self.shared.verifyTabs = () => {
        if (self.selectedSes.type == "L") {
            self.iterationNames = [{name: "reading", val: 0}, {name: "individual", val: 1},
                {name: "anon", val: 2}, {name: "teamWork", val: 3}, {name: "report", val: 4},
                {name: "rubricCalib", val: 5}, {name: "pairEval", val: 6}];
            self.tabOptions = ["configuration", "dashboard"];
            self.tabConfig = ["users", "groups", "rubrica"];
            self.sesStatusses = ["configuration", "reading", "individual", "anon", "teamWork", "report", "rubricCalib", "pairEval", "finished"];
            self.shared.getRubrica();
            self.shared.getExampleReports();
            self.shared.getReports();
        }
        else if(self.selectedSes.type == "S"){
            self.iterationNames = [{name: "individual", val: 1}, {name: "anon", val: 2},
                {name: "teamWork", val: 3}];
            self.tabOptions = ["configuration", "dashboard"];
            self.tabConfig = ["users","groups",null,"options"];
            self.sesStatusses = ["configuration", "individual", "anon", "teamWork", "finished"];
        }
        else if(self.selectedSes.type == "M"){
            self.iterationNames = [{name: "individual", val: 1}, {name: "teamWork", val: 3}, {name: "report", val:4}, {name: "pairEval", val: 6}];
            self.tabOptions = ["configuration", "dashboard"];
            self.tabConfig = ["Usuarios", "Grupos","Rúbrica"];
            self.sesStatusses = [{i:-1, name: "configuración"}, {i: 1, name: "individual"}, {i: 3, name: "teamWork"}, {i: 4, name: "report"},
                {i: 6, name: "pairEval"}, {i: 7, name: "finished"}];
            self.shared.getRubrica();
            self.shared.getExampleReports();
            self.shared.getReports();
        }
        else if(self.selectedSes.type == "D"){
            self.iterationNames = [{name: "reading", val: 0}, {name: "individual", val: 1},
                {name: "anon", val: 2}, {name: "teamWork", val: 3}, {name: "discussion", val: 4}];
            self.tabOptions = ["configuration", "dashboard"];
            self.tabConfig = ["users", "groups", "rubrica"];
            self.sesStatusses = ["Configuración", "Lectura", "Individual", "Anónima", "Grupal", "Discusión", "Finalizada"];
            self.shared.getRubrica();
            self.shared.getExampleReports();
            self.shared.getReports();
        }
        if (self.selectedSes.status > 1) {
            self.selectedTab = 1;
        }
    };

    self.setTab = (idx) => {
        self.selectedTab = idx;
    };

    self.setTabConfig = (idx) => {
        self.selectedTabConfig = idx;
    };

    self.shared.gotoGrupos = () => {
        self.selectedTab = 0;
        self.selectedTabConfig = 1;
    };

    self.shared.gotoRubrica = () => {
        self.selectedTab = 0;
        self.selectedTabConfig = 2;
    };

});

adpp.controller("DocumentsController", function ($scope, $http, Notification, $timeout) {
    let self = $scope;

    self.busy = false;

    self.uploadDocument = (event) => {
        self.busy = true;
        let fd = new FormData(event.target);
        $http.post("upload-file", fd, {
            transformRequest: angular.identity,
            headers: {'Content-Type': undefined}
        }).success((data) => {
            if (data.status == "ok") {
                $timeout(() => {
                    Notification.success("Documento cargado correctamente");
                    event.target.reset();
                    self.busy = false;
                    self.shared.updateDocuments();
                }, 2000);
            } else {
                Notification.error(data.status);
                event.target.reset();
                self.busy = false;
            }
        }).error((error) => {
            Notification.error(error);
        });
    };

});

adpp.controller("SemanticDifferentialController", function($scope, $http, $uibModal, Notification, ServiceSessions, modalService) {
    let self = $scope;

    self.serviceSes = ServiceSessions;
    self.IsProcessing = false;

    self.user = {
        name: 'awesome user'
    };

    $scope.slider = {
        value: 5,
        options: {
            showTicksValues: true,
            stepsArray: [
                {value: 0, legend: 'Malo'},
                {value: 1},
                {value: 2},
                {value: 3},
                {value: 4},
                {value: 5, legend: 'Mediano'},
                {value: 6},
                {value: 7, legend: 'Bueno'},
                {value: 8},
                {value: 9},
                {value: 10, legend: 'Excelente!'}
            ],
            onEnd: function (sliderId, modelValue) {
                self.updateSemanticDifferential(sliderId)
            }
        }
    };

    self.priceSlider = {
        value: 10
    }
    
    self.processItem = function(sliderId, modelValue) {
        self.updateSemanticDifferential(sliderId)
    }

    //self.LoadTask = (id = 0) => {
    //    self.Tasks = [];
    //    self.IsProcessing = true;
    //    if (self.serviceSes) {
    //        id = self.serviceSes.data.id || 0
    //        $http({url: '/all_semantic_differential', method: 'POST', data: {id: id}}).then(function(response) {
    //            self.Tasks = response.data;
    //        }).finally(function () {
    //            self.IsProcessing = false;
    //        })
    //    }
    //}

    self.updateSemanticDifferential = (position) => {
        let actualSemantic = self.Tasks[position]
        $http({url: '/update_semantic_differential', method: 'POST', data: {data: actualSemantic, id: actualSemantic.id }}).then((response) => {

        })
    }

    self.Sorting = (index) => {
        self.IsProcessing = true;
        self.Tasks.splice(index, 1);
        var newData = [];
        angular.forEach(self.Tasks, function(val, index){
            val.Order = index + 1;
            newData.push(val);
        })

        $http.post('/save_semantic_order', newData).then(function(response){

        });
    }

    self.removeSemanticIconTrash = (index,sesId) => {
        let custName = 'diferencial semántico';

        let modalOptions = {
            closeButtonText: 'Cancelar',
            actionButtonText: 'Eliminar',
            headerText: 'Eliminar ' + custName + '?',
            bodyText: 'Estás seguro que desear este diferencial semántico?'
        };

        modalService.showModal({}, modalOptions).then(function (result) {
            self.removeSemanticDiferential(index,sesId)
        });
    }

    self.removeSemanticDiferential = (index,sesId) => {
        $http({url: 'remove_semantic_differential', method: 'POST', data: index}).then((response) => {
            self.shared.LoadTask(sesId);
            Notification.info('Diferencial semántico eliminado')
        });
    }

    self.createSemanticDiferential = (index) => {
        if (self.Tasks.length == 5) {
            Notification.error('Ya existen el máximo de Diferenciales semánticos (5)')
        } else {
            $http({url: 'semantic_differential', method: 'POST', data: index}).then((response) => {
                Notification.success(response.data.creado);
                self.shared.LoadTask(index);
            });
        }
    }

});

adpp.controller("SesEditorController", function ($scope, $http, Notification) {
    let self = $scope;

    self.mTransition = {1: 3, 3: 5, 5: 6, 6: 8, 8: 9};

    self.splitDescr = false;
    self.splDes1 = "";
    self.splDes2 = "";

    self.toggleSplit = () => {
        self.splitDescr = !self.splitDescr;
        if(self.splitDescr){
            self.splDes1 = self.selectedSes.descr.split("\n")[0];
            self.splDes2 = self.selectedSes.descr.split("\n")[1] || "";
        }
        else{
            self.selectedSes.descr = self.splDes1 + "\n" + self.splDes2;
        }
    };

    self.updateSession = () => {
        if(self.splitDescr){
            self.selectedSes.descr = self.splDes1 + "\n" + self.splDes2;
        }
        if (self.selectedSes.name.length < 3 || self.selectedSes.descr.length < 5) {
            Notification.error("Datos de la sesión incorrectos o incompletos");
            return;
        }
        let postdata = {name: self.selectedSes.name, descr: self.selectedSes.descr, id: self.selectedSes.id};
        $http({url: "update-session", method: "post", data: postdata}).success((data) => {
            console.log("Session updated");
            Notification.success("Configuración inicial actualizada");
        });
    };

    self.shared.changeState = () => {
        if (self.selectedSes.type != "M" && self.selectedSes.status >= self.sesStatusses.length) {
            Notification.error("La sesión está finalizada");
            return;
        }
        if (self.selectedSes.type == "M" && self.selectedSes.status >= 9) {
            Notification.error("La sesión está finalizada");
            return;
        }
        if (self.selectedSes.type == "L" && self.selectedSes.status >= 3 && !self.selectedSes.grouped
            || self.selectedSes.type == "M" && self.selectedSes.status >= 3 && !self.selectedSes.grouped
            || self.selectedSes.type == "S" && self.selectedSes.status >= 2 && !self.selectedSes.grouped) {
            self.shared.gotoGrupos();
            Notification.error("Los grupos no han sido generados");
            return;
        }
        if (self.selectedSes.type == "L" && self.selectedSes.status >= 7 && !self.selectedSes.paired
            || self.selectedSes.type == "M" && self.selectedSes.status >= 6 && !self.selectedSes.paired) {
            self.shared.gotoRubrica();
            Notification.error("Los pares para la evaluación de pares no han sido asignados");
            return;
        }
        let confirm = window.confirm("¿Esta seguro que quiere ir al siguiente estado?");
        if (confirm) {
            if(self.selectedSes.type == "M"){
                let postdata = {sesid: self.selectedSes.id, state: self.mTransition[self.selectedSes.status] || self.selectedSes.status};
                $http({url: "force-state-session", method: "post", data: postdata}).success((data) => {
                    self.shared.updateSesData();
                });
            } else if (self.selectedSes.type == "D") {
                let postdata = {sesid: self.selectedSes.id};
                $http({url: "change-state-session", method: "post", data: postdata}).success((data) => {
                    self.shared.updateSesData();
                });
                if(self.selectedSes.status == 2) {
                    let currentSes = self.selectedSes.id
                    let all_users = [];
                    $http({url: 'select-session-users', method: 'post', data: currentSes}).success((data) => {
                        all_users = data.map(u => u.id)
                    })
                }
                if(self.selectedSes.status == 3) {
                    let currentSes = self.selectedSes.id
                    let all_anonymous_users = [];
                    $http({url: 'select-anonymous-session-users', method: 'post', data: currentSes}).success((data) => {
                        all_anonymous_users = data.map(u => u.id)
                    })
                }
                if(self.selectedSes.status == 4){
                    let currentSes = self.selectedSes.id
                    $http({url: 'select-first-iteration-group', method: 'post', data: currentSes}).success((data) => {

                    })
                    $http({url: 'select-first-iteration-personal-evaluation', method: 'post', data: currentSes}).success((data) => {

                    })
                }
                self.semanticTab += 1;
            }
            else {
                let postdata = {sesid: self.selectedSes.id};
                $http({url: "change-state-session", method: "post", data: postdata}).success((data) => {
                    self.shared.updateSesData();
                });
            }
        }
    };

    /*self.exportData = () => {
        let postdata = {id: self.selectedSes.id};
        $http.post("export-session-data-sel", postdata).success((data) => {
            let anchor = angular.element('<a/>');
            anchor.attr({
                href: 'data:attachment/vnd.openxmlformats,' + encodeURI(data),
                target: '_blank',
                download: 'resultados.xlsx'
            })[0].click();
        });
    }*/

});

adpp.controller("NewUsersController", function ($scope, $http, Notification) {
    let self = $scope;
    let newMembs = [];

    self.addToSession = () => {
        if (self.newMembs.length == 0) {
            Notification.error("No hay usuarios seleccionados para agregar");
            return;
        }
        let postdata = {
            users: self.newMembs.map(e => e.id),
            sesid: self.selectedSes.id
        };
        $http({url: "add-ses-users", method: "post", data: postdata}).success((data) => {
            if (data.status == "ok") {
                self.getNewUsers();
                self.getMembers();
            }
        });
    };

    self.removeUser = (uid) => {
        if (self.selectedSes.status == 1) {
            let postdata = {uid: uid, sesid: self.selectedSes.id};
            $http({url: "delete-ses-user", method: "post", data: postdata}).success((data) => {
                if (data.status == "ok") {
                    self.getNewUsers();
                    self.getMembers();
                }
            });
        }
    };

});

adpp.controller("SemDocController", function ($scope, $http, Notification) {
    let self = $scope;

    self.newSDoc = {id:null, title: "", content: ""};

    self.addSemDoc = () => {
        let postdata = {sesid: self.selectedSes.id, title: self.newSDoc.title, content: self.newSDoc.content};
        $http({url: "add-semantic-document", method: "post", data: postdata}).success((data) => {
            if (data.status == "ok") {
                self.requestSemDocuments();
                Notification.success("Texto agregado correctamente");
                self.newSDoc = {id:null, title: "", content: ""};
            }
        });
    };

    self.deleteText = (id) => {
        let postdata = {id: id};
        $http.post("delete-semantic-document", postdata).success((data) => {
            if(data.status == "ok"){
                self.requestSemDocuments();
                Notification.success("Texto eliminado correctamente");
            }
        });
    };

    self.startEditText = (tx) => {
        self.newSDoc = {id:tx.id, title: tx.title, content: tx.content};
        Notification.info("Edite el texto en el formulario");
    };

    self.updateSemDoc = () => {
        if(self.newSDoc.id == null){
            Notification.error("No hay texto a editar.");
            return;
        }
        let postdata = {id: self.newSDoc.id, sesid: self.selectedSes.id, title: self.newSDoc.title, content: self.newSDoc.content};
        $http({url: "update-semantic-document", method: "post", data: postdata}).success((data) => {
            if (data.status == "ok") {
                self.requestSemDocuments();
                Notification.success("Texto editado correctamente.");
                self.newSDoc = {id: null, title: "", content: ""};
            }
        });
    }

});

adpp.controller("QuestionsController", function ($scope, $http, Notification, $uibModal, NgMap, $timeout) {
    let self = $scope;

    self.qsLabels = ['A', 'B', 'C', 'D', 'E'];

    self.newQuestion = {
        id: null,
        content: "",
        alternatives: ["", "", "", "", ""],
        comment: "",
        other: "",
        textid: null,
        answer: -1
    };

    self.newText = {id: null, title: "", content: ""};

    /*NgMap.getMap().then((map) => {
        console.log("MAP correctly loaded");
        self.map = map;
    });*/

    self.selectAnswer = (i) => {
        self.newQuestion.answer = i;
    };

    self.addQuestion = () => {
        if (self.newQuestion.answer == -1) {
            Notification.error("Debe indicar la respuesta correcta a la pregunta");
            return;
        }
        if(self.newQuestion.includesMap){
            encodeMapPlugin();
        }
        let postdata = {
            content: self.newQuestion.content,
            options: self.newQuestion.alternatives.join("\n"),
            comment: self.newQuestion.comment,
            answer: self.newQuestion.answer,
            sesid: self.selectedSes.id,
            textid: self.newQuestion.textid,
            other: self.newQuestion.other,
            pluginData: self.newQuestion.pluginData
        };
        $http({url: "add-question", method: "post", data: postdata}).success((data) => {
            if (data.status == "ok") {
                self.requestQuestions();
                Notification.success("Pregunta agrgada correctamente");
                self.newQuestion = {
                    id: null,
                    content: "",
                    alternatives: ["", "", "", "", ""],
                    comment: "",
                    other: "",
                    textid: null,
                    answer: -1
                };
                self.shared.sendOverlayBuffer(data.id);
            }
        });
    };

    self.updateQuestion = () => {
        if(self.newQuestion.id == null){
            Notification.error("No hay pregunta para editar");
            return;
        }
        if (self.newQuestion.answer == -1) {
            Notification.error("Debe indicar la respuesta correcta a la pregunta");
            return;
        }
        if(self.newQuestion.includesMap){
            encodeMapPlugin();
        }
        let postdata = {
            id: self.newQuestion.id,
            content: self.newQuestion.content,
            options: self.newQuestion.alternatives.join("\n"),
            comment: self.newQuestion.comment,
            answer: self.newQuestion.answer,
            sesid: self.selectedSes.id,
            textid: self.newQuestion.textid,
            other: self.newQuestion.other,
            pluginData: self.newQuestion.pluginData
        };
        $http({url: "update-question", method: "post", data: postdata}).success((data) => {
            if (data.status == "ok") {
                self.requestQuestions();
                Notification.success("Pregunta editada correctamente");
                self.newQuestion = {
                    id: null,
                    content: "",
                    alternatives: ["", "", "", "", ""],
                    comment: "",
                    other: "",
                    textid: null,
                    answer: -1
                };
                if(self.shared.clearOverlayBuffer)
                    self.shared.clearOverlayBuffer();
            }
        });
    };

    self.startEditQuestion = (qs) => {
        self.newQuestion = {
            id: qs.id,
            content: qs.content,
            alternatives: qs.options,
            comment: qs.comment,
            other: qs.other,
            textid: qs.textid,
            answer: qs.answer,
            includesMap: qs.plugin_data && qs.plugin_data.startsWith("MAP")
        };
        Notification.info("Edite la pregunta en el formulario.");
        if(self.newQuestion.includesMap){
            if(self.shared.clearOverlayBuffer)
                self.shared.clearOverlayBuffer();
            self.shared.processMapData(qs.plugin_data, qs.id);
            futureRefreshMap();
        }
    };

    self.startEditText = (tx) => {
        self.newText = {
            id: tx.id,
            title: tx.title,
            content: tx.content
        };
        Notification.info("Edite el texto en el formulario.");
    };

    self.addQuestionText = () => {
        let postdata = {sesid: self.selectedSes.id, title: self.newText.title, content: self.newText.content};
        $http({url: "add-question-text", method: "post", data: postdata}).success((data) => {
            if (data.status == "ok") {
                self.requestQuestions();
                self.newText = {id: null, title: "", content: ""};
            }
        });
    };

    self.updateQuestionText = () => {
        if(self.newText.id == null){
            Notification.error("No hay texto para editar");
            return;
        }
        let postdata = {id: self.newText.id, sesid: self.selectedSes.id, title: self.newText.title, content: self.newText.content};
        $http({url: "update-question-text", method: "post", data: postdata}).success((data) => {
            if (data.status == "ok") {
                self.requestQuestions();
                self.newText = {title: "", content: ""};
            }
        });
    };

    self.deleteQuestion = (id) => {
        let postdata = {id: id};
        $http.post("delete-question", postdata).success((data) => {
            self.requestQuestions();
            Notification.success("Pregunta eliminada correctamente");
        });
    };

    self.deleteQuestionText = (id) => {
        let postdata = {id: id};
        $http.post("delete-question-text", postdata).success((data) => {
            self.requestQuestions();
            Notification.success("Texto eliminado correctamente");
        });
    };

    self.configQuillExtra = (editor) => {
        self.editor = editor;
    };

    self.toggleMapPlugin = () => {
        self.newQuestion.includesMap = !self.newQuestion.includesMap;
        if(self.newQuestion.includesMap){
            futureRefreshMap();
        }
    };

    let futureRefreshMap = () => {
        $timeout(() => {
            let map = self.shared.getActiveMap();
            google.maps.event.trigger(map, "resize");
        }, 1000);
    };

    let encodeMapPlugin = () => {
        let r = self.shared.getPluginMapOptions();
        let map = self.shared.getActiveMap();
        if(map == null){
            /*NgMap.getMap().then((map) => {
                console.log("MAP correctly loaded");
                self.map = map;
                let lat = self.map.getCenter().lat();
                let lng = self.map.getCenter().lng();
                let zoom = self.map.getZoom();
                self.newQuestion.pluginData = "MAP " + lat + " " + lng + " " + zoom + (r.nav ? " NAV" : "") + (r.edit ? " EDIT" : "");
            }, (err) => {*/
                Notification.error("Ocurrio un error al cargar los datos del mapa, intente nuevamente.");
            //});
            return;
        }
        let lat = map.getCenter().lat();
        let lng = map.getCenter().lng();
        let zoom = map.getZoom();
        self.newQuestion.pluginData = "MAP " + lat + " " + lng + " " + zoom + (r.nav ? " NAV" : "") + (r.edit ? " EDIT" : "");
    };

});

adpp.controller("DashboardController", function ($scope, $http, $timeout, $uibModal, Notification) {
    let self = $scope;
    self.iterationIndicator = 1;
    self.currentTimer = null;
    self.showCf = false;

    self.shared.resetGraphs = () => {
        if (self.selectedSes != null && self.selectedSes.type == "L") {
            self.iterationIndicator = Math.max(Math.min(6, self.selectedSes.status - 2), 0);
        }
        else if (self.selectedSes.type == "S") {
            self.iterationIndicator = Math.max(Math.min(3, self.selectedSes.status - 1), 1);
        }
        else if (self.selectedSes.type == "M") {
            self.iterationIndicator = Math.max(Math.min(6, self.selectedSes.status - 2), 0);
        }
        else if (self.selectedSes.type == "D") {
            self.iterationIndicator = Math.max(Math.min(6, self.selectedSes.status - 2), 0);
        }
        self.alumState = null;
        self.barOpts = {
            chart: {
                type: 'multiBarChart',
                height: 320,
                x: d => d.label,
                y: d => d.value,
                showControls: false,
                showValues: false,
                duration: 500,
                xAxis: {
                    showMaxMin: false
                },
                yAxis: {
                    axisLabel: 'Cantidad Alumnos'
                }
            }
        };
        self.barData = [{key: "Alumnos", color: "#4d6b87", values: []}];
        self.updateState();
        if (DASHBOARD_AUTOREALOD && self.selectedSes.status < 9) {
            self.reload(true);
        }
    };

    self.reload = (k) => {
        if (!k) {
            self.updateState();
        }
        if (self.currentTimer != null) {
            $timeout.cancel(self.currentTimer);
        }
        self.currentTimer = $timeout(self.reload, DASHBOARD_AUTOREALOD_TIME * 1000);
    };

    self.updateState = () => {
        if (self.iterationIndicator <= 4)
            self.updateStateIni();
        else
            self.updateStateRub();
    };

    self.shared.updateState = self.updateState;

    self.updateStateIni = () => {
        self.alumTime = {};
        let postdata = {sesid: self.selectedSes.id, iteration: self.iterationIndicator};
        if (self.selectedSes.type == "S") {
            $http({url: "get-alum-full-state-sel", method: "post", data: postdata}).success((data) => {
                self.alumState = {};
                for (let uid in self.users) {
                    if (self.users[uid].role == "A")
                        self.alumState[uid] = {};
                }
                data.forEach((d) => {
                    if (self.alumState[d.uid] == null) {
                        self.alumState[d.uid] = {};
                        self.alumState[d.uid][d.qid] = d.correct;
                    }
                    else {
                        self.alumState[d.uid][d.qid] = d.correct;
                    }
                });
                if (self.iterationIndicator == 3) {
                    $http({
                        url: "get-original-leaders",
                        method: "post",
                        data: {sesid: self.selectedSes.id}
                    }).success((data) => {
                        let temp = angular.copy(self.alumState);
                        self.alumState = {};
                        self.leaderTeamStr = {};
                        data.forEach((r) => {
                            self.alumState[r.leader] = temp[r.leader];
                            self.leaderTeamStr[r.leader] = r.team.map(u => (self.users[u]) ? self.users[u].name : "- ").join(", ");
                        });
                    });
                }
                self.shared.alumState = self.alumState;
            });
            $http({url: "get-alum-state-sel", method: "post", data: postdata}).success((data) => {
                let dataNorm = data.map(d => {
                    d.score /= self.questions.length;
                    return d;
                });
                self.buildBarData(dataNorm);
            });
            $http({url: "get-alum-confidence", method: "post", data: postdata}).success((data) => {
                 self.confidence = {};
                 data.forEach(r => {
                     if(!self.confidence[r.qid])
                         self.confidence[r.qid] = {};
                     self.confidence[r.qid][r.conf] = r.freq;
                 });
            });
        }
        else if (self.selectedSes.type == "L") {
            $http({url: "get-alum-state-lect", method: "post", data: postdata}).success((data) => {
                self.alumState = {};
                for (let uid in self.users) {
                    if (self.users[uid].role == "A")
                        self.alumState[uid] = {};
                }
                data.forEach((d) => {
                    if (self.alumState[d.uid] == null) {
                        self.alumState[d.uid] = d;
                    }
                    else {
                        self.alumState[d.uid] = d;
                    }
                });
                self.buildBarData(data);
                self.getAlumDoneTime(postdata);
                if (self.iterationIndicator == 3) {
                    $http({url: "get-original-leaders", method: "post", data: {sesid: self.selectedSes.id}}).success((data) => {
                        let temp = angular.copy(self.alumState);
                        self.alumState = {};
                        self.leaderTeamStr = {};
                        data.forEach((r) => {
                            self.alumState[r.leader] = temp[r.leader];
                            self.leaderTeamStr[r.leader] = r.team.map(u => (self.users[u]) ? self.users[u].name : "- ").join(", ");
                        });
                    });
                }
                self.shared.alumState = self.alumState;
            });
            $http({url: "get-ideas-progress", method: "post", data: postdata}).success((data) => {
                self.numProgress = 0;
                self.numUsers = Object.keys(self.users).length - 1;
                let n = self.documents.length * 3;
                if (n != 0) {
                    data.forEach((d) => {
                        self.numProgress += d.count / n;
                    });
                    self.numProgress *= 100 / self.numUsers;
                }
            });
        }
        else if (self.selectedSes.type == "D") {
            $http({url: "get-alum-state-lect", method: "post", data: postdata}).success((data) => {
                self.alumState = {};
                for (let uid in self.users) {
                    if (self.users[uid].role == "A")
                        self.alumState[uid] = {};
                }
                data.forEach((d) => {
                    if (self.alumState[d.uid] == null) {
                        self.alumState[d.uid] = d;
                    }
                    else {
                        self.alumState[d.uid] = d;
                    }
                });
                self.buildBarData(data);
                self.getAlumDoneTime(postdata);
                if (self.iterationIndicator == 3) {
                    $http({url: "get-original-leaders", method: "post", data: {sesid: self.selectedSes.id}}).success((data) => {
                        let temp = angular.copy(self.alumState);
                        self.alumState = {};
                        self.leaderTeamStr = {};
                        data.forEach((r) => {
                            self.alumState[r.leader] = temp[r.leader];
                            self.leaderTeamStr[r.leader] = r.team.map(u => (self.users[u]) ? self.users[u].name : "- ").join(", ");
                        });
                    });
                }
                self.shared.alumState = self.alumState;
            });
            $http({url: "get-ideas-progress", method: "post", data: postdata}).success((data) => {
                self.numProgress = 0;
                self.numUsers = Object.keys(self.users).length - 1;
                let n = self.documents.length * 3;
                if (n != 0) {
                    data.forEach((d) => {
                        self.numProgress += d.count / n;
                    });
                    self.numProgress *= 100 / self.numUsers;
                }
            });
        }
        else if (self.selectedSes.type == "M") {
            $http({url: "get-alum-state-semantic", method: "post", data: postdata}).success((data) => {
                self.alumState = {};
                self.numUsers = 0;
                for (let uid in self.users) {
                    if (self.users[uid].role == "A") {
                        self.alumState[uid] = {};
                        self.numUsers++;
                    }
                }
                data.forEach((d) => {
                    if (self.alumState[d.uid] == null) {
                        self.alumState[d.uid] = d;
                    }
                    else {
                        self.alumState[d.uid] = d;
                    }
                });
                self.buildBarData(data);
                self.getAlumDoneTime(postdata);
                if (self.iterationIndicator == 3) {
                    $http({url: "get-original-leaders", method: "post", data: {sesid: self.selectedSes.id}}).success((data) => {
                        let temp = angular.copy(self.alumState);
                        self.alumState = {};
                        self.leaderTeamStr = {};
                        data.forEach((r) => {
                            self.alumState[r.leader] = temp[r.leader];
                            self.leaderTeamStr[r.leader] = r.team.map(u => (self.users[u]) ? self.users[u].name : "- ").join(", ");
                        });
                    });
                }
                self.shared.alumState = self.alumState;
            });
            /*$http({url: "get-ideas-progress", method: "post", data: postdata}).success((data) => {
                self.numProgress = 0;
                self.numUsers = Object.keys(self.users).length - 1;
                let n = self.documents.length * 3;
                if (n != 0) {
                    data.forEach((d) => {
                        self.numProgress += d.count / n;
                    });
                    self.numProgress *= 100 / self.numUsers;
                }
            });*/
        }
    };

    self.avgAlum = (uid) => {
        if (self.alumState != null && self.alumState[uid] != null) {
            let t = 0;
            let c = 0;
            for (let k in self.alumState[uid]) {
                if (self.alumState[uid][k])
                    c++;
                t++;
            }
            return (t > 0) ? 100 * c / t : 0;
        }
        return 0;
    };


    self.avgPreg = (pid) => {
        if (self.alumState != null) {
            let t = 0;
            let c = 0;
            for (let k in self.alumState) {
                if (self.alumState[k] != null && self.alumState[k][pid] != null) {
                    if (self.alumState[k][pid])
                        c++;
                    t++;
                }
            }
            return (t > 0) ? 100 * c / t : 0;
        }
        return 0;
    };

    self.avgAll = () => {
        let t = 0;
        let c = 0;
        if (self.alumState != null) {
            for (let u in self.alumState) {
                for (let k in self.alumState[u]) {
                    if (self.alumState[u][k])
                        c++;
                    t++;
                }
            }
        }
        return (t > 0) ? 100 * c / t : 0;
    };

    self.progress = () => {
        let t = 0;
        if (self.alumState != null) {
            for (let u in self.alumState) {
                for (let k in self.alumState[u]) {
                    t++;
                }
            }
            return 100 * t / (Object.keys(self.alumState).length * self.questions.length);
        }
        return 0;
    };

    self.progressAlum = (uid) => {
        let t = 0;
        if (self.alumState != null && self.alumState[uid] != null) {
            for (let k in self.alumState[uid]) {
                t++;
            }
            return 100 * t / (self.questions.length);
        }
        return 0;
    };

    self.progressPreg = (pid) => {
        let t = 0;
        if (self.alumState != null) {
            for (let u in self.alumState) {
                if (self.alumState[u][pid] != null) {
                    t++;
                }
            }
            return 100 * t / (Object.keys(self.alumState).length);
        }
        return 0;
    };

    self.lectPerformance = () => {
        let t = 0;
        let c = 0;
        if (self.alumState != null) {
            for (let u in self.alumState) {
                var a = self.alumState[u];
                t++;
                c += a.score;
            }
            return 100 * c/t;
        }
        return 0;
    };

    self.getAlumDoneTime = (postdata) => {
        $http({url: "get-alum-done-time", method: "post", data: postdata}).success((data) => {
            self.numComplete = 0;
            data.forEach((row) => {
                self.numComplete += 1;
                if (self.alumState[row.uid] == null)
                    self.alumState[row.uid] = row;
                else
                    self.alumState[row.uid].dtime = ~~(row.dtime);
            });
        });
    };

    self.buildBarData = (data) => {
        const N = 5;
        self.barData[0].values = [];
        for (let i = 0; i < N; i++) {
            let lbl = (i * 20) + "% - " + ((i + 1) * 20) + "%";
            self.barData[0].values.push({label: lbl, value: 0});
        }
        data.forEach((d) => {
            let rank = Math.min(Math.floor(N * d.score), N - 1);
            self.barData[0].values[rank].value += 1;
        });
        self.barOpts.chart.xAxis.axisLabel = "Rendimiento";
    };

    self.updateStateRub = () => {
        if (self.iterationIndicator == 5)
            self.computeDif();
        else if (self.iterationIndicator == 6)
            self.getAllReportResult();
    };

    self.showName = (report) => {
        if (report.example)
            return report.title + " - Texto ejemplo";
        else
            return report.id + " - Reporte de Alumno " + self.users[report.uid].name;
    };

    self.shared.getReports = () => {
        let postdata = {sesid: self.selectedSes.id};
        $http({url: "get-report-list", method: "post", data: postdata}).success((data) => {
            self.reports = data;
            self.exampleReports = data.filter(e => e.example);
        });
    };

    self.getReportResult = () => {
        let postdata = {repid: self.selectedReport.id};
        $http({url: "get-report-result", method: "post", data: postdata}).success((data) => {
            self.result = data;
            self.updateState();
        });
    };

    self.getAllReportResult = () => {
        let postdata = {sesid: self.selectedSes.id};
        $http({url: "get-report-result-all", method: "post", data: postdata}).success((data) => {
            self.resultAll = {};
            for (let uid in self.users) {
                if (self.users[uid].role == "A")
                    self.resultAll[uid] = [];
            }
            data.forEach((d) => {
                if(d!=null && d.length > 0) {
                    let uid = self.getReportAuthor(d[0].rid);
                    if (uid != -1 && self.resultAll[uid] == null) {
                        self.resultAll[uid] = d;
                    }
                    else if(uid != -1) {
                        self.resultAll[uid] = d;
                    }
                }
            });
            self.pairArr = (data[0]) ? new Array(data[0].length) : [];
            self.buildRubricaBarData(data);
        });
    };

    self.buildRubricaBarData = (data) => {
        const N = 3;
        let rubnms = ["Inicio-Proceso", "Proceso-Competente", "Competente-Avanzado"];
        self.barData[0].values = [];
        for (let i = 0; i < N; i++) {
            let lbl = (i + 1) + " - " + (i + 2) + " (" + rubnms[i] + ")";
            self.barData[0].values.push({label: lbl, value: 0});
        }
        data.forEach((d) => {
            let score = d.reduce((e, v) => e + v.val, 0) / d.length;
            let rank = Math.min(Math.floor(score - 1), N - 1);
            self.barData[0].values[rank].value += 1;
        });
        self.barOpts.chart.xAxis.axisLabel = "Distribución de Puntaje (Nivel)";
    };

    self.computeDif = () => {
        if (self.result) {
            let pi = self.result.findIndex(e => self.users[e.uid].role == 'P');
            if (pi != -1) {
                let pval = self.result[pi].val;
                let difs = [];
                self.result.forEach((e, i) => {
                    if (i != pi) {
                        difs.push(Math.abs(pval - e.val));
                    }
                });
                self.buildRubricaDiffData(difs);
            }
        }
    };

    self.buildRubricaDiffData = (difs) => {
        console.log("difs", difs);
        const N = 5;
        let lblnms = ["Alto", "Medio Alto", "Medio", "Medio Bajo", "Bajo"];
        self.barData[0].values = [];
        for (let i = 0; i < N; i++) {
            // let lbl = (i * 0.5) + " - " + (i + 1) * 0.5;
            self.barData[0].values.push({label: lblnms[i], value: 0});
        }
        difs.forEach((d) => {
            let rank = Math.min(Math.floor(d * 2), N - 1);
            self.barData[0].values[rank].value += 1;
        });
        self.barOpts.chart.xAxis.axisLabel = "Cercanía a evaluación correcta";
    };

    self.getReportAuthor = (rid) => {
        if (self.reports) {
            let rep = self.reports.find(e => e.id == rid);
            return (rep) ? rep.uid : -1;
        }
        return -1;
    };

    self.getAvg = (row) => {
        if (row == null || row.length == 0) return "";
        let s = row.reduce((v, e) => v + e.val, 0);
        return s / row.length;
    };

    self.getInMax = (res) => {
        if (res == null) return [];
        let n = 0;
        for(let u in res){
            n = Math.max(n, res[u].length);
        }
        return new Array(n);
    };

    self.showReport = (rid) => {
        let postdata = {rid: rid};
        $http({url: "get-report", method: "post", data: postdata}).success((data) => {
            let modalData = {report: data, criterios: self.shared.obtainCriterios()};
            modalData.report.author = self.users[data.uid];
            let postdata = {repid: data.id};
            $http({url: "get-report-result", method: "post", data: postdata}).success((data) => {
                modalData.answers = data;
                $http.post("get-criteria-selection-by-report", postdata).success((data) => {
                    modalData.answersRubrica = {};
                    data.forEach((row) => {
                        if (modalData.answersRubrica[row.uid] == null)
                            modalData.answersRubrica[row.uid] = {};
                        modalData.answersRubrica[row.uid][row.cid] = row.selection;
                    });
                    $http.post("get-report-evaluators", postdata).success((data) => {
                        data.forEach(row => {
                            let i = modalData.answers.findIndex(e => e.uid == row.uid);
                            if(i == -1)
                                modalData.answers.push({uid: row.uid, evaluatorName: self.users[row.uid].name});
                            else
                                modalData.answers[i].evaluatorName = self.users[row.uid].name;
                        });
                        $uibModal.open({
                            templateUrl: "templ/report-details.html",
                            controller: "ReportModalController",
                            controllerAs: "vm",
                            size: "lg",
                            scope: self,
                            resolve: {
                                data: function () {
                                    return modalData;
                                },
                            }
                        });
                    });
                });
            });
        });
    };

    self.showReportByUid = (uid) => {
        console.log(uid);
        let postdata = {uid: uid, sesid: self.selectedSes.id};
        $http({url: "get-report-uid", method: "post", data: postdata}).success((data) => {
            let modalData = {report: data};
            modalData.report.author = self.users[uid];
            $uibModal.open({
                templateUrl: "templ/report-details.html",
                controller: "ReportModalController",
                controllerAs: "vm",
                scope: self,
                resolve: {
                    data: function () {
                        return modalData;
                    },
                }
            });
        });
    };

    self.broadcastReport = (rid) => {
        let postdata = {sesid: self.selectedSes.id, rid: rid};
        $http({url: "set-eval-report", method: "post", data: postdata}).success((data) => {
            Notification.success("Reporte enviado a alumnos");
        });
    };

    self.showDetailAnswer = (qid, uid, it) => {
        let opts = ["A", "B", "C", "D", "E"];
        let postdata = {uid: uid, qid: qid, iteration: it};
        $http({url: "get-selection-comment", method: "post", data: postdata}).success((data) => {
            let qs = self.questions.reduce((e,v) => (v.id == qid)? v : e, null);
            console.log(qs);
            let alt = opts[data.answer] + ". " + qs.options[data.answer];
            let qstxt = qs.content;
            $uibModal.open({
                templateUrl: "templ/content-dialog.html",
                controller: "ContentModalController",
                controllerAs: "vm",
                scope: self,
                resolve: {
                    data: function () {
                        data.title = "Respuesta de " + self.users[uid].name;
                        data.content = "Pregunta:\n" + qstxt + "\n\nRespuesta:\n" + alt + "\n\nComentario:\n" + data.comment;
                        if(data.confidence){
                            data.content += "\n\nGrado de Confianza: " + data.confidence + "%";
                        }
                        return data;
                    },
                }
            });
        });
    };

});

adpp.controller("MapSelectionModalController", function($scope, $uibModalInstance){
    var vm = this;

    vm.nav = true;
    vm.edit = false;

    vm.cancel = () => {
        $uibModalInstance.dismiss('cancel');
    };

    vm.resolve = () => {
        $uibModalInstance.close({
            nav : vm.nav,
            edit: vm.edit
        });
    };

});

adpp.controller("ReportModalController", function ($scope, $uibModalInstance, data) {
    var vm = this;
    vm.data = data;

    vm.cancel = () => {
        $uibModalInstance.dismiss('cancel');
    };

});

adpp.controller("ContentModalController", function ($scope, $uibModalInstance, data) {
    var vm = this;
    vm.data = data;

    vm.cancel = () => {
        $uibModalInstance.dismiss('cancel');
    };

});

adpp.controller("DuplicateSesModalController", function ($scope, $http, $uibModalInstance, data) {
    var vm = this;
    vm.data = data;
    vm.nses = {
        name: vm.data.name,
        tipo: vm.data.type,
        descr: vm.data.descr,
        originalSesid: vm.data.id,
        copyDocuments: false,
        copyIdeas: false,
        copyQuestions: false,
        copyRubrica: false,
        copyUsers: false,
        copySemUnits: false,
        copySemDocs: false
    };

    vm.cancel = () => {
        $uibModalInstance.dismiss('cancel');
    };

    vm.sendDuplicate = () => {
        console.log(vm.nses);
        $http({url: "duplicate-session", method: "post", data: vm.nses}).success((data) => {
            console.log(data);
            window.location.reload();
        });
    };

});

adpp.controller("GroupController", function ($scope, $http, Notification) {
    let self = $scope;
    self.methods = ["Aleatorio", "Rendimiento Homogeneo", "Rendimiento Heterogeneo", "Tipo Aprendizaje Homogeneo", "Tipo Aprendizaje Heterogeoneo"];
    self.lastI = -1;
    self.lastJ = -1;

    self.shared.verifyGroups = () => {
        self.groupNum = 3;
        self.groupMet = self.methods[0];
        self.groups = [];
        self.groupNames = [];
        if (self.selectedSes != null && self.selectedSes.grouped) {
            self.groupNum = null;
            self.groupMet = null;
            self.generateGroups(true);
        }
    };

    self.generateGroups = (key) => {
        if (self.selectedSes.grouped) {
            $http({url: "group-proposal-sel", method: "post", data: {sesid: self.selectedSes.id}}).success((data) => {
                self.groups = data;
                //self.groupsProp = angular.copy(self.groups);
                console.log(data);
                //self.groupNames = [];
            });
            return;
        }
        if (key == null && (self.groupNum < 1 || self.groupNum > self.users.length)) {
            Notification.error("Error en los parámetros de formación de grupos");
            return;
        }

        let postdata = {
            sesid: self.selectedSes.id,
            gnum: self.groupNum,
            method: self.groupMet
        };

        console.log(self.shared.alumState);
        let users = Object.values(self.users).filter(e => e.role == "A");
        console.log(users);

        if (self.groupMet == "Tipo Aprendizaje Homogeneo" || self.groupMet == "Tipo Aprendizaje Heterogeoneo") {
            self.groups = generateTeams(users, habMetric, self.groupNum, isDifferent(self.groupMet));
        }
        else if (self.groupMet == "Aleatorio") {
            let arr = users.map(e => {
                e.rnd = Math.random();
                return e;
            });
            self.groups = generateTeams(arr, s => s.rnd, self.groupNum, false);
        }
        else if (self.selectedSes.type == "S") {
            let arr = [];
            for(let uid in self.shared.alumState){
                let s = 0;
                for(let q in self.shared.alumState[uid]){
                    s += +q;
                }
                arr.push({uid: uid, score: s});
            }
            self.groups = generateTeams(arr, s => s.score, self.groupNum, isDifferent(self.groupMet));
        }
        else if (self.selectedSes.type == "L" || self.selectedSes.type == "M") {
            self.groups = generateTeams(self.shared.alumState, s => s.score, self.groupNum, isDifferent(self.groupMet));
        }

        if(self.groups != null) {
            self.groupsProp = angular.copy(self.groups);
            self.groupNames = [];
        }

        /*if (urlRequest != "") {
            $http({url: urlRequest, method: "post", data: postdata}).success((data) => {
                self.groups = data;
                self.groupsProp = angular.copy(self.groups);
                console.log(data);
                self.groupNames = [];
                /*data.forEach((d) => {
                 self.groupNames.push(d.map(i => self.users[i.uid].name).join(", "));
                 });*
            });
        }*/
    };

    self.acceptGroups = () => {
        if (self.groupsProp == null) {
            Notification.error("No hay propuesta de grupos para fijar");
            return;
        }
        let postdata = {
            sesid: self.selectedSes.id,
            groups: JSON.stringify(self.groups.map(e => e.map(f => f.uid || f.id)))
        };
        console.log(postdata);
        $http({url: "set-groups", method: "post", data: postdata}).success((data) => {
            if (data.status == "ok") {
                console.log("Groups accepted");
                self.selectedSes.grouped = true;
                self.shared.verifyGroups();
            }
        });
    };

    self.swapTable = (i, j) => {
        console.log(i, j, self.groups);
        if (self.lastI == -1 && self.lastJ == -1) {
            self.lastI = i;
            self.lastJ = j;
            return;
        }
        if (!(self.lastI == i && self.lastJ == j)) {
            let temp = angular.copy(self.groupsProp[i][j]);
            self.groupsProp[i][j] = angular.copy(self.groupsProp[self.lastI][self.lastJ]);
            self.groupsProp[self.lastI][self.lastJ] = temp;
        }
        self.lastI = -1;
        self.lastJ = -1;
    };

});

adpp.controller("RubricaController", function ($scope, $http) {
    let self = $scope;
    self.criterios = [];
    self.newCriterio = {};
    self.editable = false;
    self.exampleReports = [];
    self.newExampleReport = "";
    self.pairNum = 3;

    self.addCriterio = () => {
        self.criterios.push(self.newCriterio);
        self.newCriterio = {};
    };

    self.removeCriterio = (idx) => {
        self.criterios.splice(idx, 1);
    };

    self.checkSum = () => {
        return self.criterios.reduce((e, p) => e + p.pond, 0) == 100;
    };

    self.shared.getRubrica = () => {
        self.criterios = [];
        self.newCriterio = {};
        self.editable = false;
        let postdata = {sesid: self.selectedSes.id};
        $http({url: "get-admin-rubrica", method: "post", data: postdata}).success((data) => {
            if (data.length == 0) {
                self.editable = true;
            }
            else {
                self.criterios = data;
            }
        });
    };

    self.saveRubrica = () => {
        let postdata = {sesid: self.selectedSes.id};
        $http({url: "send-rubrica", method: "post", data: postdata}).success((data) => {
            if (data.status == "ok") {
                let rid = data.id;
                self.criterios.forEach((criterio) => {
                    let postdata = angular.copy(criterio);
                    postdata.rid = rid;
                    $http({url: "send-criteria", method: "post", data: postdata}).success((data) => {
                        if (data.status == "ok") console.log("Ok");
                    });
                });
                self.editable = false;
            }
        });
    };

    self.shared.getExampleReports = () => {
        self.exampleReports = [];
        let postdata = {sesid: self.selectedSes.id};
        $http({url: "get-example-reports", method: "post", data: postdata}).success((data) => {
            self.exampleReports = data;
        });
    };

    self.sendExampleReport = () => {
        let postdata = {
            sesid: self.selectedSes.id,
            content: self.newExampleReport.text,
            title: self.newExampleReport.title
        };
        $http({url: "send-example-report", method: "post", data: postdata}).success((data) => {
            self.newExampleReport = "";
            self.shared.getExampleReports();
        });
    };

    self.setActiveExampleReport = (rep) => {
        let postdata = {sesid: self.selectedSes.id, rid: rep.id};
        $http({url: "set-active-example-report", method: "post", data: postdata}).success((data) => {
            if (data.status == 'ok') {
                self.exampleReports.forEach(r => {
                    r.active = false;
                });
                rep.active = true;
            }
        });
    };

    self.goToReport = (rep) => {
        self.setActiveExampleReport(rep);
        window.location.href = "to-rubrica?sesid=" + self.selectedSes.id;
    };

    self.pairAssign = () => {
        let postdata = {sesid: self.selectedSes.id, rnum: +self.pairNum || 3};
        $http({url: "assign-pairs", method: "post", data: postdata}).success((data) => {
            if (data.status == "ok") {
                self.selectedSes.paired = true;
                self.errPairMsg = "";
            }
            else {
                self.errPairMsg = data.msg;
            }
        });
    };

    self.shared.obtainCriterios = () => {
        return self.criterios;
    };

});

adpp.controller("OptionsController", function ($scope, $http, Notification) {
    let self = $scope;
    self.conf = {};
    self.sesidConfig = -1;
    self.options = [{name: "Ocultar Cometarios", code:"J"}, {name: "Grados de Certeza", code:"C"}];

    self.saveConfs = () => {
        let postdata = {
            sesid: self.selectedSes.id,
            options: self.buildConfStr()
        };
        $http.post("update-ses-options", postdata).success((data) => {
            if(data.status == "ok") {
                Notification.success("Opciones actualizadas");
                self.selectedSes.options = postdata.options;
            }
        });
    };

    self.updateConf = () => {
        if(self.selectedSes.id != self.sesidConfig) {
            self.conf = {};
            let op = self.selectedSes.options || "";
            for (var i = 0; i < op.length; i++) {
                self.conf[op[i]] = true;
            }
            self.sesidConfig = self.selectedSes.id;
        }
        return true;
    };

    self.buildConfStr = () => {
        let s = "";
        for(let key in self.conf){
            if(self.conf[key])
                s += key;
        }
        return s;
    };

});

adpp.controller("DashboardRubricaController", function ($scope, $http) {
    let self = $scope;
    self.reports = [];
    self.result = [];
    self.selectedReport = null;

    self.shared.resetRubricaGraphs = () => {
        self.alumState = null;
        self.barOpts = {
            chart: {
                type: 'multiBarChart',
                height: 320,
                x: d => d.label,
                y: d => d.value,
                showControls: false,
                showValues: false,
                duration: 500,
                xAxis: {
                    showMaxMin: false
                },
                yAxis: {
                    axisLabel: 'Cantidad Alumnos'
                }
            }
        };
        self.barData = [{key: "Alumnos", color: "#ef6c00", values: []}];
        //self.updateGraph();
    };

    self.shared.resetRubricaGraphs();

});

adpp.controller("GeoAdminController", ["$scope", "$http", "NgMap", function ($scope, $http, NgMap) {

    let self = $scope;

    self.openRight = false;
    self.rightTab = "";

    self.mOverlays = [];
    self.sOverlays = [];

    self.selectedOverlay = null;

    self.overlayBuffer = [];

    let init = () => {
        self.updateOverlayList();
        self.clearOverlay();
        NgMap.getMap().then((map) => {
            console.log("MAP cargado correctamente");
            self.map = map;
            self.map.streetView.setOptions({addressControlOptions: {position: google.maps.ControlPosition.TOP_CENTER}});
            self.map.infoWindows.iw.close();
        });
    };

    let toOverlay = (data) => {
        return {
            id: data.id,
            name: data.name,
            description: data.description,
            color: getColor(data),
            type: data.type,
            fullType: getFullType(data.type),
            geom: JSON.parse(data.geom)
        };
    };

    let getColor = (data) => {
        return "blue";
    };

    let packOverlay = (overlay) => {
        return {
            name: overlay.name,
            description: overlay.description,
            iteration: 0,
            qid: (self.questions[self.selectedQs] != null) ? self.questions[self.selectedQs].id : -1,
            type: overlay.type,
            geom: JSON.stringify(overlay.geom)
        };
    };

    let getFullType = (t) => {
        switch (t){
            case "M":
                return "marker";
            case "P":
                return "polygon";
            case "L":
                return "polyline";
            case "R":
                return "rectangle";
            case "C":
                return "circle";
            case "I":
                return "image";
        }
    };

    self.shared.processMapData = (data, qid) => {
        let comps = data.split(" ");
        console.log(comps);
        self.map.setCenter(new google.maps.LatLng(+comps[1], +comps[2]));
        self.map.setZoom(+comps[3]);
        self.nav = comps[4] == "NAV";
        self.edit = comps[4] == "EDIT" || comps[5] == "EDIT";
        getPrevOverlays(qid);
        google.maps.event.trigger(self.map, "resize");
    };

    let getPrevOverlays = (qid) => {
        $http.post("list-default-overlay", {qid: qid}).success((data) => {
            let overlays = data.map(toOverlay);
            self.mOverlays = self.mOverlays.concat(overlays.filter(e => e.type == "M"));
            self.sOverlays = self.sOverlays.concat(overlays.filter(e => e.type != "M"));
        });
    };

    self.clearOverlay = () => {
        self.newOverlay = {
            name: "",
            description: "",
            color: "blue",
            type: "M",
            fullType: "marker",
            geom: {
                position: null,
                radius: null,
                center: null,
                path: null,
                bounds: null
            }
        };
    };

    self.updateOverlayList = () => {
        let postdata = {
            qid: (self.questions[self.selectedQs] != null) ? self.questions[self.selectedQs].id : -1
        };
        $http.post("list-overlay", postdata).success((data) => {
            let overlays = data.map(toOverlay);
            self.mOverlays = overlays.filter(e => e.type == "M");
            self.sOverlays = overlays.filter(e => e.type != "M");
        });
    };

    self.shared.updateOverlayList = self.updateOverlayList;

    self.onMapOverlayCompleted = (ev) => {
        self.map.mapDrawingManager[0].setDrawingMode(null);

        self.newOverlay.fullType = ev.type;
        self.newOverlay.type = (ev.type == "polyline") ? "L" : ev.type[0].toUpperCase();
        self.newOverlay.geom.position = ev.overlay.getPosition ? positionToArray(ev.overlay.getPosition()) : null;
        self.newOverlay.geom.radius = ev.overlay.radius;
        self.newOverlay.geom.center = positionToArray(ev.overlay.center);
        self.newOverlay.geom.path = ev.overlay.getPath ? mutiplePositionToArray(ev.overlay.getPath()) : null;
        self.newOverlay.geom.bounds = ev.overlay.getBounds ? boundsToArray(ev.overlay.getBounds()) : null;

        self.newOverlay.centroid = centroidAsLatLng(self.newOverlay.type, self.newOverlay.geom);
        self.map.showInfoWindow("iw2");

        ev.overlay.setMap(null);
    };

    self.colorizeShape = (col) => {
        if(self.map.shapes && self.map.shapes.nshp) {
            self.map.shapes.nshp.set("fillColor", col);
            self.map.shapes.nshp.set("strokeColor", "dark"+col);
        }
    };

    self.closeOverlay = () => {
        self.clearOverlay();
        self.map.infoWindows.iw2.close();
    };

    let updateOverlay =  () => {
        let ov = (self.newOverlay.type == "M")? self.map.markers.nmkr : self.map.shapes.nshp;
        self.newOverlay.geom.position = ov.getPosition ? positionToArray(ov.getPosition()) : null;
        self.newOverlay.geom.radius = ov.radius;
        self.newOverlay.geom.center = positionToArray(ov.center);
        self.newOverlay.geom.path = ov.getPath ? mutiplePositionToArray(ov.getPath()) : null;
        self.newOverlay.geom.bounds = ov.getBounds ? boundsToArray(ov.getBounds()) : null;
        self.newOverlay.centroid = centroidAsLatLng(self.newOverlay.type, self.newOverlay.geom);
        //self.map.showInfoWindow("iw2");
    };

    self.sendOverlay = () => {
        updateOverlay();
        self.overlayBuffer.push(packOverlay(self.newOverlay));
        console.log(self.overlayBuffer);
        if(self.newOverlay.type == "M") {
            self.mOverlays.push(self.newOverlay);
        }
        else {
            self.sOverlays.push(self.newOverlay);
        }
        self.closeOverlay();
    };

    self.shared.clearOverlayBuffer = () => {
        self.mOverlays = [];
        self.sOverlays = [];
        self.overlayBuffer = [];
    };

    self.shared.sendOverlayBuffer = (id) => {
        console.log(id, self.overlayBuffer);
        self.overlayBuffer.forEach((ov) => {
            ov.qid = id;
            $http.post("add-overlay", ov).success((data) => {
                console.log("OK");
            });
        });
    };

    self.clickOverlay = function(event){
        self.selectOverlay(this.id);
    };

    self.selectOverlay = (id) => {
        self.selectedOverlay = self.mOverlays.find(e => e.id == id) || self.sOverlays.find(e => e.id == id);
        self.selectedOverlay.centroid = centroidAsLatLng(self.selectedOverlay.type, self.selectedOverlay.geom);
        self.map.panTo(self.selectedOverlay.centroid);
        self.map.showInfoWindow("iw");
    };

    self.googleSearch = function(){
        let p = this.getPlace();
        if(p == null || p.geometry == null || p.geometry.location == null)
            return;

        self.map.mapDrawingManager[0].setDrawingMode(null);
        self.newOverlay.fullType = "marker";
        self.newOverlay.type = "M";
        self.newOverlay.geom.position = positionToArray(p.geometry.location);
        self.newOverlay.centroid = centroidAsLatLng(self.newOverlay.type, self.newOverlay.geom);

        self.map.showInfoWindow("iw2");
        self.map.panTo(p.geometry.location);
    };


    self.shared.getPluginMapOptions = () => {
        return {
            nav: self.nav,
            edit: self.edit
        };
    };

    self.shared.getActiveMap = () => {
        return self.map;
    };

    init();

}]);

adpp.filter('htmlExtractText', function() {
    return function(text) {
        return  text ? String(text).replace(/<[^>]+>/gm, '') : '';
    };
});

adpp.filter('lang', function(){
    filt.$stateful = true;
    return filt;

    function filt(label){
        if(window.DIC[label])
            return window.DIC[label];
        if(!window.warnDIC[label]) {
            console.warn("Cannot find translation for ", label);
            window.warnDIC[label] = true;
        }
        return label;
    }
});

let generateTeams = (alumArr, scFun, n, different) => {
    if(n == null || n == 0) return [];
    let arr = alumArr;
    arr.sort((a, b) => scFun(b) - scFun(a));
    let groups = [];
    let numGroups = alumArr.length / n;
    for (let i = 0; i < numGroups; i++) {
        if (different) {
            let rnd = [];
            let offset = arr.length / n;
            for (let j = 0; j < n; j++)
                rnd.push(~~(Math.random() * offset + offset * j));
            groups.push(arr.filter((a, i) => rnd.includes(i)));
            arr = arr.filter((a, i) => !rnd.includes(i));
        }
        else{
            groups.push(arr.filter((a, i) => i < n));
            arr = arr.filter((a, i) => i >= n);
        }
    }
    let final_groups = [];
    let ov = 0;
    for(let i = 0; i < groups.length; i++){
        if(groups[i].length > 1 || final_groups.length == 0)
            final_groups.push(groups[i]);
        else {
            final_groups[ov % final_groups.length].push(groups[i][0]);
            ov++;
        }
    }
    return final_groups;
};

let isDifferent = (type) => {
    switch (type){
        case "Rendimiento Homogeneo":
            return false;
        case "Rendimiento Heterogeneo":
            return true;
        case "Tipo Aprendizaje Homogeneo":
            return false;
        case "Tipo Aprendizaje Heterogeoneo":
            return true;
    }
    return false;
};

let habMetric = (u) => {
    switch (u.aprendizaje){
        case "Teorico":
            return -2;
        case "Reflexivo":
            return -1;
        case "Activo":
            return 1;
        case "Pragmatico":
            return 2;
    }
    return 0;
};

let quillMapHandler = function(){
    alert("Mapa sólo disponible para preguntas");
};

let positionToArray = (pos) => {
    if (pos == null)
        return null;
    return [pos.lat(), pos.lng()];
};

let mutiplePositionToArray = (mpos) => {
    let r = [];
    for (let i = 0; i < mpos.getLength(); i++) {
        let pos = mpos.getAt(i);
        r.push(positionToArray(pos));
    }
    return r;
};

let boundsToArray = (bounds) => {
    return [positionToArray(bounds.getSouthWest()), positionToArray(bounds.getNorthEast())];
};

let avgCoord = (arr) => {
    let slat = 0;
    let slng = 0;
    for (let i = 0; i < arr.length; i++) {
        slat += arr[i][0];
        slng += arr[i][1];
    }
    return [slat/arr.length, slng/arr.length];
};

let centroidAsLatLng = (type, geom) => {
    let c = centroid(type, geom);
    return new google.maps.LatLng(c[0], c[1]);
};

let centroid = (type, geom) => {
    if(type == "M")
        return geom.position;
    if(type == "C")
        return geom.center;
    if(type == "R")
        return avgCoord(geom.bounds);
    if(type == "P" || type == "L")
        return avgCoord(geom.path);
    return null;
};
