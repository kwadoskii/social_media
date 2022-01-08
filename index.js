import { Sequelize } from "sequelize";

const sequelize = new Sequelize("social_media", "root", "", {
  host: "localhost",
  dialect: "mysql",
});

try {
  await sequelize.authenticate();
  console.log("Connection has been established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
}

//Question 1 answer
const get_posts = async (id, post_ids) => {
  if (Array.isArray(post_ids) !== true) return "post_ids is not an array";

  post_ids = post_ids.reduce((prev, post_id, i) => {
    if (i === post_ids.length - 1) return prev + post_id + ")";

    return prev + post_id + ", ";
  }, "(");

  const [posts] = await sequelize.query(`select * from posts where id in ${post_ids}`);

  const user_ids = posts.map((p) => p.user_id);

  const [user] = await sequelize.query(
    `select id, username, full_name, profile_picture from users where id in(:ids)`,
    {
      replacements: { ids: user_ids },
    }
  );

  const [likes] = await sequelize.query(`select * from likes where user_id = ${id}`);
  const [following] = await sequelize.query(`select * from follows where follower_id = ${id}`);

  following.map((f, i) => {
    user.forEach((u, i) => {
      if (u.id === f.following_id) return (user[i].followed = true);

      return (user[i].followed = false);
    });
  });

  likes.map((l) => {
    posts.forEach((post, i) => {
      if (post.id === l.post_id) return (posts[i].liked = true);

      return (posts[i].liked = false);
    });
  });

  posts.map((p, i) => {
    posts[i].owner = user.filter((u) => u.id === p.user_id);
    delete posts[i].user_id;
  });

  return posts;
};

//function call to question 1
console.log(await get_posts(7, [111, 102, 80]));

//Question 2 answer
const merge_posts = async (list_of_posts) => {
  const [post_ids] = list_of_posts;

  const [posts] = await sequelize.query(
    `select id, description, image, created_at from posts where id in(:ids) order by created_at desc, id desc`,
    { replacements: { ids: post_ids } }
  );

  return posts;
};

//function call to question 2
console.log(await merge_posts([[101, 103, 104]]));

sequelize.close();
