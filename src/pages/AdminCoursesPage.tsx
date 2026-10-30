import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { fetchAdminCourses, updateAdminCourse } from '../lib/courseApi'
import type { AdminCourse } from '../lib/courses'

/**
 * /admin/courses: every public mini course with two switches — Hidden (out of the library and
 * off the students' shelf; students who started it keep it) and Self-enroll (on the shelf).
 */
export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<AdminCourse[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    fetchAdminCourses()
      .then(setCourses)
      .catch(() => setError('Failed to load the courses. Please try again.'))
  }, [])

  async function toggle(course: AdminCourse, patch: { hidden?: boolean; selfEnroll?: boolean }) {
    setBusy(course.id)
    setError(null)
    try {
      setCourses(await updateAdminCourse(course.id, patch))
    } catch {
      setError('That didn’t work. Please try again.')
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold text-slate-800">Public mini courses</h1>
        <Link to="/admin" className="text-sm text-indigo-600 hover:underline">
          ← Admin overview
        </Link>
      </div>
      <p className="text-sm text-slate-500">
        Teachers make a course public; it shows in every teacher’s library at once. <strong>Hidden</strong> takes it out of the library and off the students’ shelf (anyone already on it keeps it).{' '}
        <strong>Self-enroll</strong> puts it on the “Start a course” shelf in My courses, for any student to start.
      </p>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {!courses && !error && <p className="text-sm text-slate-400">Loading...</p>}
      {courses && courses.length === 0 && <p className="text-sm text-slate-500">No public courses yet.</p>}
      {courses && courses.length > 0 && (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-200 text-left text-slate-500">
                <th className="px-4 py-2">Course</th>
                <th className="px-4 py-2">Author</th>
                <th className="px-4 py-2">Students</th>
                <th className="px-4 py-2">Hidden</th>
                <th className="px-4 py-2">Self-enroll</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((course) => (
                <tr key={course.id} className="border-b border-slate-100 align-top last:border-0">
                  <td className="px-4 py-2">
                    <Link to={`/teacher/tools/courses/library/${course.id}`} className="font-medium text-indigo-700 hover:underline">
                      {course.title}
                    </Link>
                    <span className="block text-xs text-slate-500">
                      {course.level} · {course.status === 'published' ? 'published' : 'draft (not in the library)'} · updated {new Date(course.updatedAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="px-4 py-2 text-slate-700">
                    {course.authorName}
                    <span className="block text-xs text-slate-500">{course.teacherEmail}</span>
                  </td>
                  <td className="px-4 py-2 text-slate-600">
                    {course.assignedCount} assigned · {course.selfCount} self
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      aria-label={`Hide ${course.title}`}
                      checked={course.hidden}
                      disabled={busy === course.id}
                      onChange={(e) => void toggle(course, { hidden: e.target.checked })}
                    />
                  </td>
                  <td className="px-4 py-2">
                    <input
                      type="checkbox"
                      aria-label={`Open ${course.title} for self-enroll`}
                      checked={course.selfEnroll}
                      disabled={busy === course.id}
                      onChange={(e) => void toggle(course, { selfEnroll: e.target.checked })}
                    />
                    {course.selfEnroll && (course.hidden || course.status !== 'published') && <span className="block text-xs text-amber-700">not on the shelf while {course.hidden ? 'hidden' : 'a draft'}</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
