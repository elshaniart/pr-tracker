import supabase from "./supabaseClient";

const isDev = process.env.NODE_ENV === "development";
const redirectTo = isDev
  ? "http://localhost:3000/"
  : "https://pr-tracker-taupe.vercel.app/";

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo },
  });

  if (error) {
    throw new Error("awd" + error.message);
  }

  return data;
};

export const signOut = async () => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    throw new Error(error.message);
  }
};
