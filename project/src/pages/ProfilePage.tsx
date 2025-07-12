import React, { useState } from 'react';
import { User, Camera, MapPin, Globe, Calendar, Award, MessageSquare, TrendingUp, Heart } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { formatDistanceToNow } from '../utils/dateUtils';
import apiService from '../services/api';

interface ProfilePageProps {
  onNavigate: (page: string) => void;
}

const ProfilePage: React.FC<ProfilePageProps> = ({ onNavigate }) => {
  const { user, updateUser } = useAuth();
  const { questions } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    bio: user?.bio || '',
    location: user?.location || '',
    website: user?.website || ''
  });
  const [isSaving, setIsSaving] = useState(false);

  if (!user) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">Please sign in to view your profile</h2>
        <button
          onClick={() => onNavigate('login')}
          className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
        >
          Sign In
        </button>
      </div>
    );
  }

  const userQuestions = questions.filter(q => q.author._id === user._id);
  const userAnswers = questions.flatMap(q => q.answers.filter(a => a.author._id === user._id));
  const totalVotes = userQuestions.reduce((sum, q) => sum + (q.voteCount || 0), 0) + 
                    userAnswers.reduce((sum, a) => sum + (a.voteCount || 0), 0);
  const totalLikes = userQuestions.reduce((sum, q) => sum + (q.likes || 0), 0);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = async (e) => {
        const result = e.target?.result as string;
        try {
          await apiService.updateUserProfile({ avatar: result });
          // Update local user state
          updateUser({ ...user, avatar: result });
        } catch (error) {
          console.error('Failed to update avatar:', error);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveProfile = async () => {
    try {
      setIsSaving(true);
      const response = await apiService.updateUserProfile(editData);
      
      // Update local user state
      updateUser({ ...user, ...editData });
      setIsEditing(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('Failed to update profile. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Profile Header */}
      <div className="bg-gradient-to-r from-indigo-500 to-purple-600 rounded-2xl p-8 text-white">
        <div className="flex flex-col md:flex-row items-center md:items-start space-y-4 md:space-y-0 md:space-x-6">
          <div className="relative">
            <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center overflow-hidden">
              {user.avatar ? (
                <img 
                  src={user.avatar} 
                  alt={user.username}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-white" />
              )}
            </div>
            <label className="absolute bottom-0 right-0 bg-white text-indigo-600 rounded-full p-2 cursor-pointer hover:bg-gray-50 transition-colors">
              <Camera className="w-4 h-4" />
              <input
                type="file"
                accept="image/*"
                onChange={handleAvatarUpload}
                className="hidden"
                aria-label="Upload avatar"
              />
            </label>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-3xl font-bold mb-2">{user.username}</h1>
            <p className="text-indigo-100 mb-4">{user.email}</p>
            
            <div className="flex flex-wrap justify-center md:justify-start gap-4 text-sm">
              {user.location && (
                <div className="flex items-center space-x-1">
                  <MapPin className="w-4 h-4" />
                  <span>{user.location}</span>
                </div>
              )}
              {user.website && (
                <div className="flex items-center space-x-1">
                  <Globe className="w-4 h-4" />
                  <a href={user.website} target="_blank" rel="noopener noreferrer" className="hover:underline">
                    Website
                  </a>
                </div>
              )}
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>Joined {formatDistanceToNow(new Date(user.joinedAt || Date.now()))}</span>
              </div>
            </div>
          </div>
          
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-6 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>
      </div>

      {/* Edit Profile Form */}
      {isEditing && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Edit Profile</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bio</label>
              <textarea
                value={editData.bio}
                onChange={(e) => setEditData({ ...editData, bio: e.target.value })}
                placeholder="Tell us about yourself..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                value={editData.location}
                onChange={(e) => setEditData({ ...editData, location: e.target.value })}
                placeholder="Where are you based?"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Website</label>
              <input
                type="url"
                value={editData.website}
                onChange={(e) => setEditData({ ...editData, website: e.target.value })}
                placeholder="https://your-website.com"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <div className="flex space-x-3">
              <button
                onClick={handleSaveProfile}
                disabled={isSaving}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition-colors"
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={isSaving}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bio Section */}
      {user.bio && (
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">About</h3>
          <p className="text-gray-600">{user.bio}</p>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
          <div className="flex justify-center mb-2">
            <Award className="w-8 h-8 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{user.reputation || 0}</div>
          <div className="text-sm text-gray-600">Reputation</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
          <div className="flex justify-center mb-2">
            <MessageSquare className="w-8 h-8 text-indigo-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{userQuestions.length}</div>
          <div className="text-sm text-gray-600">Questions</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
          <div className="flex justify-center mb-2">
            <TrendingUp className="w-8 h-8 text-green-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalVotes}</div>
          <div className="text-sm text-gray-600">Total Votes</div>
        </div>
        
        <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
          <div className="flex justify-center mb-2">
            <Heart className="w-8 h-8 text-red-500" />
          </div>
          <div className="text-2xl font-bold text-gray-900">{totalLikes}</div>
          <div className="text-sm text-gray-600">Likes Received</div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 border border-gray-200 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Questions</h3>
        {userQuestions.length === 0 ? (
          <div className="text-center py-8">
            <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">You haven't asked any questions yet.</p>
            <button
              onClick={() => onNavigate('ask')}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Ask Your First Question
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {userQuestions.slice(0, 5).map(question => (
              <div 
                key={question._id}
                className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => onNavigate('question')}
              >
                <h4 className="font-medium text-gray-900 mb-2">{question.title}</h4>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <div className="flex items-center space-x-4">
                    <span>{question.voteCount || 0} votes</span>
                    <span>{question.answers.length} answers</span>
                    <span>{question.likes || 0} likes</span>
                  </div>
                  <span>{formatDistanceToNow(new Date(question.createdAt))}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;