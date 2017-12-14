--
-- PostgreSQL database dump
--

SET statement_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SET check_function_bodies = false;
SET client_min_messages = warning;

--
-- Name: plpgsql; Type: EXTENSION; Schema: -; Owner: 
--

CREATE EXTENSION IF NOT EXISTS plpgsql WITH SCHEMA pg_catalog;


--
-- Name: EXTENSION plpgsql; Type: COMMENT; Schema: -; Owner: 
--

COMMENT ON EXTENSION plpgsql IS 'PL/pgSQL procedural language';


SET search_path = public, pg_catalog;

--
-- Name: tipo_aprendizaje; Type: TYPE; Schema: public; Owner: postgres
--

CREATE TYPE tipo_aprendizaje AS ENUM (
    'Reflexivo',
    'Activo',
    'Teorico',
    'Pragmatico'
);


ALTER TYPE public.tipo_aprendizaje OWNER TO postgres;

SET default_tablespace = '';

SET default_with_oids = false;

--
-- Name: criteria; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE criteria (
    id integer NOT NULL,
    name text NOT NULL,
    pond integer NOT NULL,
    inicio text,
    proceso text,
    competente text,
    avanzado text,
    rid integer
);


ALTER TABLE public.criteria OWNER TO postgres;

--
-- Name: criteria_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE criteria_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.criteria_id_seq OWNER TO postgres;

--
-- Name: criteria_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE criteria_id_seq OWNED BY criteria.id;


--
-- Name: criteria_selection; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE criteria_selection (
    id integer NOT NULL,
    selection integer,
    cid integer,
    uid integer,
    repid integer
);


ALTER TABLE public.criteria_selection OWNER TO postgres;

--
-- Name: criteria_selection_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE criteria_selection_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.criteria_selection_id_seq OWNER TO postgres;

--
-- Name: criteria_selection_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE criteria_selection_id_seq OWNED BY criteria_selection.id;


--
-- Name: documents; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE documents (
    id integer NOT NULL,
    title text NOT NULL,
    path text NOT NULL,
    sesid integer,
    uploader integer
);


ALTER TABLE public.documents OWNER TO postgres;

--
-- Name: documents_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE documents_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.documents_id_seq OWNER TO postgres;

--
-- Name: documents_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE documents_id_seq OWNED BY documents.id;


--
-- Name: ideas; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE ideas (
    id integer NOT NULL,
    content text,
    descr text,
    serial character varying(255),
    uid integer,
    docid integer,
    orden integer DEFAULT 100,
    iteration integer DEFAULT 1
);


ALTER TABLE public.ideas OWNER TO postgres;

--
-- Name: ideas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE ideas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.ideas_id_seq OWNER TO postgres;

--
-- Name: ideas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE ideas_id_seq OWNED BY ideas.id;


--
-- Name: questions; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE questions (
    id integer NOT NULL,
    content text,
    options text,
    answer integer,
    comment text,
    other text,
    sesid integer
);


ALTER TABLE public.questions OWNER TO postgres;

--
-- Name: questions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE questions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.questions_id_seq OWNER TO postgres;

--
-- Name: questions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE questions_id_seq OWNED BY questions.id;


--
-- Name: report_pair; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE report_pair (
    id integer NOT NULL,
    uid integer,
    sesid integer,
    repid integer
);


ALTER TABLE public.report_pair OWNER TO postgres;

--
-- Name: report_pair_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE report_pair_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.report_pair_id_seq OWNER TO postgres;

--
-- Name: report_pair_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE report_pair_id_seq OWNED BY report_pair.id;


--
-- Name: reports; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE reports (
    id integer NOT NULL,
    content text,
    example boolean DEFAULT false,
    rid integer,
    uid integer
);


ALTER TABLE public.reports OWNER TO postgres;

--
-- Name: reports_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE reports_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.reports_id_seq OWNER TO postgres;

