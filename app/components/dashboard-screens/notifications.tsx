"use client";

import React, { useEffect, useState } from "react";
import supabase from "../../helper/supabaseClient";
import { Notification } from "@/app/types/notification";

const DashboardNotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [filteredNotifications, setFilteredNotifications] = useState<
    Notification[]
  >([]);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"unread" | "read" | "all">("all"); // Tab state

  useEffect(() => {
    const fetchNotifications = async () => {
      const { data: userData, error: userError } =
        await supabase.auth.getUser();
      if (userError) {
        console.error("Error getting user data:", userError);
        return;
      }

      if (!userData?.user) {
        console.error("No user found.");
        return;
      }

      setUserId(userData.user.id);
      // Fetch notifications where current user is a recipient
      const { data: notificationsData, error: notificationsError } =
        await supabase
          .from("notifications")
          .select("*")
          .contains("recipients", [userData.user.id])
          .order("date", { ascending: false });

      if (notificationsError) {
        console.error("Error fetching notifications:", notificationsError);
        return;
      }

      setNotifications(notificationsData || []);
      setFilteredNotifications(notificationsData || []); // Initially display all
    };

    fetchNotifications();
  }, []);

  useEffect(() => {
    // Filter notifications based on the active tab
    const filtered = notifications.filter((notif) => {
      if (activeTab === "unread") {
        return !notif.opened_by?.includes(userId!);
      } else if (activeTab === "read") {
        return notif.opened_by?.includes(userId!);
      }
      return true; // For 'all' tab, return all notifications
    });
    setFilteredNotifications(filtered);
  }, [activeTab, notifications, userId]);

  const toggleReadStatus = async (notificationId: string, isRead: boolean) => {
    if (!userId) {
      console.error("No user ID found.");
      return;
    }

    const notification = notifications.find((n) => n.id === notificationId);
    if (!notification) {
      console.error("Notification not found with ID:", notificationId);
      return;
    }

    const openedByArray: string[] = notification.opened_by ?? [];
    const updatedOpenedBy = isRead
      ? openedByArray.filter((id) => id !== userId) // Remove userId
      : [...openedByArray, userId]; // Add userId

    const { error: updateError } = await supabase
      .from("notifications")
      .update({ opened_by: updatedOpenedBy })
      .eq("id", notificationId);

    if (updateError) {
      console.error("Error toggling read status:", updateError);
      return;
    }

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId
          ? ({
              ...n,
              opened_by: updatedOpenedBy,
              text: String(n.text), // Ensure text is string
              date: String(n.date), // Ensure date is string
              recipients: n.recipients ?? [], // Ensure recipients is array
            } as Notification)
          : n
      )
    );
  };

  return (
    <div className="w-full h-full text-black py-8 flex flex-col gap-4 px-4 md:pr-0">
      <h2 className="text-3xl font-semibold mt-16 md:mt-0">Notifications</h2>

      <div className="flex gap-1 mb-4">
        <button
          className={`border-b-2 p-2 border-black hover:border-brandGreen transition-all ease-in-out ${
            activeTab === "all" && "border-brandGreen"
          }`}
          onClick={() => setActiveTab("all")}
        >
          All
        </button>
        <button
          className={`border-b-2 p-2 border-black hover:border-brandGreen transition-all ease-in-out ${
            activeTab === "read" && "border-brandGreen"
          }`}
          onClick={() => setActiveTab("read")}
        >
          Read
        </button>
        <button
          className={`border-b-2 p-2 border-black hover:border-brandGreen transition-all ease-in-out ${
            activeTab === "unread" && "border-brandGreen"
          }`}
          onClick={() => setActiveTab("unread")}
        >
          Unread
        </button>
      </div>

      <table className="w-[100%] md:w-[88%] text-left border-collapse">
        <thead>
          <tr className="bg-brandGreen">
            <th className="p-4 text-sm md:text-base">Date</th>
            <th className="p-4 text-sm md:text-base">Text</th>
            <th className="p-4 text-sm md:text-base">From</th>
            <th className="p-4 text-sm md:text-base">Action</th>
          </tr>
        </thead>
        <tbody>
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notif) => (
              <tr key={notif.id} className="border-b border-black">
                <td className="px-4 py-2 text-sm md:text-base">
                  {notif?.date
                    ? new Date(notif.date).toLocaleDateString("en-GB")
                    : "N/A"}
                </td>
                <td className="px-4 py-2 text-sm md:text-base">{notif.text}</td>
                <td className="px-4 py-2 text-sm md:text-base">
                  <SenderName creatorId={notif.creator_id} />
                </td>
                <td className="px-4 py-2">
                  {notif?.opened_by?.includes(userId!) ? (
                    <button
                      onClick={() => toggleReadStatus(notif.id, true)}
                      className="btn-alt"
                    >
                      Mark Unread
                    </button>
                  ) : (
                    <button
                      onClick={() => toggleReadStatus(notif.id, false)}
                      className="btn"
                    >
                      Mark Read
                    </button>
                  )}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={4} className="p-4 text-center text-gray-500">
                No notifications found.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

// Fetches the sender's name based on creator_id
const SenderName = ({ creatorId }: { creatorId: string }) => {
  const [name, setName] = useState<string>("Loading...");

  useEffect(() => {
    const fetchSender = async () => {
      const { data, error } = await supabase
        .from("profiles")
        .select("name")
        .eq("id", creatorId)
        .single();

      if (error) {
        console.error("Error fetching sender name:", error);
        setName("Unknown");
        return;
      }

      setName(data?.name || "Unknown");
    };

    fetchSender();
  }, [creatorId]);

  return <>{name}</>;
};

export default DashboardNotificationsScreen;
