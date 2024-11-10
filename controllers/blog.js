const Blog = require("../models/Blog");
const { isValidEmail } = require("../utils/validations");
const { isValidObjectId } = require("mongoose");
module.exports.getAllBlogs = async (req, res, next) => {
    try {
        let foundBlogs = await Blog.find({});
        if (foundBlogs.length < 1) {
            return res.status(200).send({ success: true, message: "No blogs found.", blogs: foundBlogs });
        }
        return res.status(200).send({ success: true, message: "Blogs retrieved.", blogs: foundBlogs });
    } catch (error) {
        next(error);
    }
};
module.exports.getBlogById = async (req, res, next) => {
    try {
        let { blogId } = req.params;
        if (!isValidObjectId(blogId)) {
            return res.status(404).send({ error: "No blog found." });
        }
        const foundBlog = await Blog.findById(blogId);
        if (!foundBlog) {
            return res.status(404).send({ error: "No blog found." });
        }
        return res.status(200).send({ success: true, message: "Blog retrieved.", blog: foundBlog });
    } catch (error) {
        next(error);
    }
};
module.exports.getOwnBlogs = async (req, res, next) => {
    try {
        let { _id } = req.user;
        let foundBlogs = await Blog.find({ posterId: _id });
        if (foundBlogs.length < 1) {
            return res.status(200).send({ success: true, message: "No blogs found.", blogs: foundBlogs });
        }
        return res.status(200).send({ success: true, message: "Blogs retrieved.", blogs: foundBlogs });
    } catch (error) {
        next(error);
    }
};
module.exports.postBlog = async (req, res, next) => {
    try {
        let { title, posterId, posterEmail, content, comments } = req.body;
        let { _id, email } = req.user;
        if (typeof posterId === "undefined" || typeof posterEmail === "undefined") {
            posterId = _id;
            posterEmail = email;
        }
        if (typeof title === "undefined" || typeof posterId === "undefined" || typeof posterEmail === "undefined") {
            return res.status(400).send({ error: "Required inputs missing" });
        }
        if (typeof title !== "string") {
            return res.status(400).send({ error: "Invalid title" });
        }
        if (typeof posterId !== "string" || !isValidObjectId(posterId)) {
            return res.status(400).send({ error: "Invalid posterId" });
        }
        if (typeof posterEmail !== "string" || !isValidEmail(posterEmail)) {
            return res.status(400).send({ error: "Invalid posterEmail" });
        }
        if (typeof content !== "undefined" && typeof content !== "string") {
            return res.status(400).send({ error: "Invalid content" });
        }
        if (typeof comments !== "undefined" && (!Array.isArray(comments) || !comments.every((o) => typeof o.commenterId === "string") || !comments.every((o) => typeof o.comment === "string"))) {
            return res.status(400).send({ error: "Invalid comments" });
        }
        let newBlog = new Blog({
            title: title,
            posterId: posterId,
            posterEmail: posterEmail,
            content: content,
            comments: comments,
        });
        let savedBlog = await newBlog.save();
        res.status(201).send({ success: true, message: "Blog created.", blog: savedBlog });
    } catch (error) {
        next(error);
    }
};
module.exports.postComment = async (req, res, next) => {
    try {
        let { comment } = req.body;
        let { blogId } = req.params;
        let _id;
        let email;
        if (req.hasOwnProperty("user")) {
            _id = req.user._id;
            email = req.user.email;
        }
        if (typeof comment === "undefined" || typeof blogId === "undefined") {
            return res.status(400).send({ error: "Required inputs missing" });
        }
        if (!isValidObjectId(blogId)) {
            return res.status(404).send({ error: "No blog found." });
        }
        if (typeof comment !== "string") {
            return res.status(400).send({ error: "Invalid comment" });
        }
        let foundBlog = await Blog.findById(blogId);
        if (!foundBlog) {
            return res.status(404).send({ error: "No blog found." });
        }
        foundBlog.comments.push({ commenterId: _id, commenterEmail: email, comment: comment });
        let savedBlog = await foundBlog.save();
        res.status(201).send({ success: true, message: "Comment added.", blog: savedBlog });
    } catch (error) {
        next(error);
    }
};
module.exports.updateComment = async (req, res, next) => {
    try {
        let { comment } = req.body;
        let { commentId, blogId } = req.params;
        let { _id } = req.user;
        if (typeof comment === "undefined" || typeof blogId === "undefined" || typeof commentId === "undefined") {
            return res.status(400).send({ error: "Required inputs missing" });
        }
        if (!isValidObjectId(commentId)) {
            return res.status(404).send({ error: "No comment found." });
        }
        if (!isValidObjectId(blogId)) {
            return res.status(404).send({ error: "No blog found." });
        }
        if (typeof comment !== "string") {
            return res.status(400).send({ error: "Invalid comment" });
        }
        let foundBlog = await Blog.findById(blogId);
        if (!foundBlog) {
            return res.status(404).send({ error: "No blog found." });
        }
        let foundCommentIndex = foundBlog.comments.findIndex((comment) => comment._id.toString() === commentId);
        if (foundCommentIndex === -1) {
            return res.status(404).send({ error: "Comment not found." });
        }
        if (foundBlog.comments[foundCommentIndex].commenterId !== _id) {
            return res.status(403).send({ error: "Action Forbidden" });
        }
        foundBlog.comments[foundCommentIndex].comment = comment;
        let savedBlog = await foundBlog.save();
        res.status(200).send({ success: true, message: "Comment updated.", blog: savedBlog });
    } catch (error) {
        next(error);
    }
};
module.exports.updateBlog = async (req, res, next) => {
    try {
        let { blogId } = req.params;
        let { _id } = req.user;
        let { title, content, comments } = req.body;
        if (!isValidObjectId(blogId)) {
            return res.status(404).send({ error: "No blog found." });
        }
        let foundBlog = await Blog.findById(blogId);
        if (!foundBlog) {
            return res.status(404).send({ error: "No blog found." });
        }
        if (typeof title !== "string") {
            return res.status(400).send({ error: "Invalid title" });
        }
        if (typeof content !== "undefined" && typeof content !== "string") {
            return res.status(400).send({ error: "Invalid content" });
        }
        if (typeof comments !== "undefined" && (!Array.isArray(comments) || !comments.every((o) => typeof o.commenterId === "string") || !comments.every((o) => typeof o.comment === "string"))) {
            return res.status(400).send({ error: "Invalid comments" });
        }
        if (foundBlog.posterId !== _id) {
            return res.status(400).send({ error: "You do not have permission to access this resource." });
        }
        foundBlog.title = title || foundBlog.title;
        foundBlog.content = content || foundBlog.content;
        foundBlog.comments = comments || foundBlog.comments;
        let updatedBlog = await foundBlog.save();
        res.status(200).send({ success: true, message: "Blog updated successfully", blog: updatedBlog });
    } catch (error) {
        next(error);
    }
};
module.exports.deleteBlog = async (req, res, next) => {
    try {
        let { _id, isAdmin } = req.user;
        let { blogId } = req.params;
        if (!isValidObjectId(blogId)) {
            return res.status(404).send({ error: "No blog found." });
        }
        let foundBlog = await Blog.findById(blogId);
        if (!foundBlog) {
            return res.status(404).send({ error: "No blog found." });
        }
        if (!isAdmin && foundBlog.posterId !== _id) {
            return res.status(403).send({ error: "Action Forbidden" });
        }
        let deletedBlog = await Blog.findByIdAndDelete(blogId);
        res.status(200).send({ success: true, message: "Blog deleted successfully", blog: deletedBlog });
    } catch (error) {
        next(error);
    }
};
module.exports.deleteComment = async (req, res, next) => {
    try {
        let { _id, isAdmin } = req.user;
        let { blogId, commentId } = req.params;
        if (!isValidObjectId(blogId)) {
            return res.status(404).send({ error: "No blog found." });
        }
        if (!isValidObjectId(commentId)) {
            return res.status(404).send({ error: "Comment not found." });
        }
        let foundBlog = await Blog.findById(blogId);
        if (!foundBlog) {
            return res.status(404).send({ error: "No blog found." });
        }
        let foundCommentIndex = foundBlog.comments.findIndex((comment) => comment._id.toString() === commentId);
        if (foundCommentIndex === -1) {
            return res.status(404).send({ error: "Comment not found." });
        }
        if (!isAdmin && foundBlog.comments[foundCommentIndex].commenterId !== _id) {
            return res.status(403).send({ error: "Action Forbidden" });
        }
        let removedComments = foundBlog.comments.splice(foundCommentIndex, 1);
        let updatedBlog = await foundBlog.save();
        res.status(200).send({ success: true, message: "Comment deleted successfully", blog: updatedBlog });
    } catch (error) {
        next(error);
    }
};
