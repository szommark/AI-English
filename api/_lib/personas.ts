import { supabaseAdmin } from './supabaseAdmin.js'
import type { UserRole } from './roles.js'

export interface TutorPersona {
  id: string
  displayName: string
  promptText: string
}

/**
 * Validates a client-supplied personaId against the caller's role — never trust it
 * blindly, same validation-boundary role isModelId plays for models. Returns null if
 * the persona doesn't exist or isn't enabled for this role (admins can use any).
 */
export async function getPersonaForRole(personaId: string, role: UserRole): Promise<TutorPersona | null> {
  const { data } = await supabaseAdmin
    .from('tutor_personas')
    .select('id, display_name, prompt_text, enabled_for_students, enabled_for_teachers')
    .eq('id', personaId)
    .maybeSingle()

  if (!data) return null
  if (role === 'student' && !data.enabled_for_students) return null
  if (role === 'teacher' && !data.enabled_for_teachers) return null

  return { id: data.id, displayName: data.display_name, promptText: data.prompt_text }
}

/** Substitutes {{token}} placeholders in admin-authored persona text with learner context. */
export function applyPersonaTokens(text: string, tokens: Record<string, string>): string {
  return text.replace(/\{\{(\w+)\}\}/g, (match, key: string) => (key in tokens ? tokens[key] : match))
}
