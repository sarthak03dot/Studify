# StudyFy 🎓

StudyFy is a comprehensive **React Native** mobile application designed to be the ultimate companion for students and developers. It bridges the gap between academic resource sharing and professional portfolio tracking, providing a unified platform for learning and growth.

## 🚀 Key Features

### 📊 Ecosystem Stats (Developer Portfolio)
Connect and track your real-time progress across major developer platforms directly within the app:
*   **GitHub**: View public repos, followers, following, and account age.
*   **LeetCode**: Track solved problems (Easy/Med/Hard), global ranking, and acceptance rate.
*   **Codeforces**: Monitor competitive programming ratings, max ratings, and ranks.
*   **Visual Data**: Beautifully animated cards with platform-specific branding and metrics.

### 📚 Resource Hub
A robust file-sharing system for academic materials:
*   **Browse & Search**: Find resources by **Year**, **Branch**, or **Subject**. Capability to search by title or subject.
*   **Smart Filtering**: Filter resources (Notes, Syllabus, Papers) relative to your academic standing.
*   **Upload**: Contribute to the community by uploading resources.
*   **Interactive UI**: Animations on interaction, category badges, and user attribution.

### 🔐 Authentication & Profile
*   **Secure Auth**: robust Login and Registration flows using **JWT** and modern validation.
*   **Profile Management**: extensive profile customization with avatar management.
*   **Real-time Updates**: Socket.io integration ensures data consistency.

### 🎨 Modern UI/UX
*   **Theming**: Full support for **Dark Mode** and **Light Mode**.
*   **Animations**: Smooth transitions and entry animations using `react-native-reanimated`.
*   **Custom Navigation**: A unique **Curved Bottom Bar** for seamless navigation.
*   **Design**: Uses Linear Gradients and Lucide Icons for a premium aesthetic.

---

## 🛠 Tech Stack

### Frontend
- **React Native** (v0.83)
- **TypeScript**
- **React 19**

### State & Data Management
- **TanStack Query (React Query)**: For efficient server state management and caching.
- **Context API**: For global app state (Auth, Theme).

### Navigation
- **React Navigation v7**:
  - Native Stack Navigator
  - Bottom Tab Navigator

### UI & Styling
- **Reanimated**: For high-performance animations.
- **Lucide React Native**: For consistent iconography.
- **Linear Gradient**: For rich visual backgrounds.
- **React Native SVG**: For custom vector graphics.

### Form Handling & Validation
- **React Hook Form**: Performant form management.
- **Zod**: Schema-based validation.

### Networking
- **Axios**: HTTP client.
- **Socket.io-client**: Real-time bidirectional communication.

---

## 📱 Screens

The application allows users to navigate through several key screens:
- **Dashboard**: The central hub for quick access to app features.
- **Global Stats**: Your developer fitness tracker.
- **Resources**: Browse and search specifically tailored study materials.
- **Upload Resource**: Share knowledge with the community.
- **Profile**: Manage your identity and settings.

---

## ⚡ Getting Started

### Prerequisites
- Node.js (>=20) - [Download](https://nodejs.org/)
- React Native CLI environment setup - [Guide](https://reactnative.dev/docs/environment-setup)
- Android Studio / Xcode

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-username/studyfy.git
   cd studyfy
   ```

2. **Install dependencies**
   ```bash
   # Using npm
   npm install
   
   # OR using Yarn
   yarn install
   ```

3. **Install Pods (iOS only)**
   ```bash
   cd ios && pod install && cd ..
   ```

### Running the App

1. **Start Metro Bundler**
   ```bash
   npm start
   ```

2. **Run on Android**
   ```bash
   npm run android
   ```

3. **Run on iOS**
   ```bash
   npm run ios
   ```

---

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit a pull request for any enhancements or bug fixes.

---

## 📄 License

This project is licensed under the MIT License.
