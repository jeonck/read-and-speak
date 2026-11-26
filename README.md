# Read & Speak (read-and-speak)

Read a book for about 30 minutes, explain out loud what you read to a speaking
partner, and paste the iPhone live-dictation transcript here — Claude analyzes it
and publishes a study post: good sentences, native-speaker corrections of mistakes
(Say It Better), idioms, vocabulary, a fill-in-the-blank quiz, and a mini diary.
Sessions accumulate as a reviewable history.

Site: https://readandspeak.metacog.co.kr/

## How it works

```
input/script.md (paste the session transcript in the code block, edit on GitHub web UI)
        │
        ▼  saving (committing) triggers the push hook immediately (no schedule — runs only when you save a session)
pipeline/generate.py
  - reads the whole code block as ONE session (`---` line separates several sessions)
  - skips sessions already published (hash dedup, tracked in pipeline/state.json)
  - if the input is empty, builds a mini lesson from a classic English idiom instead
  - Claude analyzes the transcript into:
      Session Overview / 💬 Idioms (explanation + 2 examples) / 📚 Vocabulary /
      🔧 Say It Better (what was actually said vs the natural correction) /
      ✅ Check Yourself (toggle quiz) / ✍️ Mini Diary (one-event story)
  - saves as content/posts/YYYY-MM-DD-....md
        │
        ▼  commit & push
Hugo build → GitHub Pages deploy
```

## How to use

1. Open [`input/script.md`](input/script.md) in the repo.
   (The "Add a session" button in the site menu links straight here.)
2. Click the pencil (✏️) icon to edit.
3. At the top of the code block, write the book info, then paste the transcript:
   ```
   Book: <title and author>
   Pages read: <e.g. pp. 42–58, Chapter 3>
   <your spoken transcript — the whole thing, as dictated>
   ```
   To process several sessions at once, separate them with a line containing only
   `---` — each block becomes its own post.
4. Click "Commit changes" (top right). **Saving triggers GitHub Actions immediately**
   (hook on push) — no local git work needed.
5. A few minutes later the new study post appears on the site.

When everything publishes successfully, the pipeline clears the code block in its
commit — next time, just paste the new transcript. (If only part of it fails, the
input stays put so you can retry.) An already-published session is never re-posted
(text-hash dedup). You can also run it manually: Actions tab → "Read & Speak"
→ "Run workflow".

## A session, step by step

1. **Read** — about 30 minutes in the book, with your reading partner.
2. **Talk** — explain out loud what you read: the story or argument, what stood out,
   what you thought about it. Record it with the iPhone's live dictation
   (speech-to-text), so the transcript is saved.
3. **Paste** — book title + pages read + the transcript into `input/script.md`,
   commit, and wait a few minutes.
4. **Review** — read the post: check the Say It Better corrections, try the quiz,
   and re-read the diary. Old sessions stay on the site for review.

## Privacy

- **The post**: `pipeline/generate.py`'s prompt generalizes real names, ages,
  health/immigration/employer details, etc. into "a participant", "a recent trip"
  and similar wording. Nothing identifying appears on the site.
- **The raw commit**: if this repo is public, the transcript you paste is visible in
  the commit the moment you save (the pipeline clearing the code block later does
  not erase that earlier commit). **Before pasting, replace real names with a
  placeholder like "my reading partner".**

## Days with no session — idiom mini lesson

If you run the workflow manually with an empty code block, it picks a
classic English idiom from `FALLBACK_QUOTES` in `pipeline/generate.py` and publishes
a mini lesson. Emptying the pool
(`FALLBACK_QUOTES = []`) turns this off.

## No schedule

This site has **no cron**. It runs only when you save a session (push hook) or run
the workflow manually. The template this site was built from had a daily cron; it
was removed because this is a reading log — it runs when you read, not every day.

## First-time setup (once, done by a person)

The pipeline uses the Claude Code CLI. To authenticate it in GitHub Actions, register
an OAuth token (from your Claude subscription) as a repo Secret. This needs a browser
login, so it cannot be done by an agent.

```bash
claude setup-token
```

Paste the auth code shown in the terminal into the browser and log in. **After that**,
the terminal prints a token starting with `sk-ant-oat01-...`. (That token is what you
register — not the auth code shown in the browser.)

```bash
gh secret set CLAUDE_CODE_OAUTH_TOKEN --repo jeonck/read-and-speak
# paste the token when prompted
```

After registering, run the workflow once manually (Actions tab → "Run workflow") to
confirm it works.

## Repo structure

| Path | Role |
|---|---|
| `input/script.md` | where transcripts are pasted (edited by a person — saving triggers the hook) |
| `pipeline/generate.py` | transcript analysis → Hugo post. Domain settings are in the "도메인 설정" block at the top |
| `pipeline/state.json` | hashes of published sessions (prevents duplicates) |
| `content/posts/` | generated study posts |
| `.github/workflows/daily.yml` | push hook + manual generate/deploy workflow (no schedule) |
| `layouts/` | custom Hugo templates (home, session archive, post, topics, search, 404) |
| `assets/css/main.css` | the whole design: black / paper / lime palette, light + dark |
| `assets/js/app.js` | theme toggle + client-side search |
| `static/CNAME` | (optional) for a custom domain |

## Test locally

```bash
hugo server -D                           # http://localhost:1313/ (needs Hugo extended ≥ 0.146)
python3 pipeline/generate.py --dry-run   # shows the result without creating files
```

Locally, the `claude` CLI login session is used if present
(`JUDGE_BACKEND=claude-code`); otherwise set `ANTHROPIC_API_KEY` to run with
`JUDGE_BACKEND=api`.
