// Shares new entries from updates.json on LinkedIn, once each.
//
// An entry is shared only if it has "linkedin": true and its id is not yet
// listed in .github/linkedin-posted.json. Runs from the GitHub Action
// (.github/workflows/site.yml) and does nothing unless these repo secrets exist:
//   LINKEDIN_ACCESS_TOKEN  - member token with the w_member_social scope
//   LINKEDIN_PERSON_URN    - your member URN, e.g. urn:li:person:AbC123xyz
// Uses LinkedIn's "Share on LinkedIn" API (POST /v2/ugcPosts).
import fs from 'node:fs';

const SITE = 'https://narendaransg.github.io/';
const token = process.env.LINKEDIN_ACCESS_TOKEN;
const author = process.env.LINKEDIN_PERSON_URN;
if (!token || !author) {
  console.log('LinkedIn secrets not set; skipping.');
  process.exit(0);
}

const postedPath = '.github/linkedin-posted.json';
const posted = fs.existsSync(postedPath) ? JSON.parse(fs.readFileSync(postedPath, 'utf8')) : [];
const { updates = [] } = JSON.parse(fs.readFileSync('updates.json', 'utf8'));
const pending = updates.filter(u => u.linkedin === true && u.id && !posted.includes(u.id));

if (!pending.length) {
  console.log('Nothing new to share.');
  process.exit(0);
}

for (const u of pending.reverse()) {
  const link = u.view && u.view !== 'home' ? `${SITE}#${u.view}` : SITE;
  const body = {
    author,
    lifecycleState: 'PUBLISHED',
    specificContent: {
      'com.linkedin.ugc.ShareContent': {
        shareCommentary: { text: u.post_text || `${u.title}\n\n${u.summary}\n\nDetails on my portfolio:` },
        shareMediaCategory: 'ARTICLE',
        media: [{ status: 'READY', originalUrl: link, title: { text: u.title } }],
      },
    },
    visibility: { 'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC' },
  };
  const res = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    console.error(`LinkedIn rejected "${u.id}": ${res.status} ${await res.text()}`);
    console.error('If this is a 401, the access token has expired: create a new one and update the secret.');
    process.exit(1);
  }
  console.log(`Shared "${u.id}" on LinkedIn.`);
  posted.push(u.id);
  fs.writeFileSync(postedPath, JSON.stringify(posted, null, 2) + '\n');
}
