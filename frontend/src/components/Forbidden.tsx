import { LockKeyhole, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

function ForbiddenPage() {
  const navigate = useNavigate();

  return (
    <div className="flex min-h-[70vh] items-center justify-center px-6">
      <div className="max-w-md text-center">

        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <LockKeyhole size={36} className="text-red-500" />
        </div>

        <p className="text-sm font-semibold uppercase tracking-widest text-red-500">
          403 Forbidden
        </p>

        <h1 className="mt-3 text-3xl font-bold text-gray-900">
          Access Denied
        </h1>

        <p className="mt-3 text-sm leading-6 text-gray-500">
          You don't have permission to view this content.
          Please log in with an account that has the required permission.
        </p>

        <button
          onClick={() => navigate("/dashboard")}
          className="mt-6 inline-flex items-center gap-2 rounded-lg bg-black px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-gray-800"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </button>
      </div>
    </div>
  );
}

export default ForbiddenPage;