--
-- Name: reports_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE reports_id_seq OWNED BY reports.id;


--
-- Name: rubricas; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE rubricas (
    id integer NOT NULL,
    sesid integer
);


ALTER TABLE public.rubricas OWNER TO postgres;

--
-- Name: rubricas_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE rubricas_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.rubricas_id_seq OWNER TO postgres;

--
-- Name: rubricas_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE rubricas_id_seq OWNED BY rubricas.id;


--
-- Name: selection; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE selection (
    answer integer,
    uid integer NOT NULL,
    comment text,
    qid integer NOT NULL,
    iteration integer
);


ALTER TABLE public.selection OWNER TO postgres;

--
-- Name: sessions; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE sessions (
    id integer NOT NULL,
    name text NOT NULL,
    descr text,
    "time" timestamp with time zone,
    creator integer,
    code character(6),
    status integer DEFAULT 1,
    type character(1)
);


ALTER TABLE public.sessions OWNER TO postgres;

--
-- Name: sessions_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE sessions_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.sessions_id_seq OWNER TO postgres;

--
-- Name: sessions_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE sessions_id_seq OWNED BY sessions.id;


--
-- Name: sesusers; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE sesusers (
    sesid integer,
    uid integer
);


ALTER TABLE public.sesusers OWNER TO postgres;

--
-- Name: teams; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE teams (
    id integer NOT NULL,
    sesid integer,
    leader integer
);


ALTER TABLE public.teams OWNER TO postgres;

--
-- Name: teams_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE teams_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.teams_id_seq OWNER TO postgres;

--
-- Name: teams_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE teams_id_seq OWNED BY teams.id;


--
-- Name: teamusers; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE teamusers (
    tmid integer,
    uid integer
);


ALTER TABLE public.teamusers OWNER TO postgres;

--
-- Name: users; Type: TABLE; Schema: public; Owner: postgres; Tablespace: 
--

CREATE TABLE users (
    id integer NOT NULL,
    name text NOT NULL,
    rut text NOT NULL,
    pass text NOT NULL,
    mail text NOT NULL,
    sex character(1),
    role character(1),
    aprendizaje tipo_aprendizaje
);


ALTER TABLE public.users OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE; Schema: public; Owner: postgres
--

CREATE SEQUENCE users_id_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.users_id_seq OWNER TO postgres;

--
-- Name: users_id_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: postgres
--

