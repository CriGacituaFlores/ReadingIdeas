module.exports.configSocket = function(io){
    module.exports.stateChange = function(sesid){
        io.of("/").emit("stateChange", {ses: sesid});
    };
    module.exports.updateTeam = function(tmid){
        io.of("/").emit("updateTeam", {tmid: tmid});
    };
    module.exports.reportChange = function(sesid){
        io.of("/").emit("reportChange", {ses: sesid});
    };
    module.exports.reportBroadcast = function(sesid, rid){
        io.of("/").emit("reportReceived", {ses: sesid, rid: rid});
    };
    module.exports.teamProgress = function(sesid, tmid){
        io.of("/").emit("teamProgress", {ses: sesid, tmid: tmid});
    };
    module.exports.updateOverlay = function(qid){
        io.of("/").emit("updateOverlay", {qid: qid});
    };
    module.exports.updateWaiting = function(sesid){
        io.of("/").emit("updateWaiting", {ses: sesid});
    };
    module.exports.updateUserIteration = function(sesid){
        io.of("/").emit("updateUserIteration", {ses: sesid});
    };
};