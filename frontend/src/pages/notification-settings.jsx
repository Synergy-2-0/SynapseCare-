import React from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import NotificationHub from '../components/dashboard/NotificationHub';

/**
 * NotificationSettingsPage
 * 
 * Page for managing notification preferences
 */
const NotificationSettingsPage = () => {
    return (
        <DashboardLayout title="Notification Settings" showBack={true}>
            <div className="max-w-5xl mx-auto py-8">
                <NotificationHub />
            </div>
        </DashboardLayout>
    );
};

export default NotificationSettingsPage;
