"use strict";

let express = require('express');
let router = express.Router();
let rpg = require("../modules/rest-pg");
let pass = require("../modules/passwords");
let socket = require("../modules/socket.config");

let sesStatusCache = {};

router.get("/to-visor", (req, res) => {
    if (req.session.uid && !isNaN(req.query.sesid)) {
        req.session.ses = req.query.sesid;
        let doRedirect = (status) => {
            console.log(status);
            if(status <= 6) res.redirect("visor");
            else res.redirect("rubrica");
        };
        if(sesStatusCache[req.query.sesid] == null) {
            rpg.singleSQL({
                dbcon: pass.dbcon,
                sql: "select status from sessions where id = " + req.query.sesid,
                onEnd: (req, res, result) => {
                    sesStatusCache[req.query.sesid] = result.status;
                    doRedirect(result.status);
                }
            })(req, res);
        }
        else {
            doRedirect(sesStatusCache[req.query.sesid]);
        }
    }
    else
        res.redirect(".");
});

router.get("/to-pauta", (req, res) => {
    if (req.session.uid && !isNaN(req.query.sesid) && req.session.role == "P") {
        req.session.ses = req.query.sesid;
        let doRedirect = (status) => {
            console.log(status);
            res.redirect("pauta");
        };
        if(sesStatusCache[req.query.sesid] == null) {
            rpg.singleSQL({
                dbcon: pass.dbcon,
                sql: "select status from sessions where id = " + req.query.sesid,
                onEnd: (req, res, result) => {
                    sesStatusCache[req.query.sesid] = result.status;
                    doRedirect(result.status);
                }
            })(req, res);
        }
        else {
            doRedirect(sesStatusCache[req.query.sesid]);
        }
    }
    else
        res.redirect(".");
});

router.get("/to-rubrica", (req, res) => {
    if (req.session.uid && !isNaN(req.query.sesid) && req.session.role == "P") {
        req.session.ses = req.query.sesid;
        let doRedirect = (status) => {
            console.log(status);
            res.redirect("rubrica");
        };
        if(sesStatusCache[req.query.sesid] == null) {
            rpg.singleSQL({
                dbcon: pass.dbcon,
                sql: "select status from sessions where id = " + req.query.sesid,
                onEnd: (req, res, result) => {
                    sesStatusCache[req.query.sesid] = result.status;
                    doRedirect(result.status);
                }
            })(req, res);
        }
        else {
            doRedirect(sesStatusCache[req.query.sesid]);
        }
    }
    else
        res.redirect(".");
});

router.get("/visor", (req, res) => {
    if (req.session.uid && req.session.ses)
        res.render("visor");
    else
        res.redirect(".");
});

router.get("/pauta", (req, res) => {
    if (req.session.uid && req.session.ses && req.session.role == "P")
        res.render("visor-pauta");
    else
        res.redirect(".");
});

router.get("/to-select", (req, res) => {
    if (req.session.uid) {
        req.session.ses = req.query.sesid;
        res.redirect("select");
    }
    else
        res.redirect(".");
});

router.get("/select", (req, res) => {
    if (req.session.uid && req.session.ses)
        res.render("select");
    else
        res.redirect(".");
});

router.get("/to-semantic", (req, res) => {
    if (req.session.uid) {
        req.session.ses = req.query.sesid;
        res.redirect("semantic");
    }
    else
        res.redirect(".");
});

router.get("/to-differential-semantic", (req, res) => {
    if (req.session.uid) {
        req.session.ses = req.query.sesid;
        res.render("differential-semantic");
    }
    else
        res.redirect(".");
});

router.get("/semantic", (req, res) => {
    if (req.session.uid && req.session.ses)
        res.render("semantic");
    else
        res.redirect(".");
});

router.post("/get-documents", rpg.multiSQL({
    dbcon: pass.dbcon,
    sql: "select id, title, path from documents where sesid = $1 and active = true",
    sesReqData: ["uid", "ses"],
    sqlParams: [rpg.param("ses", "ses")]
}));

router.post("/delete-document", rpg.execSQL({
    dbcon: pass.dbcon,
    sql: "update documents set active = false where id = $1",
    postReqData: ["docid"],
    sqlParams: [rpg.param("post", "docid")]
}));

