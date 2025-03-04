import { useUser } from '@clerk/clerk-react';

function Profile() {
  const { user } = useUser();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white">Profile</h1>
      <p>
        Logged in as: {user?.primaryEmailAddress?.emailAddress || 'Not provided'}
      </p>
    </div>
  );
}

export default Profile;