import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { fillFeedback, getBySessionIdAndUserId } from "../../api/rarfApi"; // adjust import if needed
import type { FillFeedbackRequest } from "../../types";
import { getUsernameFromToken, isTokenExpired } from "../../utils/jwtUtils";

export default function FillFeedback() {
  const { sessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();

   // 🔒 Handle token and extract user from JWT
  const [userId, setUserId] = useState<string>("");
  if (!sessionId) return <div className="text-center text-red-500">Invalid session.</div>;
  
  const [feedback, setFeedback] = useState<FillFeedbackRequest>({
    rating: 0,
    understandableScore: 0,
    confidenceScore: 0,
    expectationsScore: 0,
    engagementScore: 0,
    organizationScore: 0,
    relevanceScore: 0,
    presenterScore: 0,
    paceScore: 0,
    mostValuable: "",
    suggestions: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isError, setIsError] = useState(false);

  const [alreadyFilled, setAlreadyFilled] = useState(false);
  const [notRegistered, setNotRegistered] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // <-- new loading state

    // Check registration and feedbackFilled
  useEffect(() => {

        if (isTokenExpired()) {
            alert("Your session has expired. Please log in again.");
            navigate("/login");
        } else {
            setUserId(getUsernameFromToken() || "");
            if (!userId) {
            alert("Invalid session. Please log in again.");
            navigate("/login");
            }
        }

    const checkFeedback = async () => {
        console.log("Checking feedback for session:", sessionId, "user:", userId);
        try {
            const response = await getBySessionIdAndUserId(sessionId, userId);
            console.log("API response:", response);

            if (response.feedbackFilled) {
                console.log("Feedback already filled!");
                setAlreadyFilled(true);
            }
        } catch (err: any) {
        console.error("API error caught:", err, typeof err, err?.status);
        if (err?.status === 404) {
            console.log("User is not registered for this session.");
            setNotRegistered(true);
            navigate(`/sessions/${sessionId}/view`);
        } else {
            console.log("Other error occurred:", err);
            setIsError(true);
        }
        } finally {
        console.log("Setting isLoading to false");
        setIsLoading(false);
        }
    };

    checkFeedback();
  }, [sessionId, userId]);

  const handleChange = (key: keyof FillFeedbackRequest, value: any) => {
    setFeedback((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    setIsError(false);
    setIsSuccess(false);
    try {
      await fillFeedback(sessionId, userId, feedback);
      setIsSuccess(true);
      // Redirect after successful submission
      navigate(`/sessions/${sessionId}/view`);
    } catch (err) {
      console.error("Failed to submit feedback:", err);
      setIsError(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const scoreFields: (keyof FillFeedbackRequest)[] = [
    "understandableScore",
    "confidenceScore",
    "expectationsScore",
    "engagementScore",
    "organizationScore",
    "relevanceScore",
    "presenterScore",
    "paceScore",
  ];

  const questions: Record<string, string> = {
    understandableScore: "How understandable was the material covered in this session?",
    confidenceScore: "How confident do you feel in applying what you learned?",
    expectationsScore: "How well did the session meet your expectations?",
    engagementScore: "How engaging was the session?",
    organizationScore: "How organized and well-structured was the session?",
    relevanceScore: "How relevant was the content to your goals or interests?",
    presenterScore: "How effective was the presenter in explaining the concepts?",
    paceScore: "How would you rate the pace of the session?",
  };

  const renderStars = (current: number, onChange: (value: number) => void) => (
    <div className="flex gap-1 text-2xl">
      {[1, 2, 3, 4, 5].map((value) => (
        <button
          key={value}
          type="button"
          onClick={() => onChange(value)}
          className={`transition ${
            value <= current ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300"
          }`}
        >
          ★
        </button>
      ))}
    </div>
  );

  // Show loading spinner while fetching feedback info
  if (isLoading) {
    return <div className="text-center text-gray-700 mt-10">⏳ Loading...</div>;
  }

  // Show messages instead of form if blocked
  if (notRegistered) {
    return <div className="text-center text-red-500 mt-10">❌ You are not registered for this session.</div>;
  }

  if (alreadyFilled) {
    return <div className="text-center text-green-600 mt-10">✅ You have already filled feedback for this session.</div>;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-400 to-purple-500 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-700 text-white text-center py-8 px-6">
          <h1 className="text-3xl font-semibold mb-2">Fill Feedback</h1>
          <p className="opacity-90 text-lg">Share your thoughts about this session</p>
        </div>

        <div className="p-6 md:p-10 space-y-6 text-gray-900">
          {/* Overall Rating */}
          <div className="flex flex-col gap-3 items-start">
            <label className="font-medium text-gray-900 text-lg">Overall Rating</label>
            {renderStars(feedback.rating, (v) => handleChange("rating", v))}
          </div>

          {/* Detailed Scores */}
          <div className="grid sm:grid-cols-2 gap-4">
            {scoreFields.map((field) => (
              <div key={field} className="flex flex-col gap-1">
                <label className="text-gray-900 font-medium">{questions[field]}</label>
                <input
                  type="number"
                  min={0}
                  max={10}
                  value={feedback[field]}
                  onChange={(e) => handleChange(field, parseInt(e.target.value))}
                  className="px-3 py-2 border rounded-md text-gray-900"
                />
              </div>
            ))}
          </div>

          {/* Most Valuable */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-900 font-medium">Most Valuable Part</label>
            <textarea
              value={feedback.mostValuable}
              onChange={(e) => handleChange("mostValuable", e.target.value)}
              className="px-3 py-2 border rounded-md text-gray-900 resize-none"
              placeholder="What did you find most valuable?"
            />
          </div>

          {/* Suggestions */}
          <div className="flex flex-col gap-2">
            <label className="text-gray-900 font-medium">Suggestions for Improvement</label>
            <textarea
              value={feedback.suggestions}
              onChange={(e) => handleChange("suggestions", e.target.value)}
              className="px-3 py-2 border rounded-md text-gray-900 resize-none"
              placeholder="Any suggestions to improve?"
            />
          </div>

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || isLoading || notRegistered || alreadyFilled}
            className="w-full px-4 py-3 bg-indigo-600 text-white rounded-lg shadow hover:bg-indigo-700 transition disabled:opacity-50"
          >
            {isSubmitting ? "Submitting..." : "Submit Feedback"}
          </button>

          {/* Status Messages */}
          {isSuccess && (
            <div className="text-green-600 font-medium text-center">✅ Feedback submitted successfully!</div>
          )}
          {isError && (
            <div className="text-red-500 font-medium text-center">❌ Failed to submit feedback. Please try again.</div>
          )}
        </div>
      </div>
    </div>
  );
};