/**
 * Shared Auth Constants & Configurations for EventMate Authentication
 */

export function isOrganizerRole(role: string | null | undefined): boolean {
    return role === "organizer" || role === "employer"
}
