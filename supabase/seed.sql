SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_clients; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_authorizations; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: oauth_consents; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."users" ("id", "username", "display_name", "bio", "location", "image_url", "website", "join_date", "follower_count", "following_count", "cover_image_url", "top_technologies", "github_url", "linkedin_url") VALUES
	('user_2x6baZqyYhTgll06OwxRkkgM81r', 'test_user', 'Test User', 'This is my biography', 'San Francisco', 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvdXBsb2FkZWQvaW1nXzJ4QmgwQm1ISm9nYlRqZ2tHS0xuZjZuRzJyaSJ9', 'https://x.com/dartilesm', '2025-05-14 22:25:36.106596+00', 3, 0, NULL, NULL, NULL, NULL),
	('user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'dartilesm', 'Diego Artiles', 'Senior Frontend Engineer with 10 years of experience', 'Buenos Aires, Argentina', 'https://img.clerk.com/eyJ0eXBlIjoicHJveHkiLCJzcmMiOiJodHRwczovL2ltYWdlcy5jbGVyay5kZXYvb2F1dGhfZ2l0aHViL2ltZ18yeDFCc3RqSFI5VTBBT2JXV2NqMkxZSWJLOVUifQ', 'https://dartiles.dev', '2025-05-13 00:25:09.839424+00', 0, 3, 'https://tshvilqfreifjtrdjrqj.supabase.co/storage/v1/object/public/post-images/user_2x1BsnAmgPArzn4l8kjqSpVB8bf/profile/1754792478325_cover.webp', '{typescript,nextjs,javascript}', 'https://github.com/dartilesm', '');


--
-- Data for Name: posts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."posts" ("id", "user_id", "content", "parent_post_id", "repost_post_id", "reply_count", "repost_count", "star_count", "coffee_count", "approve_count", "cache_count", "created_at") VALUES
	('20b6be6a-1999-43cd-b1ef-788084989a9e', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'A reply to "New reply!"', 'fc644c2c-6015-4095-b797-456228353f04', NULL, 0, 0, 0, 0, 0, 0, '2025-05-20 23:33:50.089883+00'),
	('2819fab8-db56-49be-bbca-2ecc1e3d6916', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'Fifth post!', NULL, NULL, 0, 0, 0, 0, 0, 0, '2025-05-21 12:32:52.794757+00'),
	('4e5e4f11-b43c-4bef-b0e6-746c8135ea19', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'This is a reply to Another reply to faboulous!!', '8278b510-fd0d-45dc-b631-380bdda93d28', NULL, 0, 0, 0, 0, 0, 0, '2025-05-21 11:59:41.879031+00'),
	('6c20e6b3-f3b1-4119-8b51-6b2686695438', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'This is a reply to Another reply to faboulous!! 2', '8278b510-fd0d-45dc-b631-380bdda93d28', NULL, 0, 0, 0, 0, 0, 0, '2025-05-21 12:00:25.776208+00'),
	('75d990fc-7252-4af5-be17-20e9e08286db', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'Fourth post!', NULL, NULL, 0, 0, 0, 0, 0, 0, '2025-05-21 12:32:24.96579+00'),
	('7c0d2c7b-5471-4676-8c78-7846330192bd', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'A reply of the first reply', 'fad06c7a-002c-468f-bb75-52d183d9a09e', NULL, 0, 0, 0, 0, 0, 0, '2025-05-16 23:36:01.863673+00'),
	('970cb353-e478-4d1a-9229-ff7e57c73713', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'This is an answer of the reply', '3149f94a-0dfb-40d7-b64e-17ac4a6755c5', NULL, 0, 0, 0, 0, 0, 0, '2025-05-21 11:55:45.594048+00'),
	('a934c5a0-ccbf-412e-a4c3-0ca7cd049347', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'Seventh post!', NULL, NULL, 0, 0, 0, 0, 0, 0, '2025-05-21 12:37:09.943215+00'),
	('f909dc68-a8e1-4624-be48-c37347a58bc9', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'Sixth post!', NULL, NULL, 0, 0, 0, 0, 0, 0, '2025-05-21 12:36:33.963219+00'),
	('dfb6852c-a9ee-4dc6-b794-505b514bbe9b', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'Wow, thank you for sharing this code! :) ', '7ab554d2-ff14-4332-8a5a-f46b6502ad7a', NULL, 0, 0, 0, 0, 0, 0, '2025-06-07 14:05:51.821489+00'),
	('75d7c279-5ca3-4abf-a4fd-de52233a7974', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', '> I am a bit confusing

What do you mean by that? 🤔', NULL, NULL, 0, 0, 0, 0, 0, 0, '2025-06-07 14:23:41.061799+00'),
	('c0b56b72-4fe0-43a2-bd6b-ee714cfd770e', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'This is new post **made** with Markdown

### Woooow

```javascript
function getConsoleLog(data) {
  console.log(data)
}
```', NULL, NULL, 0, 0, 0, 0, 0, 0, '2025-06-01 22:34:37.105088+00'),
	('72b79dd4-77f7-4c92-9ffd-e8632dfed6c5', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'This another try *wow* and **woow**:

## H2 content :O 

```typescript
interface MyInterface {
  content: string;
}
```', NULL, NULL, 0, 0, 0, 0, 0, 0, '2025-06-01 22:42:28.081586+00'),
	('34d1d38f-a12c-4b4f-a810-2daf6a527743', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'This is a post with image 👀

![Frame 1.png](blob:http://localhost:3000/b3e0d171-b560-40b2-be6b-2c08c418566b)', NULL, NULL, 0, 0, 0, 0, 0, 0, '2025-06-01 22:44:37.981719+00'),
	('fc644c2c-6015-4095-b797-456228353f04', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'A reply to "New reply!"', '457144ff-0fd1-47d0-9ec1-b04716a477fe', NULL, 2, 0, 0, 0, 0, 0, '2025-05-20 23:13:38.647666+00'),
	('6649409e-97d1-42e1-9957-c3d626d1ca15', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'Reposting this content of @Diego', NULL, '5c3cc1e2-ba3e-4e02-9cb0-4adc62edf9f5', 0, 0, 0, 0, 0, 0, '2025-06-16 02:23:20.073623+00'),
	('72c260a1-e0c1-4554-9521-d435ad4176fa', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'Reposting this post without an image', NULL, '80bc93ae-553a-4998-9baa-9fba251ef8d8', 0, 0, 0, 0, 0, 0, '2025-06-16 02:23:58.474039+00'),
	('43a656b5-6971-4770-9624-e68c428bfe44', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'This looks great!!', NULL, NULL, 0, 0, 0, 0, 0, 0, '2025-06-28 21:52:24.051196+00'),
	('5dd54285-70df-44f3-8f5f-64d20d8e19ea', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'I am reposting this', NULL, NULL, 0, 0, 0, 0, 0, 0, '2025-06-28 21:53:12.423277+00'),
	('80adf60b-394a-4fe3-926b-e49941471983', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'Replying to this', '0e8c6996-8665-42f9-9d22-46de5dad49bf', NULL, 0, 0, 0, 0, 0, 0, '2025-06-28 21:57:31.607652+00'),
	('62fc022a-1c18-40dc-8806-44b74333af20', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'Creating a new post', NULL, NULL, 0, 0, 0, 0, 0, 0, '2025-06-28 22:34:19.244354+00'),
	('8e45dc6b-b980-43e7-9aa8-9f6dc376ee5b', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'Posting a map

![US_Map_Time_Zones_1@2x.webp](/api/media/user_2x1BsnAmgPArzn4l8kjqSpVB8bf/1751206146058_image)', NULL, NULL, 0, 0, 0, 0, 0, 0, '2025-06-29 14:09:29.612493+00'),
	('307a8cad-954a-44fd-8eb7-5f627489e83e', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'Posting several images

![Frame 1.png](/api/media/user_2x1BsnAmgPArzn4l8kjqSpVB8bf/1751208694799_image)

![repository-open-graph-template.png](/api/media/user_2x1BsnAmgPArzn4l8kjqSpVB8bf/1751208697663_image)

![US_Map_Time_Zones_1@2x.webp](/api/media/user_2x1BsnAmgPArzn4l8kjqSpVB8bf/1751208700928_image)

![d947d1401ae0af3ae67ef1358ffccdcbb4141fa2-960x720.png](/api/media/user_2x1BsnAmgPArzn4l8kjqSpVB8bf/1751208710664_image)', NULL, NULL, 0, 0, 0, 0, 0, 0, '2025-06-29 14:52:01.686209+00'),
	('b94ddb55-d373-4c5c-bb7f-f902cdceb820', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'Posting three images

![Frame 1.png](/api/media/user_2x1BsnAmgPArzn4l8kjqSpVB8bf/1751209837374_image)

![repository-open-graph-template.png](/api/media/user_2x1BsnAmgPArzn4l8kjqSpVB8bf/1751209840918_image)

![US_Map_Time_Zones_1@2x.webp](/api/media/user_2x1BsnAmgPArzn4l8kjqSpVB8bf/1751209842952_image)', NULL, NULL, 0, 0, 0, 0, 0, 0, '2025-06-29 15:10:52.973403+00'),
	('deef0365-32e4-4ee3-95d3-fd2d747c9482', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'Testing if all the images load and are moved to the permanent link

![US_Map_Time_Zones_1@2x.webp](http://localhost:3000/api/media/user_2x1BsnAmgPArzn4l8kjqSpVB8bf/1751653643539_image)

![Frame 1.png](http://localhost:3000/api/media/user_2x1BsnAmgPArzn4l8kjqSpVB8bf/1751653647117_image)

![repository-open-graph-template.png](http://localhost:3000/api/media/user_2x1BsnAmgPArzn4l8kjqSpVB8bf/1751653651038_image)', NULL, NULL, 0, 0, 0, 0, 0, 0, '2025-07-04 18:28:06.039701+00'),
	('ad07828b-0b46-4a6c-8009-278a695cad3e', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'Add a test post', NULL, NULL, 0, 0, 0, 0, 0, 0, '2025-07-04 18:48:58.129738+00'),
	('26a7dfe3-ced2-46db-b9e0-e7bb79f13c2c', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'Hello', NULL, NULL, 0, 0, 0, 0, 0, 0, '2025-09-06 23:20:18.181208+00'),
	('9bf0b755-289b-4602-8ee0-1927860040e2', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'This is a reply from a modal

![d947d1401ae0af3ae67ef1358ffccdcbb4141fa2-960x720.png](http://localhost:3000/api/media/user_2x6baZqyYhTgll06OwxRkkgM81r/1750022937664_image)', '482974d1-aceb-44d1-81ac-6fea45c00f1e', NULL, 1, 1, 0, 0, 0, 0, '2025-06-15 21:29:04.297273+00'),
	('80bc93ae-553a-4998-9baa-9fba251ef8d8', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'This is a normal reply with the old post-composer', '9bf0b755-289b-4602-8ee0-1927860040e2', NULL, 0, 1, 0, 0, 0, 0, '2025-06-15 21:57:28.092854+00'),
	('984d1804-56eb-46e5-8072-129537382e42', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'Reposting the first post of the history 😗', NULL, '9bf0b755-289b-4602-8ee0-1927860040e2', 1, 0, 0, 0, 0, 0, '2025-06-16 02:06:00.491738+00'),
	('14464b01-d560-403c-96b1-4387405c3f6c', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', '**Next.js 15.5 just dropped — here’s what’s new, what’s going away, and what you should fix before 16 lands.**

**Thread 🧵**


1/ ⚡ Turbopack builds are now in beta
Run `next build --turbopack` and enjoy blazing-fast builds.
Vercel’s own sites use it — over 1.2B requests served.
It’s seriously fast.


2/ 🧱 Node.js middleware is stable

You can now use full Node APIs in middleware.
Need to hit the file system or use crypto? Go for it.
Edge runtime still exists, but now you’ve got options.


3/ 🧠 TypeScript got smarter

- Typed routes are stable
- Route export validation works with Turbopack
- Auto-generated props helpers
- New `next typegen` CLI
Fewer broken links, more type safety.

4/ 🧹 `next lint` is being sunset
Use ESLint CLI or Biome instead.
New projects get explicit configs.
Codemod available — migration’s easy.


5/ ⚠️ Deprecation warnings for Next.js 16

- `legacyBehavior` for `<Link>` is going away
- AMP support is being removed
- `next/image` quality defaults to 75
- Query strings in local image paths need config


6/ 🛠️ Migration tips

- Update `next.config.ts` for image quality and localPatterns
- Remove AMP-related code
- Drop `legacyBehavior` from `<Link>`
- Use codemods for linting migration


7/ 🚀 Upgrade like a pro

```bash
npx @next/codemod@canary upgrade latest  
npm install next@latest react@latest react-dom@latest
```

8/ 🙌 Over 3,000 contributors helped ship this
Huge shoutout to the Next.js, Turbopack, and Docs teams.
This release is stacked.


9/ 📚 Full release notes: [Next.js 15.5 blog post](https://nextjs.org/blog/next-15-5)', NULL, NULL, 0, 0, 0, 0, 0, 0, '2025-09-07 20:11:41.089244+00'),
	('8278b510-fd0d-45dc-b631-380bdda93d28', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'Another reply to faboulous!!', '9dd1f821-7a30-4069-9a26-b6f7471ae1d4', NULL, 4, 0, 0, 0, 0, 0, '2025-05-18 14:30:23.718501+00'),
	('3149f94a-0dfb-40d7-b64e-17ac4a6755c5', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'This is test reply', 'fad06c7a-002c-468f-bb75-52d183d9a09e', NULL, 2, 0, 0, 0, 0, 0, '2025-05-21 11:55:17.264192+00'),
	('7ab554d2-ff14-4332-8a5a-f46b6502ad7a', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'Just posting imports:


```typescript
import { Button, Skeleton, Tooltip, cn } from "@heroui/react";
import { useTheme } from "next-themes";
import React, { useEffect } from "react";
import { type ThemeRegistration, codeToHtml } from "shiki";

import oneDarkProTheme from "@shikijs/themes/github-dark";
import oneLightTheme from "@shikijs/themes/one-light";
import { CopyIcon, DownloadIcon } from "lucide-react";
import { addLineNumbers, formatLanguage, getFileExtension } from "./functions/code-block-functions";
import { CodeHighlightNode } from "@lexical/code";
```', NULL, NULL, 1, 0, 0, 0, 0, 0, '2025-06-01 23:43:32.853505+00'),
	('482974d1-aceb-44d1-81ac-6fea45c00f1e', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'This is a reply with an image

![Frame 1.png](http://localhost:3000/api/media/user_2x6baZqyYhTgll06OwxRkkgM81r/1750022784391_image)', '5c3cc1e2-ba3e-4e02-9cb0-4adc62edf9f5', NULL, 1, 0, 0, 0, 0, 0, '2025-06-15 21:26:35.060711+00'),
	('5c3cc1e2-ba3e-4e02-9cb0-4adc62edf9f5', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'This is a new post with an inmediate feedback

![repository-open-graph-template.png](http://localhost:3000/api/media/user_2x1BsnAmgPArzn4l8kjqSpVB8bf/1750017436161_image)', NULL, NULL, 1, 1, 0, 0, 0, 0, '2025-06-15 19:57:32.51201+00'),
	('16f3e9db-c964-4437-a557-b182467b8fc1', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'This is a reply of the first repost of the history', '984d1804-56eb-46e5-8072-129537382e42', NULL, 0, 1, 0, 0, 0, 0, '2025-06-16 02:40:37.836558+00'),
	('5b9657b9-78c5-45e8-8d3b-edd62c013a81', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'Reposting a reply', NULL, '16f3e9db-c964-4437-a557-b182467b8fc1', 0, 1, 0, 0, 0, 0, '2025-06-22 15:35:01.154018+00'),
	('0e8c6996-8665-42f9-9d22-46de5dad49bf', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'Reposting this', NULL, '5b9657b9-78c5-45e8-8d3b-edd62c013a81', 1, 0, 0, 0, 0, 0, '2025-06-28 21:57:06.151073+00'),
	('3cf21461-2f7d-4b7d-91c7-fdc132165901', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'First post!', NULL, NULL, 4, 0, 3, 0, 0, 0, '2025-05-16 18:51:15.080432+00'),
	('26e67ab0-1718-48df-a0fd-e65b2b1fcb02', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'Another reply!', '3cf21461-2f7d-4b7d-91c7-fdc132165901', NULL, 0, 0, 0, 3, 0, 0, '2025-05-16 22:58:39.36438+00'),
	('c7376154-5961-4a03-b4b9-39b6b51a4964', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'A reply for the second post!', 'bef32b04-6b02-4632-a28b-603d954f3dca', NULL, 0, 0, 3, 3, 0, 0, '2025-05-21 12:22:57.251137+00'),
	('9dd1f821-7a30-4069-9a26-b6f7471ae1d4', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'Thats faboulous!! 🤣🤔🎉✅🚀🚀', 'fad06c7a-002c-468f-bb75-52d183d9a09e', NULL, 4, 0, 0, 0, 3, 0, '2025-05-17 14:30:55.003475+00'),
	('fad06c7a-002c-468f-bb75-52d183d9a09e', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'First reply!', '3cf21461-2f7d-4b7d-91c7-fdc132165901', NULL, 6, 0, 0, 0, 0, 3, '2025-05-16 22:56:16.424045+00'),
	('7a8b9ad3-f01c-4f7e-9b05-dc9a70be11b8', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'Third post!', NULL, NULL, 0, 0, 3, 0, 0, 0, '2025-05-21 12:32:00.058856+00'),
	('457144ff-0fd1-47d0-9ec1-b04716a477fe', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'New reply!', '9dd1f821-7a30-4069-9a26-b6f7471ae1d4', NULL, 2, 0, 0, 0, 0, 3, '2025-05-18 01:06:13.11842+00'),
	('bef32b04-6b02-4632-a28b-603d954f3dca', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'Second post!!', NULL, NULL, 2, 0, 0, 3, 0, 3, '2025-05-21 12:00:48.347609+00'),
	('f844bbb3-f7bd-4be8-b9da-799cbeff5f1d', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'Testing a new post', NULL, NULL, 0, 0, 0, 2, 0, 0, '2025-07-04 18:56:11.289797+00');


--
-- Data for Name: post_media; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."post_media" ("id", "post_id", "media_type", "file_url", "file_path", "file_size", "mime_type", "alt_text", "display_order", "created_at") VALUES
	('f381234a-24da-481a-bacc-8e96bff9b491', '5c3cc1e2-ba3e-4e02-9cb0-4adc62edf9f5', 'image', 'https://tshvilqfreifjtrdjrqj.supabase.co/storage/v1/object/public/post-images/user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/5c3cc1e2-ba3e-4e02-9cb0-4adc62edf9f5/1750017436161_image.png', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/5c3cc1e2-ba3e-4e02-9cb0-4adc62edf9f5/1750017436161_image.png', NULL, NULL, NULL, 0, '2025-06-15 19:57:33.8495+00'),
	('da2cbb21-4a72-457c-840b-abb288500d24', '482974d1-aceb-44d1-81ac-6fea45c00f1e', 'image', 'https://tshvilqfreifjtrdjrqj.supabase.co/storage/v1/object/public/post-images/user_2x6baZqyYhTgll06OwxRkkgM81r/posts/482974d1-aceb-44d1-81ac-6fea45c00f1e/1750022784391_image.png', 'user_2x6baZqyYhTgll06OwxRkkgM81r/posts/482974d1-aceb-44d1-81ac-6fea45c00f1e/1750022784391_image.png', NULL, NULL, NULL, 0, '2025-06-15 21:26:36.133012+00'),
	('66969fac-4aa0-4bd9-886a-3586d805b729', '9bf0b755-289b-4602-8ee0-1927860040e2', 'image', 'https://tshvilqfreifjtrdjrqj.supabase.co/storage/v1/object/public/post-images/user_2x6baZqyYhTgll06OwxRkkgM81r/posts/9bf0b755-289b-4602-8ee0-1927860040e2/1750022937664_image.png', 'user_2x6baZqyYhTgll06OwxRkkgM81r/posts/9bf0b755-289b-4602-8ee0-1927860040e2/1750022937664_image.png', NULL, NULL, NULL, 0, '2025-06-15 21:29:05.250461+00'),
	('838c4f6b-2876-4528-a2b9-cde0129dfea8', '8e45dc6b-b980-43e7-9aa8-9f6dc376ee5b', 'image', 'https://tshvilqfreifjtrdjrqj.supabase.co/storage/v1/object/public/post-images/user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/8e45dc6b-b980-43e7-9aa8-9f6dc376ee5b/1751206146058_image.webp', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/8e45dc6b-b980-43e7-9aa8-9f6dc376ee5b/1751206146058_image.webp', NULL, NULL, NULL, 0, '2025-06-29 14:09:31.108916+00'),
	('eb4ea4e0-2554-4595-a9ba-8db83dc175b1', '307a8cad-954a-44fd-8eb7-5f627489e83e', 'image', 'https://tshvilqfreifjtrdjrqj.supabase.co/storage/v1/object/public/post-images/user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/307a8cad-954a-44fd-8eb7-5f627489e83e/1751208694799_image.png', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/307a8cad-954a-44fd-8eb7-5f627489e83e/1751208694799_image.png', NULL, NULL, NULL, 0, '2025-06-29 14:52:03.555641+00'),
	('7d6fdde4-2d52-497e-a44d-396c4738e57d', 'b94ddb55-d373-4c5c-bb7f-f902cdceb820', 'image', 'https://tshvilqfreifjtrdjrqj.supabase.co/storage/v1/object/public/post-images/user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/b94ddb55-d373-4c5c-bb7f-f902cdceb820/1751209837374_image.png', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/b94ddb55-d373-4c5c-bb7f-f902cdceb820/1751209837374_image.png', NULL, NULL, NULL, 0, '2025-06-29 15:10:55.43411+00'),
	('20afabf4-e683-4eb0-a6e0-dc70e087aa98', 'deef0365-32e4-4ee3-95d3-fd2d747c9482', 'image', 'https://tshvilqfreifjtrdjrqj.supabase.co/storage/v1/object/public/post-images/user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/deef0365-32e4-4ee3-95d3-fd2d747c9482/1751653643539_image.webp', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/deef0365-32e4-4ee3-95d3-fd2d747c9482/1751653643539_image.webp', NULL, NULL, NULL, 0, '2025-07-04 18:28:26.995717+00'),
	('67da2e3e-a8a5-49f0-ac59-2359ca12de55', 'deef0365-32e4-4ee3-95d3-fd2d747c9482', 'image', 'https://tshvilqfreifjtrdjrqj.supabase.co/storage/v1/object/public/post-images/user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/deef0365-32e4-4ee3-95d3-fd2d747c9482/1751653647117_image.png', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/deef0365-32e4-4ee3-95d3-fd2d747c9482/1751653647117_image.png', NULL, NULL, NULL, 0, '2025-07-04 18:28:26.995717+00'),
	('55406241-c94c-4f72-9bab-1d8f38a0bf4b', 'deef0365-32e4-4ee3-95d3-fd2d747c9482', 'image', 'https://tshvilqfreifjtrdjrqj.supabase.co/storage/v1/object/public/post-images/user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/deef0365-32e4-4ee3-95d3-fd2d747c9482/1751653651038_image.png', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/deef0365-32e4-4ee3-95d3-fd2d747c9482/1751653651038_image.png', NULL, NULL, NULL, 0, '2025-07-04 18:28:26.995717+00');


--
-- Data for Name: reactions; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."reactions" ("id", "user_id", "post_id", "reaction_type", "created_at") VALUES
	('09e6ce48-cd56-4f6c-a72c-02622302221f', 'user_2x6baZqyYhTgll06OwxRkkgM81r', '3cf21461-2f7d-4b7d-91c7-fdc132165901', 'star', '2025-05-21 12:02:17.388882+00'),
	('12bea05f-4bc6-4784-8023-244a8bc803f3', 'user_2x6baZqyYhTgll06OwxRkkgM81r', '26e67ab0-1718-48df-a0fd-e65b2b1fcb02', 'coffee', '2025-05-21 17:38:17.480296+00'),
	('602acef2-2f62-4594-879a-7484952fcd8a', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'c7376154-5961-4a03-b4b9-39b6b51a4964', 'coffee', '2025-05-22 00:13:35.268292+00'),
	('76342485-51c7-4571-bf62-efc9b31481f3', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'c7376154-5961-4a03-b4b9-39b6b51a4964', 'star', '2025-05-21 22:38:10.070732+00'),
	('7b75f059-3ff1-4033-8d7e-daac710740fc', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', '9dd1f821-7a30-4069-9a26-b6f7471ae1d4', 'approve', '2025-05-18 14:22:26.5487+00'),
	('828e2d9d-9d95-434e-bb8d-bd484c0eed1c', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'fad06c7a-002c-468f-bb75-52d183d9a09e', 'cache', '2025-05-21 17:40:36.703491+00'),
	('9b46e27d-67ec-4f52-af47-9d59aad04938', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'bef32b04-6b02-4632-a28b-603d954f3dca', 'coffee', '2025-05-21 21:11:50.861866+00'),
	('b84411f2-7639-4f9f-abc7-59ccce6881d2', 'user_2x6baZqyYhTgll06OwxRkkgM81r', '7a8b9ad3-f01c-4f7e-9b05-dc9a70be11b8', 'star', '2025-05-21 23:00:59.384662+00'),
	('dd057f82-c743-4bb6-a46c-35996ce4c509', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', '457144ff-0fd1-47d0-9ec1-b04716a477fe', 'cache', '2025-05-18 14:23:32.181669+00'),
	('ea3d1681-d159-4f3d-b17e-503b2c94b307', 'user_2x6baZqyYhTgll06OwxRkkgM81r', 'bef32b04-6b02-4632-a28b-603d954f3dca', 'cache', '2025-05-21 17:57:43.530206+00'),
	('57f47e74-e8f4-490b-975f-8db75bf0e3f2', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', 'f844bbb3-f7bd-4be8-b9da-799cbeff5f1d', 'coffee', '2025-09-01 19:59:38.797189+00');


--
-- Data for Name: user_followers; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."user_followers" ("user_id", "follower_id", "created_at") VALUES
	('user_2x6baZqyYhTgll06OwxRkkgM81r', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', '2025-05-19 20:54:26.1166+00');


--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id", "type") VALUES
	('post-images', 'post-images', NULL, '2025-06-14 22:57:44.950524+00', '2025-06-14 22:57:44.950524+00', true, false, 52428800, NULL, NULL, 'STANDARD');


--
-- Data for Name: buckets_analytics; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: buckets_vectors; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_namespaces; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: iceberg_tables; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."objects" ("id", "bucket_id", "name", "owner", "created_at", "updated_at", "last_accessed_at", "metadata", "version", "owner_id", "user_metadata", "level") VALUES
	('a030a1aa-4342-4bf6-8615-0dc5cad301c3', 'post-images', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/307a8cad-954a-44fd-8eb7-5f627489e83e/1751208694799_image.png', NULL, '2025-06-29 14:51:35.200735+00', '2025-08-31 14:10:35.14465+00', '2025-06-29 14:51:35.200735+00', '{"eTag": "\"acfae21bb2525559170e06fe210b2289\"", "size": 24814, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-06-29T14:52:03.000Z", "contentLength": 24814, "httpStatusCode": 200}', '2a6bcf9b-7b1c-4a95-a4b9-81809505e4e1', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', '{}', 4),
	('d19eeabd-f4a7-4bc0-b3b5-27649b7dde29', 'post-images', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/307a8cad-954a-44fd-8eb7-5f627489e83e/1751208697663_image.png', NULL, '2025-06-29 14:51:38.618806+00', '2025-08-31 14:10:35.14465+00', '2025-06-29 14:51:38.618806+00', '{"eTag": "\"0b8ad7942d8c1a70295a9c7b0b2e58e3\"", "size": 51470, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-06-29T14:57:39.000Z", "contentLength": 51470, "httpStatusCode": 200}', '18066e6f-d5f6-409c-9e55-74bd46ddbf6c', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', '{}', 4),
	('bb28546d-1cf0-4e54-b0d3-def0d3d8efb5', 'post-images', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/307a8cad-954a-44fd-8eb7-5f627489e83e/1751208710664_image.png', NULL, '2025-06-29 14:51:51.547573+00', '2025-08-31 14:10:35.14465+00', '2025-06-29 14:51:51.547573+00', '{"eTag": "\"0f47c9f07e5fb84f6713e333386d5ef4\"", "size": 32920, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-06-29T14:57:39.000Z", "contentLength": 32920, "httpStatusCode": 200}', '37f6c321-d150-4cde-83ef-d3d3b4b4530f', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', '{}', 4),
	('9c184bf8-f26e-494e-b903-c5355955c1cd', 'post-images', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/307a8cad-954a-44fd-8eb7-5f627489e83e/1751208700928_image.webp', NULL, '2025-06-29 14:51:41.542917+00', '2025-08-31 14:10:35.14465+00', '2025-06-29 14:51:41.542917+00', '{"eTag": "\"197e4348475168fb272996dd4d45803a\"", "size": 85274, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2025-06-29T14:57:39.000Z", "contentLength": 85274, "httpStatusCode": 200}', '686a4e00-74e5-48ea-a501-25a5da53f489', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', '{}', 4),
	('688a0c64-866a-408a-911a-cdf6f0e3f4f6', 'post-images', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/deef0365-32e4-4ee3-95d3-fd2d747c9482/1751653643539_image.webp', NULL, '2025-07-04 18:27:24.875908+00', '2025-08-31 14:10:35.14465+00', '2025-07-04 18:27:24.875908+00', '{"eTag": "\"197e4348475168fb272996dd4d45803a\"", "size": 85274, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2025-07-04T18:28:07.000Z", "contentLength": 85274, "httpStatusCode": 200}', '03641e75-c94d-4807-864e-6432990b4814', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', '{}', 4),
	('8a64ca79-62ba-4617-9f2c-6dce47892116', 'post-images', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/deef0365-32e4-4ee3-95d3-fd2d747c9482/1751653651038_image.png', NULL, '2025-07-04 18:27:31.683678+00', '2025-08-31 14:10:35.14465+00', '2025-07-04 18:27:31.683678+00', '{"eTag": "\"0b8ad7942d8c1a70295a9c7b0b2e58e3\"", "size": 51470, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-07-04T18:28:07.000Z", "contentLength": 51470, "httpStatusCode": 200}', 'bbee7f57-df13-49b6-85d0-1a1aa3b580f5', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', '{}', 4),
	('09af6c75-4321-4295-bcb3-148c50fe0f9b', 'post-images', 'user_2x6baZqyYhTgll06OwxRkkgM81r/posts/482974d1-aceb-44d1-81ac-6fea45c00f1e/1750022784391_image.png', NULL, '2025-06-15 21:26:25.372012+00', '2025-08-31 14:10:35.14465+00', '2025-06-15 21:26:25.372012+00', '{"eTag": "\"acfae21bb2525559170e06fe210b2289\"", "size": 24814, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-06-15T21:26:36.000Z", "contentLength": 24814, "httpStatusCode": 200}', 'f3adcafd-bb97-4d2a-b254-d93621161493', 'user_2x6baZqyYhTgll06OwxRkkgM81r', '{}', 4),
	('c679b334-3105-415e-9a0b-c17716a1dd67', 'post-images', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/deef0365-32e4-4ee3-95d3-fd2d747c9482/1751653647117_image.png', NULL, '2025-07-04 18:27:27.86171+00', '2025-08-31 14:10:35.14465+00', '2025-07-04 18:27:27.86171+00', '{"eTag": "\"acfae21bb2525559170e06fe210b2289\"", "size": 24814, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-07-04T18:28:08.000Z", "contentLength": 24814, "httpStatusCode": 200}', 'de75fd36-87a6-40c2-8725-4fa13ddaf0e3', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', '{}', 4),
	('6a16857f-213f-46d2-bdcd-102d8b3cc4a4', 'post-images', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/5c3cc1e2-ba3e-4e02-9cb0-4adc62edf9f5/1750017436161_image.png', NULL, '2025-06-15 19:57:17.080441+00', '2025-08-31 14:10:35.14465+00', '2025-06-15 19:57:17.080441+00', '{"eTag": "\"0b8ad7942d8c1a70295a9c7b0b2e58e3\"", "size": 51470, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-06-15T19:57:34.000Z", "contentLength": 51470, "httpStatusCode": 200}', 'd39a56a0-e78b-4bf1-83e5-45f848889ab3', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', '{}', 4),
	('e87d6c5f-cbf5-41ae-b9b6-419700f2fa35', 'post-images', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/8e45dc6b-b980-43e7-9aa8-9f6dc376ee5b/1751206146058_image.webp', NULL, '2025-06-29 14:09:07.139766+00', '2025-08-31 14:10:35.14465+00', '2025-06-29 14:09:07.139766+00', '{"eTag": "\"197e4348475168fb272996dd4d45803a\"", "size": 85274, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2025-06-29T14:09:31.000Z", "contentLength": 85274, "httpStatusCode": 200}', '80138303-a026-49cb-a14d-6768eb6f677f', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', '{}', 4),
	('338dbd8a-b308-47fa-ab04-d06d4638d96d', 'post-images', 'user_2x6baZqyYhTgll06OwxRkkgM81r/posts/9bf0b755-289b-4602-8ee0-1927860040e2/1750022937664_image.png', NULL, '2025-06-15 21:28:58.339506+00', '2025-08-31 14:10:35.14465+00', '2025-06-15 21:28:58.339506+00', '{"eTag": "\"0f47c9f07e5fb84f6713e333386d5ef4\"", "size": 32920, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-06-15T21:29:05.000Z", "contentLength": 32920, "httpStatusCode": 200}', 'de1ab39e-7fbe-469a-b716-0780f8bf923c', 'user_2x6baZqyYhTgll06OwxRkkgM81r', '{}', 4),
	('e7f7453a-0e85-4fd4-808b-49b0157030bd', 'post-images', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/b94ddb55-d373-4c5c-bb7f-f902cdceb820/1751209837374_image.png', NULL, '2025-06-29 15:10:40.692929+00', '2025-08-31 14:10:35.14465+00', '2025-06-29 15:10:40.692929+00', '{"eTag": "\"acfae21bb2525559170e06fe210b2289\"", "size": 24814, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-06-29T15:10:55.000Z", "contentLength": 24814, "httpStatusCode": 200}', '22e1e235-1091-4876-8039-3585d3bb7cc4', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', '{}', 4),
	('eaf19d19-af14-4ef2-93b4-a89be7052007', 'post-images', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/b94ddb55-d373-4c5c-bb7f-f902cdceb820/1751209840918_image.png', NULL, '2025-06-29 15:10:42.08548+00', '2025-08-31 14:10:35.14465+00', '2025-06-29 15:10:42.08548+00', '{"eTag": "\"0b8ad7942d8c1a70295a9c7b0b2e58e3\"", "size": 51470, "mimetype": "image/png", "cacheControl": "max-age=3600", "lastModified": "2025-06-29T15:44:34.000Z", "contentLength": 51470, "httpStatusCode": 200}', 'c834ac3f-ffda-4050-8686-9a94ddaabd5a', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', '{}', 4),
	('7e7b3143-01ef-4e71-8f05-23a10dc46a8e', 'post-images', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/b94ddb55-d373-4c5c-bb7f-f902cdceb820/1751209842952_image.webp', NULL, '2025-06-29 15:10:44.026773+00', '2025-08-31 14:10:35.14465+00', '2025-06-29 15:10:44.026773+00', '{"eTag": "\"197e4348475168fb272996dd4d45803a\"", "size": 85274, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2025-06-29T15:44:34.000Z", "contentLength": 85274, "httpStatusCode": 200}', '7bad633a-7a65-4c13-bdf6-0f7fbe567d3c', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', '{}', 4),
	('464ecbcb-f9e6-4a3d-8329-7fd3c370d5e4', 'post-images', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/profile/1754792478325_cover.webp', NULL, '2025-08-10 02:21:19.28516+00', '2025-08-31 14:10:35.14465+00', '2025-08-10 02:21:19.28516+00', '{"eTag": "\"197e4348475168fb272996dd4d45803a\"", "size": 85274, "mimetype": "image/webp", "cacheControl": "max-age=3600", "lastModified": "2025-08-10T02:21:20.000Z", "contentLength": 85274, "httpStatusCode": 200}', '6e395dd8-915f-4ec7-8fa0-d8a9d769855b', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', '{}', 3);


--
-- Data for Name: prefixes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."prefixes" ("bucket_id", "name", "created_at", "updated_at") VALUES
	('post-images', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf', '2025-11-21 17:37:02.310455+00', '2025-11-21 17:37:02.310455+00'),
	('post-images', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts', '2025-11-21 17:37:02.310455+00', '2025-11-21 17:37:02.310455+00'),
	('post-images', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/307a8cad-954a-44fd-8eb7-5f627489e83e', '2025-11-21 17:37:02.310455+00', '2025-11-21 17:37:02.310455+00'),
	('post-images', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/deef0365-32e4-4ee3-95d3-fd2d747c9482', '2025-11-21 17:37:02.310455+00', '2025-11-21 17:37:02.310455+00'),
	('post-images', 'user_2x6baZqyYhTgll06OwxRkkgM81r', '2025-11-21 17:37:02.310455+00', '2025-11-21 17:37:02.310455+00'),
	('post-images', 'user_2x6baZqyYhTgll06OwxRkkgM81r/posts', '2025-11-21 17:37:02.310455+00', '2025-11-21 17:37:02.310455+00'),
	('post-images', 'user_2x6baZqyYhTgll06OwxRkkgM81r/posts/482974d1-aceb-44d1-81ac-6fea45c00f1e', '2025-11-21 17:37:02.310455+00', '2025-11-21 17:37:02.310455+00'),
	('post-images', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/5c3cc1e2-ba3e-4e02-9cb0-4adc62edf9f5', '2025-11-21 17:37:02.310455+00', '2025-11-21 17:37:02.310455+00'),
	('post-images', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/8e45dc6b-b980-43e7-9aa8-9f6dc376ee5b', '2025-11-21 17:37:02.310455+00', '2025-11-21 17:37:02.310455+00'),
	('post-images', 'user_2x6baZqyYhTgll06OwxRkkgM81r/posts/9bf0b755-289b-4602-8ee0-1927860040e2', '2025-11-21 17:37:02.310455+00', '2025-11-21 17:37:02.310455+00'),
	('post-images', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/posts/b94ddb55-d373-4c5c-bb7f-f902cdceb820', '2025-11-21 17:37:02.310455+00', '2025-11-21 17:37:02.310455+00'),
	('post-images', 'user_2x1BsnAmgPArzn4l8kjqSpVB8bf/profile', '2025-11-21 17:37:02.310455+00', '2025-11-21 17:37:02.310455+00');


--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: vector_indexes; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: hooks; Type: TABLE DATA; Schema: supabase_functions; Owner: supabase_functions_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: hooks_id_seq; Type: SEQUENCE SET; Schema: supabase_functions; Owner: supabase_functions_admin
--

SELECT pg_catalog.setval('"supabase_functions"."hooks_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
