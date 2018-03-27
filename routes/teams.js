"use strict";

let express = require('express');
let router = express.Router();
let rpg = require("../modules/rest-pg");
let pass = require("../modules/passwords");
let socket = require("../modules/socket.config");

router.post("/get-team-selection",rpg.multiSQL({
    dbcon: pass.dbcon,
    sql: "select distinct s.answer, s.uid, s.qid, s.comment from selection as s, questions as q where q.sesid = $1 and " +
        "s.uid in (select tu.uid from teamusers as tu where tu.tmid = (select t.id from teamusers as tu, teams as t where " +
        "t.sesid = $2 and tu.tmid = t.id and tu.uid = $3)) and s.iteration = $4",
    sesReqData: ["ses","uid"],
    postReqData: ["iteration"],
    sqlParams: [rpg.param("ses","ses"),rpg.param("ses","ses"),rpg.param("ses","uid"),rpg.param("post","iteration")]
}));

router.post("/get-team-ideas",rpg.multiSQL({
    dbcon: pass.dbcon,
    sql: "select i.id, i.uid, i.content, i.descr, i.serial, i.docid from ideas as i inner join documents as d on i.docid = d.id where " +
        "d.sesid = $1 and i.uid in (select tu.uid from teamusers as tu where tu.tmid = (select t.id from teamusers as tu, teams as t where " +
        "t.sesid = $2 and tu.tmid = t.id and tu.uid = $3)) and i.iteration = $4 order by i.orden asc",
    sesReqData: ["ses","uid"],
    postReqData: ["iteration"],
    sqlParams: [rpg.param("ses","ses"),rpg.param("ses","ses"),rpg.param("ses","uid"),rpg.param("post","iteration")]
}));

router.post("/get-team-semantic-units",rpg.multiSQL({
    dbcon: pass.dbcon,
    sql: "select u.id, u.sentences, u.comment, u.docs, u.iteration, u.uid from semantic_unit as u where u.sesid = $1 and " +
        "u.uid in (select tu.uid from teamusers as tu where tu.tmid = (select t.id from teamusers as tu, teams as t where " +
        "t.sesid = $2 and tu.tmid = t.id and tu.uid = $3)) and u.iteration = $4 order by u.uid asc",
    sesReqData: ["ses","uid"],
    postReqData: ["iteration"],
    sqlParams: [rpg.param("ses","ses"),rpg.param("ses","ses"),rpg.param("ses","uid"),rpg.param("post","iteration")]
}));

router.post("/get-ses-info",rpg.singleSQL({
    dbcon: pass.dbcon,
    sql: "select greatest(0,least(7,s.status-2)) as iteration, $1::int as uid, s.name, s.id, s.descr, s.options, s.type, sr.stime, s.waiting_partners, s.times_waiting, s.final_response from sessions as s " +
        "left outer join status_record as sr on sr.sesid = s.id and s.status = sr.status where s.id = $2",
    sesReqData: ["ses","uid"],
    sqlParams: [rpg.param("ses","uid"),rpg.param("ses","ses")]
}));

router.post("/create-personal-evaluation", (req, res) => {
    rpg.singleSQL({
        dbcon: pass.dbcon,
        sql: `insert into user_personal_evaluation(min_name,max_name,sesid,value,created_at,updated_at,user_id,team_id) values('Indefinido','Indefinido',${req.body.ses_id},0,now(),now(),${req.body.user_id},${req.body.team_id})`
    })(req, res);
    res.end('{"creado": "Item agregado correctamente"}')
})

router.post("/update_semantic_differential_user", (req, res) => {
    rpg.singleSQL({
        dbcon: pass.dbcon,
        sql: `UPDATE semantic_differential_user SET min_name = '${req.body.data.min_name}', max_name = '${req.body.data.max_name}',value = ${req.body.data.value}, description = '${req.body.data.description}' where id = ${req.body.data.id}`
    })(req, res);
    res.end('{"creado": "Item modificado correctamente"}')
})

router.post("/update_second_iteration_personal_evaluation", (req, res) => {
    rpg.singleSQL({
        dbcon: pass.dbcon,
        sql: `UPDATE second_iteration_personal_evaluation SET min_name = '${req.body.data.min_name}', max_name = '${req.body.data.max_name}',value = ${req.body.data.value}, description = '${req.body.data.description}' where id = ${req.body.data.id}`
    })(req, res);
    res.end('{"creado": "Diferencial semántico modificado"}')
})

