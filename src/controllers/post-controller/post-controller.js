const { Post } = require('../../models/post-models/post-model');
const Joi = require('joi');
const { User } = require('../../models/user-models/user-model');
const Cloudinary = require('../../utils/cloudinary');
const ReturnResult = require('../../helpers/return-result');
const RedisCache = require('../../utils/redis');

const SUCCESS_MESSAGES = {
	CREATE_POST_SUCCESS: 'Create post successfully',
	UPDATE_POST_SUCCESS: 'Update post successfully',
	DELETE_POST_SUCCESS: 'Delete post successfully',
	GET_POST_SUCCESS: 'Get post successfully',
	GET_ALL_POST_SUCCESS: 'Get all posts successfully',
	LIKE_POST_SUCCESS: 'Like post successfully',
	UNLIKE_POST_SUCCESS: 'Unlike post successfully',
	COMMENT_POST_SUCCESS: 'Comment post successfully',
	DELETE_COMMENT_POST_SUCCESS: 'Delete comment post successfully',
};

const ERROR_MESSAGES = {
	CREATE_POST_FAIL: 'Create post failed',
	UPDATE_POST_FAIL: 'Update post failed',
	DELETE_POST_FAIL: 'Delete post failed',
	GET_POST_FAIL: 'Get post failed',
	GET_ALL_POST_FAIL: 'Get all posts failed',
	LIKE_POST_FAIL: 'Like post failed',
	UNLIKE_POST_FAIL: 'Unlike post failed',
	COMMENT_POST_FAIL: 'Comment post failed',
	DELETE_COMMENT_POST_FAIL: 'Delete comment post failed',
	NOT_FOUND_POST: 'Post not found',
};

class PostController {
	static getAllPosts = async (req, res) => {
		const posts = await Post.find();
		return res.status(200).json(ReturnResult.success(posts, SUCCESS_MESSAGES.GET_ALL_POST_SUCCESS));
	};

	static getPostsByPagination = async (req, res) => {
		const { page, limit } = req.query;

		const options = {
			page: parseInt(page, 10) || 1,
			limit: parseInt(limit, 10) || 10,
			sort: { createdAt: -1 },
			populate: 'user',
		};

		const posts = await Post.find({})
			.limit(options.limit)
			.skip(options.limit * (options.page - 1))
			.sort(options.sort)
			.populate(options.populate)
			.exec();

		const totalItems = await Post.countDocuments();

		return res
			.status(200)
			.json(
				ReturnResult.paginate(
					posts,
					totalItems,
					options.page,
					options.limit,
					SUCCESS_MESSAGES.GET_ALL_POST_SUCCESS
				)
			);
	};

	static getPost = async (req, res) => {
		const { postId } = req.params;

		const post = await Post.findById(postId);

		if (!post) {
			return res.status(404).json(ReturnResult.fail(ERROR_MESSAGES.NOT_FOUND_POST));
		}

		return res.status(200).json(ReturnResult.success(post, SUCCESS_MESSAGES.GET_POST_SUCCESS));
	};

	static getPostByUser = async (req, res) => {
		const { userId } = req.params;

		const posts = await Post.find({ createdBy: userId }).sort({
			createdAt: -1,
		});

		return res.status(200).json(ReturnResult.success(posts, SUCCESS_MESSAGES.GET_ALL_POST_SUCCESS));
	};

	static getPostBySlug = async (req, res) => {
		const { slug } = req.params;

		const post = await Post.findOne({ slug });

		if (!post) {
			return res.status(404).json(ReturnResult.fail(ERROR_MESSAGES.NOT_FOUND_POST));
		}

		return res.status(200).json(ReturnResult.success(post, SUCCESS_MESSAGES.GET_POST_SUCCESS));
	};
}
