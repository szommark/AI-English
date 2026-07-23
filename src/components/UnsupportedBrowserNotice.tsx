export default function UnsupportedBrowserNotice() {
  return (
    <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-800">
      <p className="font-medium">Speech features aren't supported in this browser.</p>
      <p className="mt-1">
        AI-English uses your browser's built-in speech recognition and text-to-speech. For the
        best experience, please open this app in <span className="font-medium">Google Chrome</span> on
        desktop or Android.
      </p>
    </div>
  )
}
