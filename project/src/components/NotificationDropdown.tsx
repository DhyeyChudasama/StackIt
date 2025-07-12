import React, { useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useApp } from '../contexts/AppContext';
import { formatDistanceToNow } from '../utils/dateUtils';

interface NotificationDropdownProps {
  onClose: () => void;
}

const NotificationDropdown: React.FC<NotificationDropdownProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { notifications, markNotificationAsRead } = useApp();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const userNotifications = user 
    ? notifications.filter(n => n.recipient === user._id).slice(0, 10)
    : [];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleNotificationClick = async (notification: any) => {
    if (!notification.isRead) {
      try {
        await markNotificationAsRead(notification._id);
      } catch (error) {
        console.error('Failed to mark notification as read:', error);
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_answer':
        return '💬';
      case 'new_comment':
        return '💭';
      case 'question_like':
      case 'answer_like':
        return '❤️';
      case 'answer_accepted':
        return '✅';
      case 'question_vote':
      case 'answer_vote':
        return '👍';
      default:
        return '🔔';
    }
  };

  return (
    <div
      ref={dropdownRef}
      className="absolute right-0 top-full mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50"
    >
      <div className="p-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Notifications</h3>
        {userNotifications.length > 0 && (
          <p className="text-sm text-gray-500 mt-1">
            {userNotifications.filter(n => !n.isRead).length} unread
          </p>
        )}
      </div>
      
      <div className="max-h-96 overflow-y-auto">
        {userNotifications.length === 0 ? (
          <div className="p-4 text-center text-gray-500">
            <div className="text-4xl mb-2">🔔</div>
            <p>No notifications yet</p>
            <p className="text-xs text-gray-400 mt-1">We'll notify you when something happens</p>
          </div>
        ) : (
          userNotifications.map((notification) => (
            <div
              key={notification._id}
              onClick={() => handleNotificationClick(notification)}
              className={`p-4 border-b border-gray-100 hover:bg-gray-50 cursor-pointer transition-colors ${
                !notification.isRead ? 'bg-blue-50' : ''
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`w-2 h-2 rounded-full mt-2 ${
                  !notification.isRead ? 'bg-blue-500' : 'bg-gray-300'
                }`} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2 mb-1">
                    <span className="text-lg">{getNotificationIcon(notification.type)}</span>
                    <p className="text-sm font-medium text-gray-900">{notification.title}</p>
                  </div>
                  <p className="text-sm text-gray-700">{notification.message}</p>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatDistanceToNow(new Date(notification.createdAt))} ago
                  </p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {userNotifications.length > 0 && (
        <div className="p-3 border-t border-gray-200">
          <button 
            className="text-sm text-blue-600 hover:text-blue-700 font-medium"
            onClick={() => {
              // TODO: Navigate to notifications page
              onClose();
            }}
          >
            View all notifications
          </button>
        </div>
      )}
    </div>
  );
};

export default NotificationDropdown;