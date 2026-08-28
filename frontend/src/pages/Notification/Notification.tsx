import { useEffect, useState } from "react";
import { Check, UserPlus, X } from "lucide-react";
import toast from "react-hot-toast";

import { getFollowRequests, acceptFollowRequest , rejectFollowRequest } from "./api/notify.api";

interface Sender {
  _id: string;
  name: string;
  email?: string;
  profileImage?: string;
}

interface FollowRequest {
  sender: Sender;
  status: "pending";
}

function Notifications() {
  const [requests, setRequests] = useState<FollowRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      setLoading(true);

      const data = await getFollowRequests();

      setRequests(data.requests || []);
    } catch (error) {
      console.error(error);
      toast.error("Failed to load notifications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
  }, []);

  const handleAccept = async (senderId: string) => {
    try {
      setProcessingId(senderId);

      await acceptFollowRequest(senderId);

      setRequests((prev) =>
        prev.filter((request) => request.sender._id !== senderId)
      );

      toast.success("Follow request accepted");
    } catch (error) {
      console.error(error);
      toast.error("Failed to accept request");
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (senderId: string) => {
    try {
      setProcessingId(senderId);

      await rejectFollowRequest(senderId);

      setRequests((prev) =>
        prev.filter((request) => request.sender._id !== senderId)
      );

      toast.success("Follow request rejected");
    } catch (error) {
      console.error(error);
      toast.error("Failed to reject request");
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="pt-16 lg:pl-64">
      <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-10">
        
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">
            Notifications
          </h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage your follow requests
          </p>
        </div>

        {/* Notification Card */}
        <div className="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
          
          {loading ? (
            <div className="space-y-4 p-6">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="flex animate-pulse items-center gap-4"
                >
                  <div className="h-12 w-12 rounded-full bg-gray-200" />

                  <div className="flex-1">
                    <div className="mb-2 h-4 w-32 rounded bg-gray-200" />
                    <div className="h-3 w-48 rounded bg-gray-200" />
                  </div>
                </div>
              ))}
            </div>
          ) : requests.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-16 text-center">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-pink-50">
                <UserPlus className="h-7 w-7 text-pink-500" />
              </div>

              <h2 className="text-lg font-semibold text-gray-900">
                No follow requests
              </h2>

              <p className="mt-1 text-sm text-gray-500">
                You don't have any pending follow requests.
              </p>
            </div>
          ) : (
            <div>
              {/* Section Header */}
              <div className="border-b border-gray-100 px-6 py-4">
                <h2 className="font-semibold text-gray-900">
                  Follow Requests
                </h2>

                <p className="text-sm text-gray-500">
                  {requests.length} pending request
                  {requests.length !== 1 ? "s" : ""}
                </p>
              </div>

              {/* Requests */}
              <div className="divide-y divide-gray-100">
                {requests.map((request) => {
                  const sender = request.sender;
                  const isProcessing =
                    processingId === sender._id;

                  return (
                    <div
                      key={sender._id}
                      className="flex items-center gap-4 px-6 py-5 transition hover:bg-gray-50"
                    >
                      {/* Profile Image */}
                      {sender.profileImage ? (
                        <img
                          src={sender.profileImage}
                          alt={sender.name}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-pink-500 to-purple-600 text-lg font-bold text-white">
                          {sender.name
                            ?.charAt(0)
                            .toUpperCase()}
                        </div>
                      )}

                      {/* User Info */}
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-semibold text-gray-900">
                          {sender.name}
                        </p>

                        {sender.email && (
                          <p className="truncate text-sm text-gray-500">
                            {sender.email}
                          </p>
                        )}

                        <p className="mt-1 flex items-center gap-1 text-xs text-gray-400">
                          <UserPlus className="h-3.5 w-3.5" />
                          Wants to follow you
                        </p>
                      </div>

                      {/* Actions */}
                      <div className="flex shrink-0 gap-2">
                        <button
                          onClick={() =>
                            handleAccept(sender._id)
                          }
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 rounded-lg bg-pink-500 px-4 py-2 text-sm font-medium text-white transition hover:bg-pink-600 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <Check className="h-4 w-4" />

                          {isProcessing
                            ? "..."
                            : "Accept"}
                        </button>

                        <button
                          onClick={() =>
                            handleReject(sender._id)
                          }
                          disabled={isProcessing}
                          className="flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          <X className="h-4 w-4" />

                          Reject
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Notifications;