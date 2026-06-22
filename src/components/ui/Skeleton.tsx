export function SkeletonBase({ className = "" }: { className?: string }) {
    return (
        <div className={`animate-pulse bg-slate-200 rounded-md ${className}`} />
    )
}

export function SkeletonHeader() {
    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md">
            <div className="max-w-6xl mx-auto h-16 px-4 flex items-center justify-between">
                <div className="flex items-center gap-6">
                    {/* Logo skeleton */}
                    <SkeletonBase className="h-8 w-32 rounded-lg" />
                    {/* Nav links skeleton */}
                    <div className="hidden md:flex items-center gap-6">
                        <SkeletonBase className="h-5 w-20" />
                        <SkeletonBase className="h-5 w-20" />
                        <SkeletonBase className="h-5 w-20" />
                    </div>
                </div>
                <div className="flex items-center gap-4">
                    {/* Actions / Profile skeleton */}
                    <SkeletonBase className="h-9 w-24 rounded-full" />
                    <SkeletonBase className="h-9 w-9 rounded-full" />
                </div>
            </div>
        </header>
    )
}

export function SkeletonFooter() {
    return (
        <footer className="w-full border-t border-slate-150 bg-slate-50 py-10 mt-12">
            <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
                <div className="space-y-3">
                    <SkeletonBase className="h-6 w-32" />
                    <SkeletonBase className="h-4 w-48" />
                    <SkeletonBase className="h-4 w-40" />
                </div>
                <div className="space-y-3">
                    <SkeletonBase className="h-5 w-24" />
                    <SkeletonBase className="h-4 w-28" />
                    <SkeletonBase className="h-4 w-32" />
                </div>
                <div className="space-y-3">
                    <SkeletonBase className="h-5 w-24" />
                    <SkeletonBase className="h-4 w-28" />
                    <SkeletonBase className="h-4 w-32" />
                </div>
                <div className="space-y-3">
                    <SkeletonBase className="h-5 w-24" />
                    <SkeletonBase className="h-8 w-24 rounded-lg" />
                </div>
            </div>
        </footer>
    )
}

