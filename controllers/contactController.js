const Message = require('../models/Message');

exports.create = async function (req, res) {
  const data = req.body;
  if (!data || typeof data.name !== 'string' ||
      typeof data.email !== 'string' || typeof data.message !== 'string') {
    return res.status(400).json({
      error: { message: 'Send name, email, and message as text.' }
    });
  }
  const saved = await Message.create({
    name: data.name, email: data.email, message: data.message
  });
  res.status(201).json({ id: saved._id, message: 'Message received' });
};

exports.list = async function (req, res) {
  const messages = await Message.find();
  res.set('Cache-Control', 'no-store');
  res.json(messages);
};
