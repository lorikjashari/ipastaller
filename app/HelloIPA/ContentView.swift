import SwiftUI

struct ContentView: View {
    @State private var taps = 0

    var body: some View {
        ZStack {
            LinearGradient(
                colors: [
                    Color(red: 0.36, green: 0.34, blue: 0.86),
                    Color(red: 0.13, green: 0.12, blue: 0.31)
                ],
                startPoint: .topLeading,
                endPoint: .bottomTrailing
            )
            .ignoresSafeArea()

            VStack(spacing: 28) {
                Image(systemName: "iphone")
                    .font(.system(size: 62, weight: .light))
                    .foregroundStyle(.white.opacity(0.9))

                VStack(spacing: 8) {
                    Text("Hello, IPA")
                        .font(.largeTitle.weight(.bold))
                        .foregroundStyle(.white)

                    Text("A tiny app, built to be sideloaded.")
                        .font(.subheadline)
                        .foregroundStyle(.white.opacity(0.7))
                        .multilineTextAlignment(.center)
                }

                Button {
                    taps += 1
                } label: {
                    Text(taps == 0 ? "Tap me" : "Tapped \(taps) time\(taps == 1 ? "" : "s")")
                        .font(.headline)
                        .foregroundStyle(Color(red: 0.13, green: 0.12, blue: 0.33))
                        .padding(.horizontal, 28)
                        .padding(.vertical, 14)
                        .background(.white, in: Capsule())
                }
                .buttonStyle(.plain)
                .animation(.snappy, value: taps)

                Text("v1.0 · com.example.helloipa")
                    .font(.caption2.monospaced())
                    .foregroundStyle(.white.opacity(0.4))
            }
            .padding(32)
        }
    }
}

#Preview {
    ContentView()
}
