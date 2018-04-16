"use strict";

var app = angular.module("Editor", ['ui.bootstrap','ui.tree', 'btford.socket-io', "timer", "ui-notification", "rzModule", "xeditable"]);

app.factory("$socket", ["socketFactory", function (socketFactory) {
    return socketFactory();
}]);

app.controller("EditorController", ["$scope", "$http", "$timeout", "$socket", "Notification", "$uibModal", function ($scope, $http, $timeout, $socket, Notification, $uibModal) {
    let self = $scope;

    self.iteration = 0;
    self.user_information = {};
    self.myUid = -1;
    self.quantityUsersInGroup = 0;
    self.finalResponseFinished = 0;
    self.documents = [];
    self.selections = [];
    self.selectedDocument = 0;
    self.numPages = 0;
    self.ansIter1 = {};
    self.ansIter2 = {};
    self.sideTab = 0;
    self.docIdx = {};
    self.writingReport = false;
    self.followLeader = false;
    self.leader = false;
    self.finished = false;
    self.teamId = -1;
    self.currentTeam = null;
    self.reportIdeas = {};
    self.shared = {};
    self.Tasks = [];
    self.anonymousTasks = [];
    self.evaluationPersonal = [];
    self.semanticFilterInGroup = [];
    self.personalEvaluationByUser = null;
    self.personalEvaluationBySession = [];
    self.avgByGroup = [];
    self.promGroup = [];
    self.waiting_partners = false;
    self.times_waiting = 0;
    self.final_response = false;
    self.current_leader = null;
    self.personalEvaluationFirstIteration = [];
    self.personalEvaluationByGroup = [];
    self.firstIterationComment = [];
    self.secondIterationComment = [];
    self.countFirstIteration = null;
    self.countSecondIteration = null;
    self.userIterationStatus = []
    self.finishTheFirstTime = false;
    self.finishTheSecondTime = false;
    self.firstIterationCommentForLeader = [];
    self.secondIterationCommentForLeader = [];
    self.leaderTasksSecondIteration = [];
    self.leaderTasksThirdIteration = [];
    self.personalEvaluationSecondIteration = [];
    self.personalEvaluationThirdIteration = [];
    self.countEvaluationSecondIteration = 0;
    self.option_first_time = ["Enviar a compañeros", "Respuesta final"];
    self.option_second_time = ["Respuesta final"];
    self.final_response_value = '';
    self.anonymous_semantic_discussion = [];
    self.discussion_personal = [];
    self.personalIterationLast = [];
    self.user_is_done = false;
    self.current_iteration_by_team = 0;
    self.current_final_response_by_team = false;
    self.current_waiting_partners_by_team = false;

    $scope.slider = {
        value: 50,
        options: {
          floor: 0,
          ceil: 100,
          step: 1,
          minLimit: 10,
          maxLimit: 90
        }
    };

    self.finishGroupTask = (response, sesid) => {
        if(response == 'de_acuerdo') {
            self.setFinalResponseByUser(sesid, response)
        } else if (response == 'parcialmente_de_acuerdo') {
            self.setFinalResponseByUser(sesid, response)
        } else if (response == 'no_de_acuerdo') {
            self.setFinalResponseByUser(sesid, response)
        } else {

        }
    }

    self.ngShowAnswer = true;
    self.ngShowReading = false;
    self.ngShowhideFun = function(flag) {
        if (flag == 'answers') {
            self.ngShowAnswer = true;
            self.ngShowReading = false;
        } else {
            self.ngShowAnswer = false;
            self.ngShowReading = true;
        }
    };

    self.openNewSes = () => {
        $uibModal.open({
            templateUrl: "templ/modal-information-reading.html",
            controller: 'EditorController'
        });
    };

    self.createPersonalEvaluation = (ses_id, user_id) => {
        if (self.evaluationPersonal.length == 1) {
            Notification.error('Ya existen el máximo de evaluaciones personales (1)')
        } else {
            Notification.success('Evaluación personal creada')
            $http({url: 'create-personal-evaluation', method: 'POST', data: {ses_id: ses_id, user_id: user_id, team_id: self.currentTeam[0].id}}).success((response) => {
                self.LoadEvaluationPersonal(ses_id, user_id)
            })
        }
    }

    self.setFinalResponseByUser = (ses_id, response_value) => {
        $http({url: 'final_response_by_user', method: 'post', data: {ses_id: ses_id, team_id: self.currentTeam[0].id, response_value: response_value}}).success((response) => {
            self.user_is_done = true;
        })
    }

    self.finishGroupTaskResponse = () => {
        $http({url: '/finish_group_task_response', method: 'post'}).then((response) => {
            
        })
    }

    self.LoadEvaluationPersonal = (ses_id, user_id) => {
        self.evaluationPersonal = [];
        $http({url: '/all_personal_evaluations', method: 'POST', data: {ses_id: ses_id, user_id: user_id}}).then(function(response) {
            self.evaluationPersonal = response.data;
        })
    }

    self.removeEvaluationPersonal = (index,sesId) => {
        $http({url: 'remove_personal_evaluations', method: 'POST', data: index}).then((response) => {
            self.LoadEvaluationPersonal(sesId, self.myUid);
            Notification.success('Evaluacion personal eliminada eliminado')
        });
    }

    self.updateEvaluationPersonal = (position) => {
        let actualSemantic = self.evaluationPersonal[position]
        $http({url: '/update_personal_evaluations', method: 'POST', data: {data: actualSemantic, id: actualSemantic.id }}).then((response) => {

        })
    }

    self.processItemPersonal = function(sliderId, modelValue) {
        self.updateEvaluationPersonal(sliderId)
    }

    self.iterationNames = ["Lectura", "Individual", "Grupal Anónimo", "Grupal"];
    self.sesStatusses = ["Lectura", "Individual", "Anónimo", "Grupal", "Discusión"];

    self.tabOptions = ["Actual"];

    rangy.init();
    self.applier = rangy.createClassApplier("highlight");
    self.secondaryApplier = rangy.createClassApplier("highlight-secondary");

    self.init = () => {    
        self.getSesInfo();
        $socket.on("stateChange", (data) => {
            console.log("SOCKET.IO", data);
            if(data.ses == self.sesId){
                window.location.reload();
            }
        });
        $socket.on("updateTeam", (data) => {
             if(self.teamId == data.tmid){
                 if(!self.leader) {
                     self.getIdeas();
                 }
                 self.getTeamInfo();
             }
        });
        $socket.on("updateWaiting", (data) => {
            console.log("SOCKET.IO", data);
            self.getCurrentStatus(data);
        });
        $socket.on("updateUserIteration", (data) => {
            console.log("SOCKET.IO", data);
            self.getUserStatus(data);
        });
    };
    
    self.select_session_users = (ses, leader) => {
        $http({url: 'select-all-users-group', method: 'post', data: {ses: ses, leader: leader}}).success((data) => {
            self.iterationUsers = data.map((u,v) => ({id: u.id, name: u.name, position: v+1}))
        })
    }

    self.select_semantic_by_users_and_group = (user_id,session_id) => {
        $http({url: 'select-semantic-by-users-and-group', method: 'post', data: {user_id: user_id, session_id: session_id}}).success((data) => {
            self.semanticFilterInGroup = data
        })
        $http({url: 'select_personal_evaluation_by_user', method: 'post', data: {user_id: user_id, session_id: session_id}}).success((data) => {
            self.personalEvaluationByUser = data
        })
    }

    self.getSesInfo = () => {
        $http({url: "get-ses-info", method: "post"}).success((data) => {
            self.iteration = data.iteration;
            self.myUid = data.uid;
            self.sesName = data.name;
            self.sesId = data.id;
            self.sesDescr = data.descr;
            self.sesSTime = (data.stime != null) ? new Date(data.stime) : null;
            self.final_response = data.final_response
            self.waiting_partners = data.waiting_partners
            self.times_waiting = data.times_waiting
            $http({url: "get-documents", method: "post"}).success((data) => {
                self.documents = data;
                data.forEach((doc,i) => {
                    self.docIdx[doc.id] = i;
                });
                self.renderAll();
            });
            $http({url: '/status_team', method: 'post', data: self.sesId}).success((response) => {
                if(response) {
                    self.current_iteration_by_team = response[0].iteration
                    self.current_final_response_by_team = response[0].final_response
                    self.current_waiting_partners_by_team = response[0].waiting_partners
                }
            })
            $http({url: "data/instructions.json", method: "get"}).success((data) => {
                self.instructions = data;
            });
            if (self.iteration == 3){
                self.getTeamInfo();
            }
            if(self.iteration >= 5){
                self.finished = true;
            }
            $http({url: '/get_user_information', method: 'GET'}).then((response) => {
                self.user_information = response.data
            })
            $http({url: "get-finished", method: "post", data: {status: self.iteration + 2}}).success((data) => {
                if (data.finished) {
                    self.finished = true;
                }
            });
            $http({url: '/all_semantic_differential_user', method: 'POST', data: {id: self.sesId}}).then(function(response) {
                self.Tasks = response.data;
            }).finally(function () {
                self.IsProcessing = false;
            })
            $http({url: '/all_anonymous_semantic_differential_user', method: 'POST', data: {id: self.sesId}}).then(function(response) {
                self.anonymousTasks = response.data;
            }).finally(function () {
                self.IsProcessing = false;
            })
            $http({url: '/get_current_leader', method: 'post', data: {session_id: self.sesId}}).then((response) => {
                self.current_leader = response.data.length > 0 ? response.data[0].leader : false
            }).then(() => {
                self.select_session_users(self.sesId, self.current_leader)
                $http({url: '/all_semantic_by_leader_first_iteration', method: 'POST', data: {id: self.sesId, leader_id: self.current_leader}}).then((response) => {
                    self.leaderTasks = response.data
                })
                $http({url: '/all_semantic_by_leader_second_iteration', method: 'POST', data: {id: self.sesId, leader_id: self.current_leader}}).then((response) => {
                    self.leaderTasksSecondIteration = response.data
                })
                $http({url: '/all_semantic_by_leader_third_iteration', method: 'POST', data: {id: self.sesId, leader_id: self.current_leader}}).then((response) => {
                    self.leaderTasksThirdIteration = response.data
                })
                $http({url: '/all_personal_iteration_by_leader_third_iteration', method: 'POST', data: {id: self.sesId, leader_id: self.current_leader}}).then((response) => {
                    self.personalIterationLast = response.data
                })
            })
            $http({url: '/personal_evaluations_by_ses', method: 'post', data: {id: self.sesId}}).then((response) => {
                self.personalEvaluationBySession = response.data;
            });
            $http({url: '/get_final_response_user', method: 'post', data: {id: self.sesId}}).then((response) => {
                if (response.data.length > 0) {
                    self.user_is_done = true;
                }
            });
            $http({url: '/personal_evaluations_first_iteration_by_group', method: 'post', data: {id: self.sesId}}).then((response) => {
                self.personalEvaluationFirstIteration = response.data
            });
            $http({url: '/personal_evaluations_second_iteration_by_group', method: 'post', data: {id: self.sesId}}).then((response) => {
                self.personalEvaluationSecondIteration = response.data
            })
            $http({url: '/personal_evaluations_third_iteration_by_group', method: 'post', data: {id: self.sesId}}).then((response) => {
                self.personalEvaluationThirdIteration = response.data
            })
            $http({url: '/get_quantity_by_group', method: 'post', data: self.sesId}).then((response) => {
                self.quantityUsersInGroup = parseInt(response.data.cantidad);
            })
            $http({url: '/get_quantity_finished_by_group', method: 'post', data: self.sesId}).then((response) => {
                self.finalResponseFinished = parseInt(response.data.length) || 0;
            })
            $http({url: '/personal_evaluations_by_group', method: 'post', data: {id: self.sesId}}).then((response) => {
                self.personalEvaluationByGroup = response.data
            })
            $http({url: 'select-anonymous-semantic-by-group', method: 'post', data: {id: self.sesId}}).then((response) => {
                self.avgByGroup = response.data
            })
            $http({url: 'select-prom-by-group', method: 'post', data: {id: self.sesId}}).then((response) => {
                self.promGroup = response.data
            })
            $http({url: '/select-first-iteration-comment-array', method: 'post', data: {id: self.sesId}}).then((response) => {
                self.firstIterationComment = response.data[0]
            })
            $http({url: '/select-second-iteration-comment-array', method: 'post', data: {id: self.sesId}}).then((response) => {
                self.secondIterationComment = response.data[0]
            })
            $http({url: '/discussion_anonymous_semantic', method: 'post', data: self.sesId}).then((response) => {
                self.anonymous_semantic_discussion = response.data
            })
            $http({url: '/discussion_personal', method: 'post', data: self.sesId}).then((response) => {
                self.discussion_personal = response.data
            })
            $http({url: '/current_team', method: 'post', data: self.sesId}).then((response) => {
                self.currentTeam = response.data
                self.getUserStatus({ses: self.sesId})
            })
            self.LoadEvaluationPersonal(self.sesId, self.myUid)
        });
    };

    self.updateFirstIterationComment = (id, comment) => {
        $http({url: '/update_first_iteration_comment', method: 'post', data: {id: id, comment: comment}}).then((response) => {

        })
    }

    self.updateSecondIterationComment = (id, comment) => {
        $http({url: '/update_second_iteration_comment', method: 'post', data: {id: id, comment: comment}}).then((response) => {

        })
    }

    self.updateSemanticDifferentialUser = (position) => {
        let actualSemantic = self.Tasks[position]
        $http({url: '/update_semantic_differential_user', method: 'POST', data: {data: actualSemantic, id: actualSemantic.id }}).then((response) => {

        })
    }

    self.processItem = function(sliderId, modelValue) {
        self.updateSemanticDifferentialUser(sliderId)
    }

    self.updateSecondIterationPersonalEvaluation = (position) => {
        let actualSemantic = self.personalEvaluationSecondIteration[position]
        $http({url: '/update_second_iteration_personal_evaluation', method: 'POST', data: {data: actualSemantic, id: actualSemantic.id }}).then((response) => {

        })
    }

    self.processItemSecondIterationPersonalEvaluation = function(sliderId, modelValue) {
        self.updateSecondIterationPersonalEvaluation(sliderId)
    }

    self.updateThirdIterationPersonalEvaluation = (position) => {
        let actualSemantic = self.personalEvaluationThirdIteration[position]
        $http({url: '/update_third_iteration_personal_evaluation', method: 'POST', data: {data: actualSemantic, id: actualSemantic.id }}).then((response) => {

        })
    }

    self.processItemThirdIterationPersonalEvaluation = function(sliderId, modelValue) {
        self.updateThirdIterationPersonalEvaluation(sliderId)
    }

    self.updateSemanticDifferentialFirstIteration = (position) => {
        let actualSemantic = self.leaderTasks[position]
        $http({url: '/update_semantic_differential_first_iteration', method: 'POST', data: {data: actualSemantic, id: actualSemantic.id }}).then((response) => {

        })
    }

    self.processItemFirstIteration = function(sliderId, modelValue) {
        self.updateSemanticDifferentialFirstIteration(sliderId)
    }

    self.updateSemanticDifferentialSecondIteration = (position) => {
        let actualSemantic = self.leaderTasksSecondIteration[position]
        $http({url: '/update_semantic_differential_second_iteration', method: 'POST', data: {data: actualSemantic, id: actualSemantic.id }}).then((response) => {

        })
    }

    self.processItemSecondIteration = function(sliderId, modelValue) {
        self.updateSemanticDifferentialSecondIteration(sliderId)
    }

    self.updateSemanticDifferentialThirdIteration = (position) => {
        let actualSemantic = self.leaderTasksThirdIteration[position]
        $http({url: '/update_semantic_differential_third_iteration', method: 'POST', data: {data: actualSemantic, id: actualSemantic.id }}).then((response) => {

        })
    }

    self.processItemThirdIteration = function(sliderId, modelValue) {
        self.updateSemanticDifferentialThirdIteration(sliderId)
    }

    self.updateAnonymousSemanticDifferentialUser = (position) => {
        let actualAnonymousSemantic = self.anonymousTasks[position]
        $http({url: '/update_anonymous_semantic_differential_user', method: 'POST', data: {data: actualAnonymousSemantic, id: actualAnonymousSemantic.id}}).then((response) => {

        })
    }

    self.processItemAnonymous = (sliderId, modelValue) => {
        self.updateAnonymousSemanticDifferentialUser(sliderId)
    }

    self.sendToPartners = (sesid) => {
        $http({url: '/update_session_on_team_task', method: 'post', data: sesid}).success((response) => {
            $http({url: '/select_session_on_team_task', method: 'post', data: sesid}).success((response) => {
                self.waiting_partners = response.waiting_partners
                self.times_waiting = response.times_waiting
                self.final_response = response.final_response
            })
            $http({url: '/select-first-iteration-comment', method: 'post', data: sesid}).success((response) => {

            })
            $http({url: '/select-times-between-iterations', method: 'post', data: sesid}).success((response) => {

            })

            $http({url: '/insert_values_to_second_iteration', method: 'post', data: sesid}).then((response) => {

            })

            $http({url: '/first_iteration_on_team', method: 'post', data: sesid}).then((response) => {

            })
        });
    }

    self.updateThisThing = (result, sesid) => {
        if(result == "Enviar a compañeros"){
            $http({url: '/update_session_on_team_task_second_time', method: 'post', data: sesid}).then((response) => {
                $http({url: '/select_session_on_team_task', method: 'post', data: sesid}).success((response) => {
                    self.waiting_partners = response.waiting_partners
                    self.times_waiting = response.times_waiting
                    self.final_response = response.final_response
                })
                $http({url: '/select-second-iteration-comment', method: 'post', data: sesid}).success((response) => {

                })

                $http({url: '/insert_values_to_third_iteration', method: 'post', data: sesid}).then((response) => {

                })

                $http({url: '/second_iteration_on_team', method: 'post', data: sesid}).then((response) => {
                
                })

            })
        } else if (result == "Respuesta final") {
            $http({url: '/update_session_on_team_task_final_response', method: 'post', data: sesid}).then((response) => {
                $http({url: '/select_session_on_team_task', method: 'post', data: sesid}).success((response) => {
                    self.waiting_partners = response.waiting_partners
                    self.times_waiting = response.times_waiting
                    self.final_response = response.final_response
                })
            })
        } else {

        }
    }

    self.sendFirstCommentary = (sesid) => {
        $http({url: '/send_first_commentary', method: 'post', data: sesid}).then((response) => {

        })
    }

    self.sendSecondCommentary = (sesid) => {
        $http({url: '/send_second_commentary', method: 'post', data: sesid}).then((response) => {

        })
    }

    self.getCurrentStatus = (sesid) => {
        $http({url: '/select_session_on_team_task', method: 'post', data: sesid.ses}).success((response) => {
            self.waiting_partners = response.waiting_partners
            self.times_waiting = response.times_waiting
            self.final_response = response.final_response
        })
        $http({url: '/status_team', method: 'post', data: sesid.ses}).success((response) => {
            if(response) {
                self.current_iteration_by_team = response[0].iteration;
                self.current_final_response_by_team = response[0].final_response;
                self.current_waiting_partners_by_team = response[0].waiting_partners;
            }
        })
    }

    self.getUserStatus = (sesid) => {
        $http({url: '/all_semantic_by_leader_second_iteration', method: 'POST', data: {id: self.sesId, leader_id: self.current_leader}}).then((response) => {
            self.leaderTasksSecondIteration = response.data
        })
        $http({url: '/get_user_status_by_group', method: 'post', data: self.currentTeam.length > 0 ? self.currentTeam[0].id : 0}).then((response) => {
            self.userIterationStatus = response.data
            let count = 0
            response.data.map(function(usr){
                if(usr.first_time == true){
                    count += 1
                }
            })
            if(count == response.data.length && count != 0){
                self.finishTheFirstTime = true
                $http({url: '/first_iteration_comments_by_group', method: 'post', data: sesid.ses}).then((response) => {
                    self.firstIterationCommentForLeader = response.data
                })

                $http({url: '/personal_evaluations_second_iteration_by_group', method: 'post', data: {id: self.sesId}}).then((response) => {
                    var arr = []
                    arr.push(self.countEvaluationSecondIteration = response.data.length)
                    arr.push(self.sesId)
                    return arr
                }).then((response) => {
                    if (response[0] == 0){
                        $http({url: 'select-second-iteration-personal-evaluation', method: 'post', data: response[1]}).then((response) => {

                        })
                    }
                })
            }
        })

        $http({url: '/get_quantity_by_group', method: 'post', data: self.sesId}).then((response) => {
            self.quantityUsersInGroup = parseInt(response.data.cantidad);
        })
        $http({url: '/get_quantity_finished_by_group', method: 'post', data: self.sesId}).then((response) => {
            self.finalResponseFinished = parseInt(response.data.length) || 0;
        })
        
        $http({url: '/get_user_status_by_group', method: 'post', data: self.currentTeam.length > 0 ? self.currentTeam[0].id : 0}).then((response) => {
            self.userIterationStatus = response.data
            let count = 0
            response.data.map(function(usr){
                if(usr.second_time == true){
                    count += 1
                }
            })
            if(count == response.data.length && count != 0){
                self.finishTheSecondTime = true
                $http({url: '/second_iteration_comments_by_group', method: 'post', data: sesid.ses}).then((response) => {
                    self.secondIterationCommentForLeader = response.data
                })

                $http({url: '/personal_evaluations_third_iteration_by_group', method: 'post', data: {id: self.sesId}}).then((response) => {
                    var arr = []
                    arr.push(self.countEvaluationSecondIteration = response.data.length)
                    arr.push(self.sesId)
                    return arr
                }).then((response) => {
                    if (response[0] == 0){
                        $http({url: 'select-third-iteration-personal-evaluation', method: 'post', data: response[1]}).then((response) => {

                        })
                    }
                })
            }
        })
    }

    self.finishState = () => {
        if(self.iteration == 0){
            let postdata = {status: self.iteration + 2};
            $http({url: "record-finish", method: "post", data: postdata}).success((data) => {
                self.hasFinished = true;
                self.finished = true;
                console.log("FINISH");
            });
            return;
        }
        if(self.finished){
            return;
        }
        if(self.selections.length < self.documents.length){
            //Notification.error("No hay suficientes ideas fuerza para terminar la actividad");
            //return;
        }
        if(!self.areAllIdeasSync()) {
            //Notification.error("Hay ideas fuerza que no han sido enviadas");
            //return;
        }
        let confirm = window.confirm("¿Estás listo realmente?\nSi envías tu respuesta, no tendrás posibilidad de hacer máscambios");
        if(confirm) {
            self.setSelOrder();
            let postdata = {status: self.iteration + 2};
            $http({url: "record-finish", method: "post", data: postdata}).success((data) => {
                self.hasFinished = true;
                self.finished = true;
                console.log("FINISH");
            });
        }
    };

    self.areAllIdeasSync = () => {
        for(let i = 0; i < self.selections.length; i++){
            let idea = self.selections[i];
            if(idea.status == "unsaved" || idea.status == "dirty")
                return false;
        }
        return true;
    };

    self.getTeamInfo = () => {
        $http({url: "get-team-leader", method: "post"}).success((data) => {
            self.teamId = data.id;
            self.originalLeader = data.original_leader;
            if(data.leader == self.myUid){
                self.leader = true;
                self.followLeader = false;
            }
            else{
                self.leader = false;
                self.followLeader = true;
            }
        });
        $http({url: "get-team", method: "post"}).success((data) => {
            self.teamstr = data.map(e => e.name + ((e.finished)? " ✓" : "")).join(", ");
        });
    };

    self.setTab = (idx) => {
        self.sideTab = idx;
    };

    self.selectText = () => {
        let selection = window.getSelection();
        let serial = rangy.serializeSelection(window, true, $("#pdf-canvas-" + self.selectedDocument)[0]);
        let textDef = {
            text: selection.toString(),
            length: selection.toString().length,
            serial: serial,
            document: self.selectedDocument,
            comment: "",
            expanded: true,
            status: "unsaved"
        };
        if (textDef.length > 50){
            Notification.warning("El texto es muy largo para ser usado como una idea fuerza");
            return;
        }
        if (textDef.length < 2){
            Notification.warning("No ha seleccionado un texto para ser usado como una idea fuerza");
            return;
        }
        self.highlightSerial(textDef.serial, textDef.document);
        self.selections.push(textDef);
    };

    self.goToSerial = (text, index, hcls) => {
        hcls = (hcls == null)? ".highlight" : hcls;
        self.selectedDocument = index;
        let highs = angular.element(hcls);
        highs = highs.filter((i,e) => e.innerHTML == text);
        console.log(highs);
        if (highs.length > 0){
            $timeout(() => highs[0].scrollIntoView(),100);
        }
    };

    self.highlightSerial = (serial, index, applier) => {
        console.log(serial,index);
        applier = (applier == null) ? self.applier : applier;
        try{
            applier.applyToRange(rangy.deserializeRange(serial, $("#pdf-canvas-" + index)[0], document));
        }
        catch (err){
            console.log(serial + " no se pudo highlightear!", err);
        }
    };

    self.unhighlightSerial = (serial, index, applier) => {
        console.log("TODO");
    };

    self.renderAll = () => {
        self.numPages = 0;
        self.documents.forEach((doc, idx) => {
            loadPdf(doc.path, idx);
        });
    };

    self.selectPDF = (idx) => {
        self.selectedDocument = idx;
    };

    self.getIdeas = () => {
        let postdata = {iteration: Math.min(3,self.iteration)};
        let url = (postdata.iteration == 3)? "get-team-sync-ideas" : "get-ideas";
        $http({url: url, method: "post", data: postdata}).success((data) => {
            self.selections = [];
            data.forEach((idea) => {
                let textDef = {
                    id: idea.id,
                    text: idea.content,
                    serial: idea.serial,
                    document: arrayIndexOfId(self.documents, idea.docid),
                    comment: idea.descr,
                    expanded: false,
                    status: "saved"
                };
                self.highlightSerial(textDef.serial, textDef.document);
                self.selections.push(textDef);
            });
        });
        if(self.iteration > 1) {
            self.tabOptions = [{name:"Individual", idx:1},{name: "Reelaboración Anónima", idx: 0}];
            $http({url: "get-team-ideas", method: "post", data: {iteration: 1}}).success((data) => {
                self.ansIter1 = {};
                data.forEach((ans) => {
                    self.ansIter1[ans.uid] = self.ansIter1[ans.uid] || [];
                    self.ansIter1[ans.uid].push(ans);
                    self.highlightSerial(ans.serial, self.docIdx[ans.docid], self.secondaryApplier);
                });
            });
        }
        if(self.iteration > 2) {
            self.tabOptions = [{name:"Individual", idx:1},{name: "Reelaboración Anónima", idx: 2},{name: "Reelaboración Grupal", idx: 0}];
            $http({url: "get-team-ideas", method: "post", data: {iteration: 2}}).success((data) => {
                self.ansIter2 = {};
                data.forEach((ans) => {
                    self.ansIter2[ans.uid] = self.ansIter2[ans.uid] || [];
                    self.ansIter2[ans.uid].push(ans);
                    self.highlightSerial(ans.serial, self.docIdx[ans.docid], self.secondaryApplier);
                });
            });
        }
        if(self.iteration == 4){
            self.writingReport = true;
        }
        else if(self.iteration == 5){
            //window.location.replace("rubrica");
        }
    };

    self.sendIdea = (sel) => {
        if(self.iteration == 3 && !self.leader) return;
        let postdata = {
            text: sel.text,
            comment: sel.comment,
            serial: sel.serial,
            docid: self.documents[sel.document].id,
            iteration: self.iteration,
            uidoriginal: self.originalLeader,
        };
        if (sel.status == "unsaved") {
            let url = (self.iteration == 3)? "send-team-idea" : "send-idea";
            $http({url: url, method: "post", data: postdata}).success((data) => {
                if (data.status == "ok") {
                    sel.expanded = false;
                    sel.status = "saved";
                    sel.id = data.id;
                }
                if(self.iteration == 3)
                    self.updateSignal();
            });
        }
        else if (sel.status == "dirty" && sel.id != null) {
            postdata.id = sel.id;
            $http({url: "update-idea", method: "post", data: postdata}).success((data) => {
                if (data.status == "ok") {
                    sel.expanded = false;
                    sel.status = "saved";
                }
                if(self.iteration == 3)
                    self.updateSignal();
            });
        }
    };

    self.updateSignal = () => {
        $http({url: "update-my-team", method:"post"}).success((data) => {
            console.log("Team updated");
            // self.selection = selcop;
        });
    };

    self.deleteIdea = (sel, index) => {
        if (sel.id != null) {
            let postadata = {id: sel.id};
            $http({url: "delete-idea", method: "post", data: postadata}).success((data) => {
                if(data.status == "ok") {
                    self.selections.splice(index, 1);
                    self.unhighlightSerial(sel.serial, self.docIdx[sel.docid]);
                }
                self.updateSignal();
            });
        }
        else{
            self.selections.splice(index, 1);
            self.unhighlightSerial(sel.serial, self.docIdx[sel.docid]);
        }
        self.uncopyAllIdeas();
    };

    self.copyIdea = (sel) => {
        console.log(sel);
        if(sel == null || (sel.copied != null && sel.copied) || self.selections.length >= 3*self.documents.length) return;
        let textDef = {
            text: sel.content,
            length: sel.content.length,
            serial: sel.serial,
            document: self.docIdx[sel.docid],
            comment: sel.descr,
            expanded: true,
            status: "unsaved"
        };
        self.selections.push(textDef);
        sel.copied = true;
        //sel.expanded = false;
        //self.setTab(0);
    };

    self.takeControl = () => {
        $http({url: "take-team-control", method: "post"}).success((data) => {
            console.log("Control given");
            self.updateSignal();
        });
    };

    self.selTextChange = (sel) => {
        sel.status = (sel.status == 'saved') ? 'dirty' : sel.status;
    };

    self.checkAllSync = () => {
        return self.selections.filter(e => e.status != "saved").length == 0;
    };

    self.setSelOrder = () => {
        if (!self.checkAllSync()){
            Notification.warning("Hay ideas que no han sido enviadas.");
            return;
        }
        let order = self.selections.map(e => e.id);
        let postdata = {orden: order};
        $http({url: "set-ideas-orden", method: "post", data: postdata}).success((data) => {
            if (data.status == "ok") {
                console.log("Order saved");
            }
        });
    };

    self.uncopyAllIdeas = () => {
        if(self.ansIter1 != null) {
            for (let u in self.ansIter1) {
                self.ansIter1[u].forEach((e) => {
                    e.copied = false;
                });
            }
        }
        if(self.ansIter2 != null) {
            for (let u in self.ansIter2) {
                self.ansIter2[u].forEach((e) => {
                    e.copied = false;
                });
            }
        }
        console.log(self.ansIter1);
    };

    let arrayIndexOfId = (arr, id) => {
        return arr.reduce((prev, cur, i) => (cur.id == id) ? i : prev, -1);
    };

    let loadPdf = (pdfData, i) => {
        PDFJS.disableWorker = true;
        let pdf = PDFJS.getDocument(pdfData);
        pdf.then((pdf) => renderPdf(pdf, i));
    };

    let renderPdf = (pdf, idx) => {
        for (let i = 1; i <= pdf.numPages; i++) {
            let p = pdf.getPage(i).then((p) => renderPage(p, idx));
            self.numPages += 1;
        }
    };

    let renderPage = (page, i) => {
        let scale = 1.3;
        let viewport = page.getViewport(scale);
        let $canvas = $("<canvas></canvas>");

        let canvas = $canvas.get(0);
        let context = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        let $pdfContainer = $("#pdf-canvas-" + i);
        $pdfContainer.css("height", canvas.height + "px").css("width", canvas.width + "px");
        $pdfContainer.append($canvas);

        let canvasOffset = $canvas.offset();
        let $textLayerDiv = jQuery("<div></div>")
            .addClass("textLayer")
            .css("height", viewport.height + "px")
            .css("width", viewport.width + "px");
        /*.offset({
         top: canvasOffset.top,
         left: canvasOffset.left
         });*/

        $pdfContainer.append($textLayerDiv);

        page.getTextContent({normalizeWhitespace: true}).then((textContent) => {
            let textLayer = new TextLayerBuilder($textLayerDiv.get(0), 0);
            textLayer.setTextContent(textContent);
            let renderContext = {
                canvasContext: context,
                viewport: viewport,
                textLayer: textLayer
            };
            page.render(renderContext).then(() => {
                self.numPages -= 1;
                if (self.numPages == 0) {
                    self.getIdeas();
                    $(".textLayer").html(function() {
                        return this.innerHTML.replace(/\t/g, ' ');
                    });
                }
            });
        });
    };


    self.toggleUseIdea = (ideaId) => {
        if(self.reportIdeas[ideaId] == null)
            self.reportIdeas[ideaId] = true;
        else
            self.reportIdeas[ideaId] = !self.reportIdeas[ideaId];
    };

    self.shared.getReportIdeas = () => {
        let postdata = {repid: self.shared.idReport};
        $http({url:"get-report-ideas", method:"post", data:postdata}).success((data) => {
            data.forEach((row) => {
                self.reportIdeas[row.ideaid] = true;
            });
        });
    };

    self.shared.sendReportIdeas = () => {
        if(self.shared.idReport != null){
            let postdata = {repid: self.shared.idReport};
            $http({url: "clear-report-ideas", method: "post", data: postdata}).success((data) => {
                if(data.status == "ok"){
                    for(var iid in self.reportIdeas){
                        if(self.reportIdeas[iid]){
                            $http({url: "send-report-idea", method: "post", data: {repid: self.shared.idReport, iid:iid}}).success((data) => {
                                console.log("Report idea sent");
                            });
                        }
                    }
                }
            })
        }
        else{
            $http({url:"get-my-report", method:"post"}).success((data) => {
                if (data.status == "ok"){
                    self.shared.idReport = data.id;
                    self.shared.sendReportIdeas();
                }
            });
        }
    };

    self.init();

}]);

app.controller("ReportController", ["$scope", "$http", function ($scope, $http) {
    let self = $scope;
    self.isFull = true;
    self.content = "";
    self.lastSent = null;

    self.toggleFull = () => {
        self.isFull = !self.isFull;
    };

    self.sendReport = () => {
        let postdata = {content: self.content};
        $http({url:"send-report", method:"post", data:postdata}).success((data) => {
            if (data.status == "ok"){
                self.lastSent = new Date();
                self.shared.sendReportIdeas();
            }
        });
    };

    self.getReport = () => {
        $http({url:"get-my-report", method:"post"}).success((data) => {
            if (data.status == "ok"){
                self.content = data.content;
                self.shared.idReport = data.id;
                self.shared.getReportIdeas();
            }
        });
    };

    self.getReport();

}]);

