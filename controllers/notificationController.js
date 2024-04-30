import Notification from '../models/notification.js';

export function createNotification(notif){
    Notification.create({
        content:notif.content,
        title:notif.title,
        notifDate:notif.notifDate
    }).then(n => {
        return n
    }).catch((err) => {
        return err
    })
    return {notif}
}
// Get all notifications
export async function getNotifications(req, res) {
    try {
        const notifications = await Notification.find();

        res.status(200).json(notifications);
    } catch (error) {
        console.error('Error getting notifications:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}