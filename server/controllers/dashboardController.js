const Document = require('../models/Document');
const Chat = require('../models/Chat');

// @route   GET /api/dashboard/stats
// @desc    Get dashboard statistics for the logged-in user
// @access  Private
exports.getStats = async (req, res) => {
  try {
    const userId = req.user.id;

    // 1. Total uploaded documents
    const totalDocuments = await Document.countDocuments({ userId });

    // 2. Total questions asked
    const totalQuestions = await Chat.countDocuments({ userId });

    // 3. Recent uploaded document
    const recentDoc = await Document.findOne({ userId })
                                    .sort({ createdAt: -1 })
                                    .select('fileName'); // only fetch what's needed

    res.status(200).json({
      totalDocuments,
      totalQuestions,
      recentDocument: recentDoc ? recentDoc.fileName : 'None'
    });
  } catch (error) {
    console.error('Dashboard Stats Error:', error.message);
    res.status(500).json({ message: 'Server error fetching statistics' });
  }
};