router.post("/get-questions", rpg.multiSQL({
    dbcon: pass.dbcon,
    sql: "select q.id, q.content, q.options, qt.content as text_content, q.plugin_data from questions as q left outer join question_text as qt on " +
        "q.textid = qt.id where q.sesid = $1 order by q.id asc",
    sesReqData: ["uid", "ses"],
    sqlParams: [rpg.param("ses", "ses")]
}));

router.post("/get-anskey", rpg.multiSQL({
    dbcon: pass.dbcon,
    sql: "select id, comment, answer from questions where sesid = $1",
    sesReqData: ["uid", "ses"],
    sqlParams: [rpg.param("ses", "ses")]
}));

router.post("/send-answer", rpg.execSQL({
    dbcon: pass.dbcon,
    sql: "with rows as (update selection set answer = $1, comment = $2, stime = now(), confidence = $3 where qid = $4 and uid = $5 and iteration = $6 returning 1) " +
    "insert into selection(uid,qid,answer,comment,iteration,confidence,stime) select $7,$8,$9,$10,$11,$12, now() where 1 not in (select * from rows)",
    /*sql: "insert into selection(uid,qid,answer,comment) values ($1,$2,$3,$4) on conflict (uid,qid) do update " +
     "set answer = excluded.answer, comment = excluded.comment",*/
    sesReqData: ["uid", "ses"],
    postReqData: ["qid", "answer", "comment", "iteration"],
    sqlParams: [rpg.param("post", "answer"), rpg.param("post", "comment"), rpg.param("post", "confidence"), rpg.param("post", "qid"), rpg.param("ses", "uid"), rpg.param("post", "iteration"),
        rpg.param("ses", "uid"), rpg.param("post", "qid"), rpg.param("post", "answer"), rpg.param("post", "comment"), rpg.param("post", "iteration"), rpg.param("post", "confidence")]
}));

router.post("/get-answers", rpg.multiSQL({
    dbcon: pass.dbcon,
    sql: "select s.qid, s.answer, s.comment, s.confidence from selection as s inner join questions as q on q.id = s.qid " +
    "where q.sesid = $1 and s.uid = $2 and s.iteration = $3",
    sesReqData: ["uid", "ses"],
    postReqData: ["iteration"],
    sqlParams: [rpg.param("ses", "ses"), rpg.param("ses", "uid"), rpg.param("post","iteration")]
}));

router.post("/send-idea", rpg.singleSQL({
    dbcon: pass.dbcon,
    sql: "insert into ideas(content,descr,serial,docid,uid,iteration,stime) values ($1,$2,$3,$4,$5,$6,now()) returning id",
    sesReqData: ["uid", "ses"],
    postReqData: ["docid", "text", "comment", "serial", "iteration"],
    sqlParams: [rpg.param("post", "text"), rpg.param("post", "comment"), rpg.param("post", "serial"), rpg.param("post", "docid"), rpg.param("ses", "uid"), rpg.param("post", "iteration")]
}));

router.post("/send-team-idea", rpg.singleSQL({
    dbcon: pass.dbcon,
    sql: "insert into ideas(content,descr,serial,docid,uid,iteration,stime) values ($1,$2,$3,$4,$5,$6,now()) returning id",
    sesReqData: ["uid", "ses"],
    postReqData: ["docid", "text", "comment", "serial", "iteration", "uidoriginal"],
    sqlParams: [rpg.param("post", "text"), rpg.param("post", "comment"), rpg.param("post", "serial"), rpg.param("post", "docid"), rpg.param("post", "uidoriginal"), rpg.param("post", "iteration")]
}));

router.post("/send-pauta-idea", rpg.singleSQL({
    dbcon: pass.dbcon,
    sql: "insert into ideas(content,descr,serial,docid,uid,iteration,orden) values ($1,$2,$3,$4,$5,$6,$7) returning id",
    sesReqData: ["uid", "ses"],
    postReqData: ["docid", "text", "comment", "serial", "iteration", "order"],
    sqlParams: [rpg.param("post", "text"), rpg.param("post", "comment"), rpg.param("post", "serial"), rpg.param("post", "docid"), rpg.param("ses", "uid"), rpg.param("post", "iteration"), rpg.param("post", "order")]
}));

