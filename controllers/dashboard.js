import userModel from "../model/user.js";
import blogModel from "../model/blogs.js";
import url from "url";
import mongoose from "mongoose";

async function handleOpenDashboard(req, res) {
  const id = req.user._id;
  const user = await userModel.findOne({ _id: id });
  const queryMsg = url.parse(req.url, true).query.msg;

  if (!user) return res.json({ msg: "User not found" });

  if (queryMsg == "postSuccess") {
    res.status(201).render("./dashboard/create-post.ejs", {
      sucessMsg: "Post Created Sucessfully",
      cuser: user,
    });
  } else if (queryMsg == "titleError") {
    res.status(400).render("./dashboard/create-post.ejs", {
      duplicateErrMsg: "Title already in used",
      cuser: user,
    });
  } else if (queryMsg == "contentError") {
    res.status(400).render("./dashboard/create-post.ejs", {
      duplicateErrMsg: "Content is copy pasted",
      cuser: user,
    });
  } else res.render("./dashboard/create-post.ejs", { cuser: user });
}

async function handleCreatePost(req, res) {
  const id = req.user._id;
  const { title, content } = req.body;
  const user = await userModel.findById(id);

  try {
    const newBlog = await blogModel.create({
      title: title,
      content: content,
      authorID: id,
    });

    user.blogs.push(newBlog._id);

    // console.log(newBlog);
    // console.log(user);

    await user.save();

    res.redirect(`/dashboard/${user.username}?msg=postSuccess`);
  } catch (error) {
    if (error.code == 11000) {
      if (error.keyPattern.title) {
        // checking duplicate title
        res.status(400).redirect(`/dashboard/${user.username}?msg=titleError`);
      } else if (error.keyPattern.content) {
        //checking duplicate content
        res
          .status(400)
          .redirect(`/dashboard/${user.username}?msg=contentError`);
      }
    }
  }
}

async function handleViewPost(req, res) {
  try {
    const id = req.user._id;
    const user = await userModel.findById(id);
    const blogsId = user.blogs;

    if (!blogsId || blogsId.length === 0) {
      res.render("./dashboard/view-post.ejs", {
        noPostMsg: "Currently no posts available",
        cuser: user,
      });
    } else {
      // Use Promise.all to handle asynchronous operations
      const currentUserBlogs = await Promise.all(
        blogsId.map(async (blog) => {
          return await blogModel.findById(blog);
        })
      );

      // console.log("From View " + currentUserBlogs);

      res.render("./dashboard/view-post.ejs", { blogs: currentUserBlogs, cuser: user });
    }
  } catch (err) {
    console.error("Error in handleViewPost:", err);
    res.status(500).send("Server Error");
  }
}

async function renderToCreatePost(req, res) {
  res.render("./dashboard/create-post.ejs", { cuser: req.user });
}

async function renderToDeletePost(req, res) {
  try {
    const id = req.user._id;
    const user = await userModel.findById(id);
    const blogsId = user.blogs;

    if (!blogsId || blogsId.length === 0) {
      res.render("./dashboard/delete-post.ejs", {
        noPostMsg: "Currently no posts available",
        cuser: user,
      });
    } else {
      // Use Promise.all to handle asynchronous operations
      const currentUserBlogs = await Promise.all(
        blogsId.map(async (blog) => {
          return await blogModel.findById(blog);
        })
      );

      //if we got a sucess query Url means we have deleted a post
      const queryMsg = url.parse(req.url, true).query;
      if (queryMsg.sucess)
        res.render("./dashboard/delete-post.ejs", {
          blogs: currentUserBlogs,
          cuser: user,
          msg: "Blogs Deleted Sucessfully",
        });

      res.render("./dashboard/delete-post.ejs", { blogs: currentUserBlogs, cuser: user });
    }
  } catch (err) {
    console.error("Error in handleViewPost:", err);
    res.status(500).send("Server Error");
  }
}

async function handleDeletePost(req, res) {
  try {
    const id = req.user._id;
    const user = await userModel.findById(id);
    let myoptions = req.body.options;

    // Ensure options is an array
    let options = Array.isArray(myoptions) ? myoptions : [myoptions];

    // Delete the blogs with the provided IDs
    for (const opt of options) {
      let newId = new mongoose.Types.ObjectId(opt);
      await blogModel.findByIdAndDelete({
        _id: newId,
      });
    }

    //Deleteing Blogs from User Document
    await userModel.updateOne(
      { _id: user._id },
      {
        $pull: {
          blogs: {
            $in: options.map((id) => new mongoose.Types.ObjectId(id)),
          },
        },
      }
    );
    console.log("Blogs removed successfully");
    res.redirect(`/dashboard/delete-post/${user.username}?sucess=true`);
  } catch (err) {
    console.error("Error deleting posts:", err);

    // Ensure only one response is sent
    if (!res.headersSent) {
      res.status(500).send("<h2>Server Error</h2>");
    }
  }
}

