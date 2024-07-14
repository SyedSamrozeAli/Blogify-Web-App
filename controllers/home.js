import userModel from "../model/user.js";
import blogModel from "../model/blogs.js";
import commentsModel from "../model/comments.js";
import url from "url";


async function handleViewBlog(req, res) {

    const id = req.params.blogId;

    try {
        const Blog = await blogModel.findById(id).populate({
            path: 'comments',
            select: 'content madeBy',
            populate: {
                path: 'madeBy',
                select: 'username',
            }
        }).populate({
            path: 'authorID',
            select: 'username'
        });

        res.status(200).render("./home/view-blog.ejs", { blog: Blog });

    } catch (error) {

        res.send(`<h2>${error}<h2/>`);
    }

}

async function handleSaveComments(req, res) {

    const userId = req.user._id;
    const user = await userModel.findById(userId);
    const commentContent = req.body.comments;
    const blogID = req.params.blogId;
    const blog = await blogModel.findById(blogID);

    try {

        const newComment = await commentsModel.create({
            content: commentContent,
            madeBy: userId,
            blogId: blogID,
        });

        user.myComments.push(newComment._id);
        blog.comments.push(newComment._id);

        user.save();
        blog.save();

        res.redirect(`/home/view-blog/${blogID}`);

    } catch (error) {
        res.send(`<h2>${error}</h2>`);
    }

}

async function handleViewAllBlogs(req, res) {
    const userId = req.user._id;

    try {
        const user = await userModel.findById(userId).select('username profileImageURL followers following');
        console.log(user);

        const blogs = await blogModel.find().populate({
            path: 'comments',
            select: 'content madeBy',
            populate: {
                path: 'madeBy',
                select: 'username'
            }
        }).populate({
            path: 'authorID',
            select: 'username'
        });

        if (!blogs || blogs.length == 0) {
            res.render("./home/all-blogs.ejs", {
                noPostMsg: "Currently no posts available to show",
                cuser: user,
            });
        }

        res.status(200).render("./home/all-blogs.ejs", { cuser: user, allBlogs: blogs });

    } catch (error) {
        res.status(500).send(`<h3>Error in finding all Blogs: ${error}</h3>`)
    }
}

async function handleMyBlogs(req, res) {
    const userId = req.user._id;

    try {
        const user = await userModel.findById(userId);

        const blogsId = user.blogs;

        if (!blogsId || blogsId.length === 0) {
            res.render("./home/my-blogs.ejs", {
                noUserPostMsg: "Currently no posts available",
                cuser: user,
            });
        } else {
            // Use Promise.all to handle asynchronous operations
            const currentUserBlogs = await Promise.all(
                blogsId.map(async (blog) => {
                    return await blogModel.findById(blog);
                })
            );

            res.status(200).render("./home/my-blogs.ejs", { cuser: user, myBlogs: currentUserBlogs });

        }

    } catch (error) {
        res.status(500).send(`<h3>Error in finding Blogs: ${error}</h3>`);
    }

}

async function handleMyComments(req, res) {
    const userId = req.user._id;

    try {

        const user = await userModel.findById(userId).select('username profileImageURL followers following').populate({
            path: 'myComments',
            select: 'content blogId',
            populate: {
                path: 'blogId',
                select: 'title _id',
            }
        });

        res.status(200).render("./home/my-comments.ejs", { cuser: user });

    } catch (error) {
        res.status(500).send(`<h3>Error in finding User or comments: ${error}</h3>`);
    }
}

async function handleViewSearchPage(req, res) {
    const userId = req.user._id;
    try {
        const user = await userModel.findById(userId).select('username profileImageURL followers following')
        res.status(200).render("./home/search.ejs", { cuser: user });
    } catch (error) {
        res.status(500).send(`<h3>Error in finding User: ${error}</h3>`);
    }
}

async function handleSearchBlogs(req, res) {
    const userId = req.user._id;
    const searchValue = req.body.search;

    if (searchValue) {

        try {
            const user = await userModel.findById(userId).select('username profileImageURL followers following');
            const regex = new RegExp(searchValue, 'i'); // 'i' for case insensitive
            const users = await userModel.find({
                $or: [
                    { username: regex },
                    { fullName: regex }
                ]
            });

            const blogs = await blogModel.find({
                $or: [
                    { title: regex },
                    { content: regex }
                ]
            });

            const searchResult = {
                users: users,
                blogs: blogs
            }

            if (searchResult)
                res.status(200).render("./home/search.ejs", { cuser: user, searchResults: searchResult, searchValue: searchValue });
            else
                res.status(400).render("./home/search.ejs", { cuser: user, searchValue: searchValue, searchResults: { users: [], blogs: [] } });

        } catch (error) {
            console.log(`<h3>${error}</h3>`);
        }
    }
}

async function handleViewProfile(req, res) {
    const userId = req.user._id;
    const profileId = req.params.profileId;

    const query = url.parse(req.url, true).query;
    const success = query.success === 'true'; // Convert query param to boolean

    let followSuccess = false;
    if (success != undefined)
        followSuccess = success;

    try {
        const user = await userModel.findById(userId).select('username profileImageURL following followers');
        const profileUser = await userModel.findById(profileId);

        if (user.following.includes(profileId)) {
            followSuccess = true;
        };

        const blogsId = profileUser.blogs;

        if (!blogsId || blogsId.length === 0) {
            res.render("./home/view-profile.ejs", {
                noUserPostMsg: "Currently no posts available",
                profileUser: profileUser,
                cuser: user,
            });
        } else {
            // Use Promise.all to handle asynchronous operations
            const profileUserBlogs = await Promise.all(
                blogsId.map(async (blog) => {
                    return await blogModel.findById(blog);
                })
            );


            res.status(200).render("./home/view-profile.ejs", { cuser: user, profileBlogs: profileUserBlogs, profileUser: profileUser, followSuccess: followSuccess });

        }
    } catch (error) {
        res.status(500).send(`<h3>${error}</h3>`);
    }
}

async function handleFollowProfie(req, res) {
    const userId = req.user._id;
    const profileId = req.params.profileId;

    try {

        const user = await userModel.findByIdAndUpdate(userId,
            { $addToSet: { following: profileId } },
            { new: true });

        const profileUser = await userModel.findByIdAndUpdate(profileId,
            { $addToSet: { followers: userId } },
            { new: true });
        res.status(200).redirect(`/home/${user.username}/view-profile/${profileUser._id}?success=true`);
    } catch (error) {
        res.status(500).send(`<h3>${error}</h3>`);
    }
}

async function handleUnfollowProfie(req, res) {
    const userId = req.user._id;
    const profileId = req.params.profileId;

    try {
        const user = await userModel.findByIdAndUpdate(userId, {
            $pull: { following: profileId }
        });

        const profileUser = await userModel.findByIdAndUpdate(profileId, {
            $pull: { followers: userId }
        });


        res.status(200).redirect(`/home/${user.username}/view-profile/${profileUser._id}?success=false`);
    } catch (error) {
        res.status(500).send(`<h3>${error}</h3>`);
    }
}
export { handleViewBlog, handleSaveComments, handleViewAllBlogs, handleMyBlogs, handleMyComments, handleViewSearchPage, handleSearchBlogs, handleViewProfile, handleFollowProfie, handleUnfollowProfie };