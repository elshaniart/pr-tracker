"use client";

import React, { useEffect, useState } from "react";
import supabase from "../../helper/supabaseClient";
import { Trash2 } from "lucide-react";
import { Profile } from "../../types/profile";

interface DashboardFriendsScreenProps {
  profile: Profile;
}

const DashboardFriendsScreen: React.FC<DashboardFriendsScreenProps> = ({
  profile,
}) => {
  const [friends, setFriends] = useState<Profile[]>([]);
  const [friendUsername, setFriendUsername] = useState<string>(""); // Track the username to add
  const [error, setError] = useState<string>("");

  const { username, id: userId } = profile;

  useEffect(() => {
    const fetchFriends = async () => {
      if (!profile?.friends || profile.friends.length === 0) return;

      const { data, error } = await supabase
        .from("profiles")
        .select("*")
        .in("id", profile.friends) // Use IDs to fetch friends
        .order("name", { ascending: true });

      if (error) {
        console.error("Error fetching friends:", error);
      } else {
        setFriends(data || []);
      }
    };

    fetchFriends();
  }, [profile.friends]);

  const handleAddFriend = async () => {
    if (!username) {
      setError("Please update your username in your profile.");
      return;
    }

    if (!friendUsername) {
      setError("Please enter a friend's username.");
      return;
    }

    // Check if the friend exists
    const { data: friendData, error: friendError } = await supabase
      .from("profiles")
      .select("*")
      .eq("username", friendUsername)
      .single(); // Assuming usernames are unique

    if (friendError || !friendData) {
      setError("Friend not found. Please check the username.");
      return;
    }

    // Check if the user is trying to add themselves
    if (friendData.username === username) {
      setError("You can't add yourself as a friend.");
      return;
    }

    // Check if the friend is already in the current user's friends list
    if (profile.friends?.includes(friendData.id)) {
      setError("This user is already in your friends list.");
      return;
    }

    // Add the current user to the friend's friends array
    const { error: addFriendError } = await supabase
      .from("profiles")
      .update({
        friends: [...(friendData.friends || []), userId], // Use IDs
      })
      .eq("id", friendData.id);

    if (addFriendError) {
      setError("Error adding friend to the friend's list.");
      return;
    }

    // Add the friend to the current user's friends array
    const { error: addCurrentUserError } = await supabase
      .from("profiles")
      .update({
        friends: [...(profile.friends || []), friendData.id], // Use IDs
      })
      .eq("id", userId);

    if (addCurrentUserError) {
      setError("Error adding friend to your list.");
      return;
    }

    // Update the local state to reflect the changes
    setFriends((prevFriends) => [
      ...prevFriends,
      { ...friendData, username: friendData.username }, // Add the friend's data
    ]);

    // Create a notification for the user who was added
    const notificationText = `${profile.name} added you as a friend`;
    const newNotification = {
      text: notificationText,
      date: new Date().toISOString(),
      creator_id: userId, // The user who sent the friend request
      recipients: [friendData.id], // The user who was added (by their ID)
      opened_by: [],
    };

    const { error: notificationError } = await supabase
      .from("notifications")
      .insert(newNotification);

    if (notificationError) {
      console.error("Error creating notification:", notificationError);
    }

    // Clear the input and error state
    setFriendUsername("");
    setError("");
  };

  const handleRemoveFriend = async (friendIdToRemove: string | null) => {
    if (!userId || !friendIdToRemove) return;

    // Remove the current user from the friend's friends array
    const { data: friendData, error: friendError } = await supabase
      .from("profiles")
      .select("friends")
      .eq("id", friendIdToRemove)
      .single(); // Fetch the friend's friends array

    if (friendError || !friendData) {
      console.error("Error fetching friend:", friendError);
      return;
    }

    const updatedFriendFriends = friendData.friends?.filter(
      (friend: string) => friend !== userId
    );

    const { error: removeFromFriendError } = await supabase
      .from("profiles")
      .update({ friends: updatedFriendFriends })
      .eq("id", friendIdToRemove);

    if (removeFromFriendError) {
      console.error(
        "Error removing from friend's friends list:",
        removeFromFriendError
      );
    }

    // Remove the friend from the current user's friends array
    const updatedFriends = profile?.friends?.filter(
      (friendId: string) => friendId !== friendIdToRemove
    );

    const { error: removeFromUserError } = await supabase
      .from("profiles")
      .update({ friends: updatedFriends })
      .eq("id", userId);

    if (removeFromUserError) {
      console.error(
        "Error removing from user's friends list:",
        removeFromUserError
      );
    } else {
      setFriends(friends.filter((friend) => friend.id !== friendIdToRemove));
    }
  };

  return (
    <div className="w-full h-full text-black py-8 md:pr-0 flex flex-col gap-8 max-w-screen px-4">
      <h2 className="text-3xl font-semibold mt-16 md:mt-0">Friends</h2>
      <div className="flex gap-8 items-center">
        <p className="text-lg font-semibold">Username: {username + ""}</p>
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={friendUsername}
            onChange={(e) => setFriendUsername(e.target.value)}
            placeholder="Friend's username"
            className={`w-full p-2 text-black border-2 focus:outline-none border-black hover:border-brandGreen hover:border-4 hover:p-1.5 ease-in-out transition-all h-[48px] placeholder:text-black`}
          />
          <button onClick={handleAddFriend} className="btn w-48">
            Add Friend
          </button>
        </div>
      </div>

      {error && <p className="text-red-500">{error}</p>}

      {/* Friends Table */}
      <div className="overflow-x-auto">
        <table className="w-[100%] md:w-[88%] text-left border-collapse">
          <thead>
            <tr className="bg-brandGreen">
              <th className="p-4 text-sm md:text-base">Name</th>
              <th className="p-4 text-sm md:text-base">Weight (kg)</th>
              <th className="p-4 text-sm md:text-base">Height (cm)</th>
              <th className="p-4 text-sm md:text-base">Bench PR</th>
              <th className="p-4 text-sm md:text-base">Squat PR</th>
              <th className="p-4 text-sm md:text-base">Deadlift PR</th>
              <th className="p-4 text-sm md:text-base">Actions</th>
            </tr>
          </thead>
          <tbody>
            {friends.length > 0 ? (
              friends.map((friend) => (
                <tr key={friend.id} className="border-b border-black">
                  <td className="p-4 text-sm md:text-base">
                    {friend.name || "Unknown"}
                  </td>
                  <td className="p-4 text-sm md:text-base">
                    {friend.weight_kg ?? "N/A"}
                  </td>
                  <td className="p-4 text-sm md:text-base">
                    {friend.height_cm ?? "N/A"}
                  </td>
                  <td className="p-4 text-sm md:text-base">
                    {friend.bench_press_pr ?? "N/A"}
                  </td>
                  <td className="p-4 text-sm md:text-base">
                    {friend.squat_pr ?? "N/A"}
                  </td>
                  <td className="p-4 text-sm md:text-base">
                    {friend.deadlift_pr ?? "N/A"}
                  </td>
                  <td className="p-4">
                    <button
                      onClick={() => handleRemoveFriend(friend.id)}
                      className="flex items-center"
                    >
                      <Trash2 color="#E31A1A" size={24} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="p-4 text-center text-gray-500">
                  No friends found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardFriendsScreen;
