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
    <div>
      <header>
        <SignedOut>
          <div className="flex justify-center items-center h-screen">
            <SignInButton mode="modal" />
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
          </Routes>
        </SignedIn>
      </header>
    </div>
  );
}