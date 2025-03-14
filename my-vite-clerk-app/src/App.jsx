import { SignedIn, SignedOut, SignInButton } from '@clerk/clerk-react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import PostAd from './pages/PostAd';
import Chat from './pages/Chat';
import MyAds from './pages/MyAds';
import AdDetail from './pages/AdDetail';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-900">
      <header>
        <SignedOut>
          <div className="flex flex-col items-center justify-center h-screen p-6">
            <div className="bg-gray-800 rounded-lg shadow-lg p-8 max-w-md w-full text-center">
              <h1 className="text-2xl font-bold text-white mb-4">Welcome to Zesto</h1>
              <p className="text-gray-400 mb-6">Sign in to explore, buy, and sell.</p>
              <SignInButton mode="modal">
                <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition duration-300">
                  Sign In
                </button>
              </SignInButton>
              
            </div>
          </div>
        </SignedOut>

        <SignedIn>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/post-ad" element={<PostAd />} />
            <Route path="/chat" element={<Chat />} />
            <Route path="/my-ads" element={<MyAds />} />
            <Route path="/ad-detail/:adId" element={<AdDetail />} />
            <Route path="/dashboard" element={<div>Dashboard Page</div>} />
            {/* Optional: Redirect unmatched routes to home when signed in */}
            <Route path="*" element={<Home />} />
          </Routes>
        </SignedIn>
      </header>
    </div>
  );
}