router.post("/update_third_iteration_personal_evaluation", (req, res) => {
    rpg.singleSQL({
        dbcon: pass.dbcon,
        sql: `UPDATE third_iteration_personal_evaluation SET min_name = '${req.body.data.min_name}', max_name = '${req.body.data.max_name}',value = ${req.body.data.value}, description = '${req.body.data.description}' where id = ${req.body.data.id}`
    })(req, res);
    res.end('{"creado": "Diferencial semántico modificado"}')
})

router.post("/update_semantic_differential_first_iteration", (req, res) => {
    rpg.singleSQL({
        dbcon: pass.dbcon,
        sql: `UPDATE first_iteration_group SET min_name = '${req.body.data.min_name}', max_name = '${req.body.data.max_name}',value = ${req.body.data.value}, description = '${req.body.data.description}' where id = ${req.body.data.id}`
    })(req, res);
    res.end('{"creado": "Diferencial semántico modificado"}')
})

router.post("/update_semantic_differential_second_iteration", (req, res) => {
    rpg.singleSQL({
        dbcon: pass.dbcon,
        sql: `UPDATE second_iteration_group SET min_name = '${req.body.data.min_name}', max_name = '${req.body.data.max_name}',value = ${req.body.data.value}, description = '${req.body.data.description}' where id = ${req.body.data.id}`
    })(req, res);
    res.end('{"creado": "Diferencial semántico modificado"}')
})

router.post("/update_semantic_differential_third_iteration", (req, res) => {
    rpg.singleSQL({
        dbcon: pass.dbcon,
        sql: `UPDATE third_iteration_group SET min_name = '${req.body.data.min_name}', max_name = '${req.body.data.max_name}',value = ${req.body.data.value}, description = '${req.body.data.description}' where id = ${req.body.data.id}`
    })(req, res);
    res.end('{"creado": "Diferencial semántico modificado"}')
})

router.post("/update_anonymous_semantic_differential_user", (req, res) => {
    rpg.singleSQL({
        dbcon: pass.dbcon,
        sql: `UPDATE anonymous_semantic_differential_user SET min_name = '${req.body.data.min_name}', max_name = '${req.body.data.max_name}',value = ${req.body.data.value}, description = '${req.body.data.description}' where id = ${req.body.data.id}`
    })(req, res);
    res.end('{"creado": "Diferencial semántico modificado"}')
})

router.post("/update_personal_evaluations", (req, res) => {
    rpg.singleSQL({
        dbcon: pass.dbcon,
        sql: `UPDATE user_personal_evaluation SET min_name = '${req.body.data.min_name}', max_name = '${req.body.data.max_name}',value = ${req.body.data.value}, description = '${req.body.data.description}' where id = ${req.body.data.id}`
    })(req, res);
    res.end('{"creado": "Diferencial semántico modificado"}')
})

router.post("/get_final_response_user", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select * from final_response_user where user_id = ${req.session.uid} and session_id = ${req.body.id}`
    })(req, res);
})

router.post("/get_quantity_finished_by_group", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select * from final_response_user 
                where session_id = ${req.body} 
                and user_id in (select teamusers.uid from teams
                inner join teamusers on
                teamusers.tmid = teams.id
                where teams.leader = ${req.session.uid}
                and teams.sesid = ${req.body})
                `
    })(req, res);
})

router.post("/get_quantity_by_group", (req, res) => {
    rpg.singleSQL({
        dbcon: pass.dbcon,
        sql: `select count(*)-1 as cantidad from teams
                inner join teamusers on
                teamusers.tmid = teams.id
                where teams.leader = ${req.session.uid}
                and teams.sesid = ${req.body}`
    })(req,res);
})

router.post("/final_response_by_user", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `insert into final_response_user(user_id, team_id, session_id, option_value) values(${req.session.uid}, ${req.body.team_id}, ${req.body.ses_id}, '${req.body.response_value}')`,
        onEnd: (req,res) => {
            socket.updateUserIteration(req.body);
        }
    })(req,res);
})

router.post("/all_personal_evaluations", (req, res) => {
    rpg.multiSQL({
        dbcon: pass.dbcon,
        sql: `select * from user_personal_evaluation where sesid = ${req.body.ses_id} and user_id = ${req.body.user_id} order by order_sort limit 1`
    })(req,res);
})

router.post("/remove_personal_evaluations", (req, res) => {
    rpg.singleSQL({
        dbcon: pass.dbcon,
        sql: `delete from user_personal_evaluation where id = ${req.body}`
    })(req, res);
});

