function App() {
  return (
    <div className="flex h-screen w-screen flex-col items-center justify-center bg-slate-50 p-4">
      <div className="text-center space-y-4">
        <h1 className="text-5xl font-extrabold tracking-tight text-slate-950 sm:text-6xl">
          Event<span className="text-blue-600">Mate</span>
        </h1>
        <p className="text-lg text-slate-600 max-w-md mx-auto">
          Nền tảng kết nối sinh viên và các cơ hội tổ chức sự kiện chuyên nghiệp.
        </p>
        <div className="inline-flex gap-3">
          <div className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm">
            Hệ thống đang khởi tạo thành công!
          </div>
        </div>
      </div>
    </div>
  )
}

export default App