ALTER SEQUENCE users_id_seq OWNED BY users.id;


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY criteria ALTER COLUMN id SET DEFAULT nextval('criteria_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY criteria_selection ALTER COLUMN id SET DEFAULT nextval('criteria_selection_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY documents ALTER COLUMN id SET DEFAULT nextval('documents_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY ideas ALTER COLUMN id SET DEFAULT nextval('ideas_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY questions ALTER COLUMN id SET DEFAULT nextval('questions_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY report_pair ALTER COLUMN id SET DEFAULT nextval('report_pair_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY reports ALTER COLUMN id SET DEFAULT nextval('reports_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY rubricas ALTER COLUMN id SET DEFAULT nextval('rubricas_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY sessions ALTER COLUMN id SET DEFAULT nextval('sessions_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY teams ALTER COLUMN id SET DEFAULT nextval('teams_id_seq'::regclass);


--
-- Name: id; Type: DEFAULT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY users ALTER COLUMN id SET DEFAULT nextval('users_id_seq'::regclass);


--
-- Data for Name: criteria; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY criteria (id, name, pond, inicio, proceso, competente, avanzado, rid) FROM stdin;
1	Redacción	30	Más de 5 errores	Entre 3 y 5 errores	1 o 2 errores	Sin errores	1
2	Comprensión	70	No hay relación con el tema	Ideas aisladas tienen relación con el tema	Las ideas secundarias no tienen relación con el tema	Todo el texto se apega al tema	1
\.


--
-- Name: criteria_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('criteria_id_seq', 2, true);


--
-- Data for Name: criteria_selection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY criteria_selection (id, selection, cid, uid, repid) FROM stdin;
5	4	1	1	1
6	2	2	1	1
7	3	1	3	1
8	2	2	3	1
9	3	1	3	2
10	2	2	3	2
11	2	1	3	5
12	3	2	3	5
\.


--
-- Name: criteria_selection_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('criteria_selection_id_seq', 12, true);


--
-- Data for Name: documents; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY documents (id, title, path, sesid, uploader) FROM stdin;
3	Redes	uploads/1c22a449-6b91-4649-a14c-45402b774db4/pdf/Redes_Tarea3.pdf	2	2
2	Sist. Operativos	uploads/f68e346c-ce18-4b19-a92b-13ab57b354ef/pdf/t3.pdf	2	2
\.


--
-- Name: documents_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('documents_id_seq', 4, true);


--
-- Data for Name: ideas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY ideas (id, content, descr, serial, uid, docid, orden, iteration) FROM stdin;
16	Redes	dsadas	0/0/1:17,0/0/1:22	5	3	0	1
17	objetivo  de  esta	dasdas	0/6/1:4,0/6/1:22	5	3	1	1
18	EINTR	daadsa	0/43/3:18,0/43/3:23	5	2	2	1
19	modules2016-2.tgz	sadasdads	0/48/3:0,0/48/3:17	5	2	3	1
20	dos archivos pedidos	adadsads	0/3/3:18,0/3/3:38	5	3	4	1
6	Sistemas Operativos	Titulo del texto  sd	0/0/1:7,0/0/1:26	2	2	0	1
9	analizar  el  funcionamiento  de  RIPng	objetivo del texto	0/6/1:35,0/6/1:74	2	3	3	1
8	Redes	Titulo del texto	0/0/1:17,0/0/1:22	2	3	2	1
53	analizar  el  funcionamiento  de  RIPng 	idea fuerza	0/6/1:35,0/6/1:75	3	3	3	1
12	ordenadas cronológicamente	importante	0/26/1:0,0/26/1:26	3	2	4	1
34	para demostrar el comportamientoesperado	fasdfasd	0/20/1:1,0/21/1:8	3	2	5	1
61	pta si otro	fgdgfd	2/6/1:9,2/6/1:20	3	2	6	1
39	pendiente	es una idea fuerza	0/130/1:24,0/130/1:33	2	2	1	1
7	Escribir significa vender	Importante entender esto	0/12/1:42,0/12/1:67	2	2	4	1
62	.    Este problema  es similar  al pr	Ffddgg	0/9/1:0,0/9/1:37	3	2	7	1
14	ya ofreció una línea más	adsdsadas	0/6/1:53,0/6/1:77	4	2	1	1
13	Sistemas Operativos	dasdaads	0/0/1:7,0/0/1:26	4	2	0	1
33	pero	Ghghgdhg	0/12/1:1,0/12/1:5	4	2	2	1
15	Redes	dsaads	0/0/1:17,0/0/1:22	4	3	3	1
54	más larga	fsdfasd hgj	0/6/1:74,0/6/1:83	3	2	5	2
41	más larga	gsdfgsdf	0/1/6/1:0,0/1/6/1:9	3	2	1	2
56	Sistemas Operativos	dasdaads	0/0/1:7,0/0/1:26	3	2	0	2
55	analizar  el  funcionamiento  de  RIPng 	idea fuerza	0/6/1:35,0/6/1:75	3	3	6	2
43	el dispositivo /dev/remate.	fasdfsda	0/1/3/1:0,0/5/1:1	3	2	3	2
45	comportamientoesperado	fsdfasd	0/1/20/1:18,0/0/21/1:8	3	2	2	2
46	shell	fasdfasd	0/82/1:7,0/82/1:12	3	2	4	2
42	semestre	Fggfff	0/11/1:13,0/11/1:21	4	2	100	2
44	tanto	Bhshsgs	0/92/1:62,0/92/1:67	4	2	100	2
48	.  Para rechazar	Hgjghjg	0/102/1:0,0/102/1:16	4	2	100	2
49	 topologa	Fcfgd	0/7/1:18,0/7/1:29	4	3	100	2
50	DST	Dgfdgf	0/20/1:22,0/20/1:25	4	3	100	2
1	driver para Linux	Esto indica el motivo del texto, por lo tanto es necesario incluirlo	0/2/1:38,0/2/1:55	1	2	0	1
2	Sistemas Operativos	El titulo del documento	0/0/1:7,0/0/1:26	1	2	1	1
4	 entregue solo el archivo remate-impl.c 	Condiciones de entrega de la tarea	0/87/3:23,0/88/3:14	1	2	3	1
3	reproducir exactamente el mismo comportamiento	objetivo del lector del texto	0/23/1:19,0/23/1:65	1	2	4	1
5	 línea más larga	holi	0/6/1:67,0/6/1:83	1	2	2	1
52	 línea más larga	holi	0/6/1:67,0/6/1:83	1	2	0	2
51	Sistemas Operativos	El titulo del documento	0/0/1:7,0/0/1:26	1	2	1	2
57	Sistemas Operativos	dasdaads	0/0/1:7,0/0/1:26	3	2	0	3
58	shell	fasdfasd	0/82/1:7,0/82/1:12	3	2	1	3
59	más larga	fsdfasd hgj	0/6/1:74,0/6/1:83	3	2	2	3
60	tanto	Bhshsgs	0/92/1:62,0/92/1:67	3	2	3	3
40	pendiente	relevabte  de opjoiansf	0/130/1:24,0/130/1:33	3	2	0	1
32	más larga	fsdfasd	0/6/1:74,0/6/1:83	3	2	2	1
10	Redes	Titulo del texto	0/0/1:17,0/0/1:22	3	3	1	1
\.


--
-- Name: ideas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('ideas_id_seq', 62, true);


--
-- Data for Name: questions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY questions (id, content, options, answer, comment, other, sesid) FROM stdin;
2	Indique un sinonimo de sobresaliente	brillante\nexcelente\nsuperior\nconnotado\nelegante	1	hola	\N	10
3	¿Qué figura retórica representa la siguiente frase? "¡Están más pesados que 100 elefantes!"	Comparación\nHipérbole\nMetáfora\nSintesis\nPersonificación	1	La exageración de la expresión	\N	10
4	Cuanto es 1+2?	3\n2\n1\n0\n-1	0	Piense en la suma 2+1	\N	10
5	Cual es el resultado?	2\n0\n42\n4\n5	2	4*10+2	\N	10
6	Cuál es mayor?	3/7\n2/5\n13/29\n11/32\n7/17	2	Multiplique cruzado	12D	10
7	Elige la correcta	Esta no\nMira abajo\nEsta si\nTe pasaste\nMuy abajo	2	Facil	2A	10
\.


--
-- Name: questions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('questions_id_seq', 7, true);


--
-- Data for Name: report_pair; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY report_pair (id, uid, sesid, repid) FROM stdin;
1	5	2	3
2	4	2	3
3	5	2	2
4	3	2	2
5	3	2	5
6	1	2	5
7	1	2	6
8	4	2	6
\.


--
-- Name: report_pair_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('report_pair_id_seq', 8, true);


--
-- Data for Name: reports; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY reports (id, content, example, rid, uid) FROM stdin;
1	"Entro en cierta página de YouTube y veo que tiene más de 10.000.000 reproducciones. Repito: Diez millones. ¿El último hit de Lady Gaga, U2 o Justin Bieber? No. Es el "Poema 20" de Pablo Neruda, leído por el actor argentino Arturo Puig. Y eso, sin contar las reediciones del poema en innumerables libros impresos en castellano y en cuanta lengua existe. Más notable aún si consideramos que casi todas las composiciones de otros poetas, escritas en la misma época del "Poema 20", ya están perfectamente obsoletas y han pasado al olvido. Interesante, además, que ocurra con este poema que fue descalificado, y sigue siéndolo, con el lugar común de que no es un poema, sino un bolero, es decir, un texto supuestamente facilón, sentimentaloide y cursi; argumentos que serían abonados justamente por aquello de los diez millones. Esa descomunal cantidad de visitantes -se dice- jamás se interesaría en algo verdaderamente significativo y profundo. Lo que no explican es por qué otros poemas que podrían ser criticados sobre la misma base que el de Neruda no tienen ni remotamente el récord que ostenta el "Poema 20". O, dicho en otros términos, ¿qué encierran los versos de Neruda en particular, que son capaces de conmover a tan abrumador número de receptores y por una extensión de tiempo que parece no tener fin? Ese es el misterio.	t	1	2
4	un segundo ejemplo de calibración de la rúbrica	t	1	2
2	Los documentos tratan sobre tareas de computación. Ambos están conectados pues se refieren al área de sistemas. En el primero se puede ver que se pide implementar un sistema de sincronización para un sistema de archivos locales, en el segundo se puede ver que se trata de transmisión de datos en redes.	f	1	1
5	este es un reporte	f	1	4
6	Los documentos tratan sobre temas de ciencias de la computaicón	f	1	5
3	Esta es la respuesta jhjh jk	f	1	3
\.


--
-- Name: reports_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('reports_id_seq', 6, true);


--
-- Data for Name: rubricas; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY rubricas (id, sesid) FROM stdin;
1	2
\.


--
-- Name: rubricas_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('rubricas_id_seq', 1, true);


--
-- Data for Name: selection; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY selection (answer, uid, comment, qid, iteration) FROM stdin;
1	3	sdadsa	2	1
1	3	HOLA	3	1
0	3	CHAO	4	1
2	3	\N	5	1
3	3	\N	6	1
1	3	\N	7	1
2	4	\N	6	1
0	5	\N	4	1
2	5	\N	5	1
2	5	\N	7	1
2	4	\N	5	1
2	1	me parece correcto	5	1
2	1	definitivamente es mayor	6	1
2	1	no estoy seguro pero las demás no me convencen	2	1
0	1	facil	4	1
0	4	creo que es esta	2	1
1	4	exageración	3	1
0	4	facil	4	1
1	1	exagera	3	2
0	1	mantengo mi respuesta	4	2
2	1	.	5	2
2	1	\N	6	2
0	4	\N	2	2
1	4	\N	3	2
0	4	\N	4	2
2	4	la clave del universo	5	2
2	4	\N	6	2
2	4	\N	7	2
0	1	esta si	2	2
2	1	esta es correcta	7	2
0	4	\N	2	3
0	1	dsa	2	3
1	1	\N	3	3
2	4	\N	3	3
0	3	dssaDSA  fd	2	3
0	5	Gsvahsg	2	3
0	5	\N	3	3
0	3	\N	3	3
0	5	\N	4	3
\.


--
-- Data for Name: sessions; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY sessions (id, name, descr, "time", creator, code, status, type) FROM stdin;
10	Tarea Comprensión Lectora y Selección	Para cada texto seleccione la alternativa correcta	2016-12-08 17:17:49.908323-03	2	\N	5	S
2	Tarea Comprensión Lectora	Lea los documentos. Identifique ideas fuerza justificadas. Redacte un resumen con el mensaje principal de los documentos.	2016-11-13 19:05:42.994025-03	2	\N	3	L
\.


--
-- Name: sessions_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('sessions_id_seq', 10, true);


--
-- Data for Name: sesusers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY sesusers (sesid, uid) FROM stdin;
2	2
2	1
10	2
10	1
10	3
10	4
10	5
2	3
2	4
2	5
\.


--
-- Data for Name: teams; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY teams (id, sesid, leader) FROM stdin;
6	10	3
5	10	1
31	2	1
32	2	3
\.


--
-- Name: teams_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('teams_id_seq', 32, true);


--
-- Data for Name: teamusers; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY teamusers (tmid, uid) FROM stdin;
5	4
6	5
6	3
5	1
31	1
31	5
32	3
32	4
\.


--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

COPY users (id, name, rut, pass, mail, sex, role, aprendizaje) FROM stdin;
2	Profesor	12312312-3	793741d54b00253006453742ad4ed534	profesor@test	M	P	\N
3	Alumno test	12121212-1	c6865cf98b133f1f3de596a4a2894630	alumno@test	M	A	Reflexivo
5	Alumno 3 	22222222-2	3e340bb50277cb3c189d99ad85c9b25c	alumno3@test	F	A	Activo
4	Alumno 2 	11111111-1	c0eecfa0c829380ba0f0ac67a8d0db7b	alumno2@test	F	A	Teorico
1	Sergio Peñafiel	18922652-7	36f17c3939ac3e7b2fc9396fa8e953ea	elxsergio@gmail.com	M	A	Pragmatico
\.


--
-- Name: users_id_seq; Type: SEQUENCE SET; Schema: public; Owner: postgres
--

SELECT pg_catalog.setval('users_id_seq', 5, true);


--
-- Name: criteria_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY criteria
    ADD CONSTRAINT criteria_pkey PRIMARY KEY (id);


--
-- Name: criteria_selection_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY criteria_selection
    ADD CONSTRAINT criteria_selection_pkey PRIMARY KEY (id);


--
-- Name: documents_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY documents
    ADD CONSTRAINT documents_pkey PRIMARY KEY (id);


--
-- Name: ideas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY ideas
    ADD CONSTRAINT ideas_pkey PRIMARY KEY (id);


--
-- Name: questions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY questions
    ADD CONSTRAINT questions_pkey PRIMARY KEY (id);


--
-- Name: report_pair_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY report_pair
    ADD CONSTRAINT report_pair_pkey PRIMARY KEY (id);


--
-- Name: reports_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY reports
    ADD CONSTRAINT reports_pkey PRIMARY KEY (id);


--
-- Name: rubricas_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY rubricas
    ADD CONSTRAINT rubricas_pkey PRIMARY KEY (id);


--
-- Name: sessions_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY sessions
    ADD CONSTRAINT sessions_pkey PRIMARY KEY (id);


--
-- Name: teams_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY teams
    ADD CONSTRAINT teams_pkey PRIMARY KEY (id);


--
-- Name: users_pkey; Type: CONSTRAINT; Schema: public; Owner: postgres; Tablespace: 
--

ALTER TABLE ONLY users
    ADD CONSTRAINT users_pkey PRIMARY KEY (id);


--
-- Name: selection_pkey; Type: INDEX; Schema: public; Owner: postgres; Tablespace: 
--

CREATE UNIQUE INDEX selection_pkey ON selection USING btree (uid, qid, iteration);


--
-- Name: criteria_rid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY criteria
    ADD CONSTRAINT criteria_rid_fkey FOREIGN KEY (rid) REFERENCES rubricas(id);


--
-- Name: criteria_selection_cid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY criteria_selection
    ADD CONSTRAINT criteria_selection_cid_fkey FOREIGN KEY (cid) REFERENCES criteria(id);


--
-- Name: criteria_selection_repid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY criteria_selection
    ADD CONSTRAINT criteria_selection_repid_fkey FOREIGN KEY (repid) REFERENCES reports(id);


--
-- Name: criteria_selection_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY criteria_selection
    ADD CONSTRAINT criteria_selection_uid_fkey FOREIGN KEY (uid) REFERENCES users(id);


--
-- Name: documents_sesid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY documents
    ADD CONSTRAINT documents_sesid_fkey FOREIGN KEY (sesid) REFERENCES sessions(id);


--
-- Name: documents_uploader_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY documents
    ADD CONSTRAINT documents_uploader_fkey FOREIGN KEY (uploader) REFERENCES users(id);


--
-- Name: fk_leader; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY teams
    ADD CONSTRAINT fk_leader FOREIGN KEY (leader) REFERENCES users(id);


--
-- Name: ideas_docid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY ideas
    ADD CONSTRAINT ideas_docid_fkey FOREIGN KEY (docid) REFERENCES documents(id);


--
-- Name: ideas_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY ideas
    ADD CONSTRAINT ideas_uid_fkey FOREIGN KEY (uid) REFERENCES users(id);


--
-- Name: questions_sesid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY questions
    ADD CONSTRAINT questions_sesid_fkey FOREIGN KEY (sesid) REFERENCES sessions(id);


--
-- Name: report_pair_repid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY report_pair
    ADD CONSTRAINT report_pair_repid_fkey FOREIGN KEY (repid) REFERENCES reports(id);


--
-- Name: report_pair_sesid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY report_pair
    ADD CONSTRAINT report_pair_sesid_fkey FOREIGN KEY (sesid) REFERENCES sessions(id);


--
-- Name: report_pair_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY report_pair
    ADD CONSTRAINT report_pair_uid_fkey FOREIGN KEY (uid) REFERENCES users(id);


--
-- Name: reports_rid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY reports
    ADD CONSTRAINT reports_rid_fkey FOREIGN KEY (rid) REFERENCES rubricas(id);


--
-- Name: reports_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY reports
    ADD CONSTRAINT reports_uid_fkey FOREIGN KEY (uid) REFERENCES users(id);


--
-- Name: rubricas_sesid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY rubricas
    ADD CONSTRAINT rubricas_sesid_fkey FOREIGN KEY (sesid) REFERENCES sessions(id);


--
-- Name: selection_qid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY selection
    ADD CONSTRAINT selection_qid_fkey FOREIGN KEY (qid) REFERENCES questions(id);


--
-- Name: selection_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY selection
    ADD CONSTRAINT selection_uid_fkey FOREIGN KEY (uid) REFERENCES users(id);


--
-- Name: sessions_creator_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY sessions
    ADD CONSTRAINT sessions_creator_fkey FOREIGN KEY (creator) REFERENCES users(id);


--
-- Name: sesusers_sesid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY sesusers
    ADD CONSTRAINT sesusers_sesid_fkey FOREIGN KEY (sesid) REFERENCES sessions(id);


--
-- Name: sesusers_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY sesusers
    ADD CONSTRAINT sesusers_uid_fkey FOREIGN KEY (uid) REFERENCES users(id);


--
-- Name: teams_sesid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY teams
    ADD CONSTRAINT teams_sesid_fkey FOREIGN KEY (sesid) REFERENCES sessions(id);


--
-- Name: teamusers_tmid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY teamusers
    ADD CONSTRAINT teamusers_tmid_fkey FOREIGN KEY (tmid) REFERENCES teams(id);


--
-- Name: teamusers_uid_fkey; Type: FK CONSTRAINT; Schema: public; Owner: postgres
--

ALTER TABLE ONLY teamusers
    ADD CONSTRAINT teamusers_uid_fkey FOREIGN KEY (uid) REFERENCES users(id);


--
-- Name: public; Type: ACL; Schema: -; Owner: postgres
--

REVOKE ALL ON SCHEMA public FROM PUBLIC;
REVOKE ALL ON SCHEMA public FROM postgres;
GRANT ALL ON SCHEMA public TO postgres;
GRANT ALL ON SCHEMA public TO PUBLIC;


--
-- PostgreSQL database dump complete
--

