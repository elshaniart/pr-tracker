import supabase from "./supabaseClient";

export const signInWithGoogle = async () => {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
  });

  if (error) {
    throw new Error(error.message);
  }

  return data;
};
