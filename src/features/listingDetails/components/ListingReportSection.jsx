export default function ListingReportSection({
  showReportForm,
  setShowReportForm,
  reportSuccess,
  setReportSuccess,
  reportReason,
  setReportReason,
  reporterPhone,
  setReporterPhone,
  reportMessage,
  setReportMessage,
  reportSubmitting,
  handleSubmitReport,
}) {
  if (!showReportForm) return null;

  return (
    <div className="mt-6 rounded-3xl border border-red-200 bg-red-50 p-4">
      {reportSuccess ? (
        <div>
          <h3 className="text-lg font-black text-red-900">
            Report submitted
          </h3>

          <p className="mt-2 text-sm leading-6 text-red-700">
            Thanks for reporting this listing. The admin will check it.
          </p>

          <button
            onClick={() => {
              setShowReportForm(false);
              setReportSuccess(false);
            }}
            className="mt-4 rounded-2xl bg-white px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100"
          >
            Close report
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmitReport}>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-start">
            <div>
              <h3 className="text-lg font-black text-red-900">
                Report wrong information
              </h3>

              <p className="mt-1 text-sm leading-6 text-red-700">
                Tell us what is wrong with this listing so the admin can
                review it.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowReportForm(false)}
              className="rounded-2xl bg-white px-4 py-2 text-sm font-bold text-red-700 transition hover:bg-red-100"
            >
              Cancel
            </button>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm font-bold text-red-900">
                Reason
              </label>

              <select
                value={reportReason}
                onChange={(event) =>
                  setReportReason(event.target.value)
                }
                className="h-12 w-full rounded-2xl border border-red-200 bg-white px-4 text-sm outline-none"
              >
                <option>Wrong information</option>
                <option>Wrong phone number</option>
                <option>Fake listing</option>
                <option>Rent is different</option>
                <option>Location is wrong</option>
                <option>Already full</option>
                <option>Other</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-bold text-red-900">
                Your phone number optional
              </label>

              <input
                value={reporterPhone}
                onChange={(event) => setReporterPhone(event.target.value)}
                placeholder="Only if admin needs to contact you"
                className="h-12 w-full rounded-2xl border border-red-200 bg-white px-4 text-sm outline-none"
              />
            </div>
          </div>

          <div className="mt-3">
            <label className="mb-2 block text-sm font-bold text-red-900">
              Explain the issue
            </label>

            <textarea
              value={reportMessage}
              onChange={(event) => setReportMessage(event.target.value)}
              rows="4"
              placeholder="Example: The owner said rent is ₹6000 but listing shows ₹4500."
              className="w-full rounded-2xl border border-red-200 bg-white px-4 py-3 text-sm outline-none"
            />
          </div>

          <button
            disabled={reportSubmitting}
            className="mt-4 rounded-2xl bg-red-700 px-5 py-3 text-sm font-bold text-white transition hover:bg-red-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {reportSubmitting ? "Submitting..." : "Submit report"}
          </button>
        </form>
      )}
    </div>
  );
}