router.post("/update-idea", rpg.execSQL({
    dbcon: pass.dbcon,
    sql: "update ideas set content = $1, descr = $2, serial = $3, stime = now() where id = $4",
    sesReqData: ["uid", "ses"],
    postReqData: ["docid", "text", "comment", "serial", "id"],
    sqlParams: [rpg.param("post", "text"), rpg.param("post", "comment"), rpg.param("post", "serial"), rpg.param("post", "id")]
}));

router.post("/update-pauta-idea", rpg.execSQL({
    dbcon: pass.dbcon,
    sql: "update ideas set content = $1, descr = $2, serial = $3, orden = $4 where id = $5",
    sesReqData: ["uid", "ses"],
    postReqData: ["docid", "text", "comment", "serial", "id", "order"],
    sqlParams: [rpg.param("post", "text"), rpg.param("post", "comment"), rpg.param("post", "serial"), rpg.param("post", "order"), rpg.param("post", "id")]
}));

router.post("/pauta-editable", rpg.singleSQL({
    dbcon: pass.dbcon,
    sql: "select status = 1 as editable from sessions where id = $1",
    sesReqData: ["uid", "ses"],
    sqlParams: [rpg.param("ses","ses")]
}));

router.post("/get-ideas", rpg.multiSQL({
    dbcon: pass.dbcon,
    sql: "select i.id, i.content, i.descr, i.serial, i.docid, i.orden from ideas as i inner join documents as d on i.docid = d.id where " +
    "i.uid = $1 and d.sesid = $2 and i.iteration = $3 order by i.orden asc",
    sesReqData: ["uid", "ses"],
    postReqData: ["iteration"],
    sqlParams: [rpg.param("ses", "uid"), rpg.param("ses", "ses"), rpg.param("post", "iteration")]
}));

router.post("/set-ideas-orden", (req, res) => {
    res.header("Content-type", "application/json");
    let uid = req.session.uid;
    let ses = req.session.ses;
    if (uid == null || ses == null || req.body.orden == null) {
        res.end('{"status":"err"}');
        return;
    }
    req.body.orden.forEach((ideaId, i) => {
        if (!isNaN(ideaId)) {
            rpg.execSQL({
                dbcon: pass.dbcon,
                sql: "update ideas set orden = " + i + " where id = " + ideaId,
                onEnd: () => {}
            })(req, res);
        }
    });
    res.end('{"status":"ok"}');
});

router.post("/change-state-session", rpg.execSQL({
    dbcon: pass.dbcon,
    sql: "with rows as (update sessions set status = status + 1 where id = $1 returning id, status) insert into " +
            "status_record(sesid,status,stime) select id, status, now() from rows",
    postReqData: ["sesid"],
    sqlParams: [rpg.param("post", "sesid")],
    onEnd: (req,res) => {
        if(req.body.sesid != null && sesStatusCache[req.body.sesid] != null)
            sesStatusCache[req.body.sesid] += 1;
        res.send('{"status":"ok"}');
        socket.stateChange(req.body.sesid);
    }
}));

router.post("/update_session_on_team_task", (req, res) => {
    rpg.singleSQL({
        dbcon: pass.dbcon,
        sql: `update sessions set waiting_partners = true, times_waiting = times_waiting+1 where sessions.id = ${req.body}`,
        onEnd: (req,res) => {
            socket.updateWaiting(req.body);
        }
    })(req, res);
});

router.post("/update_session_on_team_task_second_time", (req, res) => {
    rpg.singleSQL({
        dbcon: pass.dbcon,
        sql: `update sessions set waiting_partners = true, times_waiting = times_waiting+1 where sessions.id = ${req.body}`,
        onEnd: (req,res) => {
            socket.updateWaiting(req.body);
        }
    })(req, res);
});

router.post("/update_session_on_team_task_final_response", (req, res) => {
    rpg.singleSQL({
        dbcon: pass.dbcon,
        sql: `update sessions set final_response = true where sessions.id = ${req.body}`,
        onEnd: (req,res) => {
            socket.updateWaiting(req.body);
        }
    })(req, res);
});

router.post("/select_session_on_team_task", (req, res) => {
    console.log('THE BODY: ' + req.body)
    rpg.singleSQL({
        dbcon: pass.dbcon,
        sql: `select * from sessions where sessions.id = ${req.body}`
    })(req, res);
});

