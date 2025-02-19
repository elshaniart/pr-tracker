"use client";

import React, { useEffect, useState } from "react";
import supabase from "../../helper/supabaseClient";

interface Notification {
  id: string;
  created_at: string;
  text: string;
  creator_id: string;
  recipients: string[];
  opened_by: string[];
}

const DashboardNotificationsScreen = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [userId, setUserId] = useState<string | null>(null);

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
    };

    fetchNotifications();
  }, []);

  const markAsRead = async (notificationId: string) => {
    if (!userId) {
      console.error("No user ID found.");
      return;
    }

    const notification = notifications.find((n) => n.id === notificationId);
    if (!notification) {
      console.error("Notification not found with ID:", notificationId);
      return;
    }

    // If already read, do nothing
    if (notification.opened_by.includes(userId)) {
      return;
    }

    const updatedOpenedBy = [...notification.opened_by, userId];

    const { error: updateError } = await supabase
      .from("notifications")
      .update({ opened_by: updatedOpenedBy })
      .eq("id", notificationId);

    if (updateError) {
      console.error("Error marking notification as read:", updateError);
      return;
    }

    setNotifications((prev) =>
      prev.map((n) =>
        n.id === notificationId ? { ...n, opened_by: updatedOpenedBy } : n
      )
    );
  };

  return (
    <div className="w-full h-full text-black py-8 flex flex-col gap-4 px-4 md:pr-0">
      <h2 className="text-3xl font-semibold mt-16 md:mt-0">Notifications</h2>

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
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <tr key={notif.id} className="border-b border-black">
                <td className="p-4 text-sm md:text-base">
                  {new Date(notif.created_at).toLocaleDateString()}
                </td>
                <td className="p-4 text-sm md:text-base">{notif.text}</td>
                <td className="p-4 text-sm md:text-base">
                  <SenderName creatorId={notif.creator_id} />
                </td>
                <td className="p-4">
                  {notif.opened_by.includes(userId!) ? (
                    <span className="text-gray-500">Read</span>
                  ) : (
                    <button
                      onClick={() => markAsRead(notif.id)}
                      className="btn"
                    >
                      Mark as Read
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
