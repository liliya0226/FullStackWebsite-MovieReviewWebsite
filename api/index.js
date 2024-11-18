import * as dotenv from "dotenv";
dotenv.config();
import express from "express";
import pkg from "@prisma/client";
import morgan from "morgan";
import cors from "cors";
import { auth } from "express-oauth2-jwt-bearer";

// this is a middleware that will validate the access token sent by the client
const requireAuth = auth({
  audience: process.env.AUTH0_AUDIENCE,
  issuerBaseURL: process.env.AUTH0_ISSUER,
  tokenSigningAlg: "RS256",
});

const app = express();

app.use(cors());
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(morgan("dev"));

const { PrismaClient } = pkg;
const prisma = new PrismaClient();

// this is a public endpoint because it doesn't have the requireAuth middleware
app.get("/ping", (req, res) => {
  res.send("pong");
});

// this endpoint is used by the client to verify the user status and to make sure the user is registered in our database once they signup with Auth0
// if not registered in our database we will create it.
// if the user is already registered we will return the user information
app.post("/verify-user", requireAuth, async (req, res) => {
  const auth0Id = req.auth.payload.sub;
  // we are using the audience to get the email and name from the token
  // if your audience is different you should change the key to match your audience
  // the value should match your audience according to this document: https://docs.google.com/document/d/1lYmaGZAS51aeCxfPzCwZHIk6C5mmOJJ7yHBNPJuGimU/edit#heading=h.fr3s9fjui5yn
  const email = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/email`];
  const name = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/name`];
  const username = req.auth.payload[`${process.env.AUTH0_AUDIENCE}/username`];

  const user = await prisma.user.findUnique({
    where: {
      auth0Id,
    },
  });

  if (user) {
    res.json(user);
  } else {
    const newUser = await prisma.user.create({
      data: {
        email,
        username,
        auth0Id,
        name,
      },
    });

    res.json(newUser);
  }
});

app.post("/create/review", requireAuth, async (req, res) => {
  const { username, title, body, movieId, score, moviename } = req.body;
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "User not found!" });
    }

    const newReview = await prisma.review.create({
      data: {
        title: title,
        body: body,
        score: parseInt(score),
        movieId: String(movieId),
        userId: user.id,
        username: username,
        moviename: moviename,
      },
    });

    res.status(201).json(newReview);
  } catch (error) {
    console.error("Error creating review: ", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/reviews/:username/profile", requireAuth, async (req, res) => {
  const { username } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found!" });
    }

    const reviews = await prisma.review.findMany({
      where: {
        userId: user.id,
      },
    });

    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching User: ", error);
  }
});

app.get("/reviews/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const reviews = await prisma.review.findMany({
      where: {
        movieId: id,
      },
    });
    res.status(200).json(reviews);
  } catch (error) {
    console.error("Error fetching reviews", error);
  }
});

app.post("/favorites", requireAuth, async (req, res) => {
  const { movieId, username } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });
    if (!user) {
      res.status(404).json({ error: "User not found!" });
    }

    const newFavorite = await prisma.favorite.create({
      data: {
        movieId: String(movieId),
        userId: user.id,
      },
    });
    res.status(201).json({ newFavorite });
  } catch (error) {
    console.error("Error creating favorite", error);
    res.status(500).json({ error: "Server error" });
  }
});

app.get("/favorites/:username", requireAuth, async (req, res) => {
  const { username } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found!" });
    }

    const favorites = await prisma.favorite.findMany({
      where: {
        userId: user.id,
      },
    });

    res.status(200).json(favorites);
  } catch (error) {
    console.error("Error getting favorites: ", error);
  }
});

app.delete("/reviews/:id", requireAuth, async (req, res) => {
  const { id } = req.params;

  try {
    const deletedReview = await prisma.review.delete({
      where: {
        id: parseInt(id),
      },
    });

    if (deletedReview) {
      return res.status(200).json(deletedReview);
    }
  } catch (error) {
    console.error("Error deleting Review: ", error);
  }
});

app.delete("/favorites/:username/:id", requireAuth, async (req, res) => {
  const { username, id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
    }

    const deletedFavorite = await prisma.favorite.deleteMany({
      where: {
        movieId: id,
        userId: user.id,
      },
    });

    if (deletedFavorite.count === 0) {
      return res.status(404).json({ error: "Favorite not found." });
    }

    return res.status(200).json({ message: "Favorite deletion successful." });
  } catch (error) {
    console.error("Error deleting favorite", error);
  }
});

app.get("/favorite/:username/:id", async (req, res) => {
  const { username, id } = req.params;

  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    if (!user) {
      res.status(404).json({ error: "User not found" });
    }

    const favorite = await prisma.favorite.findFirst({
      where: {
        userId: user.id,
        movieId: id,
      },
    });

    return res.status(200).json(favorite);
  } catch (error) {
    console.error("Error fetching favorite", error);
  }
});

app.put("/reviews/:id", async (req, res) => {
  const { id } = req.params;
  const { title, score, body } = req.body;

  try {
    const updatedReview = await prisma.review.update({
      where: {
        id: parseInt(id),
      },
      data: {
        title: title,
        score: score,
        body: body,
      },
    });

    console.log(updatedReview);

    return res.status(200).json(updatedReview);
  } catch (error) {
    console.error("Error updating review: ", error);
  }
});

app.get("/recent/reviews", async (req, res) => {
  try {
    const recentReviews = await prisma.review.findMany({
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    });

    console.log(recentReviews);
    return res.status(200).json(recentReviews);
  } catch (error) {
    console.error("Error fetching recent reviews: ", error);
  }
});

app.get("/user/:username/favorites", requireAuth, async (req, res) => {
  const { username } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: {
        username: username,
      },
    });

    const recentFavorites = await prisma.favorite.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: 3,
    });

    return res.status(200).json(recentFavorites);
  } catch (error) {
    console.error("Error fetching user: ", error);
  }
});

const PORT = parseInt(process.env.PORT) || 8080;
app.listen(8000, () => {
  console.log(`Server running on http://localhost:${PORT} 🎉 🚀`);
});