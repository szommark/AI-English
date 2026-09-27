-- AI-English: Exam Prep — listening audio (Phase 1).
--
-- A private bucket for the exam recordings. Any signed-in user can read (the client asks
-- for a signed URL); there is no insert/update/delete policy, so clients can't write —
-- the files are uploaded by hand in the dashboard:
--   erettsegi-de-kozep-2025-majus.mp3, nyelvvizsga-en-b1-minta-01.mp3 (bucket root)

insert into storage.buckets (id, name, public)
values ('exam-audio', 'exam-audio', false)
on conflict (id) do nothing;

create policy "exam_audio_read_authenticated"
  on storage.objects for select to authenticated
  using (bucket_id = 'exam-audio');