router.post("/send_first_commentary", (req, res) => {
    console.log('THE BODY: ' + req.body)
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `update session_iteration set first_time = true where user_id = ${req.session.uid} and session_id = ${req.body}`,
        onEnd: (req,res) => {
            socket.updateUserIteration(req.body);
        }
    })(req, res);
});

router.post("/send_second_commentary", (req, res) => {
    console.log('THE BODY: ' + req.body)
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `update session_iteration set second_time = true where user_id = ${req.session.uid} and session_id = ${req.body}`,
        onEnd: (req,res) => {
            socket.updateUserIteration(req.body);
        }
    })(req, res);
});

router.post("/get_user_status_by_group", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select users.name as user_name, session_iteration.first_time as first_time, session_iteration.second_time as second_time from teams
                inner join teamusers on
                teamusers.tmid = teams.id
                inner join users on
                teamusers.uid = users.id
                inner join session_iteration on
                session_iteration.user_id = users.id
                where leader = ${req.session.uid}
                and sesid = ${req.body}
                and users.id != ${req.session.uid}`
    })(req, res);
});

router.post("/first_iteration_comments_by_group", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select first_iteration_comments.*, users.name from first_iteration_comments
                inner join users on
                users.id = first_iteration_comments.user_id
                where session_id = ${req.body}
                and team_id = (
                select id from teams where teams.leader = ${req.session.uid} and teams.sesid = ${req.body}
                )
                and first_iteration_comments.user_id <> ${req.session.uid}`
    })(req, res);
});

