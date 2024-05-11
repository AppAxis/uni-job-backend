import { Chat } from "../models/chat.js";
import { User } from "../models/user.js";

// Example function: Create a new chat
export async function createChat(req, res) {
    try {
      const { participants } = req.body;
  
      // Check if participants array exists and has at least two participants
      if (!participants || participants.length < 2) {
        return res.status(400).json({ error: 'At least two participants are required to create a chat.' });
      }
  
      // Check if all participants exist in the database
      const existingParticipants = await User.find({ _id: { $in: participants } });
      if (!existingParticipants || existingParticipants.length !== participants.length) {
        return res.status(404).json({ error: 'One or more participants do not exist.' });
      }
  
      // Create the chat in the database
      const newChat = await Chat.create({ participants });
  
      return res.status(201).json({ message: 'Chat created successfully.', chat: newChat });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  // Example function: Send a message
export async function sendMessage(chatId, sender, content ) {
    try {
  
      // Check if chatId, sender, and content are provided
      if (!chatId || !sender || !content) {
        return null
      }
  
      // Find the chat by ID
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return null
      }
  
      // Add the message to the chat
      chat.messages.push({ sender, content });
      await chat.save();
  
      return chat
    } catch (error) {
      console.error(error);
return null;    }
  }
  
  // Example function: Get messages with participants
export async function getMessagesWithParticipants(req, res) {
    try {
 // Parse participants as an array
 const participants = JSON.parse(req.query.participants);  
      // Check if participants array exists and has at least two participants
      if (!participants || participants.length < 2) {
        return res.status(400).json({ error: 'At least two participants are required.' });
      }
  
      // Find chats that involve the provided participants
      const chats = await Chat.find({ participants: { $all: participants } });
     /* .populate({
          path: 'messages.sender',
          select: 'firstName lastName image', 
      });*/
  
      // Check if any chats were found
      if (!chats || chats.length === 0) {
        return res.status(404).json({ error: 'No chats found with the provided participants.' });
      }
  
      // Get messages for each chat
      const messages = [];
      for (const chat of chats) {
        messages.push({  messages: chat.messages });
      }
  
      return res.status(200).json({ messages});
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
  