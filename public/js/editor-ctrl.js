"use strict";

var app = angular.module("Editor", ['argmap', 'ui.tree', 'btford.socket-io', "timer", "ui-notification"]);

app.factory("$socket", ["socketFactory", function (socketFactory) {
    return socketFactory();
}]);

app.controller("EditorController", ["$scope", "$http", "$timeout", "$socket", "Notification", function ($scope, $http, $timeout, $socket, Notification) {
    let self = $scope;

    self.iteration = 0;
    self.myUid = -1;
    self.documents = [];
    self.selections = [];
    self.associations = [];
    self.simplifications = [];
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
    self.reportIdeas = {};
    self.shared = {};
    self.argmapVisible = false;

    self.iterationNames = ["Lectura", "Individual", "Grupal Anónimo", "Grupal"];
    self.sesStatusses = ["Lectura", "Individual", "Anónimo", "Grupal", "Reporte", "Rubrica Calibración", "Evaluación de Pares", "Finalizada"];

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
                 self.getIdeas();
                 self.getAssociations();
                 self.getTeamInfo();
             }
        });

        var AngularModules = (function (angular) {
            function AngularModules() {
                extendAngularModule();
                angular.element(document).ready(function () {
                    getModulesDependencies();
                });
            }

            var extendAngularModule = function () {
                var orig = angular.module;
                angular.modules = [];
                angular.module = function () {
                    var args = Array.prototype.slice.call(arguments);
                    var modules = [];
                    if (arguments.length > 1) {
                        modules.push(arguments[0]);
                    }
                    for (var i = 0; i < modules.length; i++) {
                        angular.modules.push({
                            'module': modules[i]
                        });
                    }
                    return orig.apply(null, args);
                };
            };

            var getModulesDependencies = function () {
                for (var i = 0; i < angular.modules.length; i++) {
                    var module = angular.module(angular.modules[i].module);
                    angular.modules[i].dependencies = module && module.hasOwnProperty('requires') ? module.requires : [];
                }
            };

            return AngularModules;

        })(angular);

        var modules = new AngularModules();
    };

    self.edgeCreateCallback = () => {
        // TODO: actualizar las asociaciones en el servidor
    };

    self.edgeDeleteCallback = () => {
        // TODO: actualizar las asociaciones en el servidor
        // llamar a sendAssociation
    };

    self.subscribeArgmapRefreshHandler = (handler) => {
        self.refreshArgmapCallback = handler;
    };

    self.refreshArgmap = () => {
      if (self.refreshArgmapCallback) {
          self.refreshArgmapCallback();
      }
    };

    self.getSesInfo = () => {
        $http({url: "get-ses-info", method: "post"}).success((data) => {
            self.iteration = data.iteration;
            self.myUid = data.uid;
            self.sesName = data.name;
            self.sesId = data.id;
            self.sesDescr = data.descr;
            self.sesSTime = (data.stime != null) ? new Date(data.stime) : null;
            self.sesType = data.type;
            $http({url: "get-documents", method: "post"}).success((data) => {
                self.documents = data;
                data.forEach((doc,i) => {
                    self.docIdx[doc.id] = i;
                });
                self.renderAll();
            });
            $http({url: "data/instructions.json", method: "get"}).success((data) => {
                self.instructions = data;
            });
            if (self.iteration == 3){
                self.getTeamInfo();
            }
            if(self.iteration >= 5){
                self.finished = true;
            }
        });
    };

    self.finishState = () => {
        self.setSelOrder();
        let postdata = {status: self.iteration + 2};
        $http({url: "record-finish", method: "post", data: postdata}).success((data) => {
            self.hasFinished = true;
            console.log("FINISH");
        });
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
        if (textDef.length < 2 || textDef.length > 50){
            Notification.warning("El texto es muy largo para ser usado como una idea fuerza");
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
            //self.selections = [];
            self.selections.length = 0;
            data.forEach((idea) => {
                let textDef = {
                    id: idea.id,
                    text: idea.content,
                    serial: idea.serial,
                    document: arrayIndexOfId(self.documents, idea.docid),
                    comment: idea.descr,
                    expanded: false,
                    status: "saved",
                    x: 100,
                    y: 100
                };
                self.highlightSerial(textDef.serial, textDef.document);
                self.selections.push(textDef);
            });

            console.log("[editorCtrl] post getIdeas: self.selections.length: " + self.selections.length);

            self.refreshArgmap();
        });
        if(self.iteration > 1) {
            self.tabOptions = ["Reelaboración","Original"];
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
            self.tabOptions = ["Reelaboración","Original","Reelaboración Anonima"];
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
            window.location.replace("rubrica");
        }
    };

    // TODO: test and debug
    self.getAssociations = () => {
        let postdata = {iteration: Math.min(3,self.iteration)};

        // TODO: extend to collaborative work
        let url = "get-associations";
        $http({url: url, method: "post", data: postdata}).success((data) => {
            self.associations.length = 0;
            data.forEach((assoc) => {
                let assocDef = {
                    id: assoc.id,
                    id_source: assoc.id_source,
                    id_target: assoc.id_target,
                    comment: assoc.comment,
                    status: "saved",
                };
                self.associations.push(assocDef);
            });

            self.refreshArgmap();
        });
        if(self.iteration > 1) {
            // TODO: here extends after asking Sergio
        }
        if(self.iteration > 2) {
            // TODO: here extends after asking Sergio
        }
        // ite 4 & 5 not needed here, already in GetIdea()
    };

    self.sendIdeaSimplification = (id) => {
        let postdata = {
            original_idea_id: id,
            iteration: self.iteration,
            // TODO: map from ABCDE... to a comment
            comment: simple_index
        };
        if(simp.status == "unsaved"){
            let url = (self.iteration == 3)? "send-team-idea-simplification":"send-idea-simplification";
            $http({url: url, method: "post", data: postdata}).success((data) => {

            });
        }
    }

    self.sendIdea = (sel) => {
        let postdata = {
            text: sel.text,
            comment: sel.comment,
            serial: sel.serial,
            docid: self.documents[sel.document].id,
            iteration: self.iteration,
            uidoriginal: self.originalLeader,
        };
        if (sel.status == "unsaved"){
            let url = (self.iteration == 3)? "send-team-idea" : "send-idea";
            $http({url: url, method: "post", data: postdata}).success((data) => {
                if (data.status == "ok") {
                    sel.expanded = false;
                    sel.status = "saved";
                    sel.id = data.id;
                    sel.x = 100 + Math.floor(Math.random() * 200);
                    sel.y = 100 + Math.floor(Math.random() * 200);
                    sendIdeaSimplification(sel.id);
                }

                // refresh argmap!
                self.refreshArgmap();

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

                // refresh argmap!
                self.refreshArgmap();

                self.updateSignal();
            });
        }
    };

    // TODO: test and debug
    self.sendAssociation = (assoc) => {
        let postdata = {
            id_source: assoc.source,
            id_dest: assoc.target,
            comment: assoc.comment,
            iteration: self.iteration,
        };
        if (assoc.status == "unsaved") {
            let url = (self.iteration == 3)? "send-team-association" : "send-association";
            $http({url: url, method: "post", data: postdata}).success((data) => {
                if (data.status == "ok") {
                    assoc.status = "saved";
                    assoc.id = data.id;
                }

                self.updateSignal();
            });
        }
        else if (assoc.status == "dirty" && assoc.id != null) {
            postdata.id = assoc.id;
            $http({url: "update-assoc", method: "post", data: postdata}).success((data) => {
                if (data.status == "ok") {
                    sel.status = "saved";
                }

                self.updateSignal();
            });
        }
    };

    self.updateSignal = () => {
        $http({url: "update-my-team", method:"post"}).success((data) => {
            console.log("Team updated");
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

                // refresh argmap!
                self.refreshArgmap();
            });
        }
        else{
            self.selections.splice(index, 1);
            self.unhighlightSerial(sel.serial, self.docIdx[sel.docid]);

            // refresh argmap!
            self.refreshArgmap();
        }
    };

    self.copyIdea = (sel) => {
        console.log('[copyIdea] sel: ' + sel);
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

    let arrayIndexOfId = (arr, id) => {
        return arr.reduce((prev, cur, i) => (cur.id == id) ? i : prev, -1);
    };

    let loadPdf = (pdfData, i) => {
        PDFJS.disableWorker = true;
        let pdf = PDFJS.getDocument(pdfData);
        pdf.then((pdf) => renderPdf(pdf, i));
    };

    let simple_index = () => {
        var alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
        for(let i = 0; i < alphabet.length; i++ ) {
            var c = alphabet.charAt(i);
            if(!simplifications.includes(c)) {
                simplifications.push(c);
                return c;
            }
        }
    }

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

    // BEGIN argmap controller functions
    // TODO: move to component controller


    // END argmap controller functions
    
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

