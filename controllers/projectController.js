const Project = require('../models/Project');

exports.list = async function (req, res) {
  const projects = await Project.find().populate('user', 'username');
  res.json(projects);
};

exports.detail = async function (req, res, next) {
  try {
    const project = await Project.findById(req.params.id).populate('user', 'username');
    if (!project) {
      res.status(404);
      throw new Error('Project not found');
    }
    res.json(project);
  } catch (error) {
    next(error);
  }
};

exports.create = async function (req, res) {
  const data = req.body;
  if (!data || typeof data.title !== 'string' ||
      typeof data.description !== 'string') {
    return res.status(400).json({
      error: { message: 'Send a title and description as text.' }
    });
  }
  const project = await Project.create({
    title: data.title, description: data.description,
    imageUrl: data.imageUrl, repoUrl: data.repoUrl, liveUrl: data.liveUrl,
    user: req.user._id.toString()
  });
  res.status(201).json(project);
};

exports.update = async function (req, res) {
  const data = req.body;
  if (!data || typeof data.title !== 'string' ||
      typeof data.description !== 'string') {
    return res.status(400).json({
      error: { message: 'Send a title and description as text.' }
    });
  }
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ error: { message: 'Project not found' } });
  }
  project.title = data.title;
  project.description = data.description;
  project.imageUrl = data.imageUrl;
  project.repoUrl = data.repoUrl;
  project.liveUrl = data.liveUrl;
  await project.save();
  res.json(project);
};

exports.remove = async function (req, res) {
  const project = await Project.findById(req.params.id);
  if (!project) {
    return res.status(404).json({ error: { message: 'Project not found' } });
  }
  await project.deleteOne();
  res.status(204).end();
};