router.post("/second_iteration_comments_by_group", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select second_iteration_comments.*, users.name from second_iteration_comments
                inner join users on
                users.id = second_iteration_comments.user_id
                where session_id = ${req.body}
                and team_id = (
                select id from teams where teams.leader = ${req.session.uid} and teams.sesid = ${req.body}
                )
                and second_iteration_comments.user_id <> ${req.session.uid}`
    })(req, res);
});

router.post("/force-state-session", rpg.execSQL({
    dbcon: pass.dbcon,
    sql: "with rows as (update sessions set status = $1 where id = $2 returning id, status) insert into " +
    "status_record(sesid,status,stime) select id, status, now() from rows",
    postReqData: ["sesid", "state"],
    sqlParams: [rpg.param("post", "state"), rpg.param("post", "sesid")],
    onEnd: (req,res) => {
        if(req.body.sesid != null && sesStatusCache[req.body.sesid] != null)
            sesStatusCache[req.body.sesid] = req.body.state;
        res.send('{"status":"ok"}');
        socket.stateChange(req.body.sesid);
    }
}));

router.post("/select-session-users", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `insert into semantic_differential_user (min_name, max_name, order_sort, sesid, value, description, user_id, semantic_differential_id)
                select min_name, max_name, order_sort, semantic_differential.sesid, value, description, users.id, semantic_differential.id
                from semantic_differential
                inner join sessions on
                sessions.id = semantic_differential.sesid
                inner join sesusers on
                sesusers.sesid = sessions.id
                inner join users on
                users.id = sesusers.uid
                where users.id in (select id from users inner join sesusers on users.id = sesusers.uid where sesusers.sesid = ${req.body} and sesusers.uid != ${req.session.uid})
                and semantic_differential.sesid = ${req.body}`
    })(req,res);
})

router.post("/select-first-iteration-group", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `insert into first_iteration_group (min_name, max_name, order_sort, sesid, value, description, user_id, semantic_differential_id)
                select min_name, max_name, order_sort, semantic_differential.sesid, value, description, users.id, semantic_differential.id
                from semantic_differential
                inner join sessions on
                sessions.id = semantic_differential.sesid
                inner join sesusers on
                sesusers.sesid = sessions.id
                inner join users on
                users.id = sesusers.uid
                where users.id in (select id from users inner join sesusers on users.id = sesusers.uid where sesusers.sesid = ${req.body} and sesusers.uid != ${req.session.uid})
                and semantic_differential.sesid = ${req.body}`
    })(req,res);
})

router.post("/select-first-iteration-personal-evaluation", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `insert into first_iteration_personal_evaluation (id, min_name, max_name, description, order_sort, sesid, value, user_id, created_at, updated_at, team_id)
                select user_personal_evaluation.id, user_personal_evaluation.min_name, user_personal_evaluation.max_name, user_personal_evaluation.description,
                user_personal_evaluation.order_sort, user_personal_evaluation.sesid, user_personal_evaluation.value, user_personal_evaluation.user_id,
                user_personal_evaluation.created_at, user_personal_evaluation.updated_at, teams.id
                from user_personal_evaluation
                inner join users on
                users.id = user_personal_evaluation.user_id
                inner join teamusers on
                users.id = teamusers.uid
                inner join teams on
                teams.id = teamusers.tmid
                where user_personal_evaluation.sesid = ${req.body}
                and teams.sesid = ${req.body}`
    })(req,res);
})

router.post("/select-second-iteration-personal-evaluation", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `insert into second_iteration_personal_evaluation (min_name, max_name, description, order_sort, sesid, value, user_id, team_id, created_at, updated_at)
                select first_iteration_personal_evaluation.min_name, first_iteration_personal_evaluation.max_name, first_iteration_personal_evaluation.description, first_iteration_personal_evaluation.order_sort, first_iteration_personal_evaluation.sesid, first_iteration_personal_evaluation.value, first_iteration_personal_evaluation.user_id, first_iteration_personal_evaluation.team_id, first_iteration_personal_evaluation.created_at, first_iteration_personal_evaluation.updated_at from first_iteration_personal_evaluation
                inner join sessions on
                sessions.id = first_iteration_personal_evaluation.sesid
                inner join teams on
                teams.sesid = sessions.id
                where first_iteration_personal_evaluation.sesid = 1
                and teams.id = (select teams.id from teamusers
                inner join teams on
                teamusers.tmid = teams.id
                where teamusers.uid = ${req.session.uid}
                and teams.sesid = ${req.body})`
    })(req,res);
})

router.post("/select-third-iteration-personal-evaluation", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `insert into third_iteration_personal_evaluation (min_name, max_name, description, order_sort, sesid, value, user_id, team_id, created_at, updated_at)
                select second_iteration_personal_evaluation.min_name, second_iteration_personal_evaluation.max_name, second_iteration_personal_evaluation.description, second_iteration_personal_evaluation.order_sort, second_iteration_personal_evaluation.sesid, second_iteration_personal_evaluation.value, second_iteration_personal_evaluation.user_id, second_iteration_personal_evaluation.team_id, second_iteration_personal_evaluation.created_at, second_iteration_personal_evaluation.updated_at from second_iteration_personal_evaluation
                inner join sessions on
                sessions.id = second_iteration_personal_evaluation.sesid
                inner join teams on
                teams.sesid = sessions.id
                where second_iteration_personal_evaluation.sesid = 1
                and teams.id = (select teams.id from teamusers
                inner join teams on
                teamusers.tmid = teams.id
                where teamusers.uid = ${req.session.uid}
                and teams.sesid = ${req.body})`
    })(req,res);
})

router.post("/select-first-iteration-comment", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `insert into first_iteration_comments (team_id, user_id,session_id)
                select teams.id,users.id, teams.sesid from users
                inner join teamusers on
                teamusers.uid = users.id
                inner join teams on
                teams.id = teamusers.tmid
                where teams.leader = ${req.session.uid}
                and teams.sesid = ${req.body}`
    })(req,res);
})

router.post("/select-second-iteration-comment", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `insert into second_iteration_comments (team_id, user_id,session_id)
                select teams.id,users.id, teams.sesid from users
                inner join teamusers on
                teamusers.uid = users.id
                inner join teams on
                teams.id = teamusers.tmid
                where teams.leader = ${req.session.uid}
                and teams.sesid = ${req.body}`
    })(req,res);
})

router.post("/select-times-between-iterations", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `insert into session_iteration (team_id, user_id,session_id)
                select teams.id,users.id, teams.sesid from users
                inner join teamusers on
                teamusers.uid = users.id
                inner join teams on
                teams.id = teamusers.tmid
                where teams.leader = ${req.session.uid}
                and teams.sesid = ${req.body.sesid}`
    })(req,res);
})

router.post("/update_team_id_for_first_iteration_group", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `update first_iteration_group set team_id = t1.team_id from
                (select first_iteration_group.id, teams.id as team_id
                from first_iteration_group
                inner join users on
                users.id = first_iteration_group.user_id
                inner join teamusers on
                teamusers.uid = users.id
                inner join teams on
                teams.id = teamusers.tmid
                where teams.leader = ${req.session.uid}
                and teams.sesid = ${req.body}
                group by teamusers.uid, first_iteration_group.id, teams.id) t1
                where first_iteration_group.id = t1.id`
    })(req,res);
})

router.post("/update_team_id_for_second_iteration_group", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `update second_iteration_group set team_id = t1.team_id from
                (select second_iteration_group.id, teams.id as team_id
                from first_iteration_group
                inner join users on
                users.id = second_iteration_group.user_id
                inner join teamusers on
                teamusers.uid = users.id
                inner join teams on
                teams.id = teamusers.tmid
                where teams.leader = ${req.session.uid}
                and teams.sesid = ${req.body}
                group by teamusers.uid, second_iteration_group.id, teams.id) t1
                where second_iteration_group.id = t1.id`
    })(req,res);
})

router.post("/insert_values_to_second_iteration", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `insert into second_iteration_group (min_name, max_name, order_sort, sesid, value, description, user_id, team_id, semantic_differential_id)
                select first_iteration_group.min_name, first_iteration_group.max_name, first_iteration_group.order_sort, first_iteration_group.sesid, first_iteration_group.value, first_iteration_group.description, first_iteration_group.user_id, first_iteration_group.team_id, first_iteration_group.semantic_differential_id
                from first_iteration_group
                inner join users on
                users.id = first_iteration_group.user_id
                inner join teamusers on
                teamusers.uid = users.id
                inner join teams on
                teams.id = teamusers.tmid
                where teams.leader = ${req.session.uid}
                and teams.sesid = ${req.body}
                group by teamusers.uid, first_iteration_group.id, teams.id`
    })(req,res);
})

router.post("/insert_values_to_third_iteration", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `insert into third_iteration_group (min_name, max_name, order_sort, sesid, value, description, user_id, team_id, semantic_differential_id)
                select second_iteration_group.min_name, second_iteration_group.max_name, second_iteration_group.order_sort, second_iteration_group.sesid, second_iteration_group.value, second_iteration_group.description, second_iteration_group.user_id, second_iteration_group.team_id, second_iteration_group.semantic_differential_id
                from second_iteration_group
                inner join users on
                users.id = second_iteration_group.user_id
                inner join teamusers on
                teamusers.uid = users.id
                inner join teams on
                teams.id = teamusers.tmid
                where teams.leader = ${req.session.uid}
                and teams.sesid = ${req.body}
                group by teamusers.uid, second_iteration_group.id, teams.id`
    })(req,res);
})

router.post("/insert_comments_to_second_iteration", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `insert into second_iteration_comments (team_id, user_id, comment, session_id, created_at, updated_at)
                select team_id, user_id, comment, session_id, created_at, updated_at
                from first_iteration_comments
                inner join users on
                users.id = first_iteration_comments.user_id
                inner join teamusers on
                teamusers.uid = users.id
                inner join teams on
                teams.id = teamusers.tmid
                where teams.leader = ${req.session.uid}
                and teams.sesid = ${req.body}
                group by teamusers.uid, first_iteration_comments.id, teams.id`
    })(req,res);
})

router.post("/select-anonymous-session-users", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `insert into anonymous_semantic_differential_user (min_name, max_name, order_sort, sesid, value, description, user_id, semantic_differential_id)
        select min_name, max_name, order_sort, sesid, value, description, user_id, semantic_differential_user.semantic_differential_id from semantic_differential_user
        where sesid = ${req.body}`
    })(req,res);
})

router.post("/select-differential-by-users", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `insert into semantic_differential_user (min_name, max_name, order_sort, sesid, value, description, user_id, semantic_differential_id)
                select min_name, max_name, order_sort, semantic_differential.sesid, value, description, users.id, semantic_differential.id
                from semantic_differential
                inner join sessions on
                sessions.id = semantic_differential.sesid
                inner join sesusers on
                sesusers.sesid = sessions.id
                inner join users on
                users.id = sesusers.uid
                where users.id in (select id from users inner join sesusers on users.id = sesusers.uid where sesusers.sesid = ${req.body} and sesusers.uid != ${req.session.uid})
                and semantic_differential.sesid = ${req.body}`
    })(req,res);
})

router.post("/select-semantic-by-all-users", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select min_name, max_name, avg(value)::INTEGER from semantic_differential_user
            where semantic_differential_user.sesid = ${req.body}
            group by semantic_differential_user.semantic_differential_id, semantic_differential_user.min_name, semantic_differential_user.max_name`
    })(req,res);
})

