--
-- PostgreSQL database dump
--

\restrict 7G9slBts5J2l3tbV6i1UmsQfZd43ILjJyFxPPo8YQ6GdphfX3izEdsWNrtdYgKK

-- Dumped from database version 17.6
-- Dumped by pg_dump version 17.9 (Ubuntu 17.9-1.pgdg24.04+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: usuarios; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.usuarios (id, email, created_at) VALUES ('1b462e01-0310-4094-86a2-13a4f747afcb', 'deromrm27@gmail.com', '2026-02-06 02:47:56+00');
INSERT INTO public.usuarios (id, email, created_at) VALUES ('2a51a916-c038-4116-a193-e56d2e426b56', 'ameliaticonapari@gmail.com', '2026-02-06 02:50:18.958348+00');


--
-- Data for Name: administradores; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.administradores (id, user_id, created_at, email) VALUES (1, '1b462e01-0310-4094-86a2-13a4f747afcb', '2026-02-06 02:48:50+00', 'deromrm27@gmail.com');
INSERT INTO public.administradores (id, user_id, created_at, email) VALUES (2, '2a51a916-c038-4116-a193-e56d2e426b56', '2026-02-06 02:53:09+00', 'ameliaticonapari@gmail.com');


--
-- Data for Name: config; Type: TABLE DATA; Schema: public; Owner: -
--

INSERT INTO public.config (dato, valor) VALUES ('meta', '99999');
INSERT INTO public.config (dato, valor) VALUES ('bono', '0');


--
-- Data for Name: productos; Type: TABLE DATA; Schema: public; Owner: -
--



--
-- Name: administradores_id_seq; Type: SEQUENCE SET; Schema: public; Owner: -
--

SELECT pg_catalog.setval('public.administradores_id_seq', 1, true);


--
-- PostgreSQL database dump complete
--

\unrestrict 7G9slBts5J2l3tbV6i1UmsQfZd43ILjJyFxPPo8YQ6GdphfX3izEdsWNrtdYgKK