export function SkeletonCompanyDetail() {
    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
            <SkeletonHeader />
            <main className="max-w-6xl mx-auto py-6 px-4 w-full flex-1 space-y-6">
                {/* Header card skeleton */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row items-center md:items-start justify-between gap-6">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6 w-full md:w-auto">
                        <SkeletonBase className="w-28 h-28 md:w-32 md:h-32 rounded-2xl shrink-0" />
                        <div className="space-y-4 flex-1 w-full text-center md:text-left">
                            <SkeletonBase className="h-7 w-64 mx-auto md:mx-0" />
                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                <SkeletonBase className="h-4 w-40" />
                                <SkeletonBase className="h-4 w-32" />
                            </div>
                        </div>
                    </div>
                    <SkeletonBase className="w-40 h-10 rounded-full shrink-0" />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                    {/* Left content skeleton */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Giới thiệu */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-4">
                            <SkeletonBase className="h-5 w-36" />
                            <SkeletonBase className="h-4 w-full" />
                            <SkeletonBase className="h-4 w-full" />
                            <SkeletonBase className="h-4 w-3/4" />
                        </div>
                        {/* Hình ảnh */}
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 space-y-4">
                            <SkeletonBase className="h-5 w-36" />
                            <div className="grid grid-cols-3 gap-3">
                                <SkeletonBase className="aspect-[4/3] rounded-lg" />
                                <SkeletonBase className="aspect-[4/3] rounded-lg" />
                                <SkeletonBase className="aspect-[4/3] rounded-lg" />
                            </div>
                        </div>
                    </div>

                    {/* Right sidebar skeleton */}
                    <div className="lg:col-span-1 space-y-6">
                        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                            <SkeletonBase className="h-5 w-36" />
                            <div className="space-y-3">
                                <div className="flex gap-3">
                                    <SkeletonBase className="w-8 h-8 rounded-full shrink-0" />
                                    <div className="space-y-2 flex-1">
                                        <SkeletonBase className="h-3 w-16" />
                                        <SkeletonBase className="h-4 w-28" />
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <SkeletonBase className="w-8 h-8 rounded-full shrink-0" />
                                    <div className="space-y-2 flex-1">
                                        <SkeletonBase className="h-3 w-16" />
                                        <SkeletonBase className="h-4 w-28" />
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4">
                            <SkeletonBase className="h-5 w-36" />
                            <SkeletonBase className="aspect-[4/3] rounded-xl" />
                        </div>
                    </div>
                </div>
            </main>
            <SkeletonFooter />
        </div>
    )
}

export function SkeletonEventDetail() {
    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans">
            <SkeletonHeader />
            <main className="max-w-6xl mx-auto py-6 px-4 w-full flex-1">
                <div className="flex flex-col lg:flex-row gap-6 items-start">
                    {/* Left Column */}
                    <div className="flex-1 w-full lg:max-w-[760px] space-y-6">
                        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-6">
                            <SkeletonBase className="h-8 w-3/4" />
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 border-t border-slate-100 pt-5 pb-6">
                                <div className="flex items-center gap-3">
                                    <SkeletonBase className="w-9 h-9 rounded-full shrink-0" />
                                    <div className="space-y-1.5 flex-1">
                                        <SkeletonBase className="h-3.5 w-16" />
                                        <SkeletonBase className="h-4 w-24" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <SkeletonBase className="w-9 h-9 rounded-full shrink-0" />
                                    <div className="space-y-1.5 flex-1">
                                        <SkeletonBase className="h-3.5 w-16" />
                                        <SkeletonBase className="h-4 w-24" />
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <SkeletonBase className="w-9 h-9 rounded-full shrink-0" />
                                    <div className="space-y-1.5 flex-1">
                                        <SkeletonBase className="h-3.5 w-16" />
                                        <SkeletonBase className="h-4 w-24" />
                                    </div>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <SkeletonBase className="h-10 w-44 rounded-md" />
                                <SkeletonBase className="h-10 w-32 rounded-md" />
                            </div>
                        </div>

                        <div className="bg-white rounded-lg border border-slate-200 p-6 space-y-4">
                            <SkeletonBase className="h-5 w-48" />
                            <SkeletonBase className="h-4 w-full" />
                            <SkeletonBase className="h-4 w-full" />
                            <SkeletonBase className="h-4 w-full" />
                            <SkeletonBase className="h-4 w-2/3" />
                        </div>
                    </div>

                    {/* Right Column */}
                    <div className="w-full lg:w-[350px] shrink-0 space-y-6">
                        <div className="bg-white rounded-lg border border-slate-200 p-5 space-y-4">
                            <div className="flex items-start gap-4">
                                <SkeletonBase className="w-[88px] h-[88px] rounded-lg shrink-0" />
                                <div className="space-y-2 flex-1">
                                    <SkeletonBase className="h-5 w-full" />
                                    <SkeletonBase className="h-4 w-20" />
                                </div>
                            </div>
                            <div className="space-y-3 pt-2">
                                <div className="flex justify-between">
                                    <SkeletonBase className="h-4 w-20" />
                                    <SkeletonBase className="h-4 w-32" />
                                </div>
                                <div className="flex justify-between">
                                    <SkeletonBase className="h-4 w-20" />
                                    <SkeletonBase className="h-4 w-32" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
            <SkeletonFooter />
        </div>
    )
}

export function SkeletonGenericPage() {
    return (
        <div className="min-h-screen bg-slate-50/50 flex flex-col font-sans animate-pulse">
            <SkeletonHeader />
            <main className="max-w-6xl mx-auto py-8 px-4 w-full flex-1 space-y-6">
                <div className="flex justify-between items-center">
                    <SkeletonBase className="h-8 w-48" />
                    <SkeletonBase className="h-10 w-32 rounded-lg" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="md:col-span-2 space-y-4">
                        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                            <SkeletonBase className="h-6 w-3/4" />
                            <SkeletonBase className="h-4 w-full" />
                            <SkeletonBase className="h-4 w-full" />
                            <SkeletonBase className="h-4 w-1/2" />
                        </div>
                        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                            <SkeletonBase className="h-6 w-3/4" />
                            <SkeletonBase className="h-4 w-full" />
                            <SkeletonBase className="h-4 w-full" />
                            <SkeletonBase className="h-4 w-1/2" />
                        </div>
                    </div>
                    <div className="space-y-4">
                        <div className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
                            <SkeletonBase className="h-5 w-1/2" />
                            <SkeletonBase className="h-4 w-full" />
                            <SkeletonBase className="h-4 w-full" />
                        </div>
                    </div>
                </div>
            </main>
            <SkeletonFooter />
        </div>
    )
}
