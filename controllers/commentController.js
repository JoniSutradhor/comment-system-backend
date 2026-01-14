import commentService from '../services/commentService.js';

export const getComments = async (req, res) => {
  try {
    const { pageId = 'main', page = 1, limit = 10, sortBy = 'newest' } = req.query;
    
    const result = await commentService.getComments(
      pageId,
      parseInt(page),
      parseInt(limit),
      sortBy
    );

    res.json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const createComment = async (req, res) => {
  try {
    const { content, pageId = 'main' } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const comment = await commentService.createComment(
      req.user._id,
      content,
      pageId
    );

    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateComment = async (req, res) => {
  try {
    const { content } = req.body;
    const { id } = req.params;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Content is required' });
    }

    const comment = await commentService.updateComment(
      id,
      req.user._id.toString(),
      content
    );

    res.json(comment);
  } catch (error) {
    res.status(error.message.includes('authorized') ? 403 : 400)
       .json({ message: error.message });
  }
};

export const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await commentService.deleteComment(
      id,
      req.user._id.toString()
    );

    res.json(result);
  } catch (error) {
    res.status(error.message.includes('authorized') ? 403 : 400)
       .json({ message: error.message });
  }
};

export const likeComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await commentService.toggleLike(
      id,
      req.user._id
    );

    res.json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const dislikeComment = async (req, res) => {
  try {
    const { id } = req.params;

    const comment = await commentService.toggleDislike(
      id,
      req.user._id
    );

    res.json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const addReply = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Reply content is required' });
    }

    const comment = await commentService.addReply(
      id,
      req.user._id,
      content
    );

    res.status(201).json(comment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};