router.post("/select-anonymous-semantic-by-all-users", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select min_name, max_name, avg(value)::INTEGER from anonymous_semantic_differential_user
            where anonymous_semantic_differential_user.sesid = ${req.body}
            group by anonymous_semantic_differential_user.semantic_differential_id, anonymous_semantic_differential_user.min_name, anonymous_semantic_differential_user.max_name`
    })(req,res);
})

router.post("/select-anonymous-semantic-by-group", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select min_name, max_name, avg(value)::INTEGER from anonymous_semantic_differential_user
                inner join sessions on
                sessions.id = anonymous_semantic_differential_user.sesid
                inner join teams on
                teams.sesid = sessions.id
                where anonymous_semantic_differential_user.sesid = ${req.body.id}
                and teams.id = (select teams.id from teamusers
                                    inner join teams on
                                    teamusers.tmid = teams.id
                                    where teamusers.uid = ${req.session.uid}
                                    and teams.sesid = ${req.body.id})
                group by anonymous_semantic_differential_user.semantic_differential_id, anonymous_semantic_differential_user.min_name, anonymous_semantic_differential_user.max_name`
    })(req,res);
})

router.post("/select-first-iteration-comment-array", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select * from first_iteration_comments where session_id = ${req.body.id} and user_id = ${req.session.uid}`
    })(req,res);
})

router.post("/select-second-iteration-comment-array", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select * from second_iteration_comments where session_id = ${req.body.id} and user_id = ${req.session.uid}`
    })(req,res);
})

