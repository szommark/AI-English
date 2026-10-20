// Every UI string of the exam task maker (/teacher/tools/exam-tasks), Hungarian and English.
// German falls back to English: the tool builds Hungarian English-language exams (Zöld Út style),
// so its users are English teachers. Task content itself (instructions, script, items) is English.

import { useCallback } from 'react'
import { useLanguage } from '../lib/i18n'

const COPY = {
  // Hub
  title: { hu: 'Vizsgafeladat-készítő', en: 'Exam task maker' },
  subtitle: {
    hu: 'Hallott szöveg, olvasott szöveg, írás és szóbeli feladatlap készítése és tesztelése B1–C1 vizsgákhoz.',
    en: 'Create and test listening, reading, writing and oral exam tasks for B1–C1 exams.',
  },
  part_listening: { hu: 'Hallott szöveg értése', en: 'Listening' },
  part_reading: { hu: 'Olvasott szöveg értése', en: 'Reading' },
  part_writing: { hu: 'Írásbeli', en: 'Writing' },
  part_speaking: { hu: 'Szóbeli feladatlap', en: 'Oral exam task sheet' },
  comingSoon: { hu: 'Hamarosan', en: 'Coming soon' },
  partSoonBody: {
    hu: 'Ez a vizsgarész még nem készíthető. A hallott szöveg értése már működik.',
    en: "This exam part isn't available yet. Listening tasks already work.",
  },
  newTask: { hu: 'Új feladat', en: 'New task' },
  myTasks: { hu: 'Saját feladataim', en: 'My tasks' },
  myTasksEmpty: { hu: 'Még nincs feladatod. Készíts egyet MI-vel, vagy tölts fel egy kész feladatot.', en: 'No tasks yet. Generate one with AI or upload a finished task.' },
  sentToMe: { hu: 'Tesztelésre küldve nekem', en: 'Sent to me for testing' },
  sentToMeEmpty: { hu: 'Most nincs tesztelendő feladatod.', en: 'Nothing to test right now.' },
  fromTeacher: { hu: 'Küldte: {email}', en: 'From {email}' },
  tested: { hu: 'Tesztelve', en: 'Tested' },
  testNow: { hu: 'Tesztelés', en: 'Test it' },
  testedCount: { hu: '{n}/{m} tesztelte', en: '{n}/{m} tested' },
  notSent: { hu: 'Még nincs elküldve', en: 'Not sent yet' },
  revision: { hu: '{n}. változat', en: 'Revision {n}' },
  updated: { hu: 'Módosítva: {date}', en: 'Updated {date}' },
  loadError: { hu: 'Nem sikerült betölteni. Próbáld újra.', en: "Couldn't load. Try again." },
  notFound: { hu: 'Ez a feladat nem található.', en: "This task doesn't exist." },
  backToList: { hu: '← Vissza a feladatokhoz', en: '← Back to tasks' },
  loading: { hu: 'Betöltés…', en: 'Loading…' },

  // Publish for review (draft → published; a content change makes it a draft again)
  status_draft: { hu: 'Piszkozat', en: 'Draft' },
  status_published: { hu: 'Közzétéve véleményezésre', en: 'Published for review' },
  publish: { hu: 'Közzététel véleményezésre', en: 'Publish for review' },
  publishing: { hu: 'Közzététel…', en: 'Publishing…' },
  publishConfirmTitle: { hu: 'Közzététel véleményezésre: {n}. változat', en: 'Publish revision {n} for review?' },
  publishConfirmBody: {
    hu: 'Ezután elküldheted más tanároknak vagy tanárcsoportoknak tesztelésre. Ha később módosítod, a feladat újra piszkozat lesz, és újra közzé kell tenned.',
    en: 'You can then send it to other teachers or pools for testing. If you change it later, it goes back to draft and you publish it again.',
  },
  publishBlockers: {
    hu: 'Az automatikus ellenőrzés {n} blokkoló hibát talált. Így is közzéteheted; a tesztelők ezeket is látni fogják.',
    en: 'The automatic checks found {n} blocker(s). You can still publish; testers will see these.',
  },
  publishNoBlockers: { hu: 'Az automatikus ellenőrzés nem talált blokkoló hibát.', en: 'The automatic checks found no blockers.' },
  publishConfirm: { hu: 'Közzététel', en: 'Publish' },
  published: { hu: 'Közzétéve. Most már elküldheted tesztelésre.', en: 'Published. You can now send it for testing.' },
  shareLocked: { hu: 'Tedd közzé a feladatot véleményezésre, hogy elküldhesd tanároknak.', en: 'Publish the task for review to send it to teachers.' },
  shareChanged: {
    hu: 'Módosítottad a közzététel óta. Tedd közzé újra, hogy elküldd az új, {n}. változatot.',
    en: 'Changed since publishing — publish again to send revision {n}.',
  },
  shareChangedTesters: {
    hu: 'Addig a tesztelők nem nyithatják meg a feladatot; a korábbi eredményeik megmaradnak.',
    en: "Until then testers can't open it; their earlier results stay.",
  },
  inRevision: {
    hu: 'A feladat készítője éppen átdolgozza ezt a feladatot. Ha újra közzéteszi, tesztelheted.',
    en: 'The creator is revising this task. You can test it once they publish it again.',
  },
  err_not_published: { hu: 'Előbb tedd közzé a feladatot véleményezésre.', en: 'Publish the task for review first.' },
  err_revision_changed: { hu: 'A feladat közben megváltozott. Töltsd újra az oldalt.', en: 'The task changed in the meantime. Reload the page.' },

  // Labels
  level: { hu: 'Szint', en: 'Level' },
  format: { hu: 'Feladattípus', en: 'Task type' },
  format_true_false: { hu: 'Igaz/Hamis', en: 'True/False' },
  format_notes: { hu: 'Jegyzetkiegészítés', en: 'Notes completion' },
  field: { hu: 'Vizsga', en: 'Exam' },
  field_general: { hu: 'Általános angol', en: 'General English' },
  field_business: { hu: 'Gazdasági', en: 'Economics and Management' },
  field_technical: { hu: 'Műszaki', en: 'Technical English' },
  'field_agri-env': { hu: 'Agrár- és környezettudomány', en: 'Agricultural and Environmental Sciences' },
  style: { hu: 'Szöveg formája', en: 'Script style' },
  style_infer: { hu: 'A forrás alapján', en: 'From the source' },
  style_monologue: { hu: 'Monológ', en: 'Monologue' },
  style_dialogue: { hu: 'Interjú / párbeszéd', en: 'Interview / dialogue' },
  style_panel: { hu: 'Több beszélő', en: 'Panel' },
  origin_generated: { hu: 'MI', en: 'AI' },
  origin_uploaded: { hu: 'Feltöltött', en: 'Uploaded' },
  origin_pasted: { hu: 'Beillesztett', en: 'Pasted' },

  // Editor tabs
  tabCreate: { hu: 'Készítés', en: 'Create' },
  tabTest: { hu: 'Tesztelés', en: 'Test' },
  tabResults: { hu: 'Eredmények', en: 'Results' },
  crumbNew: { hu: 'Új feladat', en: 'New task' },

  // Start: generate / upload / paste
  startTitle: { hu: 'Honnan indulsz?', en: 'Where do you start?' },
  replaceTitle: { hu: 'Tartalom cseréje', en: 'Replace the content' },
  way_generate: { hu: 'MI-vel generálom', en: 'Generate with AI' },
  way_upload: { hu: '.docx feltöltése', en: 'Upload .docx' },
  way_paste: { hu: 'Szöveg beillesztése', en: 'Paste text' },
  way_blank: { hu: 'Üresen kezdem', en: 'Start blank' },
  sourceUrl: { hu: 'Forrás URL (pl. BBC-cikk)', en: 'Source URL (e.g. a BBC article)' },
  sourceText: { hu: 'vagy illeszd be a cikk szövegét', en: 'or paste the article text' },
  sourceHint: {
    hu: 'A feladat minden ténye ebből a hiteles forrásból jön; a téma is ebből adódik.',
    en: 'Every fact in the task comes from this authentic source; it also sets the topic.',
  },
  avoid: { hu: 'Mit kerüljön? (nem kötelező)', en: 'Anything to avoid? (optional)' },
  avoidPlaceholder: { hu: 'pl. átfedés egy korábbi feladattal, vizsgáztatói visszajelzés', en: 'e.g. overlap with an earlier task, examiner feedback' },
  generate: { hu: 'Feladat generálása', en: 'Generate task' },
  generating: { hu: 'Generálás… (akár fél perc)', en: 'Generating… (up to half a minute)' },
  remaining: { hu: 'Ma még {n} generálás', en: '{n} generations left today' },
  envTitle: { hu: 'Környezetvédelmi téma', en: 'Environment topic' },
  envBody: {
    hu: 'Környezeti és környezetvédelmi témából csak Igaz/Hamis feladat készülhet. Mit szeretnél?',
    en: 'Environment and environmental-protection topics can only be True/False tasks. What would you like to do?',
  },
  envSwitch: { hu: 'Váltás Igaz/Hamis feladatra (ajánlott)', en: 'Switch to True/False (recommended)' },
  envChange: { hu: 'Másik forrást választok', en: "I'll choose another source" },
  uploadHint: {
    hu: 'Töltsd fel a feladatlapot, a jelölt hangszöveget és a megoldókulcsot (.docx, egyszerre több is). A félkövér (n) jelölések adják a válaszok helyét.',
    en: 'Upload the task sheet, annotated audioscript and answer key (.docx, several at once). Bold (n) markers give the answer points.',
  },
  chooseFiles: { hu: 'Fájlok kiválasztása', en: 'Choose files' },
  pasteHint: {
    hu: 'Illeszd be a teljes feladatot: utasítás, táblázat vagy jegyzetek, jelölt hangszöveg (**(n)** vagy [[n|…]]), megoldókulcs.',
    en: 'Paste the whole task: instruction, table or notes, annotated script (**(n)** or [[n|…]]), answer key.',
  },
  importBtn: { hu: 'Beolvasás', en: 'Import' },
  importFound: {
    hu: 'Beolvasva: hangszöveg {script}, {markers} jelölés, {items} item, {key} kulcs.',
    en: 'Read: script {script}, {markers} markers, {items} items, {key} key answers.',
  },
  yes: { hu: 'igen', en: 'yes' },
  no: { hu: 'nem', en: 'no' },
  importFailed: { hu: 'A fájl nem olvasható.', en: "Couldn't read the file." },

  // Checking an existing task
  checkExisting: { hu: 'Kész feladat ellenőrzése', en: 'Check an existing task' },
  checkTitle: { hu: 'Kész feladat ellenőrzése', en: 'Check an existing task' },
  checkIntro: {
    hu: 'Tölts fel egy már elkészült feladatot: a hangszöveget és a feladatlapot a megoldókulccsal, ha van, a hangfelvétellel együtt. Az automatikus ellenőrzés után tesztelésre is elküldheted.',
    en: 'Upload a task that already exists: its audioscript and its task sheet with the key, plus the recording if you have one. After the automatic checks you can send it for testing too.',
  },
  checkScript: { hu: 'Hangszöveg', en: 'Audioscript' },
  checkScriptHint: {
    hu: '.docx vagy beillesztett szöveg. Jelölés nélkül is jó: a válaszok helyét a program megkeresi.',
    en: '.docx or pasted text. Markers are optional: the answer points are found automatically.',
  },
  checkSheet: { hu: 'Feladatlap és megoldókulcs', en: 'Task sheet and answer key' },
  checkSheetHint: {
    hu: 'Az utasítás, az állítások vagy a jegyzetek, és a kulcs (akár külön fájlban).',
    en: 'The instruction, the statements or notes, and the key (a separate file is fine).',
  },
  checkAudio: { hu: 'Hangfelvétel (nem kötelező)', en: 'Recording (optional)' },
  checkAudioHint: {
    hu: 'MP3, legfeljebb 15 MB. Mentéskor feltöltődik, és a tesztelők ezt hallják. Ha nincs, készíthetsz Azure-hangot.',
    en: 'MP3, up to 15 MB. It is uploaded on save and testers hear it. Without one, you can create an Azure voice recording.',
  },
  orPaste: { hu: 'vagy illeszd be ide a szöveget', en: 'or paste the text here' },
  checkRun: { hu: 'Ellenőrzés indítása', en: 'Run the checks' },
  checkNeedBoth: { hu: 'A hangszöveg és a feladatlap is kell.', en: 'Both the audioscript and the task sheet are needed.' },
  mp3OnSave: { hu: 'A(z) {name} felvétel mentéskor feltöltődik.', en: 'The recording {name} is uploaded when you save.' },
  mp3TooBig: { hu: 'Az MP3 nagyobb 15 MB-nál.', en: 'The MP3 is larger than 15 MB.' },
  mp3Uploading: { hu: 'Felvétel feltöltése…', en: 'Uploading the recording…' },
  mp3Failed: { hu: 'A feladat mentve, de a felvétel feltöltése nem sikerült. Töltsd fel a Hanganyag panelen.', en: 'The task is saved, but the recording upload failed. Upload it in the Recording panel.' },

  // Details
  details: { hu: 'Alapadatok', en: 'Details' },
  taskTitle: { hu: 'Feladat címe', en: 'Task title' },
  sourceRef: { hu: 'Forrás', en: 'Source' },
  instructions: { hu: 'Utasítás', en: 'Instruction' },
  topic_tf: { hu: 'Téma az utasításban („Listen to the text about …”)', en: 'Topic in the instruction ("Listen to the text about …")' },
  topic_notes: { hu: 'Jegyzetdoboz címe („Notes on …”)', en: 'Notes box title ("Notes on …")' },
  useStandard: { hu: 'Szabványos mondat', en: 'Use the standard sentence' },

  // Script
  script: { hu: 'Hangszöveg', en: 'Audioscript' },
  scriptHint: {
    hu: 'Bekezdések üres sorral elválasztva. A válasz helyét így jelöld: [[3|ahol elhangzik]]. Párbeszédnél a sor elején: „Interviewer: ”.',
    en: 'Separate paragraphs with a blank line. Mark each answer point as [[3|the words where it is spoken]]. Dialogue lines start with a label like "Interviewer: ".',
  },
  words: { hu: '{n} szó', en: '{n} words' },
  band: { hu: 'sáv: {min}–{max}', en: 'band {min}–{max}' },
  preview: { hu: 'Előnézet a távolságokkal', en: 'Preview with spacing' },
  syllables: { hu: '{n} szótag', en: '{n} syll.' },
  gapSince: { hu: '{n} szótag az előző válasz óta', en: '{n} syllables since the previous answer' },

  // Items
  items: { hu: 'Itemek', en: 'Items' },
  statement: { hu: 'Állítás', en: 'Statement' },
  example: { hu: 'Példa', en: 'Example' },
  trap: { hu: 'Csapda', en: 'Trap' },
  trap_none: { hu: '—', en: '—' },
  trap_swap: { hu: 'Ténycsere', en: 'Factual swap' },
  trap_conjunction: { hu: 'both…and', en: 'both…and' },
  addRow: { hu: '+ Sor', en: '+ Row' },
  removeRow: { hu: 'Utolsó sor törlése', en: 'Remove last row' },
  notesLines: { hu: 'Jegyzetsorok', en: 'Note lines' },
  notesHint: { hu: 'Soronként egy jegyzet; a hiány: {{n}}. Pl. „Place of research: {{0}}”', en: 'One note per line; a gap is {{n}}. E.g. "Place of research: {{0}}"' },
  answers: { hu: 'Megoldókulcs', en: 'Answer key' },
  answersHint: { hu: 'Az első az elhangzó alak; további elfogadható változatok „ / ” jellel.', en: 'The first is the spoken form; more accepted variants after " / ".' },
  balance: { hu: 'Kulcs: {t} I : {f} H', en: 'Key: {t} T : {f} F' },
  authorNotes: { hu: 'Szerzői megjegyzések (önellenőrzés)', en: 'Author notes (self-check)' },

  // Checks
  checks: { hu: 'Automatikus ellenőrzés', en: 'Automatic checks' },
  checksSummary: { hu: 'Blokkoló: {fail} · Figyelmeztetés: {warn}', en: 'Blockers: {fail} · Warnings: {warn}' },
  checksClean: { hu: 'Minden automatikus ellenőrzés rendben.', en: 'Every automatic check passes.' },
  blocker: { hu: 'Blokkoló', en: 'Blocker' },
  warning: { hu: 'Figyelmeztetés', en: 'Warning' },
  itemN: { hu: '{n}. item', en: 'Item {n}' },
  passedAuto: { hu: 'Rendben ({n})', en: 'Passed ({n})' },
  manualChecks: { hu: 'A tesztelő tanárok ítélik meg ({n})', en: 'Judged by testing teachers ({n})' },
  distanceChart: { hu: 'Távolságok (szótag az előző válasz óta, min. 15)', en: 'Spacing (syllables since the previous answer, min. 15)' },
  leadIn: { hu: 'bevezető', en: 'lead-in' },
  fixWithAi: { hu: 'Javítás MI-vel', en: 'Fix with AI' },
  keepScript: { hu: 'A hangszöveg maradjon (csak az itemek változzanak)', en: 'Keep the audioscript (change only the items)' },
  teacherNote: { hu: 'Megjegyzés az MI-nek (nem kötelező)', en: 'Note for the AI (optional)' },
  revising: { hu: 'Javítás…', en: 'Revising…' },
  revisedNotice: { hu: 'Az MI javított változata betöltve. Nézd át, és mentsd, ha jó.', en: "The AI's revision is loaded. Look it over and save if it's good." },

  // Audio
  audio: { hu: 'Hanganyag', en: 'Recording' },
  audioNone: { hu: 'Még nincs hanganyag ehhez a változathoz.', en: 'No recording for this revision yet.' },
  audioTts: { hu: 'Azure neurális hang, a szint tempójával (~{wpm} szó/perc).', en: 'Azure neural voice at the level speed (~{wpm} wpm).' },
  audioUploaded: { hu: 'Feltöltött felvétel.', en: 'Uploaded recording.' },
  makeAudio: { hu: 'Hanganyag készítése', en: 'Create the recording' },
  makingAudio: { hu: 'Készül…', en: 'Creating…' },
  uploadMp3: { hu: 'MP3 feltöltése', en: 'Upload MP3' },
  removeAudio: { hu: 'Hanganyag törlése', en: 'Remove recording' },
  saveFirst: { hu: 'Előbb mentsd a feladatot.', en: 'Save the task first.' },
  audioFailed: { hu: 'Nem sikerült a hanganyag.', en: "Couldn't make the recording." },

  // Sharing
  testing: { hu: 'Tesztelők', en: 'Testing teachers' },
  testingHint: { hu: 'Válaszd ki, mely tanárok teszteljék a feladatot.', en: 'Choose which teachers should test this task.' },
  addPool: { hu: 'Csoport hozzáadása:', en: 'Add a pool:' },
  noTeachers: { hu: 'Nincs más tanár az alkalmazásban.', en: 'There are no other teachers in the app.' },
  saveTesters: { hu: 'Tesztelők mentése', en: 'Save testers' },
  testersSaved: { hu: 'Elküldve {n} tanárnak.', en: 'Sent to {n} teachers.' },
  waiting: { hu: 'vár', en: 'waiting' },

  // Pools
  pools: { hu: 'Tanárcsoportok', en: 'Teacher pools' },
  poolsHint: { hu: 'Mentett tanárcsoportok, amelyeknek egy kattintással küldhetsz feladatot.', en: 'Saved groups of teachers you can send a task to in one click.' },
  poolName: { hu: 'Csoport neve', en: 'Pool name' },
  newPool: { hu: 'Új csoport', en: 'New pool' },
  savePool: { hu: 'Csoport mentése', en: 'Save pool' },
  deletePool: { hu: 'Törlés', en: 'Delete' },
  edit: { hu: 'Szerkesztés', en: 'Edit' },
  cancel: { hu: 'Mégse', en: 'Cancel' },
  members: { hu: '{n} tag', en: '{n} members' },

  // Save
  save: { hu: 'Mentés', en: 'Save' },
  saving: { hu: 'Mentés…', en: 'Saving…' },
  saved: { hu: 'Mentve', en: 'Saved' },
  saveFailed: { hu: 'Nem sikerült menteni: {error}', en: "Couldn't save: {error}" },
  revisionNote: {
    hu: 'Ha a szöveg vagy az itemek változnak, új változat jön létre; a korábbi tesztek a régi változatnál maradnak.',
    en: 'Changing the script or items makes a new revision; earlier tests stay with their revision.',
  },
  deleteTask: { hu: 'Feladat törlése', en: 'Delete task' },
  deleteConfirm: { hu: 'Biztosan törlöd a feladatot és minden tesztjét?', en: 'Delete this task and all of its tests?' },
  unsaved: { hu: 'Nem mentett változások', en: 'Unsaved changes' },

  // Test mode
  testIntroTitle: { hu: 'Teszteld vizsgázóként', en: 'Take it as a candidate' },
  testIntro: {
    hu: 'Először oldd meg a feladatot úgy, ahogy egy vizsgázó. Utána itemenként eldöntöd, megfelel-e, és ha nem, miért.',
    en: 'First answer the task as a candidate would. Then decide item by item whether it is fit for the exam, and if not, why.',
  },
  playback_exam: { hu: 'Vizsgaszerű: 1 perc olvasási idő, kétszeri lejátszás, nincs tekerés', en: 'Exam-style: 1 minute reading time, played twice, no seeking' },
  playback_free: { hu: 'Szabad lejátszás', en: 'Free playback' },
  readingTime: { hu: 'Olvasási idő: {s} mp', en: 'Reading time: {s}s' },
  skip: { hu: 'Kihagyás', en: 'Skip' },
  play: { hu: 'Lejátszás', en: 'Play' },
  pause: { hu: 'Szünet', en: 'Pause' },
  playOf: { hu: '{n}. lejátszás / 2', en: 'Play {n} of 2' },
  betweenPlays: { hu: 'Szünet a második lejátszás előtt: {s} mp', en: 'Pause before the second play: {s}s' },
  recordingDone: { hu: 'A felvétel véget ért.', en: 'The recording has ended.' },
  noAudioYet: { hu: 'Ehhez a változathoz még nincs hanganyag.', en: 'There is no recording for this revision yet.' },
  finishAnswering: { hu: 'Kész, jöhet az értékelés', en: "Done, let's review the items" },
  reviewTitle: { hu: 'Itemek értékelése', en: 'Review the items' },
  reviewIntro: {
    hu: 'Itemenként: elfogadod vizsgafeladatnak, vagy elutasítod és megadod az okát. A hangszöveg most már látható.',
    en: 'For each item: accept it as fit for the exam, or reject it and give the reason. The audioscript is now visible.',
  },
  yourAnswer: { hu: 'A te válaszod: {a}', en: 'Your answer: {a}' },
  keyAnswer: { hu: 'Kulcs: {a}', en: 'Key: {a}' },
  noAnswer: { hu: '(nincs)', en: '(none)' },
  whereSpoken: { hu: 'Ahol elhangzik', en: 'Where it is spoken' },
  autoFlags: { hu: 'Automatikus jelzések', en: 'Automatic flags' },
  accept: { hu: 'Elfogadom', en: 'Accept' },
  reject: { hu: 'Elutasítom', en: 'Reject' },
  why: { hu: 'Miért nem jó?', en: "Why isn't it good?" },
  other: { hu: 'Egyéb (írd le)', en: 'Other (explain)' },
  note: { hu: 'Megjegyzés', en: 'Note' },
  wholeTask: { hu: 'A teljes feladat', en: 'The whole task' },
  wholeTaskHint: { hu: 'A hangszöveggel és az egész feladattal kapcsolatos problémák.', en: 'Problems with the audioscript and the task as a whole.' },
  recommendation: { hu: 'Javaslatod', en: 'Your recommendation' },
  rec_publish: { hu: 'Publikálható', en: 'Publish' },
  rec_revise: { hu: 'Javítandó', en: 'Revise' },
  rec_reject: { hu: 'Elvetendő', en: 'Reject' },
  overallNote: { hu: 'Összegző megjegyzés', en: 'Overall note' },
  saveDraft: { hu: 'Piszkozat mentése', en: 'Save draft' },
  submitTest: { hu: 'Teszt beküldése', en: 'Submit test' },
  submitted: { hu: 'Beküldve: {date}. Amíg a feladat nem változik, módosíthatod.', en: 'Submitted {date}. You can change it until the task changes.' },
  needVerdicts: { hu: 'Még {n} itemről nem döntöttél.', en: '{n} items still need a verdict.' },
  needRecommendation: { hu: 'Válassz javaslatot.', en: 'Choose a recommendation.' },
  needReason: { hu: 'Az elutasított itemekhez adj okot.', en: 'Give a reason for every rejected item.' },
  answerAgain: { hu: '← Vissza a válaszokhoz', en: '← Back to answering' },
  reviewSaved: { hu: 'Mentve', en: 'Saved' },
  correct: { hu: 'helyes', en: 'correct' },
  incorrect: { hu: 'eltér a kulcstól', en: 'differs from the key' },

  // Results
  resultsEmpty: { hu: 'Ehhez a változathoz még nincs beküldött teszt.', en: 'No submitted tests for this revision yet.' },
  resultsFor: { hu: 'Változat:', en: 'Revision:' },
  testsCount: { hu: '{n} teszt', en: '{n} tests' },
  recommendations: { hu: 'Javaslatok', en: 'Recommendations' },
  correctRate: { hu: '{n}/{m} helyes', en: '{n}/{m} correct' },
  accepts: { hu: '{n} elfogad', en: '{n} accept' },
  rejects: { hu: '{n} elutasít', en: '{n} reject' },
  reasons: { hu: 'Okok', en: 'Reasons' },
  notes: { hu: 'Megjegyzések', en: 'Notes' },
  oldRevisionNote: {
    hu: 'Ezek a tesztek egy korábbi változatra vonatkoznak.',
    en: 'These tests are about an earlier revision.',
  },
  editItem: { hu: 'Javítás', en: 'Edit' },
  editKey: { hu: 'Megoldás', en: 'Key' },
  editNoteLine: { hu: 'Jegyzetsor', en: 'Note line' },
  editNoteLineHint: { hu: 'A {gap} hézag maradjon a sorban.', en: 'Keep the gap {gap} in the line.' },
  editExcerpt: { hu: 'Részlet a szövegből', en: 'Script excerpt' },
  editExcerptHint: {
    hu: 'A megjelölt mondat és az előtte álló. A [[{n}|…]] jelölés mutatja, hol hangzik el a megoldás; hagyd meg.',
    en: 'The marked sentence and the one before it. The [[{n}|…]] marker shows where the answer is spoken; keep it.',
  },
  editNoExcerpt: {
    hu: 'Ennek a tételnek nincs jelölése a szövegben ([[{n}|…]]); a szöveget a Készítés fülön javíthatod.',
    en: 'This item has no marker in the script ([[{n}|…]]); fix the script on the Create tab.',
  },
  editMarkerRemoved: {
    hu: 'A(z) {n}. tétel jelölése ([[{n}|…]]) kikerült a részletből. Mentés előtt tedd vissza, különben az ellenőrzés nem találja a megoldás helyét.',
    en: "The marker for item {n} ([[{n}|…]]) is gone from the excerpt. Put it back before saving, or the checks can't find where the answer is spoken.",
  },
  editGapRule: { hu: 'A sorban pontosan ezek a hézagok maradjanak: {gaps}.', en: 'Keep exactly these gaps in the line: {gaps}.' },
  editNeedsAnswer: { hu: 'Adj meg legalább egy elfogadható választ.', en: 'Give at least one accepted answer.' },
  editNeedsText: { hu: 'Az állítás nem lehet üres.', en: "The statement can't be empty." },
  editChecks: { hu: 'Automatikus ellenőrzés ehhez a tételhez', en: 'Automatic checks for this item' },
  editChecksClean: { hu: 'Nincs automatikus jelzés ehhez a tételhez.', en: 'No automatic findings for this item.' },
  editFeedback: { hu: 'A tesztelők visszajelzése', en: "Testers' feedback" },
  editNewRevision: { hu: 'A mentés új változatot hoz létre.', en: 'Saving makes a new revision.' },
  editSavedRevision: {
    hu: 'Mentve {n}. változatként. A korábbi tesztek a saját változatuknál maradnak.',
    en: 'Saved as revision {n}. Earlier tests stay with their revision.',
  },
  editSaveCreateFirst: {
    hu: 'A Készítés fülön mentetlen módosítások vannak. Mentsd őket, mielőtt itt javítasz.',
    en: 'There are unsaved changes on the Create tab. Save them before correcting items here.',
  },

  // Errors
  err_daily_limit: { hu: 'Elérted a mai generálási keretet.', en: "You've reached today's generation limit." },
  err_generation_failed: { hu: 'Az MI nem adott használható feladatot. Próbáld újra.', en: "The AI didn't return a usable task. Try again." },
  err_source_fetch_failed: { hu: 'Az oldal nem tölthető le. Illeszd be a cikk szövegét.', en: "Couldn't fetch the page. Paste the article text instead." },
  err_invalid_url: { hu: 'Érvénytelen URL.', en: 'Invalid URL.' },
  err_source_too_short: { hu: 'A forrás túl rövid (legalább 80 szó).', en: 'The source is too short (at least 80 words).' },
  err_generic: { hu: 'Hiba történt. Próbáld újra.', en: 'Something went wrong. Try again.' },
} satisfies Record<string, { hu: string; en: string }>

export type ExamTaskCopyKey = keyof typeof COPY

/** `c('key', { n: 3 })` in the UI language (German shows English). */
export function useExamTaskCopy() {
  const { lang } = useLanguage()
  const l: 'hu' | 'en' = lang === 'hu' ? 'hu' : 'en'
  const c = useCallback(
    (key: ExamTaskCopyKey, vars?: Record<string, string | number>) => {
      let s: string = COPY[key][l]
      if (vars) for (const [k, v] of Object.entries(vars)) s = s.split(`{${k}}`).join(String(v))
      return s
    },
    [l],
  )
  return { c, lang: l as 'hu' | 'en' }
}

/** `{ en, hu }` pairs from the criteria list and the checks. */
export function pick(text: { en: string; hu: string }, lang: 'hu' | 'en'): string {
  return text[lang]
}