router.post("/get-team-leader",rpg.singleSQL({
    dbcon: pass.dbcon,
    sql: "select leader, original_leader, id from teams inner join teamusers on tmid = id where uid = $1 and sesid = $2",
    sesReqData: ["ses","uid"],
    sqlParams: [rpg.param("ses","uid"),rpg.param("ses","ses")]
}));

router.post("/get-team-sync-ideas", rpg.multiSQL({
    dbcon: pass.dbcon,
    sql: "select i.id, i.content, i.descr, i.serial, i.docid from ideas as i inner join documents as d on i.docid = d.id where " +
        "i.uid in (select original_leader from teams inner join teamusers on tmid = id where uid = $1 and sesid = $2) and d.sesid = $3 and " +
        "i.iteration = 3 order by i.orden asc",
    sesReqData: ["uid", "ses"],
    sqlParams: [rpg.param("ses", "uid"), rpg.param("ses", "ses"), rpg.param("ses", "ses")]
}));

router.post("/check-team-answer",rpg.multiSQL({
    dbcon: pass.dbcon,
    sql: "select t.uid, s.answer, q.comment, q.answer as realanswer from (select uid from teamusers where tmid in (select tmid from teams inner join teamusers " +
        "on id = tmid where uid = $1 and sesid = $2)) as t left outer join (select uid, answer, qid from selection where iteration = 3 " +
        "and qid = $3) as s on s.uid = t.uid left outer join questions as q on s.qid = q.id",
    sesReqData: ["ses","uid"],
    postReqData: ["qid"],
    sqlParams: [rpg.param("ses","uid"),rpg.param("ses","ses"),rpg.param("post","qid")],
    onEnd: (req,res,arr) => {
        let answered = true;
        let option = null;
        let sameOption = true;
        let real_ans = null;
        let real_comment = null;
        arr.forEach((row) => {
            answered = answered && row.answer != null;
            option = (option == null)? row.answer : option;
            sameOption = sameOption && row.answer == option;
            real_ans = row.realanswer;
            real_comment = row.comment;
        });
        if(!answered){
            res.end('{"status":"incomplete"}');
        }
        else if(!sameOption){
            res.end('{"status":"different"}');
        }
        else if(option != real_ans){
            res.end('{"status":"incorrect", "msg": "'+real_comment+'"}');
        }
        else{
            res.end('{"status":"ok"}');
        }
    }
}));


router.post("/get-team", rpg.multiSQL({
    dbcon: pass.dbcon,
    sql: "select u.name, u.id, t.progress, t.id as tmid, u.id in (select uid from finish_session where status = 5 and sesid = $1) as finished from " +
        "users as u, teams as t, teamusers as tu where tu.uid = u.id and t.id = tu.tmid and t.sesid = $2 and t.id in " +
        "(select tmid from teamusers where uid = $3)",
    sesReqData: ["uid", "ses"],
    sqlParams: [rpg.param("ses", "ses"), rpg.param("ses", "ses"), rpg.param("ses", "uid")]
}));

router.post("/send-team-progress", rpg.execSQL({
    dbcon: pass.dbcon,
    sql: "update teams set progress = $1 where id = $2",
    sesReqData: ["ses","uid"],
    postReqData: ["tmid","progress"],
    sqlParams: [rpg.param("post","progress"),rpg.param("post","tmid")],
    onEnd: (req,res,ans) => {
        socket.teamProgress(req.session.ses, req.body.tmid);
    }
}));

router.post("/update-my-team", rpg.singleSQL({
    dbcon: pass.dbcon,
    sql: "select id from teams inner join teamusers on tmid = id where uid = $1 and sesid = $2",
    sesReqData: ["ses","uid"],
    sqlParams: [rpg.param("ses","uid"),rpg.param("ses","ses")],
    onEnd: (req,res,ans) => {
        socket.updateTeam(ans.id);
    }
}));

router.post("/take-team-control", rpg.execSQL({
    dbcon: pass.dbcon,
    sql: "update teams set leader = $1 from teamusers where tmid = id and uid = $2 and sesid = $3",
    sesReqData: ["uid", "ses"],
    sqlParams: [rpg.param("ses", "uid"), rpg.param("ses", "uid"), rpg.param("ses", "ses")]
}));

router.post("/get-original-leaders", rpg.multiSQL({
    dbcon: pass.dbcon,
    sql: "select t.original_leader as leader, array_agg(tu.uid) as team from teams as t inner join teamusers as tu on " +
        "t.id = tu.tmid where t.sesid = $1 group by t.original_leader",
    postReqData: ["sesid"],
    sqlParams: [rpg.param("post", "sesid")]
}));

module.exports = router;