import { Chat } from "../models/chat.js";
import { User } from "../models/user.js";



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

    // Check if a chat already exists with the same participants
    const existingChat = await Chat.findOne({
      participants: { $all: participants, $size: participants.length }
    });

    if (existingChat) {
      return res.status(201).json({ message: 'You are already chatting with these participants.', chat: existingChat });
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
  export async function sendMessage(chatId, sender, content) {
    try {
      if (!chatId || !sender || !content) {
        return null;
      }
  
      const chat = await Chat.findById(chatId);
      if (!chat) {
        return null;
      }
  
      const newMessage = { sender, content, timestamp: new Date() };
      chat.messages.push(newMessage);
  
      // Mettre à jour le dernier message
      chat.lastMessage = { content, timestamp: new Date() };
      await chat.save();
  
      return chat;
    } catch (error) {
      console.error(error);
      return null;
    }
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
  export async function getChatsByUserId(req, res) {
    try {
      const userId = req.params.userId;
      console.log(`Fetching chats for user ID: ${userId}`);
  
      const user = await User.findById(userId);
      if (!user) {
        console.log('User not found');
        return res.status(404).json({ error: 'User not found.' });
      }
      console.log('User found:', user);
  
      const chats = await Chat.find({ participants: userId })
        .populate('participants', 'firstName lastName image email companyName');
  
      console.log('Chats found:', chats);
  
      const chatResponses = chats.map(chat => {
        const lastMessage = chat.messages.length > 0 ? chat.messages[chat.messages.length - 1] : null;
        console.log('Last message for chat ID:', chat._id, lastMessage);
  
        return {
          _id: chat._id,
          participants: chat.participants.map(participant => ({
            _id: participant._id,
            firstName: participant.firstName,
            lastName: participant.lastName,
            image: participant.image,
            email: participant.email,
            companyName: participant.companyName,
        
          })),
          lastMessage: lastMessage ? {
            content: lastMessage.content,
            timestamp: lastMessage.timestamp,
            sender: lastMessage.sender
          } : null,
          createdAt: chat.createdAt,
          updatedAt: chat.updatedAt,
        };
      });
  
      console.log('Chat responses structured:', chatResponses);
  
      return res.status(200).json({ chats: chatResponses });
    } catch (error) {
      console.error('Error in getChatsByUserId:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }