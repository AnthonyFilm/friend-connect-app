/*
  PARTY HOST SETTINGS
  Edit the greetings, page labels, and Supabase connection here.
  Leave Supabase blank for local-only testing.
*/
window.FRIEND_PARTY_CONFIG = {
  appName: "Connect Friend",
  enterGreeting: "Toss a question or activity into the party bowl",
  viewerGreeting: "Spark Connections",
  enterSubheading: "Add a question or activity for the group. Keep it kind, open-ended, and party-safe.",
  viewerSubheading: "",

  /*
    SUPABASE SETTINGS
    After you create the Supabase project/table, paste these two values:
    supabaseUrl: "https://YOUR-PROJECT.supabase.co",
    supabaseAnonKey: "YOUR-PUBLISHABLE-ANON-KEY",
  */
  supabaseUrl: "https://daamtupiewonwpqzloul.supabase.co",
  supabaseAnonKey: "sb_publishable_OJaU0rFvObBDZ5icK21Xuw_JNlEIOcG",
  tableName: "party_prompts"
};