router.post('/update_first_iteration_comment', (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `update first_iteration_comments set comment = '${req.body.comment}' where id = ${req.body.id}`
    })(req,res);
})

router.post('/update_second_iteration_comment', (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `update second_iteration_comments set comment = '${req.body.comment}' where id = ${req.body.id}`
    })(req,res);
})


router.post("/select-all-users", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select * from users inner join sesusers on users.id = sesusers.uid where sesusers.sesid = ${req.body} and users.id != ${req.session.uid}`
    })(req,res);
})

router.post("/select-all-groups", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select * from teams where sesid = ${req.body}`
    })(req,res);
})


router.post("/select_first_iteration_group", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select * from first_iteration_group
            where team_id = ${req.body.group_id}
            and user_id = (
            select teams.leader from teams where teams.sesid = ${req.body.ses_id} and teams.id = ${req.body.group_id}
        )`
    })(req,res);
})

router.post("/select_first_iteration_personal_evaluation", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select * from first_iteration_personal_evaluation
            where team_id = ${req.body.group_id}
            and user_id = (
            select teams.leader from teams where teams.sesid = ${req.body.ses_id} and teams.id = ${req.body.group_id}
        )`
    })(req,res);
})

router.post("/select_second_iteration_group", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select * from second_iteration_group
            where team_id = ${req.body.group_id}
            and user_id = (
            select teams.leader from teams where teams.sesid = ${req.body.ses_id} and teams.id = ${req.body.group_id}
        )`
    })(req,res);
})

router.post("/select_second_iteration_personal_evaluation", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select * from second_iteration_personal_evaluation
            where team_id = ${req.body.group_id}
            and user_id = (
            select teams.leader from teams where teams.sesid = ${req.body.ses_id} and teams.id = ${req.body.group_id}
        )`
    })(req,res);
})

router.post("/select_third_iteration_group", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select * from third_iteration_group
            where team_id = ${req.body.group_id}
            and user_id = (
            select teams.leader from teams where teams.sesid = ${req.body.ses_id} and teams.id = ${req.body.group_id}
        )`
    })(req,res);
})

router.post("/select_third_iteration_personal_evaluation", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select * from third_iteration_personal_evaluation
            where team_id = ${req.body.group_id}
            and user_id = (
            select teams.leader from teams where teams.sesid = ${req.body.ses_id} and teams.id = ${req.body.group_id}
        )`
    })(req,res);
})

