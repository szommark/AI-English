import type { AdminClientError, AdminFeedbackReport, FeedbackLogEntry } from './feedback'

// "Copy for Claude" in the admin inbox: turns a problem report or a recorded error into a
// self-contained task to paste into Claude Code (or a GitHub issue). Plain Markdown, English
// framing; the reporter's own words stay in their language.

const KIND_TEXT: Record<AdminFeedbackReport['kind'], string> = {
  bug: 'Something does not work',
  display: 'Something looks wrong',
  content: 'Wrong content (e.g. an answer key or translation)',
  idea: 'Feature idea',
}

const UI_LANG: Record<string, string> = { hu: 'Hungarian', en: 'English', de: 'German' }

/** The workflow every task ends with: fix on a branch, verify, then stop for review. */
const WORKFLOW = [
  '## How to work on it',
  '',
  '1. Find the cause in the code first; say briefly what it is before changing anything.',
  '2. Fix it on a new `fix/...` branch from `main` and verify the fix (type check, and the page in the browser preview where possible).',
  '3. If the fix needs a Supabase migration, show the SQL; do not apply it unless asked.',
  '4. Stop before committing and ask; commit and open a PR only when asked.',
].join('\n')

function fence(text: string): string {
  // Longer fence than any backtick run inside, so pasted stacks can't break out of the block.
  const longest = Math.max(2, ...(text.match(/`+/g) ?? []).map((m) => m.length))
  const ticks = '`'.repeat(longest + 1)
  return `${ticks}\n${text}\n${ticks}`
}

function quote(text: string): string {
  return text
    .split('\n')
    .map((line) => `> ${line}`)
    .join('\n')
}

function logBlock(title: string, entries: FeedbackLogEntry[] | undefined): string | null {
  if (!entries?.length) return null
  return `**${title} (${entries.length}, oldest first)**\n\n${fence(entries.map((e) => `${e.at}  ${e.message}`).join('\n'))}`
}

function section(lines: (string | null | false | undefined)[]): string {
  return lines.filter((l): l is string => typeof l === 'string').join('\n\n')
}

export function reportTask(r: AdminFeedbackReport): string {
  const c = r.context
  const isIdea = r.kind === 'idea'
  const lang = c.uiLang ? (UI_LANG[c.uiLang] ?? c.uiLang) : null
  const env = [
    `- Page: \`${r.pagePath}\``,
    `- Reported: ${r.createdAt} by a ${r.role}`,
    c.browser && `- Browser: ${c.browser} on ${c.os ?? 'unknown OS'}`,
    c.viewport && `- Window: ${c.viewport.width} × ${c.viewport.height} @${c.viewport.dpr}x`,
    lang && `- UI language: ${lang}`,
    c.appVersion && `- App version (commit): \`${c.appVersion}\``,
    c.micPermission && `- Microphone permission: ${c.micPermission}`,
    c.online === false && '- The browser was offline',
  ]
    .filter(Boolean)
    .join('\n')

  return section([
    `# ${isIdea ? 'Feature idea' : 'Bug report'} from an Avalon user: ${KIND_TEXT[r.kind]}`,
    isIdea
      ? 'A user suggested the idea below. Assess whether and how it fits the app, propose a plan, and ask before building anything.'
      : 'A user reported the problem below through "Report a problem". Reproduce it if you can, find the cause and fix it.',
    `Report id: \`${r.id}\` (table \`feedback_reports\`; admin inbox: /admin/feedback). The user's own words are quoted as written${lang && lang !== 'English' ? ` (${lang})` : ''}.`,
    `## ${isIdea ? 'The idea' : 'What happened'}`,
    quote(r.description),
    r.expected && `## ${r.kind === 'content' ? 'What it should be' : 'What they expected'}`,
    r.expected && quote(r.expected),
    '## Where',
    env,
    r.screenshotUrl && 'A screenshot is attached to the report; open it from the admin inbox.',
    logBlock('Console errors before the report', c.errors),
    logBlock('Failed requests before the report', c.requests),
    r.adminNote && '## Admin note',
    r.adminNote && quote(r.adminNote),
    r.kind === 'content' &&
      'Content problems (answer keys, translations, exam items) are often data, not code: check whether it should be corrected in an editor (e.g. the exam task maker) rather than in the source.',
    WORKFLOW,
  ])
}

export function clientErrorTask(e: AdminClientError): string {
  const kind =
    e.kind === 'render' ? 'React render crash (caught by CrashBoundary)' : e.kind === 'rejection' ? 'Unhandled promise rejection' : 'Uncaught error'
  return section([
    `# Recorded error in Avalon: ${e.message.slice(0, 120)}`,
    'This error was recorded automatically from visitors\' browsers (crash capture). Find the cause and fix it so it stops happening.',
    `Fingerprint: \`${e.fingerprint}\` (table \`client_errors\`; admin inbox: /admin/feedback?tab=errors).`,
    '## The error',
    fence(e.message),
    [
      `- Kind: ${kind}`,
      `- Seen ${e.occurrences} times in total, ${e.occurrences7d} in the last 7 days`,
      `- Signed-in users affected: ${e.users} (${e.users7d} this week); signed-out visitors only add to the counts`,
      `- First seen ${e.firstSeenAt}, last seen ${e.lastSeenAt}`,
      e.lastPagePath && `- Last page: \`${e.lastPagePath}\``,
      e.lastBrowser && `- Last browser: ${e.lastBrowser}`,
      e.lastAppVersion && `- Last app version (commit): \`${e.lastAppVersion}\``,
    ]
      .filter(Boolean)
      .join('\n'),
    e.stack && '## Stack',
    e.stack &&
      `${fence(e.stack)}\n\nProduction stacks point at minified bundles (\`assets/*.js\`); match function and component names against the source instead of line numbers.`,
    /Failed to fetch dynamically imported module|Importing a module script failed/i.test(e.message) &&
      'This looks like a stale lazy chunk after a deploy, which the crash screen already handles with a reload button. Only change code if the count keeps growing between deploys.',
    WORKFLOW,
  ])
}
