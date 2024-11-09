const Blog = require("../models/Blog");
const { errorHandler } = require("../utils");
const { isValidEmail } = require("../utils/validations");
const { isValidObjectId } = require("mongoose");
module.exports.getAllBlogs = async (req, res) => {
    let log = { name: "getAllBlogs", variables: {} };
    req.log.middlewares.push(log);
    try {
        let foundBlogs = await Blog.find({});
        log.variables["foundBlogs"] = foundBlogs;
        if (foundBlogs.length < 1) {
            log.variables["message"] = "200 No blogs found.";
            return res.status(200).send({ success: true, message: "No blogs found.", blogs: foundBlogs });
        }
        log.variables["message"] = "200 Blogs retrieved.";
        return res.status(200).send({ success: true, message: "Blogs retrieved.", blogs: foundBlogs });
    } catch (error) {
        log.variables["message"] = "Passed to error handler.";
        errorHandler(error, req, res);
    }
};
module.exports.getBlogById = async (req, res) => {
    let log = { name: "getBlogById", variables: {} };
    req.log.middlewares.push(log);
    try {
        let { blogId } = req.params;
        if (!isValidObjectId(blogId)) {
            log.variables["message"] = "404 Invalid Object ID.";
            return res.status(404).send({ error: "No blog found." });
        }
        const foundBlog = await Blog.findById(blogId);
        log.variables["foundBlog"] = foundBlog;
        if (!foundBlog) {
            log.variables["message"] = "404 No blog found.";
            return res.status(404).send({ error: "No blog found." });
        }
        log.variables["message"] = "200 Blog retrieved.";
        return res.status(200).send({ success: true, message: "Blog retrieved.", blog: foundBlog });
    } catch (error) {
        log.variables["message"] = "Passed to error handler.";
        errorHandler(error, req, res);
    }
};
module.exports.getOwnBlogs = async (req, res) => {
    let log = { name: "getOwnBlogs", variables: {} };
    req.log.middlewares.push(log);
    try {
        let { _id } = req.user;
        let foundBlogs = await Blog.find({ posterId: _id });
        log.variables["foundBlogs"] = foundBlogs;
        if (foundBlogs.length < 1) {
            log.variables["message"] = "200 No blogs found.";
            return res.status(200).send({ success: true, message: "No blogs found.", blogs: foundBlogs });
        }
        log.variables["message"] = "200 Blogs retrieved.";
        return res.status(200).send({ success: true, message: "Blogs retrieved.", blogs: foundBlogs });
    } catch (error) {
        log.variables["message"] = "Passed to error handler.";
        errorHandler(error, req, res);
    }
};
module.exports.postBlog = async (req, res) => {
    let log = { name: "postBlog", variables: {} };
    req.log.middlewares.push(log);
    try {
        let { title, posterId, posterEmail, content, comments } = req.body;
        let { _id, email } = req.user;
        if (typeof posterId === "undefined" || typeof posterEmail === "undefined") {
            posterId = _id;
            posterEmail = email;
        }
        if (typeof title === "undefined" || typeof posterId === "undefined" || typeof posterEmail === "undefined") {
            log.variables["message"] = "400 Required inputs missing";
            return res.status(400).send({ error: "Required inputs missing" });
        }
        if (typeof title !== "string") {
            log.variables["message"] = "400 Invalid title";
            return res.status(400).send({ error: "Invalid title" });
        }
        if (typeof posterId !== "string" || !isValidObjectId(posterId)) {
            log.variables["message"] = "400 Invalid posterId";
            return res.status(400).send({ error: "Invalid posterId" });
        }
        if (typeof posterEmail !== "string" || !isValidEmail(posterEmail)) {
            log.variables["message"] = "400 Invalid posterEmail";
            return res.status(400).send({ error: "Invalid posterEmail" });
        }
        if (typeof content !== "undefined" && typeof content !== "string") {
            log.variables["message"] = "400 Invalid content";
            return res.status(400).send({ error: "Invalid content" });
        }
        if (typeof comments !== "undefined" && (!Array.isArray(comments) || !comments.every((o) => typeof o.commenterId === "string") || !comments.every((o) => typeof o.comment === "string"))) {
            log.variables["message"] = "400 Invalid comments";
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
        log.variables["savedBlog"] = savedBlog;
        log.variables["message"] = "201 Blog created.";
        res.status(201).send({ success: true, message: "Blog created.", blog: savedBlog });
    } catch (error) {
        log.variables["message"] = "Passed to error handler.";
        errorHandler(error, req, res);
    }
};
module.exports.postComment = async (req, res) => {
    let log = { name: "postComment", variables: {} };
    req.log.middlewares.push(log);
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
            log.variables["message"] = "404 Required inputs missing";
            return res.status(400).send({ error: "Required inputs missing" });
        }
        if (!isValidObjectId(blogId)) {
            log.variables["message"] = "404 Invalid Object ID.";
            return res.status(404).send({ error: "No blog found." });
        }
        if (typeof comment !== "string") {
            log.variables["message"] = "400 Invalid comment";
            return res.status(400).send({ error: "Invalid comment" });
        }
        let foundBlog = await Blog.findById(blogId);
        log.variables["foundBlog"] = foundBlog;
        if (!foundBlog) {
            log.variables["message"] = "404 No blog found.";
            return res.status(404).send({ error: "No blog found." });
        }
        foundBlog.comments.push({ commenterId: _id, commenterEmail: email, comment: comment });
        let savedBlog = await foundBlog.save();
        log.variables["savedBlog"] = savedBlog;
        log.variables["message"] = "201 Comment added.";
        res.status(201).send({ success: true, message: "Comment added.", blog: savedBlog });
    } catch (error) {
        log.variables["message"] = "Passed to error handler.";
        errorHandler(error, req, res);
    }
};
module.exports.updateComment = async (req, res) => {
    let log = { name: "postComment", variables: {} };
    req.log.middlewares.push(log);
    try {
        let { comment } = req.body;
        let { commentId, blogId } = req.params;
        let { _id } = req.user;
        if (typeof comment === "undefined" || typeof blogId === "undefined" || typeof commentId === "undefined") {
            log.variables["message"] = "404 Required inputs missing";
            return res.status(400).send({ error: "Required inputs missing" });
        }
        if (!isValidObjectId(commentId)) {
            log.variables["message"] = "404 Invalid Comment Object ID.";
            return res.status(404).send({ error: "No comment found." });
        }
        if (!isValidObjectId(blogId)) {
            log.variables["message"] = "404 Invalid Blog Object ID.";
            return res.status(404).send({ error: "No blog found." });
        }
        if (typeof comment !== "string") {
            log.variables["message"] = "400 Invalid comment";
            return res.status(400).send({ error: "Invalid comment" });
        }
        let foundBlog = await Blog.findById(blogId);
        log.variables["foundBlog"] = foundBlog;
        if (!foundBlog) {
            log.variables["message"] = "404 No blog found.";
            return res.status(404).send({ error: "No blog found." });
        }
        let foundCommentIndex = foundBlog.comments.findIndex((comment) => comment._id.toString() === commentId);
        log.variables["foundCommentIndex"] = foundCommentIndex;
        if (foundCommentIndex === -1) {
            log.variables["message"] = "404 Comment not found.";
            return res.status(404).send({ error: "Comment not found." });
        }
        if (foundBlog.comments[foundCommentIndex].commenterId !== _id) {
            log.variables["message"] = "403 Action Forbidden.";
            return res.status(403).send({ error: "Action Forbidden" });
        }
        foundBlog.comments[foundCommentIndex].comment = comment;
        let savedBlog = await foundBlog.save();
        log.variables["savedBlog"] = savedBlog;
        log.variables["message"] = "201 Comment updated.";
        res.status(200).send({ success: true, message: "Comment updated.", blog: savedBlog });
    } catch (error) {
        log.variables["message"] = "Passed to error handler.";
        errorHandler(error, req, res);
    }
};
module.exports.updateBlog = async (req, res) => {
    let log = { name: "updateBlog", variables: {} };
    req.log.middlewares.push(log);
    try {
        let { blogId } = req.params;
        let { _id } = req.user;
        let { title, content, comments } = req.body;
        if (!isValidObjectId(blogId)) {
            log.variables["message"] = "404 Invalid Object ID.";
            return res.status(404).send({ error: "No blog found." });
        }
        let foundBlog = await Blog.findById(blogId);
        log.variables["foundBlog"] = foundBlog;
        if (!foundBlog) {
            log.variables["message"] = "404 No blog found.";
            return res.status(404).send({ error: "No blog found." });
        }
        if (typeof title !== "string") {
            log.variables["message"] = "400 Invalid title";
            return res.status(400).send({ error: "Invalid title" });
        }
        if (typeof content !== "undefined" && typeof content !== "string") {
            log.variables["message"] = "400 Invalid content";
            return res.status(400).send({ error: "Invalid content" });
        }
        if (typeof comments !== "undefined" && (!Array.isArray(comments) || !comments.every((o) => typeof o.commenterId === "string") || !comments.every((o) => typeof o.comment === "string"))) {
            log.variables["message"] = "400 Invalid comments";
            return res.status(400).send({ error: "Invalid comments" });
        }
        if (foundBlog.posterId !== _id) {
            log.variables["message"] = "403 User is not this blog's poster.";
            return res.status(400).send({ error: "You do not have permission to access this resource." });
        }
        foundBlog.title = title || foundBlog.title;
        foundBlog.content = content || foundBlog.content;
        foundBlog.comments = comments || foundBlog.comments;
        let updatedBlog = await foundBlog.save();
        log.variables["updatedBlog"] = updatedBlog;
        log.variables["message"] = "200 Blog updated.";
        res.status(200).send({ success: true, message: "Blog updated successfully", blog: updatedBlog });
    } catch (error) {
        log.variables["message"] = "Passed to error handler.";
        errorHandler(error, req, res);
    }
};
module.exports.deleteBlog = async (req, res) => {
    let log = { name: "deleteBlog", variables: {} };
    req.log.middlewares.push(log);
    try {
        let { _id, isAdmin } = req.user;
        let { blogId } = req.params;
        if (!isValidObjectId(blogId)) {
            log.variables["message"] = "404 Invalid Object ID.";
            return res.status(404).send({ error: "No blog found." });
        }
        let foundBlog = await Blog.findById(blogId);
        log.variables["foundBlog"] = foundBlog;
        if (!foundBlog) {
            log.variables["message"] = "404 No blog found.";
            return res.status(404).send({ error: "No blog found." });
        }
        if (!isAdmin && foundBlog.posterId !== _id) {
            log.variables["message"] = "403 Action Forbidden.";
            return res.status(403).send({ error: "Action Forbidden" });
        }
        let deletedBlog = await Blog.findByIdAndDelete(blogId);
        log.variables["deletedBlog"] = deletedBlog;
        log.variables["message"] = "200 Movie deleted.";
        res.status(200).send({ success: true, message: "Blog deleted successfully", blog: deletedBlog });
    } catch (error) {
        log.variables["message"] = "Passed to error handler.";
        errorHandler(error, req, res);
    }
};
module.exports.deleteComment = async (req, res) => {
    let log = { name: "deleteComment", variables: {} };
    req.log.middlewares.push(log);
    try {
        let { _id, isAdmin } = req.user;
        let { blogId, commentId } = req.params;
        if (!isValidObjectId(blogId)) {
            log.variables["message"] = "404 Invalid Blog Object ID.";
            return res.status(404).send({ error: "No blog found." });
        }
        if (!isValidObjectId(commentId)) {
            log.variables["message"] = "404 Invalid Comment Object ID.";
            return res.status(404).send({ error: "Comment not found." });
        }
        let foundBlog = await Blog.findById(blogId);
        log.variables["foundBlog"] = foundBlog;
        if (!foundBlog) {
            log.variables["message"] = "404 No blog found.";
            return res.status(404).send({ error: "No blog found." });
        }
        let foundCommentIndex = foundBlog.comments.findIndex((comment) => comment._id.toString() === commentId);
        log.variables["foundCommentIndex"] = foundCommentIndex;
        if (foundCommentIndex === -1) {
            log.variables["message"] = "404 Comment not found.";
            return res.status(404).send({ error: "Comment not found." });
        }
        if (!isAdmin && foundBlog.comments[foundCommentIndex].commenterId !== _id) {
            log.variables["message"] = "403 Action Forbidden.";
            return res.status(403).send({ error: "Action Forbidden" });
        }
        let removedComments = foundBlog.comments.splice(foundCommentIndex, 1);
        log.variables["removedComments"] = removedComments;
        let updatedBlog = await foundBlog.save();
        log.variables["updatedBlog"] = updatedBlog;
        log.variables["message"] = "200 Comment deleted.";
        res.status(200).send({ success: true, message: "Comment deleted successfully", blog: updatedBlog });
    } catch (error) {
        log.variables["message"] = "Passed to error handler.";
        errorHandler(error, req, res);
    }
};
