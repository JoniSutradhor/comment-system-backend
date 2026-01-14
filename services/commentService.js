import Comment from '../models/Comment.js';

class CommentService {
  async getComments(pageId, page, limit, sortBy) {
    const skip = (page - 1) * limit;
    
    let sortOption = { createdAt: -1 };
    
    if (sortBy === 'mostLiked') {
      sortOption = { likesCount: -1, createdAt: -1 };
    } else if (sortBy === 'mostDisliked') {
      sortOption = { dislikesCount: -1, createdAt: -1 };
    }

    const comments = await Comment.aggregate([
      { $match: { pageId } },
      {
        $addFields: {
          likesCount: { $size: '$likes' },
          dislikesCount: { $size: '$dislikes' }
        }
      },
      { $sort: sortOption },
      { $skip: skip },
      { $limit: limit }
    ]);

    await Comment.populate(comments, [
      { path: 'user', select: 'username' },
      { path: 'replies.user', select: 'username' }
    ]);

    const total = await Comment.countDocuments({ pageId });

    return {
      comments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    };
  }

  async createComment(userId, content, pageId) {
    const comment = await Comment.create({
      user: userId,
      content,
      pageId
    });

    return await comment.populate('user', 'username');
  }

  async updateComment(commentId, userId, content) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.user.toString() !== userId) {
      throw new Error('Not authorized to update this comment');
    }

    comment.content = content;
    await comment.save();

    return await comment.populate('user', 'username');
  }

  async deleteComment(commentId, userId) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new Error('Comment not found');
    }

    if (comment.user.toString() !== userId) {
      throw new Error('Not authorized to delete this comment');
    }

    await comment.deleteOne();
    return { message: 'Comment deleted successfully' };
  }

  async toggleLike(commentId, userId) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new Error('Comment not found');
    }

    const likeIndex = comment.likes.indexOf(userId);
    const dislikeIndex = comment.dislikes.indexOf(userId);

    if (dislikeIndex > -1) {
      comment.dislikes.splice(dislikeIndex, 1);
    }

    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    } else {
      comment.likes.push(userId);
    }

    await comment.save();
    return await comment.populate('user', 'username');
  }

  async toggleDislike(commentId, userId) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new Error('Comment not found');
    }

    const likeIndex = comment.likes.indexOf(userId);
    const dislikeIndex = comment.dislikes.indexOf(userId);

    if (likeIndex > -1) {
      comment.likes.splice(likeIndex, 1);
    }

    if (dislikeIndex > -1) {
      comment.dislikes.splice(dislikeIndex, 1);
    } else {
      comment.dislikes.push(userId);
    }

    await comment.save();
    return await comment.populate('user', 'username');
  }

  async addReply(commentId, userId, content) {
    const comment = await Comment.findById(commentId);

    if (!comment) {
      throw new Error('Comment not found');
    }

    comment.replies.push({
      user: userId,
      content
    });

    await comment.save();
    return await comment.populate([
      { path: 'user', select: 'username' },
      { path: 'replies.user', select: 'username' }
    ]);
  }
}

export default new CommentService();