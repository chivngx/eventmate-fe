/**
 * Root loading state — shown while any route segment is loading.
 */
export default function Loading() {
 return (
 <div className="flex min-h-[60vh] w-full items-center justify-center">
 <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-600 border-t-transparent" />
 </div>
 )
}
