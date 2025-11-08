import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getBySessionIdPaginated } from "../../api/rarfApi"; // adjust path if needed
import type { Rarf } from "../../types";

export default function ViewSessionFeedback() {
  const { sessionId } = useParams<{ sessionId: string }>();

  const [pageData, setPageData] = useState<{ items: Rarf[]; totalPages: number } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isError, setIsError] = useState(false);
  const [page, setPage] = useState(0);
  const [expanded, setExpanded] = useState<string | null>(null);
  const PAGE_SIZE = 9;

  useEffect(() => {
    if (!sessionId) return;
    const fetchFeedback = async () => {
      setIsLoading(true);
      setIsError(false);
      try {
        const data = await getBySessionIdPaginated(sessionId + `?page=${page}&size=${PAGE_SIZE}`);
        setPageData(data);
      } catch (err) {
        console.error("Failed to fetch feedback:", err);
        setIsError(true);
      } finally {
        setIsLoading(false);
      }
    };
    fetchFeedback();
  }, [sessionId, page]);

  if (!sessionId) {
    return (
      <div className="min-h-screen flex items-center justify-center text-red-500">
        Invalid session ID.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 py-10 px-4">
      <div className="max-w-6xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white text-center py-8 px-6">
          <h1 className="text-3xl font-semibold mb-2">Session Feedback</h1>
          <p className="opacity-90 text-lg">Feedback responses for this session</p>
        </div>

        <div className="p-6 md:p-10">
          {/* Pagination Controls */}
          {pageData && (
            <div className="flex justify-between items-center mb-6">
              <div className="text-gray-900 font-medium">
                Total Pages: {pageData.totalPages}
              </div>
              <div className="flex gap-3">
                <button
                  disabled={page === 0}
                  onClick={() => setPage(page - 1)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
                >
                  Previous
                </button>
                <span className="px-4 py-2 bg-gray-200 rounded-lg text-gray-900">
                  Page {page + 1} of {pageData.totalPages}
                </span>
                <button
                  disabled={page >= pageData.totalPages - 1}
                  onClick={() => setPage(page + 1)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          )}

          {/* Feedback Cards */}
          {isLoading ? (
            <div className="text-center text-gray-900 italic py-10">Loading feedback...</div>
          ) : isError ? (
            <div className="text-center text-red-500 py-10">Failed to load feedback.</div>
          ) : !pageData ? (
            <div className="text-center text-gray-900 italic py-10">
              Fetching feedback data...
            </div>
          ) : pageData.items.length === 0 ? (
            <div className="text-center text-gray-900 italic py-10">
              No feedback responses yet.
            </div>
          ) : (
            <ul className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {pageData.items.map((fb) => {
                const isOpen = expanded === fb.userId;
                return (
                  <li
                    key={fb.userId}
                    className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-lg transition transform hover:-translate-y-1"
                  >
                    <div className="flex flex-col justify-between h-full">
                      {/* Header summary */}
                      <div>
                        <h2 className="text-xl font-semibold text-indigo-700 mb-1">
                          {fb.userId}
                        </h2>
                        <p className="text-sm text-gray-900 mb-2">
                          Overall Rating: <b>{fb.rating}/5</b>
                        </p>
                      </div>

                      {/* Expandable section */}
                      {isOpen && (
                        <div className="mt-3 text-sm text-gray-900 space-y-1 transition-all">
                          <p>Understandable: {fb.understandableScore}</p>
                          <p>Confidence: {fb.confidenceScore}</p>
                          <p>Expectations: {fb.expectationsScore}</p>
                          <p>Engagement: {fb.engagementScore}</p>
                          <p>Organization: {fb.organizationScore}</p>
                          <p>Relevance: {fb.relevanceScore}</p>
                          <p>Presenter: {fb.presenterScore}</p>
                          <p>Pace: {fb.paceScore}</p>
                          <div className="mt-2">
                            <p className="font-semibold">Most Valuable:</p>
                            <p className="italic text-gray-800">{fb.mostValuable}</p>
                          </div>
                          <div className="mt-2">
                            <p className="font-semibold">Suggestions:</p>
                            <p className="italic text-gray-800">{fb.suggestions}</p>
                          </div>
                        </div>
                      )}

                      {/* Toggle button */}
                      <button
                        onClick={() =>
                          setExpanded(isOpen ? null : fb.userId)
                        }
                        className="mt-4 px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
                      >
                        {isOpen ? "Hide Details" : "View Details"}
                      </button>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
};