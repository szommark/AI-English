import TaskView from '../Exam/TaskView'
import { answerKey, type AnswerValue, type ExamAnswers } from '../../lib/examScoring'
import { toPaperTasks, type CompSkill, type CompTestContent } from '../../lib/compTests'
import TestText from './TestText'

/**
 * The test as a student answers it: the reading text (listening: nothing, the recording is shown
 * by the page), then every section with Exam Prep's item controls.
 */
export default function TestPaper({
  skill,
  content,
  answers,
  onAnswer,
}: {
  skill: CompSkill
  content: CompTestContent
  answers: ExamAnswers
  onAnswer: (key: string, value: AnswerValue) => void
}) {
  const tasks = toPaperTasks(content)
  return (
    <div className="space-y-6">
      {skill === 'reading' && content.text && <TestText text={content.text} />}
      {tasks.map((task) => (
        <TaskView key={task.id} task={task} language="en" answers={answers} onAnswer={(taskId, itemId, v) => onAnswer(answerKey(taskId, itemId), v)} />
      ))}
    </div>
  )
}
