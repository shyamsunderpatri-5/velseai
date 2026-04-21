import { createClient } from "../supabase/server";
import { NeuralAuditResult } from "./auditor";

/**
 * Story Bank Service
 * Manages the persistent interview stories (STAR+R)
 */
export async function saveStoriesFromAudit(
  userId: string,
  auditResult: NeuralAuditResult,
  scoreId: string
) {
  const supabase = await createClient();

  if (!auditResult.interview_master_stories?.length) return;

  const stories = auditResult.interview_master_stories.map((story) => ({
    user_id: userId,
    title: story.title,
    situation: story.situation,
    task: story.task,
    action: story.action,
    result: story.result,
    reflection: story.reflection,
    themes: story.themes,
    source_report_id: scoreId,
  }));

  const { error } = await supabase.from("interview_stories").insert(stories);

  if (error) {
    console.error("[StoryBank] Failed to save stories from audit:", error);
  } else {
    console.log(`[StoryBank] Successfully persisted ${stories.length} stories for user ${userId}`);
  }
}

export async function getUserStoryBank(userId: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("interview_stories")
    .select("*")
    .eq("user_id", userId)
    .order("created_at", { ascending: false });

  if (error) throw error;
  return data;
}

export async function toggleMasterStory(storyId: string, isMaster: boolean) {
  const supabase = await createClient();
  const { error } = await supabase
    .from("interview_stories")
    .update({ is_master: isMaster })
    .eq("id", storyId);

  if (error) throw error;
}