async function renderToUpdatePost(req, res) {
  try {
    const id = req.user._id;
    const user = await userModel.findById(id);
    const blogsId = user.blogs;

    if (!blogsId || blogsId.length === 0) {
      res.render("./dashboard/update-post.ejs", {
        noPostMsg: "Currently no posts available",
        cuser: user,
      });
    } else {
      // Use Promise.all to handle asynchronous operations
      const currentUserBlogs = await Promise.all(
        blogsId.map(async (blog) => {
          return await blogModel.findById(blog);
        })
      );

      //if we got a sucess query Url means we have updated a post
      const queryMsg = url.parse(req.url, true).query;
      if (queryMsg.sucess)
        res.render("./dashboard/update-post.ejs", {
          blogs: currentUserBlogs,
          cuser: user,
          msg: "Blog Updated Sucessfully",
        });
      else {
        if (queryMsg.msg == "titleError") {
          console.log("In query title");
          res.status(400).render("./dashboard/update-post.ejs", {
            msg: "Title already in used",
            cuser: user,
            blogs: currentUserBlogs,
          });
        } else if (queryMsg.msg == "contentError") {
          res.status(400).render("./dashboard/update-post.ejs", {
            msg: "Content is copy pasted",
            cuser: user,
            blogs: currentUserBlogs,
          });
        } else {
          res.render("./dashboard/update-post.ejs", {
            blogs: currentUserBlogs,
            cuser: user,
          });
        }
      }
    }
  } catch (err) {
    console.error("Error in handleViewPost:", err);
    res.status(500).send("Server Error");
  }
}

async function handleGetUpdatePostForm(req, res) {
  try {
    const id = req.user._id;
    const user = await userModel.findById(id);

    let myoptions = req.body.options;

    // Ensure options is an array
    let options = Array.isArray(myoptions) ? myoptions : [myoptions];
    try {
      const myBlog = await blogModel.findById(options);


      res.render("./dashboard/update-post-form1.ejs", { blog: myBlog, cuser: user });

    } catch (error) {
      res.send(err);
    }
  } catch {
    console.error("Error finding posts:", err);

    // Ensure only one response is sent
    if (!res.headersSent) {
      res.status(500).send("<h2>Server Error</h2>");
    }
  }
}


async function handleUpdatePost(req, res) {
  const userId = req.user._id;
  const { title, content } = req.body;
  const user = await userModel.findById(userId);

  if (!user) {
    return res.status(404).send("<h2>User not found</h2>");
  }

  const blogId = req.params.blogId; // Ensure blogId is passed in the URL
  const blog = await blogModel.findById(blogId);

  if (!blog) {
    return res.status(404).send("<h2>Blog post not found</h2>");
  }

  blog.title = title;
  blog.content = content;

  try {
    await blog.save();
    res.redirect(`/dashboard/update-post/${user.username}?sucess=true`);
  } catch (error) {
    console.error("Error: ", error);
    if (error.code === 11000) {
      if (error.keyPattern.title) {
        // checking duplicate title
        return res.redirect(
          `/dashboard/update-post/${user.username}?msg=titleError`
        );
      } else if (error.keyPattern.content) {
        // checking duplicate content
        return res.redirect(
          `/dashboard/update-post/${user.username}?msg=contentError`
        );
      }
    }
    res.status(500).send("<h2>Unable to update the post</h2>");
  }
}

async function handleUpdateProfile(req, res) {
  const id = req.user._id;
  console.log(req.body);
  console.log(req.file);
  if (
    !req.body.name ||
    !req.body.email ||
    !req.body.password ||
    !req.body.username
  ) {
    return res.status(400).json({ msg: "All fields are required" });
  }

  try {
    const updatedUser = await userModel.findById(id);
    updatedUser.name = req.body.name;
    updatedUser.username = req.body.username;
    updatedUser.email = req.body.email;
    updatedUser.password = req.body.password;
    if (req.file && req.file.filename) {
      updatedUser.profileImageURL = `/uploads/profile-images/${req.file.filename}`;
    } else {
      updatedUser.profileImageURL = `/uploads/profile-images/default.png`;
    }

    updatedUser.save();

    res.redirect(`/dashboard/update-profile/${updatedUser.username}?success=true`);

  } catch (error) {
    if (error.code == 11000) {
      if (error.keyPattern.email)
        // checking duplicate email
        res.status(400).render("./dashboard/update-profile-form.ejs", {
          duplicateErrMsg: "Email already in use",
        });
      else if (error.keyPattern.username)
        //checking duplicate username
        res.status(400).render("./dashboard/update-profile-form.ejs", {
          duplicateErrMsg: "Username already in use",
        });
    }
  }
}

async function renderToUpdateProfile(req, res) {
  const id = req.user._id;

  try {
    const user = await userModel.findById(id);
    const queryPara = url.parse(req.url, true).query;
    if (queryPara.success) {
      res.render("./dashboard/update-profile-form.ejs", { cuser: user, successMsg: "User updated successfully!" });
    } else {
      res.render("./dashboard/update-profile-form.ejs", { cuser: user });
    }


  } catch (error) {
    res.status(505).send(`<h3>${error}</h3>`);
  }


}

export {
  handleOpenDashboard,
  handleCreatePost,
  handleViewPost,
  handleDeletePost,
  renderToCreatePost,
  renderToDeletePost,
  renderToUpdatePost,
  handleGetUpdatePostForm,
  handleUpdatePost,
  handleUpdateProfile,
  renderToUpdateProfile,
};