router.post("/select_all_by_first_iteration", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select min_name, max_name, avg(value)::INTEGER from first_iteration_group
        where first_iteration_group.sesid = ${req.body.ses_id}
        group by first_iteration_group.semantic_differential_id, first_iteration_group.min_name, first_iteration_group.max_name
        `
    })(req,res);
})

router.post("/select_all_by_second_iteration", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select min_name, max_name, avg(value)::INTEGER from second_iteration_group
        where second_iteration_group.sesid = ${req.body.ses_id}
        group by second_iteration_group.semantic_differential_id, second_iteration_group.min_name, second_iteration_group.max_name
        `
    })(req,res);
})

router.post("/select_all_by_third_iteration", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select min_name, max_name, avg(value)::INTEGER from third_iteration_group
        where third_iteration_group.sesid = ${req.body.ses_id}
        group by third_iteration_group.semantic_differential_id, third_iteration_group.min_name, third_iteration_group.max_name
        `
    })(req,res);
})

router.post("/select-all-users-group", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select * from users inner join sesusers on users.id = sesusers.uid where sesusers.sesid = ${req.body} and users.id != ${req.session.uid} and users.role != 'P'`
    })(req,res);
})


router.post("/select-semantic-by-users", (req, res) => {
    console.log('session: ' + req.body)
    console.log('session: ' + req.body.userid)
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select * from semantic_differential_user where user_id = ${req.body.userid} and sesid = ${req.body.ses} limit 5`
    })(req,res);
})

router.post("/select-anonymous-by-user", (req, res) => {
    console.log('session: ' + req.body)
    console.log('session: ' + req.body.userid)
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select * from anonymous_semantic_differential_user where user_id = ${req.body.userid} and sesid = ${req.body.ses} limit 5`
    })(req,res);
})

router.post("/select-semantic-by-users-and-group", (req, res) => {
    console.log('session: ' + req.body.user_id)
    console.log('session: ' + req.body.session_id)
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select semantic_differential_user.* from teamusers 
                inner join users on
                users.id = teamusers.uid
                inner join semantic_differential_user on
                users.id = semantic_differential_user.user_id
                where tmid = (
                    select teamusers.tmid from teamusers
                    inner join users on
                    users.id = teamusers.uid
                    inner join teams on
                    teams.id = teamusers.tmid
                    where teamusers.uid = ${req.body.user_id}
                    and teams.sesid = ${req.body.session_id}
                )
                and users.id = ${req.body.user_id}
                and semantic_differential_user.sesid = ${req.body.session_id}`
    })(req,res);
})

router.post("/select_personal_evaluation_by_user", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select * from user_personal_evaluation where user_id = ${req.body.user_id} and sesid = ${req.body.session_id}`
    })(req,res);
})


router.post("/record-finish", rpg.execSQL({
    dbcon: pass.dbcon,
    sql: "with rows as (update finish_session set stime = now() where uid = $1 and sesid = $2 and status = $3 returning 1) " +
        "insert into finish_session(uid,sesid,status,stime) select $4,$5,$6,now() where 1 not in (select * from rows)",
    sesReqData: ["uid","ses"],
    postReqData: ["status"],
    sqlParams: [rpg.param("ses", "uid"),rpg.param("ses", "ses"),rpg.param("post", "status"),rpg.param("ses", "uid"),rpg.param("ses", "ses"),rpg.param("post", "status")]
}));

router.post("/get-finished", rpg.singleSQL({
    dbcon: pass.dbcon,
    sql: "select $1 in (select uid from finish_session where sesid = $2 and status = $3) as finished",
    sesReqData: ["ses","uid"],
    sqlParams: [rpg.param("ses","uid"),rpg.param("ses","ses"),rpg.param("post","status")]
}));

router.post("/delete-idea", rpg.execSQL({
    dbcon: pass.dbcon,
    sql: "delete from ideas where uid = $1 and id = $2",
    sesReqData: ["uid"],
    postReqData: ["id"],
    sqlParams: [rpg.param("ses", "uid"), rpg.param("post", "id")]
}));

module.exports = router;