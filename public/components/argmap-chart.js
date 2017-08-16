/**
 * Created by calvarezg on 5/30/17.
 */
(function () {
    'use strict';

    angular.module('argmap.defaults', [])
        .constant('defaultMessages', {
            'blank_comment' : '(Sin comentario)'
        });

    // create component
    // Agregamos abajo callbacks para cuando hay creacion y eliminacion de arcos
    angular.module('argmap', ['argmap.defaults', 'd3', 'd3GraphCreator'])
        .component('argmapChart', {
            controller : ArgmapCtrl,
            templateUrl: 'components/views/argmap.basic.ejs.html',
            bindings: {
                edgeDeleteCallback: '&',
                edgeCreateCallback: '&',
                refreshCallback: '&',
                edges: '=',
                ideas: '='
            }
        });

    function ArgmapCtrl($scope, $element, $attrs, d3, d3GraphCreator, defaultMessages) {
        let ctrl = this;

        ctrl.$onInit = () => {
            ctrl.deleteEdges = false;
            ctrl.createEdges = false;
            ctrl.commentVisible = false;
            ctrl.helpVisible = false;

            ctrl.currentComment = { text: '', edge: {}, x: 0, y: 0};
            ctrl.prevNodeClicked = null;

            d3.d3().then((d3) => {
                d3GraphCreator.d3GraphCreator().then(() => {
                    /** MAIN SVG **/
                    var svg = d3.select($element[0])
                        .append("div")
                        .attr("style", "width:100%;height:800px;background:#fff")
                        .append("svg:svg")
                        .attr("id", "argmap_graph");

                    // TODO: add an event notifying the creation of a new edge
                    // TODO: add an event notifying edge update (comment update)
                    let graph = new GraphCreator({
                            commentClick: ctrl.onCommentClicked,
                            edgeClick: ctrl.onEdgeClicked,
                            nodeClick: ctrl.onNodeClicked
                        },
                        svg,
                        ctrl.ideas,
                        ctrl.edges,
                        defaultMessages);

                    graph.setIdCt(2);
                    graph.updateGraph();

                    // Pass on the graph to the controller through the callback function
                    // set in the scope
                    // Note that this follows the callback calling conventions explained here:
                    // https://weblogs.asp.net/dwahlin/creating-custom-angularjs-directives-part-3-isolate-scope-and-function-parameters
                    ctrl.argmapChart = graph;
                    ctrl.refreshCallback()(() => { ctrl.argmapChart.updateGraph(); });

                    /// Esto llama el edge delete callback configurado en EditorCtrl
                    /// TODO: poner donde haya eliminacion
                    ctrl.edgeDeleteCallback()();
                    /// Esto llama el edge create callback configurado en EditorCtrl
                    /// TODO: poner donde haya creacion
                    ctrl.edgeCreateCallback()();
                })
            })
        };

        ctrl.onEdgeClicked = (args) => {
            // If edge elimination mode is active:
            if (ctrl.deleteEdges) {
                let edge = args.edge;

                let index = -1;

                // Search for the edge and delete it
                let found = ctrl.edges.some((e, i) => {
                    if (e.source == edge.source && e.target == edge.target) {
                        index = i;
                        return true;
                    }
                    else {
                        return false;
                    }
                });

                if (index >= 0 && found) {
                    ctrl.edges.splice(index, 1);
                }

                ctrl.deleteEdges = false;

                $scope.$apply();

                // Update graph
                ctrl.argmapChart.updateGraph();
            }
        }

        ctrl.onCommentClicked = (args) => {
            ctrl.currentComment = args;
            ctrl.commentVisible = true;

            $scope.$apply();
        }

        ctrl.ideaIdx = 3;
        ctrl.addIdea = () => {
            ideas.push({'title': "Edítame pinchando aquí", 'summary': "Este es un resumen de la idea", 'id': ctrl.ideaIdx, 'x': ctrl.ideaIdx * 50, 'y': 100});
            ctrl.ideaIdx++;
            ctrl.argmapChart.updateGraph();
        }

        ctrl.onNodeClicked = (args) => {
            // Dismiss if edge creation mode is off
            if (!ctrl.createEdges) {
                return;
            }

            let prevNode = ctrl.prevNodeClicked;
            let currNode = args.node;

            if (prevNode != null) {
                // If previous node and current node are different, process the event, otherwise,
                // simply dismiss
                if (prevNode.id != currNode.id) {

                    let edgeDirectionToggle = false;
                    let foundSameEdge = false;

                    // Detect whether (1) there is an edge direction toggle, (2) an already existing edge
                    // has been specified, or (3) it is necessary to add a new edge.
                    ctrl.edges.forEach((e, i, a) => {
                        // Detect edge direction toggle
                        if (e.source.id == currNode.id && e.target.id == prevNode.id) {
                            let aux = e.target;
                            ctrl.edges[i].target = e.source;
                            ctrl.edges[i].source = aux;

                            edgeDirectionToggle = true;

                            // Reset node selection
                            ctrl.prevNodeClicked = null;

                            // Switch off edge creation mode
                            ctrl.createEdges = false;

                            ctrl.$apply();

                            // Update graph
                            ctrl.argmapChart.updateGraph();
                        }
                        else if (e.source.id == prevNode.id && e.target.id == currNode.id) {
                            foundSameEdge = true;
                            ctrl.prevNodeClicked = currNode;
                        }
                    });

                    if (!edgeDirectionToggle && !foundSameEdge) {
                        // Add new edge
                        edges.push({'source' : prevNode, 'target' : currNode, comment: default_messages.blank_comment});

                        // Reset node selection
                        ctrl.prevNodeClicked = null;

                        // Switch off edge creation mode
                        ctrl.createEdges = false;

                        ctrl.$apply();

                        // Update graph
                        ctrl.argmapChart.updateGraph();
                    }
                }

            }
            else {
                // Update node previously clicked
                ctrl.prevNodeClicked = args.node;
            }
        }

        ctrl.onEdgeDeleteModeStart = () => {
            if (ctrl.createEdges) {
                ctrl.createEdges = false;
            }

            // activate help
            ctrl.helpVisible = true;
        }

        ctrl.onEdgeCreateModeStart = () => {

            if (ctrl.deleteEdges) {
                ctrl.deleteEdges = false;
            }

            // activate help
            ctrl.helpVisible = true;
        }

        ctrl.onIdeaTextUpdate = (data) => {
            ctrl.argmapChart.updateGraph();
        }

        ctrl.onCommentUpdate = () => {
            // Update graph
            ctrl.argmapChart.updateGraph();
        }

        ctrl.closeHelp = () => {
            ctrl.helpVisible = false;
        }

        ctrl.treeValueOptions = {
            removed: (args) => {
                // traverse the edge list in search for edges that connect to-from
                // the deleted node
                let delEdges = [];

                ctrl.edges.forEach((d,i,a) => {
                    if (d.source.id == args.node.id || d.target.id == args.node.id) {
                        delEdges.push(i);
                    }
                });

                // Traverse/delete edges in reverse order to preserve
                // array indices
                for (let i = delEdges.length -1; i >= 0; i--) {
                    ctrl.edges.splice(delEdges[i],1);
                }

                // update the graph
                ctrl.argmapChart.updateGraph();

                // regresh the scope
                //ctrl.$apply();
            }
        }

    };
})();