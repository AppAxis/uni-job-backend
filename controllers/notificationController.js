import Notification from '../models/notification.js';

// Function to create a new notification
async function createNotification(req, res) {
  try {
    // Extract data from the request body
    const { receiverId, senderId, title, message } = req.body;

    // Create a new notification object
    const newNotification = new Notification({
      receiverId,
      senderId,
      title,
      message
      // You can include more fields here if needed
    });

    // Save the notification to the database
    await newNotification.save();

    // Return success response
    res.status(201).json({ message: 'Notification created successfully', notification: newNotification });
  } catch (error) {
    // Return error response
    res.status(500).json({ error: 'Failed to create notification', details: error.message });
  }
}

// Function to get all notifications
async function getAllNotifications(req, res) {
  try {
    // Retrieve all notifications from the database
    const notifications = await Notification.find();

    // Return the notifications
    res.status(200).json(notifications);
  } catch (error) {
    // Return error response
    res.status(500).json({ error: 'Failed to fetch notifications', details: error.message });
  }
}

// Function to fetch notifications by receiverId
async function getNotificationsByReceiverId(req, res) {
  try {
    const receiverId = req.params.receiverId; // Get the receiverId from the URL parameters

    // Find notifications by receiverId
    const notifications = await Notification.find({ receiverId });

    res.status(200).json(notifications);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch notifications', details: error.message });
  }
}



export { createNotification, getAllNotifications, getNotificationsByReceiverId };

  