import { useUser } from '@clerk/clerk-react';

function Settings() {
  const { user } = useUser();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-white">Settings</h1>
      <p>
        Your login method:{' '}
        {user?.primaryEmailAddress?.emailAddress ? 'Email' : 'Unknown'}
      </p>
      <p>
        Contact: {user?.primaryEmailAddress?.emailAddress || 'Not provided'}
      </p>
    </div>
  );
}

export default Settings;